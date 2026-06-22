namespace RunStreak.Api.Models;

/// <summary>
/// Junction table: tracks which badges a user has earned and when.
/// The (UserId, BadgeId) unique index prevents duplicate awards.
/// </summary>
public class UserBadge
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public Guid BadgeId { get; set; }
    public DateTime UnlockedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public User User { get; set; } = null!;
    public Badge Badge { get; set; } = null!;
}
