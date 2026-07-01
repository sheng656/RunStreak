using System.ComponentModel.DataAnnotations;

namespace RunStreak.Api.DTOs.Auth;

public class RefreshRequest
{
    [Required]
    public string RefreshToken { get; set; } = string.Empty;
}
