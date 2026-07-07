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

        if (rankingType.Equals("weekly", StringComparison.OrdinalIgnoreCase))
        {
            var cutoffDate = DateTime.UtcNow.AddDays(-6).Date;

            var weeklyPointsQuery = _context.Runs
                .AsNoTracking()
                .Where(r => r.RunDate >= cutoffDate)
                .GroupBy(r => r.UserId)
                .Select(g => new
                {
                    UserId = g.Key,
                    WeeklyPoints = g.Sum(r => r.PointsEarned)
                });

            var leaderboardQuery = from u in _context.Users.AsNoTracking()
                                   join wp in weeklyPointsQuery on u.Id equals wp.UserId into joined
                                   from subwp in joined.DefaultIfEmpty()
                                   select new
                                   {
                                       u.Id,
                                       u.Username,
                                       u.DisplayName,
                                       u.AvatarUrl,
                                       TotalPoints = subwp != null ? subwp.WeeklyPoints : 0,
                                       u.CurrentStreak,
                                       u.LongestStreak,
                                       u.TotalDistanceKm,
                                       u.TotalRuns
                                   };

            var weeklyUsers = await leaderboardQuery
                .OrderByDescending(x => x.TotalPoints)
                .ThenByDescending(x => x.CurrentStreak)
                .ThenBy(x => x.DisplayName)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var weeklyStartingRank = (page - 1) * pageSize + 1;

            return weeklyUsers.Select((u, index) => new LeaderboardEntryDto
            {
                Rank = weeklyStartingRank + index,
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
