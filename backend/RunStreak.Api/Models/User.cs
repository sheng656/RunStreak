namespace RunStreak.Api.Models;

public class User
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }

    // Denormalized gamification stats for fast leaderboard queries.
    // These are recalculated by the service layer on every run CRUD operation.
    public int TotalPoints { get; set; }
    public int CurrentStreak { get; set; }
    public int LongestStreak { get; set; }
    public decimal TotalDistanceKm { get; set; }
    public int TotalRuns { get; set; }
    public int StreakFreezeCount { get; set; }
    // User's self-set weekly distance goal (km). Persisted to DB so it survives device switches.
    public decimal WeeklyGoalKm { get; set; } = 20.0m;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public ICollection<Run> Runs { get; set; } = [];
    public ICollection<UserBadge> UserBadges { get; set; } = [];
    public ICollection<RefreshToken> RefreshTokens { get; set; } = [];
    public ICollection<StreakFreeze> StreakFreezes { get; set; } = [];
}
