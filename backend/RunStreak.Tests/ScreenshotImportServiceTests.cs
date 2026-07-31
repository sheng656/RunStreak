using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging.Abstractions;
using RunStreak.Api.Services;
using Xunit;

namespace RunStreak.Tests;

public class ScreenshotImportServiceTests
{
    [Fact]
    public async Task ImportFromScreenshotAsync_ShouldReturnError_WhenApiKeyMissing()
    {
        // Arrange
        var inMemorySettings = new Dictionary<string, string?>();
        IConfiguration config = new ConfigurationBuilder()
            .AddInMemoryCollection(inMemorySettings)
            .Build();

        var service = new ScreenshotImportService(config, NullLogger<ScreenshotImportService>.Instance);
        using var stream = new MemoryStream(new byte[] { 1, 2, 3 });

        // Act
        var result = await service.ImportFromScreenshotAsync(stream, "image/png");

        // Assert
        Assert.NotNull(result);
        Assert.False(result.Success);
        Assert.Contains("not configured", result.ErrorMessage);
    }

    [Fact]
    public async Task ImportFromScreenshotAsync_ShouldReturnError_WhenStreamIsEmpty()
    {
        // Arrange
        var inMemorySettings = new Dictionary<string, string?>
        {
            { "AI:GeminiKey", "mock_key_12345" }
        };
        IConfiguration config = new ConfigurationBuilder()
            .AddInMemoryCollection(inMemorySettings)
            .Build();

        var service = new ScreenshotImportService(config, NullLogger<ScreenshotImportService>.Instance);
        using var stream = new MemoryStream(Array.Empty<byte>());

        // Act
        var result = await service.ImportFromScreenshotAsync(stream, "image/png");

        // Assert
        Assert.NotNull(result);
        Assert.False(result.Success);
        Assert.NotNull(result.ErrorMessage);
    }
}
