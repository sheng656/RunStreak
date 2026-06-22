namespace RunStreak.Api.Models;

public class Run
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public decimal DistanceKm { get; set; }
    public decimal DurationMinutes { get; set; }

    // Computed: DurationMinutes / DistanceKm. Stored for efficient sorting/filtering.
    public decimal PaceMinPerKm { get; set; }

    public DateTime RunDate { get; set; }
    public string? Notes { get; set; }

    // Calculated by PointsService at creation time and stored to preserve
    // the historical record even if the points formula changes later.
    public int PointsEarned { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation property
    public User User { get; set; } = null!;
}
