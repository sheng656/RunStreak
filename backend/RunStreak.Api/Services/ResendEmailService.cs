using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace RunStreak.Api.Services;

public class ResendEmailService : IEmailService
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;
    private readonly ILogger<ResendEmailService> _logger;

    public ResendEmailService(
        HttpClient httpClient,
        IConfiguration configuration,
        ILogger<ResendEmailService> logger)
    {
        _httpClient = httpClient;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<bool> SendPasswordResetEmailAsync(string toEmail, string resetToken, string username)
    {
        var apiKey = _configuration["Resend:ApiKey"];
        var fromEmail = _configuration["Resend:FromEmail"] ?? "RunStreak <noreply@runstreak.sheng.nz>";
        var frontendUrl = _configuration["FrontendUrl"] ?? "https://runstreak.sheng.nz";

        if (string.IsNullOrWhiteSpace(apiKey) || apiKey.StartsWith("<YOUR_"))
        {
            _logger.LogWarning("Resend API key is not configured or is placeholder. Password reset email skipped for {Email}.", toEmail);
            // Return true in development so local testing can proceed smoothly without failing
            return true;
        }

        var resetUrl = $"{frontendUrl.TrimEnd('/')}/reset-password?token={Uri.EscapeDataString(resetToken)}";

        var htmlContent = $$"""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <style>
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0f172a; color: #f8fafc; margin: 0; padding: 24px; }
                    .card { max-width: 520px; margin: 0 auto; background: #1e293b; border-radius: 16px; border: 1px solid #334155; padding: 32px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
                    .logo { font-size: 24px; font-weight: 800; color: #38bdf8; text-decoration: none; margin-bottom: 24px; display: inline-block; }
                    .title { font-size: 20px; font-weight: 700; color: #ffffff; margin-bottom: 16px; }
                    .text { font-size: 15px; color: #94a3b8; line-height: 1.6; margin-bottom: 24px; }
                    .btn { display: inline-block; background: linear-gradient(135deg, #38bdf8 0%, #818cf8 100%); color: #ffffff; text-decoration: none; font-weight: 600; font-size: 15px; padding: 14px 28px; border-radius: 10px; box-shadow: 0 4px 12px rgba(56, 189, 248, 0.3); }
                    .footer { font-size: 12px; color: #64748b; margin-top: 32px; border-top: 1px solid #334155; padding-top: 16px; text-align: center; }
                </style>
            </head>
            <body>
                <div class="card">
                    <a href="{{frontendUrl}}" class="logo">⚡ RunStreak</a>
                    <div class="title">Password Reset Request</div>
                    <div class="text">
                        Hi <strong>{{username}}</strong>,<br><br>
                        We received a request to reset the password for your RunStreak account. Click the button below to choose a new password.
                    </div>
                    <div style="text-align: center; margin: 32px 0;">
                        <a href="{{resetUrl}}" class="btn">Reset Password</a>
                    </div>
                    <div class="text" style="font-size: 13px;">
                        This password reset link will expire in <strong>15 minutes</strong>.<br>
                        If you did not request a password reset, you can safely ignore this email.
                    </div>
                    <div class="footer">
                        RunStreak — Gamify Your Running Habit
                    </div>
                </div>
            </body>
            </html>
            """;

        var requestBody = new
        {
            from = fromEmail,
            to = new[] { toEmail },
            subject = "Reset your RunStreak password",
            html = htmlContent
        };

        try
        {
            using var request = new HttpRequestMessage(HttpMethod.Post, "https://api.resend.com/emails");
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);
            request.Content = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json");

            var response = await _httpClient.SendAsync(request);
            if (response.IsSuccessStatusCode)
            {
                _logger.LogInformation("Password reset email sent successfully to {Email} via Resend.", toEmail);
                return true;
            }

            var errorBody = await response.Content.ReadAsStringAsync();
            _logger.LogError("Failed to send password reset email via Resend to {Email}. Status: {Status}, Error: {Error}", toEmail, response.StatusCode, errorBody);
            return false;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Exception occurred while sending password reset email to {Email}.", toEmail);
            return false;
        }
    }

    public async Task<bool> SendVerificationCodeEmailAsync(string toEmail, string code, string displayName)
    {
        var apiKey = _configuration["Resend:ApiKey"];
        var fromEmail = _configuration["Resend:FromEmail"] ?? "RunStreak <noreply@runstreak.sheng.nz>";
        var frontendUrl = _configuration["FrontendUrl"] ?? "https://runstreak.sheng.nz";

        if (string.IsNullOrWhiteSpace(apiKey) || apiKey.StartsWith("<YOUR_"))
        {
            _logger.LogInformation("Verification Code for {Email}: {Code}", toEmail, code);
            _logger.LogWarning("Resend API key is not configured or is placeholder. Verification email skipped for {Email}.", toEmail);
            return true;
        }

        var htmlContent = $$"""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <style>
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0f172a; color: #f8fafc; margin: 0; padding: 24px; }
                    .card { max-width: 520px; margin: 0 auto; background: #1e293b; border-radius: 16px; border: 1px solid #334155; padding: 32px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
                    .logo { font-size: 24px; font-weight: 800; color: #38bdf8; text-decoration: none; margin-bottom: 24px; display: inline-block; }
                    .title { font-size: 20px; font-weight: 700; color: #ffffff; margin-bottom: 16px; }
                    .text { font-size: 15px; color: #94a3b8; line-height: 1.6; margin-bottom: 24px; }
                    .code-box { font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #38bdf8; background: #0f172a; border: 1px solid #334155; border-radius: 12px; padding: 16px 24px; text-align: center; margin: 24px 0; }
                    .footer { font-size: 12px; color: #64748b; margin-top: 32px; border-top: 1px solid #334155; padding-top: 16px; text-align: center; }
                </style>
            </head>
            <body>
                <div class="card">
                    <a href="{{frontendUrl}}" class="logo">⚡ RunStreak</a>
                    <div class="title">Verify Your Email Address</div>
                    <div class="text">
                        Hi <strong>{{displayName}}</strong>,<br><br>
                        Thank you for joining RunStreak! Please use the 6-digit verification code below to complete your registration:
                    </div>
                    <div class="code-box">{{code}}</div>
                    <div class="text" style="font-size: 13px;">
                        This verification code will expire in <strong>10 minutes</strong>.<br>
                        If you did not attempt to register for RunStreak, you can safely ignore this email.
                    </div>
                    <div class="footer">
                        RunStreak — Gamify Your Running Habit
                    </div>
                </div>
            </body>
            </html>
            """;

        var requestBody = new
        {
            from = fromEmail,
            to = new[] { toEmail },
            subject = $"{code} is your RunStreak verification code",
            html = htmlContent
        };

        try
        {
            using var request = new HttpRequestMessage(HttpMethod.Post, "https://api.resend.com/emails");
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);
            request.Content = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json");

            var response = await _httpClient.SendAsync(request);
            if (response.IsSuccessStatusCode)
            {
                _logger.LogInformation("Verification code email sent successfully to {Email} via Resend.", toEmail);
                return true;
            }

            var errorBody = await response.Content.ReadAsStringAsync();
            _logger.LogError("Failed to send verification code email via Resend to {Email}. Status: {Status}, Error: {Error}", toEmail, response.StatusCode, errorBody);
            return false;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Exception occurred while sending verification code email to {Email}.", toEmail);
            return false;
        }
    }
}
