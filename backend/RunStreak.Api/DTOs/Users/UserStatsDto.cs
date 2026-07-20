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

    // Weekly stats — calculated from runs in the current ISO week (Mon–Sun)
    public decimal WeeklyDistanceKm { get; set; }
    public int WeeklyRunCount { get; set; }
    public decimal WeeklyGoalKm { get; set; }

    // Last week totals (for "You vs Past Self" comparisons)
    public decimal LastWeekDistanceKm { get; set; }
    public int LastWeekRunCount { get; set; }
    public int LastWeekPoints { get; set; }

    // Current week points
    public int WeeklyPoints { get; set; }

    // All-time personal bests
    public decimal BestWeekDistanceKm { get; set; }
}
