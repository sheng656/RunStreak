namespace RunStreak.Api.DTOs.Users;

public class UserBadgeDto
{
    public Guid BadgeId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string IconUrl { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public int PointsReward { get; set; }
    public DateTime UnlockedAt { get; set; }
}
