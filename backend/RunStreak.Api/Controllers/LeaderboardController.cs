using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using RunStreak.Api.Services;

namespace RunStreak.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[EnableCors("Frontend")]
[Authorize]
public class LeaderboardController(ILeaderboardService leaderboardService) : ControllerBase
{
    private readonly ILeaderboardService _leaderboardService = leaderboardService;

    [HttpGet]
    public async Task<IActionResult> GetLeaderboard(
        [FromQuery] string type = "points",
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var leaderboard = await _leaderboardService.GetLeaderboardAsync(type, page, pageSize);
        return Ok(leaderboard);
    }
}
