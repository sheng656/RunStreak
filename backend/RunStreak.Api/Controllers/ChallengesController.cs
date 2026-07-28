using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using RunStreak.Api.DTOs.Challenges;
using RunStreak.Api.Services;

namespace RunStreak.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[EnableCors("Frontend")]
[Authorize]
public class ChallengesController(IChallengeService challengeService) : ControllerBase
{
    private readonly IChallengeService _challengeService = challengeService;

    [HttpGet]
    public async Task<IActionResult> GetChallenges()
    {
        var userId = GetUserId();
        if (userId == Guid.Empty) return Unauthorized();

        var challenges = await _challengeService.GetChallengesAsync(userId);
        return Ok(challenges);
    }

    [HttpGet("active")]
    public async Task<IActionResult> GetActiveChallenge()
    {
        var userId = GetUserId();
        if (userId == Guid.Empty) return Unauthorized();

        var active = await _challengeService.GetActiveChallengeAsync(userId);
        return Ok(active);
    }

    [HttpPost("start")]
    public async Task<IActionResult> StartChallenge([FromBody] StartChallengeRequest request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var userId = GetUserId();
        if (userId == Guid.Empty) return Unauthorized();

        bool success = await _challengeService.StartChallengeAsync(userId, request.ChallengeId);
        if (!success)
        {
            return BadRequest(new { message = "Unable to start challenge. It may already be completed or invalid." });
        }

        return Ok(new { message = "Challenge started successfully!" });
    }

    private Guid GetUserId()
    {
        var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.TryParse(userIdStr, out var userId) ? userId : Guid.Empty;
    }
}
