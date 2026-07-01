using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using RunStreak.Api.DTOs.Auth;
using RunStreak.Api.Services;

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
    public async Task<IActionResult> Refresh([FromBody] RefreshRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var result = await _authService.RefreshAsync(request.RefreshToken);
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
    public async Task<IActionResult> Logout([FromBody] RefreshRequest request)
    {
        if (!string.IsNullOrEmpty(request.RefreshToken))
        {
            await _authService.LogoutAsync(request.RefreshToken);
        }

        return NoContent();
    }
}
