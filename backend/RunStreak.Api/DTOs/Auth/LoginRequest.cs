using System.ComponentModel.DataAnnotations;

namespace RunStreak.Api.DTOs.Auth;

public class LoginRequest
{
    [Required(ErrorMessage = "Email or Username is required.")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "Password is required.")]
    public string Password { get; set; } = string.Empty;
}
