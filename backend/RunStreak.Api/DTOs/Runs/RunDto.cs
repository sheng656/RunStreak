namespace RunStreak.Api.DTOs.Runs;

public class RunDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public decimal DistanceKm { get; set; }
    public decimal DurationMinutes { get; set; }
    public decimal PaceMinPerKm { get; set; }
    public DateTime RunDate { get; set; }
    public string? Notes { get; set; }
    public int PointsEarned { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
