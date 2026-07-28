using System;

namespace RunStreak.Api.Models;

public class UserChallenge
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public Guid ChallengeId { get; set; }
    public decimal ProgressDistanceKm { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime StartedAt { get; set; } = DateTime.UtcNow;
    public DateTime? CompletedAt { get; set; }

    // Navigation properties
    public User User { get; set; } = null!;
    public Challenge Challenge { get; set; } = null!;
}
