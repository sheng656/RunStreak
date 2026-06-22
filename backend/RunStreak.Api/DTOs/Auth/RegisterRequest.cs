using System.ComponentModel.DataAnnotations;

namespace RunStreak.Api.DTOs.Auth;

public class RegisterRequest
{
    [Required(ErrorMessage = "Username is required.")]
    [StringLength(50, MinimumLength = 3, ErrorMessage = "Username must be between 3 and 50 characters.")]
    [RegularExpression(@"^[a-zA-Z0-9_\-]+$", ErrorMessage = "Username can only contain alphanumeric characters, underscores, and hyphens.")]
    public string Username { get; set; } = string.Empty;

    [Required(ErrorMessage = "Email is required.")]
    [EmailAddress(ErrorMessage = "Invalid email address format.")]
    [StringLength(256, ErrorMessage = "Email cannot exceed 256 characters.")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "Password is required.")]
    [StringLength(100, MinimumLength = 8, ErrorMessage = "Password must be at least 8 characters long.")]
    public string Password { get; set; } = string.Empty;

    [Required(ErrorMessage = "Display name is required.")]
    [StringLength(100, ErrorMessage = "Display name cannot exceed 100 characters.")]
    public string DisplayName { get; set; } = string.Empty;
}
