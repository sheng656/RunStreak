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
        // Should unlock "First Steps" (runs >= 1), "Getting Started" (runs >= 5), and "5K Club" (single run distance >= 5km)
        Assert.Equal(3, newlyUnlocked.Count);
        Assert.Contains(newlyUnlocked, b => b.Name == "First Steps");
        Assert.Contains(newlyUnlocked, b => b.Name == "Getting Started");
        Assert.Contains(newlyUnlocked, b => b.Name == "5K Club");

        var dbUser = await context.Users.FindAsync(user.Id);
        Assert.NotNull(dbUser);
        // Total points should be: 50 (First Steps) + 100 (Getting Started) + 100 (5K Club) = 250
        Assert.Equal(250, dbUser.TotalPoints);
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

    #endregion
}
