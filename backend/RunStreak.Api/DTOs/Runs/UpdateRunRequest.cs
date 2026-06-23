using System.ComponentModel.DataAnnotations;

namespace RunStreak.Api.DTOs.Runs;

public class UpdateRunRequest
{
    [Required(ErrorMessage = "Distance is required.")]
    [Range(0.01, 1000.0, ErrorMessage = "Distance must be between 0.01 and 1000.0 kilometers.")]
    public decimal DistanceKm { get; set; }

    [Required(ErrorMessage = "Duration is required.")]
    [Range(0.1, 1440.0, ErrorMessage = "Duration must be between 0.1 and 1440.0 minutes.")]
    public decimal DurationMinutes { get; set; }

    [Required(ErrorMessage = "Run date is required.")]
    [PastOrPresent(ErrorMessage = "Run date cannot be in the future.")]
    public DateTime RunDate { get; set; }

    [StringLength(500, ErrorMessage = "Notes cannot exceed 500 characters.")]
    public string? Notes { get; set; }
}
