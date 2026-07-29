using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.AspNetCore.WebUtilities;
using RunStreak.Api.DTOs.Auth;
using RunStreak.Api.Services;
using System.Security.Claims;
using System.Text;
using System.Text.Json;

namespace RunStreak.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[EnableCors("Frontend")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("register")]
    [EnableRateLimiting("login")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            var success = await _authService.InitiateRegistrationAsync(request);
            if (!success)
            {
                return BadRequest(new { message = "Failed to initiate registration." });
            }

            return Ok(new { message = "Verification code sent to your email address." });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("verify-registration")]
    [EnableRateLimiting("login")]
    public async Task<IActionResult> VerifyRegistration([FromBody] VerifyRegistrationRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            var result = await _authService.VerifyRegistrationAsync(request);
            if (result == null)
            {
                return BadRequest(new { message = "Registration verification failed." });
            }

            return Ok(new AuthResponse
            {
                AccessToken = result.Response.AccessToken,
                RefreshToken = result.RefreshToken,
                User = result.Response.User
            });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("login")]
    [EnableRateLimiting("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var result = await _authService.LoginAsync(request);
        if (result == null)
        {
            return Unauthorized(new { message = "Invalid email/username or password." });
        }

        return Ok(new AuthResponse
        {
            AccessToken = result.Response.AccessToken,
            RefreshToken = result.RefreshToken,
            User = result.Response.User
        });
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh()
    {
        var refreshToken = await ReadRefreshTokenFromRequestAsync();
        if (string.IsNullOrWhiteSpace(refreshToken))
        {
            return BadRequest(new { message = "Refresh token is required." });
        }

        var result = await _authService.RefreshAsync(refreshToken);
        if (result == null)
        {
            return Unauthorized(new { message = "Session expired or invalid refresh token." });
        }

        // Rotate: return the new refresh token alongside the new access token.
        // Client must save the new refresh token to localStorage (old one is revoked server-side).
        return Ok(new
        {
            accessToken = result.Response.AccessToken,
            refreshToken = result.RefreshToken
        });
    }

    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        var refreshToken = await ReadRefreshTokenFromRequestAsync();
        if (!string.IsNullOrWhiteSpace(refreshToken))
        {
            await _authService.LogoutAsync(refreshToken);
        }

        return NoContent();
    }

    [HttpPost("forgot-password")]
    [EnableRateLimiting("login")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        await _authService.RequestPasswordResetAsync(request.Email);
        return Ok(new { message = "If your email is registered, you will receive a password reset link shortly." });
    }

    [HttpPost("reset-password")]
    [EnableRateLimiting("login")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var success = await _authService.ResetPasswordAsync(request.Token, request.NewPassword);
        if (!success)
        {
            return BadRequest(new { message = "Invalid or expired password reset token." });
        }

        return Ok(new { message = "Password reset successfully. You can now log in with your new password." });
    }

    [HttpPost("change-password")]
    [Microsoft.AspNetCore.Authorization.Authorize]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdString, out var userId))
        {
            return Unauthorized(new { message = "Invalid user credentials." });
        }

        var success = await _authService.ChangePasswordAsync(userId, request.CurrentPassword, request.NewPassword);
        if (!success)
        {
            return BadRequest(new { message = "Incorrect current password." });
        }

        return Ok(new { message = "Password updated successfully. All active sessions have been logged out." });
    }

    [HttpPost("reset-demo")]
    [EnableRateLimiting("login")]
    public async Task<IActionResult> ResetDemoAccount()
    {
        var success = await _authService.ResetDemoAccountAsync();
        if (!success)
        {
            return BadRequest(new { message = "Demo account not found." });
        }

        return Ok(new { message = "Demo account password has been reset to Test1234!." });
    }

    private async Task<string?> ReadRefreshTokenFromRequestAsync()
    {
        // 1) Native form posts: refreshToken=...
        if (Request.HasFormContentType)
        {
            var form = await Request.ReadFormAsync();
            var tokenFromForm = form["refreshToken"].FirstOrDefault();
            if (!string.IsNullOrWhiteSpace(tokenFromForm))
            {
                return tokenFromForm;
            }
        }

        // 2) Raw body (JSON or urlencoded body sent with a non-JSON content type)
        Request.EnableBuffering();
        Request.Body.Position = 0;

        using (var reader = new StreamReader(Request.Body, Encoding.UTF8, leaveOpen: true))
        {
            var rawBody = await reader.ReadToEndAsync();
            Request.Body.Position = 0;

            if (!string.IsNullOrWhiteSpace(rawBody))
            {
                try
                {
                    var jsonPayload = JsonSerializer.Deserialize<RefreshRequest>(
                        rawBody,
                        new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

                    if (!string.IsNullOrWhiteSpace(jsonPayload?.RefreshToken))
                    {
                        return jsonPayload.RefreshToken;
                    }
                }
                catch (JsonException)
                {
                    // Non-JSON body, continue to query-string style parsing.
                }

                var parsedQuery = QueryHelpers.ParseQuery(rawBody.StartsWith('?') ? rawBody : $"?{rawBody}");
                var tokenFromRawBody = parsedQuery["refreshToken"].FirstOrDefault();
                if (!string.IsNullOrWhiteSpace(tokenFromRawBody))
                {
                    return tokenFromRawBody;
                }
            }
        }

        // 3) Last-resort compatibility for clients passing token via query string.
        var tokenFromQuery = Request.Query["refreshToken"].FirstOrDefault();
        if (!string.IsNullOrWhiteSpace(tokenFromQuery))
        {
            return tokenFromQuery;
        }

        return null;
    }
}
