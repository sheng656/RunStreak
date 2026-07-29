using RunStreak.Api.DTOs.Auth;

namespace RunStreak.Api.Services;

public interface IAuthService
{
    Task<AuthResult?> RegisterAsync(RegisterRequest request);
    Task<AuthResult?> LoginAsync(LoginRequest request);
    Task<AuthResult?> RefreshAsync(string rawRefreshToken);
    Task<bool> LogoutAsync(string rawRefreshToken);
    Task RevokeAllUserTokensAsync(Guid userId);
    Task<bool> RequestPasswordResetAsync(string email);
    Task<bool> ResetPasswordAsync(string rawToken, string newPassword);
    Task<bool> ChangePasswordAsync(Guid userId, string currentPassword, string newPassword);
    Task<bool> ResetDemoAccountAsync();
}
