using System.ComponentModel.DataAnnotations;

namespace RunStreak.Api.DTOs.Users;

public class UpdateWeeklyGoalRequest
{
    [Required]
    [Range(1.0, 500.0, ErrorMessage = "Weekly goal must be between 1 and 500 km.")]
    public decimal GoalKm { get; set; }
}
