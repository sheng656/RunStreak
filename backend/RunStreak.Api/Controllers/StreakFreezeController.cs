using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using RunStreak.Api.Services;

namespace RunStreak.Api.Controllers;

[ApiController]
[Route("api/streak-freeze")]
[EnableCors("Frontend")]
[Authorize]
public class StreakFreezeController(IStreakFreezeService streakFreezeService, IUserService userService) : ControllerBase
{
    private readonly IStreakFreezeService _streakFreezeService = streakFreezeService;
    private readonly IUserService _userService = userService;

    [HttpPost("purchase")]
    public async Task<IActionResult> PurchaseFreeze()
    {
        var userId = GetUserId();
        if (userId == Guid.Empty)
        {
            return Unauthorized();
        }

        var success = await _streakFreezeService.PurchaseStreakFreezeAsync(userId);
        if (!success)
        {
            return BadRequest(new { message = "Unable to purchase rest day ticket. Verify you have at least 256 points and are not already at the limit of 5 banked tickets." });
        }

        // Return updated stats so frontend Zustand stores update seamlessly
        var count = await _streakFreezeService.GetAvailableFreezeCountAsync(userId);
        var user = await _userService.GetUserProfileAsync(userId);

        return Ok(new
        {
            message = "Rest day ticket purchased successfully!",
            streakFreezeCount = count,
            totalPoints = user?.TotalPoints ?? 0
        });
    }

    [HttpGet("status")]
    public async Task<IActionResult> GetStatus()
    {
        var userId = GetUserId();
        if (userId == Guid.Empty)
        {
            return Unauthorized();
        }

        var count = await _streakFreezeService.GetAvailableFreezeCountAsync(userId);
        var user = await _userService.GetUserProfileAsync(userId);

        return Ok(new
        {
            streakFreezeCount = count,
            totalPoints = user?.TotalPoints ?? 0
        });
    }

    private Guid GetUserId()
    {
        var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.TryParse(userIdStr, out var userId) ? userId : Guid.Empty;
    }
}
