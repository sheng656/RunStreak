using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using RunStreak.Api.DTOs.Users;
using RunStreak.Api.Services;

namespace RunStreak.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[EnableCors("Frontend")]
[Authorize]
public class UsersController(IUserService userService) : ControllerBase
{
    private readonly IUserService _userService = userService;

    [HttpGet("me")]
    public async Task<IActionResult> GetCurrentUserProfile()
    {
        var userId = GetUserId();
        if (userId == Guid.Empty)
        {
            return Unauthorized();
        }

        var profile = await _userService.GetUserProfileAsync(userId);
        if (profile == null)
        {
            return NotFound(new { message = "User profile not found." });
        }

        return Ok(profile);
    }

    [HttpPut("me")]
    public async Task<IActionResult> UpdateCurrentUserProfile([FromBody] UpdateProfileRequest request)
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

        var profile = await _userService.UpdateUserProfileAsync(userId, request);
        if (profile == null)
        {
            return NotFound(new { message = "User profile not found." });
        }

        return Ok(profile);
    }

    [HttpGet("{id:guid}/badges")]
    public async Task<IActionResult> GetUserBadges(Guid id)
    {
        var badges = await _userService.GetUserBadgesAsync(id);
        return Ok(badges);
    }

    [HttpGet("me/badges-progress")]
    public async Task<IActionResult> GetCurrentUserBadgesWithProgress()
    {
        var userId = GetUserId();
        if (userId == Guid.Empty)
        {
            return Unauthorized();
        }

        var badges = await _userService.GetBadgesWithProgressAsync(userId);
        return Ok(badges);
    }

    [HttpGet("{id:guid}/stats")]
    public async Task<IActionResult> GetUserStats(Guid id)
    {
        var stats = await _userService.GetUserStatsAsync(id);
        if (stats == null)
        {
            return NotFound(new { message = "User stats not found." });
        }

        return Ok(stats);
    }

    private Guid GetUserId()
    {
        var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.TryParse(userIdStr, out var userId) ? userId : Guid.Empty;
    }
}
