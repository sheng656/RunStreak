using Microsoft.EntityFrameworkCore;
using RunStreak.Api.Data;
using RunStreak.Api.DTOs.Challenges;
using RunStreak.Api.Models;

namespace RunStreak.Api.Services;

public class ChallengeService(AppDbContext context) : IChallengeService
{
    private readonly AppDbContext _context = context;

    public async Task<List<ChallengeDto>> GetChallengesAsync(Guid userId)
    {
        var challenges = await _context.Challenges
            .AsNoTracking()
            .OrderBy(c => c.SortOrder)
            .ToListAsync();

        var userChallenges = await _context.UserChallenges
            .AsNoTracking()
            .Where(uc => uc.UserId == userId)
            .ToListAsync();

        var dtos = new List<ChallengeDto>();

        foreach (var c in challenges)
        {
            var userProgress = userChallenges.FirstOrDefault(uc => uc.ChallengeId == c.Id);

            bool isActive = userProgress?.IsActive ?? false;
            bool isCompleted = userProgress?.CompletedAt.HasValue ?? false;
            decimal progressKm = userProgress?.ProgressDistanceKm ?? 0m;
            decimal percentage = c.TargetDistanceKm > 0
                ? Math.Min(100m, Math.Round((progressKm / c.TargetDistanceKm) * 100m, 1))
                : 0m;

            dtos.Add(new ChallengeDto
            {
                Id = c.Id,
                Name = c.Name,
                Description = c.Description,
                TargetDistanceKm = c.TargetDistanceKm,
                IconUrl = c.IconUrl,
                Rarity = c.Rarity,
                SortOrder = c.SortOrder,
                IsActive = isActive,
                IsCompleted = isCompleted,
                ProgressDistanceKm = Math.Round(progressKm, 2),
                CompletionPercentage = percentage,
                StartedAt = userProgress?.StartedAt,
                CompletedAt = userProgress?.CompletedAt
            });
        }

        return dtos;
    }

    public async Task<bool> StartChallengeAsync(Guid userId, Guid challengeId)
    {
        var challenge = await _context.Challenges.FindAsync(challengeId);
        if (challenge == null) return false;

        var existingUserChallenge = await _context.UserChallenges
            .FirstOrDefaultAsync(uc => uc.UserId == userId && uc.ChallengeId == challengeId);

        if (existingUserChallenge != null)
        {
            if (existingUserChallenge.CompletedAt.HasValue)
            {
                return false; // Already completed
            }

            // Reactivate if paused or not active
            // Deactivate any currently active challenge first
            var activeChallenges = await _context.UserChallenges
                .Where(uc => uc.UserId == userId && uc.IsActive && uc.ChallengeId != challengeId)
                .ToListAsync();

            foreach (var ac in activeChallenges)
            {
                ac.IsActive = false;
            }

            existingUserChallenge.IsActive = true;
            await _context.SaveChangesAsync();
            return true;
        }

        // Deactivate all existing active challenges
        var currentActives = await _context.UserChallenges
            .Where(uc => uc.UserId == userId && uc.IsActive)
            .ToListAsync();

        foreach (var ca in currentActives)
        {
            ca.IsActive = false;
        }

        // Create new UserChallenge
        var newUc = new UserChallenge
        {
            UserId = userId,
            ChallengeId = challengeId,
            ProgressDistanceKm = 0m,
            IsActive = true,
            StartedAt = DateTime.UtcNow
        };

        _context.UserChallenges.Add(newUc);
        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<ActiveChallengeSummaryDto?> GetActiveChallengeAsync(Guid userId)
    {
        var activeUc = await _context.UserChallenges
            .AsNoTracking()
            .Where(uc => uc.UserId == userId && uc.IsActive && uc.CompletedAt == null)
            .Include(uc => uc.Challenge)
            .FirstOrDefaultAsync();

        if (activeUc == null) return null;

        decimal progressKm = activeUc.ProgressDistanceKm;
        decimal targetKm = activeUc.Challenge.TargetDistanceKm;
        decimal remainingKm = Math.Max(0m, targetKm - progressKm);
        decimal percentage = targetKm > 0
            ? Math.Min(100m, Math.Round((progressKm / targetKm) * 100m, 1))
            : 0m;

        return new ActiveChallengeSummaryDto
        {
            ChallengeId = activeUc.ChallengeId,
            Name = activeUc.Challenge.Name,
            Description = activeUc.Challenge.Description,
            TargetDistanceKm = targetKm,
            ProgressDistanceKm = Math.Round(progressKm, 2),
            RemainingDistanceKm = Math.Round(remainingKm, 2),
            CompletionPercentage = percentage,
            IconUrl = activeUc.Challenge.IconUrl,
            Rarity = activeUc.Challenge.Rarity
        };
    }

    public async Task UpdateProgressOnRunLoggedAsync(Guid userId, decimal runDistanceKm)
    {
        if (runDistanceKm <= 0) return;

        var activeUc = await _context.UserChallenges
            .Where(uc => uc.UserId == userId && uc.IsActive && uc.CompletedAt == null)
            .Include(uc => uc.Challenge)
            .FirstOrDefaultAsync();

        if (activeUc == null) return;

        activeUc.ProgressDistanceKm += runDistanceKm;

        // Check completion
        if (activeUc.ProgressDistanceKm >= activeUc.Challenge.TargetDistanceKm)
        {
            activeUc.ProgressDistanceKm = activeUc.Challenge.TargetDistanceKm;
            activeUc.CompletedAt = DateTime.UtcNow;
            activeUc.IsActive = false;

            // Award associated badge if configured
            if (activeUc.Challenge.BadgeId.HasValue)
            {
                bool badgeAlreadyEarned = await _context.UserBadges.AnyAsync(ub =>
                    ub.UserId == userId && ub.BadgeId == activeUc.Challenge.BadgeId.Value);

                if (!badgeAlreadyEarned)
                {
                    var userBadge = new UserBadge
                    {
                        UserId = userId,
                        BadgeId = activeUc.Challenge.BadgeId.Value,
                        UnlockedAt = DateTime.UtcNow
                    };
                    _context.UserBadges.Add(userBadge);

                    var badge = await _context.Badges.FindAsync(activeUc.Challenge.BadgeId.Value);
                    if (badge != null)
                    {
                        var user = await _context.Users.FindAsync(userId);
                        if (user != null)
                        {
                            user.TotalPoints += badge.PointsReward;
                        }
                    }
                }
            }
        }

        await _context.SaveChangesAsync();
    }
}
