namespace RunStreak.Api.DTOs.Auth;

public class AuthResponse
{
    public string AccessToken { get; set; } = string.Empty;
    // Refresh token returned in the body so the client can store it in localStorage.
    // Stored hashed server-side; rotated on every use.
    public string RefreshToken { get; set; } = string.Empty;
    public UserDto User { get; set; } = null!;
}
