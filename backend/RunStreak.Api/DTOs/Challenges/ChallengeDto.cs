using System;

namespace RunStreak.Api.DTOs.Challenges;

public class ChallengeDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal TargetDistanceKm { get; set; }
    public string IconUrl { get; set; } = string.Empty;
    public string Rarity { get; set; } = "common";
    public int SortOrder { get; set; }
    
    // User specific status
    public bool IsActive { get; set; }
    public bool IsCompleted { get; set; }
    public decimal ProgressDistanceKm { get; set; }
    public decimal CompletionPercentage { get; set; }
    public DateTime? StartedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
}

public class ActiveChallengeSummaryDto
{
    public Guid ChallengeId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal TargetDistanceKm { get; set; }
    public decimal ProgressDistanceKm { get; set; }
    public decimal RemainingDistanceKm { get; set; }
    public decimal CompletionPercentage { get; set; }
    public string IconUrl { get; set; } = string.Empty;
    public string Rarity { get; set; } = "common";
}
