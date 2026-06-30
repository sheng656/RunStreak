using RunStreak.Api.DTOs.Users;

namespace RunStreak.Api.Services;

public interface IUserService
{
    Task<UserProfileDto?> GetUserProfileAsync(Guid userId);
    Task<UserProfileDto?> UpdateUserProfileAsync(Guid userId, UpdateProfileRequest request);
    Task<List<UserBadgeDto>> GetUserBadgesAsync(Guid userId);
    Task<List<BadgeWithProgressDto>> GetBadgesWithProgressAsync(Guid userId);
    Task<UserStatsDto?> GetUserStatsAsync(Guid userId);
}
