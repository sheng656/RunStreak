using Microsoft.EntityFrameworkCore;
using RunStreak.Api.Data;
using RunStreak.Api.DTOs.Runs;
using RunStreak.Api.Models;

namespace RunStreak.Api.Services;

public class RunService(
    AppDbContext context,
    IPointsService pointsService,
    IStreakService streakService,
    IBadgeService badgeService) : IRunService
{
    private readonly AppDbContext _context = context;
    private readonly IPointsService _pointsService = pointsService;
    private readonly IStreakService _streakService = streakService;
    private readonly IBadgeService _badgeService = badgeService;

    public async Task<RunDto?> GetRunByIdAsync(Guid runId, Guid userId)
    {
        var run = await _context.Runs
            .AsNoTracking()
            .FirstOrDefaultAsync(r => r.Id == runId && r.UserId == userId);

        if (run == null) return null;

        return MapToDto(run);
    }

    public async Task<(List<RunDto> Runs, int TotalCount)> GetUserRunsAsync(Guid userId, int page, int pageSize)
    {
        if (page < 1) page = 1;
        if (pageSize < 1 || pageSize > 100) pageSize = 10;

        var baseQuery = _context.Runs.Where(r => r.UserId == userId);

        int totalCount = await baseQuery.CountAsync();

        var runs = await baseQuery
            .AsNoTracking()
            .OrderByDescending(r => r.RunDate)
            .ThenByDescending(r => r.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var dtos = runs.Select(MapToDto).ToList();

        return (dtos, totalCount);
    }

    public async Task<(RunDto Run, List<Badge> UnlockedBadges)> LogRunAsync(Guid userId, LogRunRequest request)
    {
        var strategy = _context.Database.CreateExecutionStrategy();
        return await strategy.ExecuteAsync(async () =>
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var user = await _context.Users.FindAsync(userId) 
                    ?? throw new KeyNotFoundException("User not found.");

                // 1. Create run entity
                var run = new Run
                {
                    UserId = userId,
                    DistanceKm = request.DistanceKm,
                    DurationMinutes = request.DurationMinutes,
                    RunDate = request.RunDate.ToUniversalTime(),
                    Notes = request.Notes,
                    PerceivedEffort = request.PerceivedEffort,
                    PaceMinPerKm = request.DurationMinutes / request.DistanceKm,
                    PointsEarned = 0, // Calculated after updating streak
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _context.Runs.Add(run);
                await _context.SaveChangesAsync();

                // 2. Recalculate streak
                var streakResult = await _streakService.RecalculateStreakAsync(userId);
                user.CurrentStreak = streakResult.CurrentStreak;
                if (streakResult.LongestStreak > user.LongestStreak)
                {
                    user.LongestStreak = streakResult.LongestStreak;
                }

                // 3. Calculate points for this run
                run.PointsEarned = _pointsService.CalculatePoints(run.DistanceKm, run.DurationMinutes, user.CurrentStreak);
                
                // 4. Update user denormalized stats
                user.TotalRuns++;
                user.TotalDistanceKm += run.DistanceKm;
                user.TotalPoints += run.PointsEarned;
                user.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                // 5. Check and award badges
                var newlyUnlockedBadges = await _badgeService.CheckAndAwardBadgesAsync(userId);

                await transaction.CommitAsync();

                return (MapToDto(run), newlyUnlockedBadges);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[RunService] Error in LogRunAsync: {ex}");
                await transaction.RollbackAsync();
                throw;
            }
        });
    }

    public async Task<(RunDto Run, List<Badge> UnlockedBadges)?> UpdateRunAsync(Guid userId, Guid runId, UpdateRunRequest request)
    {
        var strategy = _context.Database.CreateExecutionStrategy();
        return await strategy.ExecuteAsync(async () =>
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var run = await _context.Runs.FirstOrDefaultAsync(r => r.Id == runId && r.UserId == userId);
                if (run == null) return null;

                var user = await _context.Users.FindAsync(userId) 
                    ?? throw new KeyNotFoundException("User not found.");

                // Update run values
                run.DistanceKm = request.DistanceKm;
                run.DurationMinutes = request.DurationMinutes;
                run.PaceMinPerKm = request.DurationMinutes / request.DistanceKm;
                run.RunDate = request.RunDate.ToUniversalTime();
                run.Notes = request.Notes;
                run.PerceivedEffort = request.PerceivedEffort;
                run.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                // Recalculate user streak & stats
                var streakResult = await _streakService.RecalculateStreakAsync(userId);
                user.CurrentStreak = streakResult.CurrentStreak;
                if (streakResult.LongestStreak > user.LongestStreak)
                {
                    user.LongestStreak = streakResult.LongestStreak;
                }

                // Recalculate this run's points
                run.PointsEarned = _pointsService.CalculatePoints(run.DistanceKm, run.DurationMinutes, user.CurrentStreak);
                await _context.SaveChangesAsync();

                // Recalculate user denormalized stats to prevent drift
                user.TotalRuns = await _context.Runs.CountAsync(r => r.UserId == userId);
                user.TotalDistanceKm = await _context.Runs.Where(r => r.UserId == userId).SumAsync(r => r.DistanceKm);
                
                var baseRunPoints = await _context.Runs.Where(r => r.UserId == userId).SumAsync(r => r.PointsEarned);
                var badgePoints = await _context.UserBadges
                    .Where(ub => ub.UserId == userId)
                    .Include(ub => ub.Badge)
                    .SumAsync(ub => ub.Badge.PointsReward);
                
                user.TotalPoints = baseRunPoints + badgePoints;
                user.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                // Check if updates unlocked new badges
                var newlyUnlockedBadges = await _badgeService.CheckAndAwardBadgesAsync(userId);

                await transaction.CommitAsync();

                return ((RunDto Run, List<Badge> UnlockedBadges)?)((MapToDto(run), newlyUnlockedBadges));
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[RunService] Error in UpdateRunAsync: {ex}");
                await transaction.RollbackAsync();
                throw;
            }
        });
    }

    public async Task<bool> DeleteRunAsync(Guid userId, Guid runId)
    {
        var strategy = _context.Database.CreateExecutionStrategy();
        return await strategy.ExecuteAsync(async () =>
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var run = await _context.Runs.FirstOrDefaultAsync(r => r.Id == runId && r.UserId == userId);
                if (run == null) return false;

                var user = await _context.Users.FindAsync(userId) 
                    ?? throw new KeyNotFoundException("User not found.");

                _context.Runs.Remove(run);
                await _context.SaveChangesAsync();

                // Recalculate streak (excluding the deleted run, which is already removed from Context)
                var streakResult = await _streakService.RecalculateStreakAsync(userId);
                user.CurrentStreak = streakResult.CurrentStreak;
                if (streakResult.LongestStreak > user.LongestStreak)
                {
                    user.LongestStreak = streakResult.LongestStreak;
                }

                // Recalculate user denormalized stats
                user.TotalRuns = await _context.Runs.CountAsync(r => r.UserId == userId);
                user.TotalDistanceKm = await _context.Runs.Where(r => r.UserId == userId).SumAsync(r => r.DistanceKm);
                
                var baseRunPoints = await _context.Runs.Where(r => r.UserId == userId).SumAsync(r => r.PointsEarned);
                var badgePoints = await _context.UserBadges
                    .Where(ub => ub.UserId == userId)
                    .Include(ub => ub.Badge)
                    .SumAsync(ub => ub.Badge.PointsReward);

                user.TotalPoints = baseRunPoints + badgePoints;
                user.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                await transaction.CommitAsync();
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[RunService] Error in DeleteRunAsync: {ex}");
                await transaction.RollbackAsync();
                throw;
            }
        });
    }

    private static RunDto MapToDto(Run run)
    {
        return new RunDto
        {
            Id = run.Id,
            UserId = run.UserId,
            DistanceKm = run.DistanceKm,
            DurationMinutes = run.DurationMinutes,
            PaceMinPerKm = run.PaceMinPerKm,
            RunDate = run.RunDate,
            Notes = run.Notes,
            PointsEarned = run.PointsEarned,
            PerceivedEffort = run.PerceivedEffort,
            CreatedAt = run.CreatedAt,
            UpdatedAt = run.UpdatedAt
        };
    }
}
