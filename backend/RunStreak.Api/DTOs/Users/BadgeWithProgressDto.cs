namespace RunStreak.Api.DTOs.Users;

public class BadgeWithProgressDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string IconUrl { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Rarity { get; set; } = "common";
    public int PointsReward { get; set; }
    public bool IsUnlocked { get; set; }
    public DateTime? UnlockedAt { get; set; }
    
    // Progress fields
    public decimal CurrentProgress { get; set; }
    public decimal TargetThreshold { get; set; }
    public string ProgressLabel { get; set; } = string.Empty;
}
