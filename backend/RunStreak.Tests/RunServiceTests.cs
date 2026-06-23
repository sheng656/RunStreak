using RunStreak.Api.Data;
using RunStreak.Api.DTOs.Runs;
using RunStreak.Api.Models;
using RunStreak.Api.Services;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace RunStreak.Tests;

public class RunServiceTests
{
    private AppDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .ConfigureWarnings(x => x.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.InMemoryEventId.TransactionIgnoredWarning))
            .Options;
        return new AppDbContext(options);
    }

    [Fact]
    public async Task LogRunAsync_ShouldCreateRunAndRecalculateStats()
    {
        // Arrange
        using var context = CreateContext();
        await DbSeeder.SeedBadgesAsync(context);

        var pointsService = new PointsService();
        var streakService = new StreakService(context);
        var badgeService = new BadgeService(context);
        var runService = new RunService(context, pointsService, streakService, badgeService);

        var user = new User
        {
            Username = "runner",
            Email = "runner@example.com",
            DisplayName = "Runner"
        };
        context.Users.Add(user);
        await context.SaveChangesAsync();

        var request = new LogRunRequest
        {
            DistanceKm = 5.0m,
            DurationMinutes = 25m,
            RunDate = DateTime.UtcNow,
            Notes = "Felt great!"
        };

        // Act
        var (run, newlyUnlockedBadges) = await runService.LogRunAsync(user.Id, request);

        // Assert
        Assert.NotNull(run);
        Assert.Equal(5.0m, run.DistanceKm);
        Assert.Equal(25m, run.DurationMinutes);
        Assert.Equal("Felt great!", run.Notes);
        
        // Points logic: Base 10 + 5*5 = 35 points (streak is 1, so no multiplier)
        Assert.Equal(35, run.PointsEarned);

        // Verify database updates
        var dbRun = await context.Runs.FindAsync(run.Id);
        Assert.NotNull(dbRun);

        var dbUser = await context.Users.FindAsync(user.Id);
        Assert.NotNull(dbUser);
        Assert.Equal(1, dbUser.TotalRuns);
        Assert.Equal(5.0m, dbUser.TotalDistanceKm);
        Assert.Equal(1, dbUser.CurrentStreak);
        
        // User points: 35 (from run) + 50 (First Steps badge) + 100 (5K Club badge) = 185
        Assert.Equal(185, dbUser.TotalPoints);

        // First Steps and 5K Club badges should be unlocked
        Assert.Equal(2, newlyUnlockedBadges.Count);
        Assert.Contains(newlyUnlockedBadges, b => b.Name == "First Steps");
        Assert.Contains(newlyUnlockedBadges, b => b.Name == "5K Club");
    }

    [Fact]
    public async Task UpdateRunAsync_ShouldUpdateRunAndRecalculateStatsCorrectly()
    {
        // Arrange
        using var context = CreateContext();
        await DbSeeder.SeedBadgesAsync(context);

        var pointsService = new PointsService();
        var streakService = new StreakService(context);
        var badgeService = new BadgeService(context);
        var runService = new RunService(context, pointsService, streakService, badgeService);

        var user = new User
        {
            Username = "runner",
            Email = "runner@example.com",
            DisplayName = "Runner"
        };
        context.Users.Add(user);
        await context.SaveChangesAsync();

        // Log initial run
        var logRequest = new LogRunRequest
        {
            DistanceKm = 4.0m,
            DurationMinutes = 20m,
            RunDate = DateTime.UtcNow,
            Notes = "First Run"
        };
        var (loggedRun, _) = await runService.LogRunAsync(user.Id, logRequest);

        // Act: Update run to be 6.0km (triggers "5K Club" badge)
        var updateRequest = new UpdateRunRequest
        {
            DistanceKm = 6.0m,
            DurationMinutes = 30m,
            RunDate = DateTime.UtcNow,
            Notes = "Updated Run"
        };

        var result = await runService.UpdateRunAsync(user.Id, loggedRun.Id, updateRequest);

        // Assert
        Assert.NotNull(result);
        var updatedRun = result.Value.Run;
        var unlockedBadges = result.Value.UnlockedBadges;

        Assert.Equal(6.0m, updatedRun.DistanceKm);
        
        // Recalculated run points: Base 10 + 6*5 = 40 points
        Assert.Equal(40, updatedRun.PointsEarned);

        // Check user stats recalculation
        var dbUser = await context.Users.FindAsync(user.Id);
        Assert.NotNull(dbUser);
        Assert.Equal(6.0m, dbUser.TotalDistanceKm);

        // Unlocked badges: Should unlock "5K Club" (First Steps was unlocked in LogRunAsync)
        Assert.Single(unlockedBadges);
        Assert.Equal("5K Club", unlockedBadges[0].Name);

        // Total Points: 40 (Run Points) + 50 (First Steps) + 100 (5K Club) = 190
        Assert.Equal(190, dbUser.TotalPoints);
    }

    [Fact]
    public async Task DeleteRunAsync_ShouldRemoveRunAndRecalculateStatsWithoutRevokingBadges()
    {
        // Arrange
        using var context = CreateContext();
        await DbSeeder.SeedBadgesAsync(context);

        var pointsService = new PointsService();
        var streakService = new StreakService(context);
        var badgeService = new BadgeService(context);
        var runService = new RunService(context, pointsService, streakService, badgeService);

        var user = new User
        {
            Username = "runner",
            Email = "runner@example.com",
            DisplayName = "Runner"
        };
        context.Users.Add(user);
        await context.SaveChangesAsync();

        // Log run 1 (unlocks First Steps)
        var run1 = await runService.LogRunAsync(user.Id, new LogRunRequest
        {
            DistanceKm = 5.0m,
            DurationMinutes = 25m,
            RunDate = DateTime.UtcNow.AddDays(-1)
        });

        // Log run 2 (recalculates streak to 2, unlocks 5K Club - though it was already unlocked)
        var run2 = await runService.LogRunAsync(user.Id, new LogRunRequest
        {
            DistanceKm = 3.0m,
            DurationMinutes = 15m,
            RunDate = DateTime.UtcNow
        });

        var dbUserBeforeDelete = await context.Users.AsNoTracking().FirstAsync(u => u.Id == user.Id);
        Assert.Equal(2, dbUserBeforeDelete.TotalRuns);
        Assert.Equal(8.0m, dbUserBeforeDelete.TotalDistanceKm);
        Assert.Equal(2, dbUserBeforeDelete.CurrentStreak);

        // Act: Delete run 2
        var success = await runService.DeleteRunAsync(user.Id, run2.Run.Id);

        // Assert
        Assert.True(success);

        // Verify run 2 is deleted from DB
        var dbRun2 = await context.Runs.FindAsync(run2.Run.Id);
        Assert.Null(dbRun2);

        // Verify user stats recalculated
        var dbUserAfterDelete = await context.Users.Include(u => u.UserBadges).FirstAsync(u => u.Id == user.Id);
        Assert.Equal(1, dbUserAfterDelete.TotalRuns);
        Assert.Equal(5.0m, dbUserAfterDelete.TotalDistanceKm);
        
        // Streak recalculation: since we deleted today's run, the latest run is yesterday, so streak remains 1!
        Assert.Equal(1, dbUserAfterDelete.CurrentStreak);

        // Verify badges are NOT revoked (First Steps and 5K Club should still be unlocked)
        Assert.Equal(2, dbUserAfterDelete.UserBadges.Count);

        // User points: 35 (Run 1 points) + 50 (First Steps badge) + 100 (5K Club badge) = 185
        Assert.Equal(185, dbUserAfterDelete.TotalPoints);
    }
}
