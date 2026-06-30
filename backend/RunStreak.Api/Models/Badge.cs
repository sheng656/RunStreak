namespace RunStreak.Api.Models;

/// <summary>
/// Achievement definition. Seeded once and rarely changed.
/// The CriteriaJson field stores unlock conditions evaluated by BadgeService.
/// </summary>
public class Badge
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string IconUrl { get; set; } = string.Empty;

    /// <summary>
    /// Rarity tier: "common", "rare", "epic", "legendary", "heroic".
    /// Inspired by game achievement rarity systems.
    /// </summary>
    public string Rarity { get; set; } = "common";

    /// <summary>
    /// Category for grouping in the UI: "distance", "streak", "milestone", "special"
    /// </summary>
    public string Category { get; set; } = string.Empty;

    /// <summary>
    /// JSON-encoded unlock condition, e.g. {"type":"total_runs","threshold":1}
    /// Evaluated by BadgeService — see specs/01-data-model.md for schema.
    /// </summary>
    public string CriteriaJson { get; set; } = string.Empty;

    public int PointsReward { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation property
    public ICollection<UserBadge> UserBadges { get; set; } = [];
}
