using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using RunStreak.Api.DTOs.Challenges;

namespace RunStreak.Api.Services;

public interface IChallengeService
{
    Task<List<ChallengeDto>> GetChallengesAsync(Guid userId);
    Task<bool> StartChallengeAsync(Guid userId, Guid challengeId);
    Task<ActiveChallengeSummaryDto?> GetActiveChallengeAsync(Guid userId);
    Task UpdateProgressOnRunLoggedAsync(Guid userId, decimal runDistanceKm);
}
