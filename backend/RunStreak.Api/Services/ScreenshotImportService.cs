using System.Globalization;
using System.Text.Json.Nodes;
using Google.GenAI;
using Google.GenAI.Types;
using RunStreak.Api.DTOs.Runs;

namespace RunStreak.Api.Services;

/// <summary>
/// Uses the Google Gemini API (via Google.GenAI) to perform OCR on running app screenshots
/// and extract structured activity data. Supports Strava, Garmin Connect, Nike Run Club,
/// Keep, Huawei Health, and other common running platforms.
/// </summary>
public class ScreenshotImportService(IConfiguration configuration, ILogger<ScreenshotImportService> logger)
    : IScreenshotImportService
{
    private readonly ILogger<ScreenshotImportService> _logger = logger;

    // Structured JSON prompt — asking Gemini to return a specific schema so we can
    // deserialize it deterministically rather than parsing free text.
    private const string OcrPrompt = """
        You are a running activity data extractor. The user has provided a screenshot from a running app
        (such as Strava, Garmin Connect, Nike Run Club, Keep, Huawei Health, or similar platforms).
        
        Extract the running activity data and return ONLY valid JSON with this exact schema:
        {
          "success": true,
          "detectedPlatform": "Strava",
          "activityDate": "2026-06-30",
          "distanceKm": 5.12,
          "durationMinutes": 26.5,
          "paceMinPerKm": 5.18,
          "caloriesBurned": 320,
          "averageHeartRate": 152,
          "elevationGainMeters": 45.0,
          "cadence": 172,
          "confidence": 0.95,
          "errorMessage": null
        }
        
        Rules:
        - If this is NOT a running activity screenshot, set success=false with an errorMessage.
        - Convert miles to km (1 mile = 1.60934 km) automatically.
        - Convert pace from min/mile to min/km if needed.
        - Duration must be in decimal minutes (e.g. 1h 30m 15s = 90.25 minutes).
        - Set null for any field you cannot confidently determine.
        - Return ONLY the JSON object, no markdown fences, no extra text.
        """;

    public async Task<ScreenshotImportResponse> ImportFromScreenshotAsync(
        Stream imageStream,
        string contentType,
        CancellationToken cancellationToken = default)
    {
        var apiKey = configuration["AI:GeminiKey"] ?? configuration["Gemini:ApiKey"];
        var model = configuration["Gemini:Model"] ?? "gemini-3.1-flash-lite";

        if (string.IsNullOrWhiteSpace(apiKey))
        {
            _logger.LogWarning("Gemini API key is not configured. Screenshot import will not work.");
            return new ScreenshotImportResponse
            {
                Success = false,
                ErrorMessage = "AI import is not configured on this server. Please enter your run manually.",
                Confidence = 0
            };
        }

        try
        {
            // Read image bytes
            using var ms = new MemoryStream();
            await imageStream.CopyToAsync(ms, cancellationToken);
            var imageBytes = ms.ToArray();

            // Google.GenAI client using explicit API key
            var client = new Client(apiKey: apiKey);

            // Build multimodal content: text prompt + inline image (byte array directly)
            var contents = new List<Content>
            {
                new()
                {
                    Role = "user",
                    Parts =
                    [
                        new Part { Text = OcrPrompt },
                        new Part
                        {
                            InlineData = new Blob
                            {
                                MimeType = contentType,
                                Data = imageBytes
                            }
                        }
                    ]
                }
            };

            // Call GenerateContentAsync directly with model and contents list
            var response = await client.Models.GenerateContentAsync(model, contents);

            var rawText = response?.Text?.Trim() ?? string.Empty;

            // Strip markdown code fences if the model wrapped JSON in ```json ... ```
            if (rawText.StartsWith("```"))
            {
                var firstNewline = rawText.IndexOf('\n');
                var lastFence = rawText.LastIndexOf("```");
                if (firstNewline > 0 && lastFence > firstNewline)
                {
                    rawText = rawText[(firstNewline + 1)..lastFence].Trim();
                }
            }

            _logger.LogInformation("Gemini OCR raw response: {Length} chars", rawText.Length);
            return ParseGeminiResponse(rawText);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error calling Gemini API for screenshot import");
            return new ScreenshotImportResponse
            {
                Success = false,
                ErrorMessage = "Could not process the screenshot. Please try again or enter your run manually.",
                Confidence = 0
            };
        }
    }

    private static ScreenshotImportResponse ParseGeminiResponse(string json)
    {
        try
        {
            var node = JsonNode.Parse(json);
            if (node == null)
            {
                return FailResponse("Could not parse AI response. Please enter your run manually.");
            }

            var success = node["success"]?.GetValue<bool>() ?? false;
            var errorMessage = node["errorMessage"]?.GetValue<string?>();
            var confidence = node["confidence"]?.GetValue<double>() ?? 0;

            if (!success)
            {
                return new ScreenshotImportResponse
                {
                    Success = false,
                    ErrorMessage = errorMessage ?? "AI could not identify a running activity in this screenshot.",
                    Confidence = (decimal)confidence
                };
            }

            // Parse optional date
            DateTime? activityDate = null;
            var dateStr = node["activityDate"]?.GetValue<string?>();
            if (!string.IsNullOrWhiteSpace(dateStr) &&
                DateTime.TryParse(dateStr, CultureInfo.InvariantCulture, DateTimeStyles.None, out var parsedDate))
            {
                activityDate = parsedDate;
            }

            return new ScreenshotImportResponse
            {
                Success = true,
                DetectedPlatform = node["detectedPlatform"]?.GetValue<string?>(),
                ActivityDate = activityDate,
                DistanceKm = ParseDecimal(node["distanceKm"]),
                DurationMinutes = ParseDecimal(node["durationMinutes"]),
                PaceMinPerKm = ParseDecimal(node["paceMinPerKm"]),
                CaloriesBurned = node["caloriesBurned"]?.GetValue<int?>(),
                AverageHeartRate = node["averageHeartRate"]?.GetValue<int?>(),
                ElevationGainMeters = ParseDecimal(node["elevationGainMeters"]),
                Cadence = node["cadence"]?.GetValue<int?>(),
                Confidence = (decimal)confidence
            };
        }
        catch (Exception ex)
        {
            return FailResponse($"Failed to parse AI response: {ex.Message}");
        }
    }

    private static decimal? ParseDecimal(JsonNode? node)
    {
        if (node == null) return null;
        try { return (decimal)node.GetValue<double>(); }
        catch { return null; }
    }

    private static ScreenshotImportResponse FailResponse(string message) =>
        new() { Success = false, ErrorMessage = message, Confidence = 0 };
}
