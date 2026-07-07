using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using RunStreak.Api.Data;
using RunStreak.Api.DTOs.Auth;
using RunStreak.Api.Models;

namespace RunStreak.Api.Services;

public class AuthService : IAuthService
{
    private readonly AppDbContext _context;
    private readonly IConfiguration _configuration;
    private readonly IPasswordHasher<User> _passwordHasher;

    public AuthService(
        AppDbContext context,
        IConfiguration configuration,
        IPasswordHasher<User> passwordHasher)
    {
        _context = context;
        _configuration = configuration;
        _passwordHasher = passwordHasher;
    }

    public async Task<AuthResult?> RegisterAsync(RegisterRequest request)
    {
        // Check duplicate email
        var emailExists = await _context.Users.AnyAsync(u => u.Email.ToLower() == request.Email.ToLower());
        if (emailExists)
        {
            throw new InvalidOperationException("Email address is already in use.");
        }

        // Check duplicate username
        var usernameExists = await _context.Users.AnyAsync(u => u.Username.ToLower() == request.Username.ToLower());
        if (usernameExists)
        {
            throw new InvalidOperationException("Username is already taken.");
        }

        // Create new User entity
        var user = new User
        {
            Username = request.Username,
            Email = request.Email,
            DisplayName = request.DisplayName,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        // Hash password
        user.PasswordHash = _passwordHasher.HashPassword(user, request.Password);

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        // Generate Access and Refresh Tokens
        var accessToken = GenerateAccessToken(user);
        var rawRefreshToken = GenerateRawRefreshToken();
        var hashedRefreshToken = HashToken(rawRefreshToken);

        var expiryDays = int.Parse(_configuration["Jwt:RefreshTokenExpiryDays"] ?? "7");
        var refreshTokenEntity = new RefreshToken
        {
            UserId = user.Id,
            TokenHash = hashedRefreshToken,
            ExpiresAt = DateTime.UtcNow.AddDays(expiryDays),
            CreatedAt = DateTime.UtcNow
        };

        _context.RefreshTokens.Add(refreshTokenEntity);
        await _context.SaveChangesAsync();

        return new AuthResult
        {
            Response = new AuthResponse
            {
                AccessToken = accessToken,
                User = MapToUserDto(user)
            },
            RefreshToken = rawRefreshToken
        };
    }

    public async Task<AuthResult?> LoginAsync(LoginRequest request)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == request.Email.ToLower());
        if (user == null)
        {
            return null; // Invalid credentials
        }

        var verificationResult = _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, request.Password);
        if (verificationResult == PasswordVerificationResult.Failed)
        {
            return null; // Invalid credentials
        }

        // Generate Access and Refresh Tokens
        var accessToken = GenerateAccessToken(user);
        var rawRefreshToken = GenerateRawRefreshToken();
        var hashedRefreshToken = HashToken(rawRefreshToken);

        var expiryDays = int.Parse(_configuration["Jwt:RefreshTokenExpiryDays"] ?? "7");
        var refreshTokenEntity = new RefreshToken
        {
            UserId = user.Id,
            TokenHash = hashedRefreshToken,
            ExpiresAt = DateTime.UtcNow.AddDays(expiryDays),
            CreatedAt = DateTime.UtcNow
        };

        _context.RefreshTokens.Add(refreshTokenEntity);
        await _context.SaveChangesAsync();

        return new AuthResult
        {
            Response = new AuthResponse
            {
                AccessToken = accessToken,
                User = MapToUserDto(user)
            },
            RefreshToken = rawRefreshToken
        };
    }

    public async Task<AuthResult?> RefreshAsync(string rawRefreshToken)
    {
        var hash = HashToken(rawRefreshToken);

        var storedToken = await _context.RefreshTokens
            .Include(rt => rt.User)
            .FirstOrDefaultAsync(rt => rt.TokenHash == hash);

        if (storedToken == null)
        {
            return null;
        }

        // Token Replay/Reuse Detection: If a token that has already been revoked is presented,
        // it implies that the token was leaked and reused. For security, we immediately revoke
        // ALL refresh tokens belonging to that user.
        if (storedToken.RevokedAt != null)
        {
            await RevokeAllUserTokensAsync(storedToken.UserId);
            return null;
        }

        // Check if token has expired
        if (DateTime.UtcNow >= storedToken.ExpiresAt)
        {
            return null;
        }

        var user = storedToken.User;

        // Rotate: Generate a new raw refresh token and hash it
        var newRawToken = GenerateRawRefreshToken();
        var newHash = HashToken(newRawToken);

        var expiryDays = int.Parse(_configuration["Jwt:RefreshTokenExpiryDays"] ?? "7");
        var newRefreshToken = new RefreshToken
        {
            UserId = user.Id,
            TokenHash = newHash,
            ExpiresAt = DateTime.UtcNow.AddDays(expiryDays),
            CreatedAt = DateTime.UtcNow
        };

        // Revoke the old token and document its replacement
        storedToken.RevokedAt = DateTime.UtcNow;
        storedToken.ReplacedByTokenHash = newHash;

        _context.RefreshTokens.Add(newRefreshToken);
        await _context.SaveChangesAsync();

        var accessToken = GenerateAccessToken(user);

        return new AuthResult
        {
            Response = new AuthResponse
            {
                AccessToken = accessToken,
                User = MapToUserDto(user)
            },
            RefreshToken = newRawToken
        };
    }

    public async Task<bool> LogoutAsync(string rawRefreshToken)
    {
        var hash = HashToken(rawRefreshToken);
        var storedToken = await _context.RefreshTokens.FirstOrDefaultAsync(rt => rt.TokenHash == hash);
        if (storedToken == null || storedToken.RevokedAt != null)
        {
            return false;
        }

        storedToken.RevokedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task RevokeAllUserTokensAsync(Guid userId)
    {
        var activeTokens = await _context.RefreshTokens
            .Where(rt => rt.UserId == userId && rt.RevokedAt == null)
            .ToListAsync();

        foreach (var token in activeTokens)
        {
            token.RevokedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();
    }

    private string GenerateAccessToken(User user)
    {
        var jwtSettings = _configuration.GetSection("Jwt");
        var keyString = jwtSettings["Key"]
            ?? throw new InvalidOperationException("JWT signing key is not configured.");

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(keyString));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.Username),
            new Claim(ClaimTypes.Email, user.Email)
        };

        var expiryMinutes = int.Parse(jwtSettings["AccessTokenExpiryMinutes"] ?? "15");

        var token = new JwtSecurityToken(
            issuer: jwtSettings["Issuer"],
            audience: jwtSettings["Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(expiryMinutes),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private string GenerateRawRefreshToken()
    {
        var randomNumber = new byte[32];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomNumber);
        return Convert.ToBase64String(randomNumber);
    }

    private string HashToken(string token)
    {
        using var sha256 = SHA256.Create();
        var hashBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(token));
        return Convert.ToHexString(hashBytes).ToLowerInvariant();
    }

    private static UserDto MapToUserDto(User user)
    {
        return new UserDto
        {
            Id = user.Id,
            Username = user.Username,
            Email = user.Email,
            DisplayName = user.DisplayName,
            AvatarUrl = user.AvatarUrl,
            TotalPoints = user.TotalPoints,
            CurrentStreak = user.CurrentStreak,
            LongestStreak = user.LongestStreak,
            TotalDistanceKm = user.TotalDistanceKm,
            TotalRuns = user.TotalRuns,
            StreakFreezeCount = user.StreakFreezeCount,
            CreatedAt = user.CreatedAt
        };
    }
}
