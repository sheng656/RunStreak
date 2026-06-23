using RunStreak.Api.Models;

namespace RunStreak.Api.Services;

public interface IBadgeService
{
    Task<List<Badge>> CheckAndAwardBadgesAsync(Guid userId);
}
