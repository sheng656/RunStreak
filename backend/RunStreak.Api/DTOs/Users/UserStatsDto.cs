namespace RunStreak.Api.DTOs.Users;

public class UserStatsDto
{
    public int TotalRuns { get; set; }
    public decimal TotalDistanceKm { get; set; }
    public decimal TotalDurationMinutes { get; set; }
    public decimal AveragePaceMinPerKm { get; set; }
    public decimal AverageDistanceKm { get; set; }
    public decimal LongestRunKm { get; set; }
    public int CurrentStreak { get; set; }
    public int LongestStreak { get; set; }
}
