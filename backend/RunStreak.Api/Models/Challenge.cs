using System;

namespace RunStreak.Api.Models;

public class Challenge
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal TargetDistanceKm { get; set; }
    public string IconUrl { get; set; } = string.Empty;
    public string Rarity { get; set; } = "common";
    public Guid? BadgeId { get; set; }
    public int SortOrder { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public Badge? Badge { get; set; }
    public ICollection<UserChallenge> UserChallenges { get; set; } = [];
}
