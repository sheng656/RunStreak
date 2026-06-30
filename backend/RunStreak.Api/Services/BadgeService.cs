using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using RunStreak.Api.Data;
using RunStreak.Api.Models;

namespace RunStreak.Api.Services;

public class BadgeCriteria
{
    public string Type { get; set; } = string.Empty;
    public decimal Threshold { get; set; }
    public decimal PaceThreshold { get; set; }
    public decimal MinDistanceKm { get; set; }

    // For "distance_count": user must have completed at least Count runs of >= MinDistanceKm
    public int Count { get; set; }
}

public class BadgeService(AppDbContext context) : IBadgeService
{
    private readonly AppDbContext _context = context;

    public async Task<List<Badge>> CheckAndAwardBadgesAsync(Guid userId)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null)
        {
            return [];
        }

        // 1. Fetch user's currently unlocked badge IDs to exclude them
        var unlockedBadgeIds = await _context.UserBadges
            .Where(ub => ub.UserId == userId)
            .Select(ub => ub.BadgeId)
            .ToListAsync();

        // 2. Fetch all badges that have not been unlocked yet
        var lockedBadges = await _context.Badges
            .Where(b => !unlockedBadgeIds.Contains(b.Id))
            .ToListAsync();

        var newlyUnlockedBadges = new List<Badge>();

        foreach (var badge in lockedBadges)
        {
            if (string.IsNullOrWhiteSpace(badge.CriteriaJson))
            {
                continue;
            }

            try
            {
                var criteria = JsonSerializer.Deserialize<BadgeCriteria>(badge.CriteriaJson, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

                if (criteria == null || string.IsNullOrEmpty(criteria.Type))
                {
                    continue;
                }

                bool isUnlocked = false;

                switch (criteria.Type.ToLowerInvariant())
                {
                    case "total_runs":
                        isUnlocked = user.TotalRuns >= (int)criteria.Threshold;
                        break;

                    case "total_distance_km":
                        isUnlocked = user.TotalDistanceKm >= criteria.Threshold;
                        break;

                    case "current_streak":
                        isUnlocked = user.CurrentStreak >= (int)criteria.Threshold;
                        break;

                    case "single_run_distance_km":
                        isUnlocked = await _context.Runs.AnyAsync(r => r.UserId == userId && r.DistanceKm >= criteria.Threshold);
                        break;

                    case "pace_under":
                        // Pace logic: PaceMinPerKm < PaceThreshold AND DistanceKm >= MinDistanceKm
                        isUnlocked = await _context.Runs.AnyAsync(r =>
                            r.UserId == userId &&
                            r.DistanceKm >= criteria.MinDistanceKm &&
                            r.PaceMinPerKm < criteria.PaceThreshold);
                        break;

                    case "distance_count":
                        // User must have completed at least Count separate runs of >= MinDistanceKm.
                        // Used for tiered badges like "5K x 10 times", "5K x 20 times", etc.
                        var qualifyingRunCount = await _context.Runs
                            .CountAsync(r => r.UserId == userId && r.DistanceKm >= criteria.MinDistanceKm);
                        isUnlocked = qualifyingRunCount >= criteria.Count;
                        break;
                }

                if (isUnlocked)
                {
                    // Create junction record
                    var userBadge = new UserBadge
                    {
                        UserId = userId,
                        BadgeId = badge.Id,
                        UnlockedAt = DateTime.UtcNow
                    };

                    _context.UserBadges.Add(userBadge);

                    // Award bonus points for the badge
                    user.TotalPoints += badge.PointsReward;

                    newlyUnlockedBadges.Add(badge);
                }
            }
            catch (JsonException)
            {
                // Silently ignore malformed badge criteria — badge definitions are seeded data
            }
        }

        if (newlyUnlockedBadges.Count > 0)
        {
            user.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }

        return newlyUnlockedBadges;
    }
}
