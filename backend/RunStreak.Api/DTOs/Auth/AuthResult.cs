namespace RunStreak.Api.DTOs.Auth;

public class AuthResult
{
    public AuthResponse Response { get; set; } = null!;
    public string RefreshToken { get; set; } = string.Empty;
}
