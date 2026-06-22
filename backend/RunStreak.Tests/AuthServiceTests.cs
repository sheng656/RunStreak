using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using RunStreak.Api.Data;
using RunStreak.Api.DTOs.Auth;
using RunStreak.Api.Models;
using RunStreak.Api.Services;
using Xunit;

namespace RunStreak.Tests;

public class AuthServiceTests
{
    private AppDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        return new AppDbContext(options);
    }

    private IConfiguration CreateConfiguration()
    {
        var settings = new Dictionary<string, string?>
        {
            { "Jwt:Key", "test-secret-key-must-be-at-least-32-chars-long!" },
            { "Jwt:Issuer", "TestIssuer" },
            { "Jwt:Audience", "TestAudience" },
            { "Jwt:AccessTokenExpiryMinutes", "15" },
            { "Jwt:RefreshTokenExpiryDays", "7" }
        };

        return new ConfigurationBuilder()
            .AddInMemoryCollection(settings)
            .Build();
    }

    private string HashToken(string token)
    {
        using var sha256 = SHA256.Create();
        var hashBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(token));
        return Convert.ToHexString(hashBytes).ToLowerInvariant();
    }

    [Fact]
    public async Task RegisterAsync_ShouldCreateUserAndTokens_WhenInputIsValid()
    {
        // Arrange
        using var context = CreateContext();
        var config = CreateConfiguration();
        var hasher = new PasswordHasher<User>();
        var service = new AuthService(context, config, hasher);

        var request = new RegisterRequest
        {
            Username = "runner1",
            Email = "runner1@example.com",
            Password = "SecurePassword123!",
            DisplayName = "Runner One"
        };

        // Act
        var result = await service.RegisterAsync(request);

        // Assert
        Assert.NotNull(result);
        Assert.NotNull(result.Response.AccessToken);
        Assert.NotEmpty(result.RefreshToken);
        Assert.Equal("runner1", result.Response.User.Username);

        var dbUser = await context.Users.FirstOrDefaultAsync(u => u.Email == "runner1@example.com");
        Assert.NotNull(dbUser);
        Assert.Equal("Runner One", dbUser.DisplayName);

        var dbToken = await context.RefreshTokens.FirstOrDefaultAsync(rt => rt.UserId == dbUser.Id);
        Assert.NotNull(dbToken);
        Assert.Equal(HashToken(result.RefreshToken), dbToken.TokenHash);
    }

    [Fact]
    public async Task RegisterAsync_ShouldThrowException_WhenEmailOrUsernameExists()
    {
        // Arrange
        using var context = CreateContext();
        var config = CreateConfiguration();
        var hasher = new PasswordHasher<User>();
        var service = new AuthService(context, config, hasher);

        var existingUser = new User
        {
            Username = "existinguser",
            Email = "existing@example.com",
            PasswordHash = "somehash",
            DisplayName = "Existing"
        };
        context.Users.Add(existingUser);
        await context.SaveChangesAsync();

        var requestWithDupEmail = new RegisterRequest
        {
            Username = "newuser",
            Email = "existing@example.com",
            Password = "SecurePassword123!",
            DisplayName = "New User"
        };

        var requestWithDupUser = new RegisterRequest
        {
            Username = "existinguser",
            Email = "new@example.com",
            Password = "SecurePassword123!",
            DisplayName = "New User"
        };

        // Act & Assert
        await Assert.ThrowsAsync<InvalidOperationException>(() => service.RegisterAsync(requestWithDupEmail));
        await Assert.ThrowsAsync<InvalidOperationException>(() => service.RegisterAsync(requestWithDupUser));
    }

    [Fact]
    public async Task LoginAsync_ShouldReturnTokens_WhenCredentialsAreCorrect()
    {
        // Arrange
        using var context = CreateContext();
        var config = CreateConfiguration();
        var hasher = new PasswordHasher<User>();
        var service = new AuthService(context, config, hasher);

        var user = new User
        {
            Username = "testuser",
            Email = "test@example.com",
            DisplayName = "Test User"
        };
        user.PasswordHash = hasher.HashPassword(user, "SecurePassword123!");
        context.Users.Add(user);
        await context.SaveChangesAsync();

        var loginRequest = new LoginRequest
        {
            Email = "test@example.com",
            Password = "SecurePassword123!"
        };

        // Act
        var result = await service.LoginAsync(loginRequest);

        // Assert
        Assert.NotNull(result);
        Assert.NotNull(result.Response.AccessToken);
        Assert.NotEmpty(result.RefreshToken);
        Assert.Equal(user.Id, result.Response.User.Id);

        var dbToken = await context.RefreshTokens.FirstOrDefaultAsync(rt => rt.UserId == user.Id);
        Assert.NotNull(dbToken);
        Assert.Equal(HashToken(result.RefreshToken), dbToken.TokenHash);
    }

    [Fact]
    public async Task LoginAsync_ShouldReturnNull_WhenCredentialsAreIncorrect()
    {
        // Arrange
        using var context = CreateContext();
        var config = CreateConfiguration();
        var hasher = new PasswordHasher<User>();
        var service = new AuthService(context, config, hasher);

        var user = new User
        {
            Username = "testuser",
            Email = "test@example.com",
            DisplayName = "Test User"
        };
        user.PasswordHash = hasher.HashPassword(user, "SecurePassword123!");
        context.Users.Add(user);
        await context.SaveChangesAsync();

        // Wrong password
        var wrongPassRequest = new LoginRequest { Email = "test@example.com", Password = "WrongPassword!" };
        // Wrong email
        var wrongEmailRequest = new LoginRequest { Email = "wrong@example.com", Password = "SecurePassword123!" };

        // Act & Assert
        Assert.Null(await service.LoginAsync(wrongPassRequest));
        Assert.Null(await service.LoginAsync(wrongEmailRequest));
    }

    [Fact]
    public async Task RefreshAsync_ShouldRotateTokens_WhenTokenIsValid()
    {
        // Arrange
        using var context = CreateContext();
        var config = CreateConfiguration();
        var hasher = new PasswordHasher<User>();
        var service = new AuthService(context, config, hasher);

        var user = new User
        {
            Username = "testuser",
            Email = "test@example.com",
            DisplayName = "Test User"
        };
        context.Users.Add(user);

        var rawToken = "initial-raw-refresh-token-value";
        var hash = HashToken(rawToken);
        var oldRefreshToken = new RefreshToken
        {
            UserId = user.Id,
            TokenHash = hash,
            ExpiresAt = DateTime.UtcNow.AddDays(7),
            CreatedAt = DateTime.UtcNow
        };
        context.RefreshTokens.Add(oldRefreshToken);
        await context.SaveChangesAsync();

        // Act
        var result = await service.RefreshAsync(rawToken);

        // Assert
        Assert.NotNull(result);
        Assert.NotNull(result.Response.AccessToken);
        Assert.NotEmpty(result.RefreshToken);
        Assert.NotEqual(rawToken, result.RefreshToken);

        // Verify old token is revoked
        var updatedOldToken = await context.RefreshTokens.FirstOrDefaultAsync(rt => rt.TokenHash == hash);
        Assert.NotNull(updatedOldToken);
        Assert.NotNull(updatedOldToken.RevokedAt);
        Assert.Equal(HashToken(result.RefreshToken), updatedOldToken.ReplacedByTokenHash);

        // Verify new token exists in DB
        var newHash = HashToken(result.RefreshToken);
        var newDbToken = await context.RefreshTokens.FirstOrDefaultAsync(rt => rt.TokenHash == newHash);
        Assert.NotNull(newDbToken);
        Assert.Null(newDbToken.RevokedAt);
        Assert.Equal(user.Id, newDbToken.UserId);
    }

    [Fact]
    public async Task RefreshAsync_ShouldReturnNull_WhenTokenIsExpired()
    {
        // Arrange
        using var context = CreateContext();
        var config = CreateConfiguration();
        var hasher = new PasswordHasher<User>();
        var service = new AuthService(context, config, hasher);

        var user = new User { Username = "user", Email = "u@example.com", DisplayName = "User" };
        context.Users.Add(user);

        var rawToken = "expired-token";
        var hash = HashToken(rawToken);
        var expiredToken = new RefreshToken
        {
            UserId = user.Id,
            TokenHash = hash,
            ExpiresAt = DateTime.UtcNow.AddMinutes(-5), // Expired 5 mins ago
            CreatedAt = DateTime.UtcNow.AddDays(-7)
        };
        context.RefreshTokens.Add(expiredToken);
        await context.SaveChangesAsync();

        // Act
        var result = await service.RefreshAsync(rawToken);

        // Assert
        Assert.Null(result);
    }

    [Fact]
    public async Task RefreshAsync_ShouldRevokeAllTokens_WhenTokenIsRevoked()
    {
        // Arrange
        using var context = CreateContext();
        var config = CreateConfiguration();
        var hasher = new PasswordHasher<User>();
        var service = new AuthService(context, config, hasher);

        var user = new User { Username = "user", Email = "u@example.com", DisplayName = "User" };
        context.Users.Add(user);
        await context.SaveChangesAsync();

        // Create family of tokens
        var rawToken1 = "token-1";
        var hash1 = HashToken(rawToken1);
        var revokedToken = new RefreshToken
        {
            UserId = user.Id,
            TokenHash = hash1,
            ExpiresAt = DateTime.UtcNow.AddDays(7),
            RevokedAt = DateTime.UtcNow.AddMinutes(-10), // Already revoked
            ReplacedByTokenHash = "replaced-hash"
        };

        var rawToken2 = "token-2";
        var hash2 = HashToken(rawToken2);
        var activeToken = new RefreshToken
        {
            UserId = user.Id,
            TokenHash = hash2,
            ExpiresAt = DateTime.UtcNow.AddDays(7)
        };

        context.RefreshTokens.AddRange(revokedToken, activeToken);
        await context.SaveChangesAsync();

        // Act: presenting a revoked token should trigger reuse penalty (revoke all active user tokens)
        var result = await service.RefreshAsync(rawToken1);

        // Assert
        Assert.Null(result);

        // Verify active token is now revoked
        var dbActiveToken = await context.RefreshTokens.FirstOrDefaultAsync(rt => rt.TokenHash == hash2);
        Assert.NotNull(dbActiveToken);
        Assert.NotNull(dbActiveToken.RevokedAt);
    }

    [Fact]
    public async Task LogoutAsync_ShouldRevokeToken_WhenTokenIsValid()
    {
        // Arrange
        using var context = CreateContext();
        var config = CreateConfiguration();
        var hasher = new PasswordHasher<User>();
        var service = new AuthService(context, config, hasher);

        var user = new User { Username = "user", Email = "u@example.com", DisplayName = "User" };
        context.Users.Add(user);

        var rawToken = "logout-token";
        var hash = HashToken(rawToken);
        var token = new RefreshToken
        {
            UserId = user.Id,
            TokenHash = hash,
            ExpiresAt = DateTime.UtcNow.AddDays(7)
        };
        context.RefreshTokens.Add(token);
        await context.SaveChangesAsync();

        // Act
        var success = await service.LogoutAsync(rawToken);

        // Assert
        Assert.True(success);
        var dbToken = await context.RefreshTokens.FirstOrDefaultAsync(rt => rt.TokenHash == hash);
        Assert.NotNull(dbToken);
        Assert.NotNull(dbToken.RevokedAt);
    }
}
