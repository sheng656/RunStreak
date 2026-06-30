namespace RunStreak.Api.Services;

public interface IScreenshotImportService
{
    Task<DTOs.Runs.ScreenshotImportResponse> ImportFromScreenshotAsync(
        Stream imageStream,
        string contentType,
        CancellationToken cancellationToken = default);
}
