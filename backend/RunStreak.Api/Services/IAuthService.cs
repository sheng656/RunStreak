using RunStreak.Api.DTOs.Auth;

namespace RunStreak.Api.Services;

public interface IAuthService
{
    Task<AuthResult?> RegisterAsync(RegisterRequest request);
    Task<AuthResult?> LoginAsync(LoginRequest request);
    Task<AuthResult?> RefreshAsync(string rawRefreshToken);
    Task<bool> LogoutAsync(string rawRefreshToken);
    Task RevokeAllUserTokensAsync(Guid userId);
}
