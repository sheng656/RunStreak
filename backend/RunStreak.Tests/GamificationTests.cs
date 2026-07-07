using RunStreak.Api.Data;
using RunStreak.Api.Models;
using RunStreak.Api.Services;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace RunStreak.Tests;

public class GamificationTests
{
    private AppDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        return new AppDbContext(options);
    }

    #region PointsService Tests

    [Theory]
    [InlineData(0, 0, 0, 10)] // Base only
    [InlineData(5.0, 30, 0, 35)] // Base 10 + 5*5 = 35
    [InlineData(5.0, 30, 6, 35)] // No multiplier for 6-day streak
    [InlineData(5.0, 30, 7, 53)] // 35 * 1.5 = 52.5 -> rounds to 53
    [InlineData(10.0, 60, 15, 90)] // (10 + 10*5) * 1.5 = 60 * 1.5 = 90
    [InlineData(-1.0, 10, 0, 0)] // Invalid inputs return 0
    public void CalculatePoints_ShouldApplyFormulaCorrectly(double distance, double duration, int streak, int expectedPoints)
    {
        // Arrange
        var pointsService = new PointsService();

        // Act
        var result = pointsService.CalculatePoints((decimal)distance, (decimal)duration, streak);

        // Assert
        Assert.Equal(expectedPoints, result);
    }

    #endregion

    #region StreakService Tests

    [Fact]
    public async Task RecalculateStreakAsync_ShouldReturnZero_WhenNoRunsExist()
    {
        // Arrange
        using var context = CreateContext();
        var streakService = new StreakService(context);
        var userId = Guid.NewGuid();

        // Act
        var result = await streakService.RecalculateStreakAsync(userId);

        // Assert
        Assert.Equal(0, result.CurrentStreak);
        Assert.Equal(0, result.LongestStreak);
    }

    [Fact]
    public async Task RecalculateStreakAsync_ShouldCalculateStreaksCorrectly()
    {
        // Arrange
        using var context = CreateContext();
        var streakService = new StreakService(context);
        var userId = Guid.NewGuid();

        // Add 3 consecutive runs ending today (UTC date)
        var today = DateTime.UtcNow.Date;
        context.Runs.AddRange(
            new Run { UserId = userId, DistanceKm = 5, DurationMinutes = 30, RunDate = today.AddDays(-2) },
            new Run { UserId = userId, DistanceKm = 5, DurationMinutes = 30, RunDate = today.AddDays(-1) },
            new Run { UserId = userId, DistanceKm = 5, DurationMinutes = 30, RunDate = today }
        );
        await context.SaveChangesAsync();

        // Act
        var result = await streakService.RecalculateStreakAsync(userId);

        // Assert
        Assert.Equal(3, result.CurrentStreak);
        Assert.Equal(3, result.LongestStreak);
    }

    [Fact]
    public async Task RecalculateStreakAsync_ShouldResetCurrentStreak_WhenActiveStreakIsBroken()
    {
        // Arrange
        using var context = CreateContext();
        var streakService = new StreakService(context);
        var userId = Guid.NewGuid();

        // Add run 3 days ago and 2 days ago (not yesterday, nor today)
        var today = DateTime.UtcNow.Date;
        context.Runs.AddRange(
            new Run { UserId = userId, DistanceKm = 5, DurationMinutes = 30, RunDate = today.AddDays(-3) },
            new Run { UserId = userId, DistanceKm = 5, DurationMinutes = 30, RunDate = today.AddDays(-2) }
        );
        await context.SaveChangesAsync();

        // Act
        var result = await streakService.RecalculateStreakAsync(userId);

        // Assert
        Assert.Equal(0, result.CurrentStreak); // Expired
        Assert.Equal(2, result.LongestStreak); // Pre-existing longest streak tracked
    }

    [Fact]
    public async Task RecalculateStreakAsync_ShouldTrackLongestStreakCorrectly()
    {
        // Arrange
        using var context = CreateContext();
        var streakService = new StreakService(context);
        var userId = Guid.NewGuid();

        var today = DateTime.UtcNow.Date;
        
        // Add streak of 5 in the past
        context.Runs.AddRange(
            new Run { UserId = userId, RunDate = today.AddDays(-15) },
            new Run { UserId = userId, RunDate = today.AddDays(-14) },
            new Run { UserId = userId, RunDate = today.AddDays(-13) },
            new Run { UserId = userId, RunDate = today.AddDays(-12) },
            new Run { UserId = userId, RunDate = today.AddDays(-11) }
        );

        // Add current streak of 2 ending today
        context.Runs.AddRange(
            new Run { UserId = userId, RunDate = today.AddDays(-1) },
            new Run { UserId = userId, RunDate = today }
        );
        await context.SaveChangesAsync();

        // Act
        var result = await streakService.RecalculateStreakAsync(userId);

        // Assert
        Assert.Equal(2, result.CurrentStreak);
        Assert.Equal(5, result.LongestStreak);
    }

    #endregion

    #region BadgeService Tests

    [Fact]
    public async Task CheckAndAwardBadgesAsync_ShouldAwardFirstSteps_OnFirstRun()
    {
        // Arrange
        using var context = CreateContext();
        await DbSeeder.SeedBadgesAsync(context);

        var badgeService = new BadgeService(context);
        var user = new User
        {
            Username = "athlete",
            Email = "athlete@example.com",
            TotalRuns = 1,
            TotalDistanceKm = 3m
        };
        context.Users.Add(user);
        await context.SaveChangesAsync();

        // Act
        var newlyUnlocked = await badgeService.CheckAndAwardBadgesAsync(user.Id);

        // Assert
        Assert.Single(newlyUnlocked);
        Assert.Equal("First Steps", newlyUnlocked[0].Name);

        // Verify points award is saved in User profile
        var dbUser = await context.Users.FindAsync(user.Id);
        Assert.NotNull(dbUser);
        Assert.Equal(50, dbUser.TotalPoints); // First steps awards 50 points

        // Verify UserBadge record is created
        var earnedBadge = await context.UserBadges.FirstOrDefaultAsync(ub => ub.UserId == user.Id);
        Assert.NotNull(earnedBadge);
    }

    [Fact]
    public async Task CheckAndAwardBadgesAsync_ShouldAwardMultipleBadges_IfMultipleCriteriaMet()
    {
        // Arrange
        using var context = CreateContext();
        await DbSeeder.SeedBadgesAsync(context);

        var badgeService = new BadgeService(context);
        var user = new User
        {
            Username = "runner",
            Email = "runner@example.com",
            TotalRuns = 5,
            TotalDistanceKm = 10m
        };
        context.Users.Add(user);
        
        // Log one single run of 6km to satisfy "5K Club" criteria in database (pace = 30/6 = 5.0, which doesn't trigger Speed Demon)
        context.Runs.Add(new Run { UserId = user.Id, DistanceKm = 6, DurationMinutes = 30, PaceMinPerKm = 5.0m, RunDate = DateTime.UtcNow });
        await context.SaveChangesAsync();

        // Act
        var newlyUnlocked = await badgeService.CheckAndAwardBadgesAsync(user.Id);

        // Assert
        // Should unlock "First Steps" (runs >= 1), "Warming Up" (runs >= 5), "5K Finisher" (single run distance >= 5km), and "10K Club" (total distance >= 10km)
        Assert.Equal(4, newlyUnlocked.Count);
        Assert.Contains(newlyUnlocked, b => b.Name == "First Steps");
        Assert.Contains(newlyUnlocked, b => b.Name == "Warming Up");
        Assert.Contains(newlyUnlocked, b => b.Name == "5K Finisher");
        Assert.Contains(newlyUnlocked, b => b.Name == "10K Club");

        var dbUser = await context.Users.FindAsync(user.Id);
        Assert.NotNull(dbUser);
        // Total points should be: 50 (First Steps) + 100 (Warming Up) + 100 (5K Finisher) + 50 (10K Club) = 300
        Assert.Equal(300, dbUser.TotalPoints);
    }

    [Fact]
    public async Task CheckAndAwardBadgesAsync_ShouldNotAwardAlreadyUnlockedBadges()
    {
        // Arrange
        using var context = CreateContext();
        await DbSeeder.SeedBadgesAsync(context);

        var badgeService = new BadgeService(context);
        var user = new User
        {
            Username = "runner",
            Email = "runner@example.com",
            TotalRuns = 1,
            TotalDistanceKm = 5m
        };
        context.Users.Add(user);
        await context.SaveChangesAsync();

        // First award: awards "First Steps"
        var firstAward = await badgeService.CheckAndAwardBadgesAsync(user.Id);
        Assert.Single(firstAward);

        // Second award check: should return 0 new badges
        var secondAward = await badgeService.CheckAndAwardBadgesAsync(user.Id);
        Assert.Empty(secondAward);
    }

    [Fact]
    public async Task CheckAndAwardBadgesAsync_ShouldAwardDistanceCountBadge_WhenCountThresholdReached()
    {
        // Arrange
        using var context = CreateContext();
        await DbSeeder.SeedBadgesAsync(context);

        var badgeService = new BadgeService(context);
        var user = new User
        {
            Username = "marathoner",
            Email = "marathoner@example.com",
            TotalRuns = 5,
            TotalDistanceKm = 25m
        };
        context.Users.Add(user);

        // Add 5 separate runs of >= 5km
        for (int i = 0; i < 5; i++)
        {
            context.Runs.Add(new Run
            {
                UserId = user.Id,
                DistanceKm = 5.2m,
                DurationMinutes = 26m,
                RunDate = DateTime.UtcNow.AddDays(-i)
            });
        }
        await context.SaveChangesAsync();

        // Act
        var newlyUnlocked = await badgeService.CheckAndAwardBadgesAsync(user.Id);

        // Assert
        // Should unlock "5K × 5" badge since there are exactly 5 runs >= 5km!
        Assert.Contains(newlyUnlocked, b => b.Name == "5K × 5");
    }

    #endregion

    #region Streak Freeze & Weekly Leaderboard Tests

    [Fact]
    public async Task RecalculateStreakAsync_ShouldMaintainStreak_WhenStreakFreezeIsUsedOnGapDays()
    {
        // Arrange
        using var context = CreateContext();
        var streakService = new StreakService(context);
        var userId = Guid.NewGuid();

        // Add user with 1 streak freeze count
        var user = new User
        {
            Id = userId,
            Username = "freezer",
            Email = "freezer@example.com",
            StreakFreezeCount = 1
        };
        context.Users.Add(user);

        // Add run 2 days ago and a run today (gap of yesterday)
        var today = DateTime.UtcNow.Date;
        context.Runs.AddRange(
            new Run { UserId = userId, DistanceKm = 5, DurationMinutes = 30, RunDate = today.AddDays(-2) },
            new Run { UserId = userId, DistanceKm = 5, DurationMinutes = 30, RunDate = today }
        );
        await context.SaveChangesAsync();

        // Act
        // This should auto-apply the 1 available freeze to yesterday and preserve streak!
        var result = await streakService.RecalculateStreakAsync(userId);

        // Assert
        Assert.Equal(3, result.CurrentStreak); // 2 days ago + yesterday (freeze) + today = 3
        Assert.Equal(0, user.StreakFreezeCount); // Freeze was consumed

        // Verify a used freeze was logged in DB
        var loggedFreeze = await context.StreakFreezes.FirstOrDefaultAsync(sf => sf.UserId == userId);
        Assert.NotNull(loggedFreeze);
        Assert.Equal("used", loggedFreeze.Type);
        Assert.Equal(today.AddDays(-1), loggedFreeze.Date.Date);
    }

    [Fact]
    public async Task StreakFreezeService_PurchaseStreakFreeze_ShouldDeductPointsAndIncrementCount()
    {
        // Arrange
        using var context = CreateContext();
        var freezeService = new StreakFreezeService(context);
        var userId = Guid.NewGuid();

        var user = new User
        {
            Id = userId,
            Username = "buyer",
            Email = "buyer@example.com",
            TotalPoints = 300,
            StreakFreezeCount = 0
        };
        context.Users.Add(user);
        await context.SaveChangesAsync();

        // Act
        var success = await freezeService.PurchaseStreakFreezeAsync(userId);

        // Assert
        Assert.True(success);
        Assert.Equal(1, user.StreakFreezeCount);
        Assert.Equal(44, user.TotalPoints); // 300 - 256 = 44
    }

    [Fact]
    public async Task StreakFreezeService_CheckAutoEarn_ShouldAwardFreezeOnMilestones()
    {
        // Arrange
        using var context = CreateContext();
        var freezeService = new StreakFreezeService(context);
        var userId = Guid.NewGuid();

        var user = new User
        {
            Id = userId,
            Username = "earner",
            Email = "earner@example.com",
            CurrentStreak = 5,
            TotalDistanceKm = 65m,
            StreakFreezeCount = 0
        };
        context.Users.Add(user);

        // Add a run so latest run date check doesn't return default
        context.Runs.Add(new Run
        {
            UserId = userId,
            DistanceKm = 65m,
            DurationMinutes = 300m,
            RunDate = DateTime.UtcNow.Date
        });
        await context.SaveChangesAsync();

        // Act
        var earned = await freezeService.CheckAutoEarnAsync(userId);

        // Assert
        // Should earn 2 freezes: 1 for streak 5, 1 for distance 65km (> 60km)
        Assert.Equal(2, earned);
        Assert.Equal(2, user.StreakFreezeCount);
    }

    [Fact]
    public async Task LeaderboardService_WeeklyRanking_ShouldOnlySumLast7DaysPoints()
    {
        // Arrange
        using var context = CreateContext();
        var leaderboardService = new LeaderboardService(context);
        
        var user1 = new User { Id = Guid.NewGuid(), Username = "u1", DisplayName = "U1" };
        var user2 = new User { Id = Guid.NewGuid(), Username = "u2", DisplayName = "U2" };
        context.Users.AddRange(user1, user2);

        // User 1 has run today (100 points) and run 10 days ago (500 points)
        var today = DateTime.UtcNow.Date;
        context.Runs.AddRange(
            new Run { UserId = user1.Id, DistanceKm = 5, DurationMinutes = 30, PointsEarned = 100, RunDate = today },
            new Run { UserId = user1.Id, DistanceKm = 5, DurationMinutes = 30, PointsEarned = 500, RunDate = today.AddDays(-10) },
            // User 2 has run 2 days ago (200 points)
            new Run { UserId = user2.Id, DistanceKm = 5, DurationMinutes = 30, PointsEarned = 200, RunDate = today.AddDays(-2) }
        );
        await context.SaveChangesAsync();

        // Act
        var leaderboard = await leaderboardService.GetLeaderboardAsync("weekly", 1, 10);

        // Assert
        // For last 7 days:
        // User 2: 200 points
        // User 1: 100 points (500 points run is excluded)
        Assert.Equal(2, leaderboard.Count);
        
        var first = leaderboard[0];
        Assert.Equal(user2.Id, first.UserId);
        Assert.Equal(200, first.TotalPoints);

        var second = leaderboard[1];
        Assert.Equal(user1.Id, second.UserId);
        Assert.Equal(100, second.TotalPoints);
    }

    #endregion
}
