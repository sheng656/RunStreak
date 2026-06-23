using System.ComponentModel.DataAnnotations;

namespace RunStreak.Api.DTOs.Users;

public class UpdateProfileRequest
{
    [Required(ErrorMessage = "Display name is required.")]
    [StringLength(100, ErrorMessage = "Display name cannot exceed 100 characters.")]
    public string DisplayName { get; set; } = string.Empty;

    [Url(ErrorMessage = "Avatar URL must be a valid URL.")]
    [StringLength(512, ErrorMessage = "Avatar URL cannot exceed 512 characters.")]
    public string? AvatarUrl { get; set; }
}
