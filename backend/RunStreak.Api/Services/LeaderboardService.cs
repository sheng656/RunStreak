using Microsoft.EntityFrameworkCore;
using RunStreak.Api.Data;
using RunStreak.Api.DTOs.Leaderboard;

namespace RunStreak.Api.Services;

public class LeaderboardService(AppDbContext context) : ILeaderboardService
{
    private readonly AppDbContext _context = context;

    public async Task<List<LeaderboardEntryDto>> GetLeaderboardAsync(string rankingType, int page = 1, int pageSize = 20)
    {
        // Enforce pagination boundaries
        if (page < 1) page = 1;
        if (pageSize < 1 || pageSize > 100) pageSize = 20;

        var query = _context.Users.AsNoTracking();

        if (rankingType.Equals("streaks", StringComparison.OrdinalIgnoreCase))
        {
            query = query
                .OrderByDescending(u => u.CurrentStreak)
                .ThenByDescending(u => u.TotalPoints)
                .ThenBy(u => u.DisplayName);
        }
        else
        {
            // Default to points ranking
            query = query
                .OrderByDescending(u => u.TotalPoints)
                .ThenByDescending(u => u.CurrentStreak)
                .ThenBy(u => u.DisplayName);
        }

        var users = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(u => new
            {
                u.Id,
                u.Username,
                u.DisplayName,
                u.AvatarUrl,
                u.TotalPoints,
                u.CurrentStreak,
                u.LongestStreak,
                u.TotalDistanceKm,
                u.TotalRuns
            })
            .ToListAsync();

        var startingRank = (page - 1) * pageSize + 1;

        return users.Select((u, index) => new LeaderboardEntryDto
        {
            Rank = startingRank + index,
            UserId = u.Id,
            Username = u.Username,
            DisplayName = u.DisplayName,
            AvatarUrl = u.AvatarUrl,
            TotalPoints = u.TotalPoints,
            CurrentStreak = u.CurrentStreak,
            LongestStreak = u.LongestStreak,
            TotalDistanceKm = u.TotalDistanceKm,
            TotalRuns = u.TotalRuns
        }).ToList();
    }
}
