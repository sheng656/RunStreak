using System.ComponentModel.DataAnnotations;

namespace RunStreak.Api.DTOs.Auth;

public class VerifyRegistrationRequest
{
    [Required(ErrorMessage = "Email is required.")]
    [EmailAddress(ErrorMessage = "Invalid email address format.")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "Verification code is required.")]
    [StringLength(6, MinimumLength = 6, ErrorMessage = "Verification code must be 6 digits.")]
    [RegularExpression(@"^\d{6}$", ErrorMessage = "Verification code must contain only digits.")]
    public string Code { get; set; } = string.Empty;
}
