using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.AspNetCore.WebUtilities;
using RunStreak.Api.DTOs.Auth;
using RunStreak.Api.Services;
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
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            var result = await _authService.RegisterAsync(request);
            if (result == null)
            {
                return BadRequest(new { message = "Registration failed." });
            }

            // Return both tokens in the response body.
            // The client stores the access token in memory (Zustand) and the
            // refresh token in localStorage for session persistence across reloads.
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
            return Unauthorized(new { message = "Invalid email or password." });
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
