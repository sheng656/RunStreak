namespace RunStreak.Api.DTOs.Runs;

/// <summary>
/// Returned by POST /api/runs/import-screenshot after AI OCR extraction.
/// Required fields (ActivityDate, DistanceKm, DurationMinutes) are null on failure.
/// Optional enrichment fields are null if not detected in the screenshot.
/// </summary>
public class ScreenshotImportResponse
{
    public bool Success { get; set; }
    public string? ErrorMessage { get; set; }

    // Required fields — must be present for a valid run record
    public DateTime? ActivityDate { get; set; }
    public decimal? DistanceKm { get; set; }
    public decimal? DurationMinutes { get; set; }

    // Optional enrichment fields — extracted when available
    public decimal? PaceMinPerKm { get; set; }
    public int? CaloriesBurned { get; set; }
    public int? AverageHeartRate { get; set; }
    public decimal? ElevationGainMeters { get; set; }
    public int? Cadence { get; set; }

    // Platform detection (e.g. "Strava", "Garmin Connect", "Nike Run Club", "Keep", "Huawei Health")
    public string? DetectedPlatform { get; set; }

    // AI model confidence in the extraction (0.0–1.0). Below 0.5 = suggest manual entry.
    public decimal Confidence { get; set; }
}
