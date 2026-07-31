using RunStreak.Api.Data;
using RunStreak.Api.Models;
using RunStreak.Api.Services;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace RunStreak.Tests;

public class ChallengeServiceTests
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
    public async Task GetChallengesAsync_ShouldReturnAllChallenges_WithCorrectCompletionCountAndProgress()
    {
        // Arrange
        using var context = CreateContext();
        await DbSeeder.SeedChallengesAsync(context);

        var user = new User { Username = "challenger", Email = "c@example.com", DisplayName = "Challenger" };
        context.Users.Add(user);
        await context.SaveChangesAsync();

        var challenge1 = await context.Challenges.FirstAsync(c => c.SortOrder == 1);
        var challenge2 = await context.Challenges.FirstAsync(c => c.SortOrder == 2);

        // Add 1 completed user challenge and 1 active user challenge
        context.UserChallenges.Add(new UserChallenge
        {
            UserId = user.Id,
            ChallengeId = challenge1.Id,
            ProgressDistanceKm = challenge1.TargetDistanceKm,
            IsActive = false,
            StartedAt = DateTime.UtcNow.AddDays(-5),
            CompletedAt = DateTime.UtcNow.AddDays(-2)
        });

        context.UserChallenges.Add(new UserChallenge
        {
            UserId = user.Id,
            ChallengeId = challenge2.Id,
            ProgressDistanceKm = 4.0m,
            IsActive = true,
            StartedAt = DateTime.UtcNow.AddDays(-1)
        });

        await context.SaveChangesAsync();

        var service = new ChallengeService(context);

        // Act
        var result = await service.GetChallengesAsync(user.Id);

        // Assert
        Assert.NotNull(result);
        Assert.True(result.Count >= 2);

        var dto1 = result.First(c => c.Id == challenge1.Id);
        Assert.Equal(1, dto1.CompletionCount);
        Assert.True(dto1.IsCompleted);

        var dto2 = result.First(c => c.Id == challenge2.Id);
        Assert.True(dto2.IsActive);
        Assert.Equal(4.0m, dto2.ProgressDistanceKm);
        Assert.Equal(50.0m, dto2.CompletionPercentage); // 4km / 8km = 50%
    }

    [Fact]
    public async Task StartChallengeAsync_ShouldDeactivateExistingActiveChallenge_AndActivateNewChallenge()
    {
        // Arrange
        using var context = CreateContext();
        await DbSeeder.SeedChallengesAsync(context);

        var user = new User { Username = "switcher", Email = "switch@example.com", DisplayName = "Switcher" };
        context.Users.Add(user);
        await context.SaveChangesAsync();

        var c1 = await context.Challenges.FirstAsync(c => c.SortOrder == 1);
        var c2 = await context.Challenges.FirstAsync(c => c.SortOrder == 2);

        context.UserChallenges.Add(new UserChallenge
        {
            UserId = user.Id,
            ChallengeId = c1.Id,
            ProgressDistanceKm = 2.0m,
            IsActive = true,
            StartedAt = DateTime.UtcNow.AddDays(-1)
        });
        await context.SaveChangesAsync();

        var service = new ChallengeService(context);

        // Act - Start Challenge 2
        var started = await service.StartChallengeAsync(user.Id, c2.Id);

        // Assert
        Assert.True(started);

        var uc1 = await context.UserChallenges.FirstAsync(uc => uc.UserId == user.Id && uc.ChallengeId == c1.Id);
        Assert.False(uc1.IsActive); // Should be deactivated

        var uc2 = await context.UserChallenges.FirstAsync(uc => uc.UserId == user.Id && uc.ChallengeId == c2.Id);
        Assert.True(uc2.IsActive); // Should be active
    }

    [Fact]
    public async Task StartChallengeAsync_ShouldAllowRestartingCompletedChallenge()
    {
        // Arrange
        using var context = CreateContext();
        await DbSeeder.SeedChallengesAsync(context);

        var user = new User { Username = "repeater", Email = "repeat@example.com", DisplayName = "Repeater" };
        context.Users.Add(user);
        await context.SaveChangesAsync();

        var c1 = await context.Challenges.FirstAsync(c => c.SortOrder == 1);

        // Add previously completed instance of challenge 1
        context.UserChallenges.Add(new UserChallenge
        {
            UserId = user.Id,
            ChallengeId = c1.Id,
            ProgressDistanceKm = c1.TargetDistanceKm,
            IsActive = false,
            StartedAt = DateTime.UtcNow.AddDays(-10),
            CompletedAt = DateTime.UtcNow.AddDays(-5)
        });
        await context.SaveChangesAsync();

        var service = new ChallengeService(context);

        // Act - Restart completed challenge
        var started = await service.StartChallengeAsync(user.Id, c1.Id);

        // Assert
        Assert.True(started);

        var userChallenges = await context.UserChallenges
            .Where(uc => uc.UserId == user.Id && uc.ChallengeId == c1.Id)
            .ToListAsync();

        Assert.Equal(2, userChallenges.Count); // Original completed + new active run
        Assert.Contains(userChallenges, uc => uc.IsActive && uc.CompletedAt == null);
    }

    [Fact]
    public async Task UpdateProgressOnRunLoggedAsync_ShouldAccumulateDistance_AndMarkCompletedWhenTargetReached()
    {
        // Arrange
        using var context = CreateContext();
        await DbSeeder.SeedChallengesAsync(context);

        var user = new User { Username = "runner", Email = "r@example.com", DisplayName = "Runner" };
        context.Users.Add(user);
        await context.SaveChangesAsync();

        var c1 = await context.Challenges.FirstAsync(c => c.TargetDistanceKm == 5.0m);

        context.UserChallenges.Add(new UserChallenge
        {
            UserId = user.Id,
            ChallengeId = c1.Id,
            ProgressDistanceKm = 3.0m,
            IsActive = true,
            StartedAt = DateTime.UtcNow.AddDays(-1)
        });
        await context.SaveChangesAsync();

        var service = new ChallengeService(context);

        // Act - Log a 3km run (total 6km >= 5km target)
        await service.UpdateProgressOnRunLoggedAsync(user.Id, 3.0m);

        // Assert
        var uc = await context.UserChallenges.FirstAsync(uc => uc.UserId == user.Id && uc.ChallengeId == c1.Id);
        Assert.Equal(5.0m, uc.ProgressDistanceKm); // Clamped to target
        Assert.False(uc.IsActive); // Deactivated upon completion
        Assert.NotNull(uc.CompletedAt); // Completed timestamp recorded
    }

    [Fact]
    public async Task GetActiveChallengeAsync_ShouldReturnNull_WhenNoActiveChallengeExists()
    {
        // Arrange
        using var context = CreateContext();
        var service = new ChallengeService(context);

        // Act
        var result = await service.GetActiveChallengeAsync(Guid.NewGuid());

        // Assert
        Assert.Null(result);
    }
}
