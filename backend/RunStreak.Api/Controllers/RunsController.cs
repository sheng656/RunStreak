using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using RunStreak.Api.DTOs.Runs;
using RunStreak.Api.Services;

namespace RunStreak.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[EnableCors("Frontend")]
[Authorize]
public class RunsController(IRunService runService, IScreenshotImportService screenshotImportService) : ControllerBase
{
    private readonly IRunService _runService = runService;
    private readonly IScreenshotImportService _screenshotImportService = screenshotImportService;

    [HttpPost]
    [EnableRateLimiting("run-submit")]
    public async Task<IActionResult> LogRun([FromBody] LogRunRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var userId = GetUserId();
        if (userId == Guid.Empty)
        {
            return Unauthorized();
        }

        var (run, newlyUnlockedBadges) = await _runService.LogRunAsync(userId, request);

        return CreatedAtAction(
            nameof(GetRunById),
            new { id = run.Id },
            new { run, newlyUnlockedBadges }
        );
    }

    /// <summary>
    /// AI-powered screenshot OCR import. Accepts an image upload and returns
    /// extracted run data (distance, duration, date, optional enrichment).
    /// Users can review and confirm the data before logging.
    /// </summary>
    [HttpPost("import-screenshot")]
    [EnableRateLimiting("run-submit")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> ImportScreenshot(IFormFile file, CancellationToken cancellationToken)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest(new { message = "No file was uploaded." });
        }

        // Max 10MB — Gemini free tier has per-request payload limits
        if (file.Length > 10 * 1024 * 1024)
        {
            return BadRequest(new { message = "Image must be under 10MB." });
        }

        if (!file.ContentType.StartsWith("image/", StringComparison.OrdinalIgnoreCase))
        {
            return BadRequest(new { message = "File must be an image (PNG, JPG, WEBP, etc.)." });
        }

        using var stream = file.OpenReadStream();
        var result = await _screenshotImportService.ImportFromScreenshotAsync(
            stream, file.ContentType, cancellationToken);

        return Ok(result);
    }

    [HttpGet]
    public async Task<IActionResult> GetRuns([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        var userId = GetUserId();
        if (userId == Guid.Empty)
        {
            return Unauthorized();
        }

        var (runs, totalCount) = await _runService.GetUserRunsAsync(userId, page, pageSize);

        return Ok(new
        {
            runs,
            totalCount,
            page,
            pageSize
        });
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetRunById(Guid id)
    {
        var userId = GetUserId();
        if (userId == Guid.Empty)
        {
            return Unauthorized();
        }

        var run = await _runService.GetRunByIdAsync(id, userId);
        if (run == null)
        {
            return NotFound(new { message = "Run not found." });
        }

        return Ok(run);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateRun(Guid id, [FromBody] UpdateRunRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var userId = GetUserId();
        if (userId == Guid.Empty)
        {
            return Unauthorized();
        }

        var result = await _runService.UpdateRunAsync(userId, id, request);
        if (result == null)
        {
            return NotFound(new { message = "Run not found or unauthorized." });
        }

        return Ok(new
        {
            run = result.Value.Run,
            newlyUnlockedBadges = result.Value.UnlockedBadges
        });
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteRun(Guid id)
    {
        var userId = GetUserId();
        if (userId == Guid.Empty)
        {
            return Unauthorized();
        }

        var success = await _runService.DeleteRunAsync(userId, id);
        if (!success)
        {
            return NotFound(new { message = "Run not found or unauthorized." });
        }

        return NoContent();
    }

    private Guid GetUserId()
    {
        var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.TryParse(userIdStr, out var userId) ? userId : Guid.Empty;
    }
}
