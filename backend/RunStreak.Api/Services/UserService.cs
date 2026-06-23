using Microsoft.EntityFrameworkCore;
using RunStreak.Api.Data;
using RunStreak.Api.DTOs.Users;

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
                PointsReward = ub.Badge.PointsReward,
                UnlockedAt = ub.UnlockedAt
            })
            .ToListAsync();

        return userBadges;
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
            .Select(r => new { r.DistanceKm, r.DurationMinutes })
            .ToListAsync();

        decimal totalDistance = runsSummary.Sum(r => r.DistanceKm);
        decimal totalDuration = runsSummary.Sum(r => r.DurationMinutes);
        decimal longestRun = runsSummary.Count > 0 ? runsSummary.Max(r => r.DistanceKm) : 0;

        decimal averageDistance = user.TotalRuns > 0 ? totalDistance / user.TotalRuns : 0;
        decimal averagePace = totalDistance > 0 ? totalDuration / totalDistance : 0;

        return new UserStatsDto
        {
            TotalRuns = user.TotalRuns,
            TotalDistanceKm = totalDistance,
            TotalDurationMinutes = totalDuration,
            AverageDistanceKm = Math.Round(averageDistance, 2),
            AveragePaceMinPerKm = Math.Round(averagePace, 2),
            LongestRunKm = Math.Round(longestRun, 2),
            CurrentStreak = user.CurrentStreak,
            LongestStreak = user.LongestStreak
        };
    }
}
