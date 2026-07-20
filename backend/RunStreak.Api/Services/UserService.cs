using Microsoft.EntityFrameworkCore;
using RunStreak.Api.Data;
using RunStreak.Api.DTOs.Users;
using System.Text.Json;

namespace RunStreak.Api.Services;

public class UserService(AppDbContext context) : IUserService
{
    private readonly AppDbContext _context = context;

    public async Task<UserProfileDto?> GetUserProfileAsync(Guid userId)
    {
        var user = await _context.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null) return null;

        return new UserProfileDto
        {
            Id = user.Id,
            Username = user.Username,
            Email = user.Email,
            DisplayName = user.DisplayName,
            AvatarUrl = user.AvatarUrl,
            TotalPoints = user.TotalPoints,
            CurrentStreak = user.CurrentStreak,
            LongestStreak = user.LongestStreak,
            TotalDistanceKm = user.TotalDistanceKm,
            TotalRuns = user.TotalRuns,
            StreakFreezeCount = user.StreakFreezeCount,
            WeeklyGoalKm = user.WeeklyGoalKm,
            CreatedAt = user.CreatedAt
        };
    }

    public async Task<UserProfileDto?> UpdateUserProfileAsync(Guid userId, UpdateProfileRequest request)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null) return null;

        user.DisplayName = request.DisplayName;
        user.AvatarUrl = request.AvatarUrl;
        user.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return new UserProfileDto
        {
            Id = user.Id,
            Username = user.Username,
            Email = user.Email,
            DisplayName = user.DisplayName,
            AvatarUrl = user.AvatarUrl,
            TotalPoints = user.TotalPoints,
            CurrentStreak = user.CurrentStreak,
            LongestStreak = user.LongestStreak,
            TotalDistanceKm = user.TotalDistanceKm,
            TotalRuns = user.TotalRuns,
            StreakFreezeCount = user.StreakFreezeCount,
            WeeklyGoalKm = user.WeeklyGoalKm,
            CreatedAt = user.CreatedAt
        };
    }

    public async Task<List<UserBadgeDto>> GetUserBadgesAsync(Guid userId)
    {
        var userBadges = await _context.UserBadges
            .AsNoTracking()
            .Where(ub => ub.UserId == userId)
            .Include(ub => ub.Badge)
            .OrderByDescending(ub => ub.UnlockedAt)
            .Select(ub => new UserBadgeDto
            {
                BadgeId = ub.BadgeId,
                Name = ub.Badge.Name,
                Description = ub.Badge.Description,
                IconUrl = ub.Badge.IconUrl,
                Category = ub.Badge.Category,
                Rarity = ub.Badge.Rarity,
                PointsReward = ub.Badge.PointsReward,
                UnlockedAt = ub.UnlockedAt
            })
            .ToListAsync();

        return userBadges;
    }

    public async Task<List<BadgeWithProgressDto>> GetBadgesWithProgressAsync(Guid userId)
    {
        var user = await _context.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == userId);
        if (user == null) return [];

        var unlockedBadges = await _context.UserBadges
            .AsNoTracking()
            .Where(ub => ub.UserId == userId)
            .ToDictionaryAsync(ub => ub.BadgeId, ub => ub.UnlockedAt);

        var badges = await _context.Badges.AsNoTracking().ToListAsync();

        var runs = await _context.Runs
            .AsNoTracking()
            .Where(r => r.UserId == userId)
            .Select(r => new { r.DistanceKm, r.PaceMinPerKm })
            .ToListAsync();

        var result = new List<BadgeWithProgressDto>();

        foreach (var badge in badges)
        {
            var isUnlocked = unlockedBadges.TryGetValue(badge.Id, out var unlockedAt);

            decimal currentProgress = 0;
            decimal targetThreshold = 0;
            string progressLabel = string.Empty;

            if (!string.IsNullOrWhiteSpace(badge.CriteriaJson))
            {
                try
                {
                    var criteria = JsonSerializer.Deserialize<BadgeCriteria>(badge.CriteriaJson, new JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true
                    });

                    if (criteria != null && !string.IsNullOrEmpty(criteria.Type))
                    {
                        switch (criteria.Type.ToLowerInvariant())
                        {
                            case "total_runs":
                                currentProgress = user.TotalRuns;
                                targetThreshold = criteria.Threshold;
                                progressLabel = $"{Math.Min(currentProgress, targetThreshold)} / {targetThreshold} runs";
                                break;

                            case "total_distance_km":
                                currentProgress = user.TotalDistanceKm;
                                targetThreshold = criteria.Threshold;
                                progressLabel = $"{Math.Min(currentProgress, targetThreshold):F1} / {targetThreshold:F1} km";
                                break;

                            case "current_streak":
                                currentProgress = user.CurrentStreak;
                                targetThreshold = criteria.Threshold;
                                progressLabel = $"{Math.Min(currentProgress, targetThreshold)} / {targetThreshold} days";
                                break;

                            case "single_run_distance_km":
                                currentProgress = runs.Count > 0 ? runs.Max(r => r.DistanceKm) : 0;
                                targetThreshold = criteria.Threshold;
                                progressLabel = $"{Math.Min(currentProgress, targetThreshold):F1} / {targetThreshold:F1} km";
                                break;

                            case "pace_under":
                                var eligibleRuns = runs.Where(r => r.DistanceKm >= criteria.MinDistanceKm).ToList();
                                currentProgress = eligibleRuns.Count > 0 ? eligibleRuns.Min(r => r.PaceMinPerKm) : 99.9m;
                                targetThreshold = criteria.PaceThreshold;
                                progressLabel = isUnlocked
                                    ? "Fast enough!"
                                    : (currentProgress == 99.9m ? $"No run of {criteria.MinDistanceKm:F1}km yet" : $"Best: {currentProgress:F2} (target < {targetThreshold:F2})");
                                break;

                            case "distance_count":
                                currentProgress = runs.Count(r => r.DistanceKm >= criteria.MinDistanceKm);
                                targetThreshold = criteria.Count;
                                progressLabel = $"{Math.Min(currentProgress, targetThreshold)} / {targetThreshold} runs";
                                break;
                        }
                    }
                }
                catch (JsonException)
                {
                    // Ignore malformed JSON
                }
            }

            result.Add(new BadgeWithProgressDto
            {
                Id = badge.Id,
                Name = badge.Name,
                Description = badge.Description,
                IconUrl = badge.IconUrl,
                Category = badge.Category,
                Rarity = badge.Rarity,
                PointsReward = badge.PointsReward,
                IsUnlocked = isUnlocked,
                UnlockedAt = isUnlocked ? unlockedAt : null,
                CurrentProgress = currentProgress,
                TargetThreshold = targetThreshold,
                ProgressLabel = progressLabel
            });
        }

        return result.OrderBy(b => b.Category).ThenBy(b => b.Rarity).ToList();
    }

    public async Task<UserStatsDto?> GetUserStatsAsync(Guid userId)
    {
        var user = await _context.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null) return null;

        var runsSummary = await _context.Runs
            .AsNoTracking()
            .Where(r => r.UserId == userId)
            .Select(r => new { r.DistanceKm, r.DurationMinutes, r.PointsEarned, r.RunDate })
            .ToListAsync();

        decimal totalDistance = runsSummary.Sum(r => r.DistanceKm);
        decimal totalDuration = runsSummary.Sum(r => r.DurationMinutes);
        decimal longestRun = runsSummary.Count > 0 ? runsSummary.Max(r => r.DistanceKm) : 0;

        decimal averageDistance = user.TotalRuns > 0 ? totalDistance / user.TotalRuns : 0;
        decimal averagePace = totalDistance > 0 ? totalDuration / totalDistance : 0;

        // --- Weekly stats (ISO week: Monday–Sunday) ---
        // Determine the start of the current week (Monday) and last week
        var today = DateTime.UtcNow.Date;
        int daysSinceMonday = ((int)today.DayOfWeek + 6) % 7; // Mon=0 … Sun=6
        var thisWeekStart = today.AddDays(-daysSinceMonday);
        var lastWeekStart = thisWeekStart.AddDays(-7);
        var lastWeekEnd = thisWeekStart.AddDays(-1);

        var thisWeekRuns = runsSummary.Where(r => r.RunDate.Date >= thisWeekStart).ToList();
        var lastWeekRuns = runsSummary.Where(r => r.RunDate.Date >= lastWeekStart && r.RunDate.Date <= lastWeekEnd).ToList();

        decimal weeklyDistance = thisWeekRuns.Sum(r => r.DistanceKm);
        int weeklyRunCount = thisWeekRuns.Count;
        int weeklyPoints = thisWeekRuns.Sum(r => r.PointsEarned);

        decimal lastWeekDistance = lastWeekRuns.Sum(r => r.DistanceKm);
        int lastWeekRunCount = lastWeekRuns.Count;
        int lastWeekPoints = lastWeekRuns.Sum(r => r.PointsEarned);

        // Best week ever (group all runs by their ISO-week Monday, take the max weekly distance)
        decimal bestWeekDistance = 0;
        if (runsSummary.Count > 0)
        {
            bestWeekDistance = runsSummary
                .GroupBy(r =>
                {
                    // Compute ISO week Monday for each run date
                    int d = ((int)r.RunDate.Date.DayOfWeek + 6) % 7;
                    return r.RunDate.Date.AddDays(-d);
                })
                .Select(g => g.Sum(r => r.DistanceKm))
                .Max();
        }

        return new UserStatsDto
        {
            TotalRuns = user.TotalRuns,
            TotalDistanceKm = totalDistance,
            TotalDurationMinutes = totalDuration,
            AverageDistanceKm = Math.Round(averageDistance, 2),
            AveragePaceMinPerKm = Math.Round(averagePace, 2),
            LongestRunKm = Math.Round(longestRun, 2),
            CurrentStreak = user.CurrentStreak,
            LongestStreak = user.LongestStreak,
            WeeklyDistanceKm = Math.Round(weeklyDistance, 2),
            WeeklyRunCount = weeklyRunCount,
            WeeklyGoalKm = user.WeeklyGoalKm,
            WeeklyPoints = weeklyPoints,
            LastWeekDistanceKm = Math.Round(lastWeekDistance, 2),
            LastWeekRunCount = lastWeekRunCount,
            LastWeekPoints = lastWeekPoints,
            BestWeekDistanceKm = Math.Round(bestWeekDistance, 2),
        };
    }

    public async Task<UserProfileDto?> UpdateWeeklyGoalAsync(Guid userId, decimal goalKm)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null) return null;

        // Clamp goal to a sensible range (1–500 km/week)
        user.WeeklyGoalKm = Math.Clamp(goalKm, 1m, 500m);
        user.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return new UserProfileDto
        {
            Id = user.Id,
            Username = user.Username,
            Email = user.Email,
            DisplayName = user.DisplayName,
            AvatarUrl = user.AvatarUrl,
            TotalPoints = user.TotalPoints,
            CurrentStreak = user.CurrentStreak,
            LongestStreak = user.LongestStreak,
            TotalDistanceKm = user.TotalDistanceKm,
            TotalRuns = user.TotalRuns,
            StreakFreezeCount = user.StreakFreezeCount,
            WeeklyGoalKm = user.WeeklyGoalKm,
            CreatedAt = user.CreatedAt
        };
    }
}
