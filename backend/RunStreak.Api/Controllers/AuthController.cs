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

            SetRefreshTokenCookie(result.RefreshToken);
            SetCsrfTokenCookie();

            return Ok(result.Response);
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

        SetRefreshTokenCookie(result.RefreshToken);
        SetCsrfTokenCookie();

        return Ok(result.Response);
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh()
    {
        // 1. Double submit CSRF verification
        if (!Request.Cookies.TryGetValue("csrf_token", out var csrfCookie))
        {
            return BadRequest(new { message = "CSRF token missing in request cookies." });
        }

        if (!Request.Headers.TryGetValue("X-CSRF-Token", out var csrfHeader) || string.IsNullOrEmpty(csrfHeader))
        {
            return BadRequest(new { message = "CSRF token missing in request headers." });
        }

        if (csrfCookie != csrfHeader)
        {
            return BadRequest(new { message = "CSRF validation failed: Token mismatch." });
        }

        // 2. Extract refresh token cookie
        if (!Request.Cookies.TryGetValue("refresh_token", out var rawRefreshToken))
        {
            return Unauthorized(new { message = "Refresh token missing." });
        }

        // 3. Process refresh rotation
        var result = await _authService.RefreshAsync(rawRefreshToken);
        if (result == null)
        {
            ClearCookies();
            return Unauthorized(new { message = "Session expired or invalid refresh token." });
        }

        // 4. Update cookies and return new access token
        SetRefreshTokenCookie(result.RefreshToken);
        SetCsrfTokenCookie();

        return Ok(new { accessToken = result.Response.AccessToken });
    }

    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        if (Request.Cookies.TryGetValue("refresh_token", out var rawRefreshToken))
        {
            await _authService.LogoutAsync(rawRefreshToken);
        }

        ClearCookies();
        return NoContent();
    }

    private void SetRefreshTokenCookie(string token)
    {
        var cookieOptions = new CookieOptions
        {
            HttpOnly = true,
            Secure = true, // requires HTTPS
            SameSite = SameSiteMode.Strict,
            Path = "/api/auth/refresh", // Scoped specifically to token refresh path
            Expires = DateTimeOffset.UtcNow.AddDays(7)
        };
        Response.Cookies.Append("refresh_token", token, cookieOptions);
    }

    private void SetCsrfTokenCookie()
    {
        var csrfToken = Guid.NewGuid().ToString("N");
        var cookieOptions = new CookieOptions
        {
            HttpOnly = false, // Readable by JavaScript for header inclusion
            Secure = true,
            SameSite = SameSiteMode.Strict,
            Path = "/",
            Expires = DateTimeOffset.UtcNow.AddDays(7)
        };
        Response.Cookies.Append("csrf_token", csrfToken, cookieOptions);
    }

    private void ClearCookies()
    {
        Response.Cookies.Delete("refresh_token", new CookieOptions
        {
            Path = "/api/auth/refresh",
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.Strict
        });
        Response.Cookies.Delete("csrf_token", new CookieOptions
        {
            Path = "/",
            HttpOnly = false,
            Secure = true,
            SameSite = SameSiteMode.Strict
        });
    }
}
