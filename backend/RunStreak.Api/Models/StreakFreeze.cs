using System;

namespace RunStreak.Api.Models;

public class StreakFreeze
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public string Type { get; set; } = string.Empty;     // "earned" or "used"
    public string Source { get; set; } = string.Empty;    // "points_purchase", "streak_milestone", "distance_milestone", "auto_applied"
    public DateTime Date { get; set; }                     // The date this freeze occurred (timezone agnostic calendar date)
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation property
    public User User { get; set; } = null!;
}
