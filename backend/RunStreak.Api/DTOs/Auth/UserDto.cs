namespace RunStreak.Api.DTOs.Auth;

public class UserDto
{
    public Guid Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
    public int TotalPoints { get; set; }
    public int CurrentStreak { get; set; }
    public int LongestStreak { get; set; }
    public decimal TotalDistanceKm { get; set; }
    public int TotalRuns { get; set; }
    public int StreakFreezeCount { get; set; }
    public decimal WeeklyGoalKm { get; set; }
    public DateTime CreatedAt { get; set; }
}
