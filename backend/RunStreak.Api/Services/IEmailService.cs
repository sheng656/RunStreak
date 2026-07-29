namespace RunStreak.Api.Services;

public interface IEmailService
{
    Task<bool> SendPasswordResetEmailAsync(string toEmail, string resetToken, string username);
    Task<bool> SendVerificationCodeEmailAsync(string toEmail, string code, string displayName);
}
