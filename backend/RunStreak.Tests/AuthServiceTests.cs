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

public class TestEmailService : IEmailService
{
    public bool WasCalled { get; private set; }
    public string? LastToEmail { get; private set; }
    public string? LastResetToken { get; private set; }

    public Task<bool> SendPasswordResetEmailAsync(string toEmail, string resetToken, string username)
    {
        WasCalled = true;
        LastToEmail = toEmail;
        LastResetToken = resetToken;
        return Task.FromResult(true);
    }
}

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
        var emailService = new TestEmailService();
        var service = new AuthService(context, config, hasher, emailService);

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
        var emailService = new TestEmailService();
        var service = new AuthService(context, config, hasher, emailService);

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
        var emailService = new TestEmailService();
        var service = new AuthService(context, config, hasher, emailService);

        var user = new User
        {
            Username = "testuser",
            Email = "test@example.com",
            DisplayName = "Test User"
        };
        user.PasswordHash = hasher.HashPassword(user, "SecurePassword123!");
        context.Users.Add(user);
        await context.SaveChangesAsync();

        var request = new LoginRequest
        {
            Email = "test@example.com",
            Password = "SecurePassword123!"
        };

        // Act
        var result = await service.LoginAsync(request);

        // Assert
        Assert.NotNull(result);
        Assert.NotNull(result.Response.AccessToken);
        Assert.NotEmpty(result.RefreshToken);
        Assert.Equal("testuser", result.Response.User.Username);
    }

    [Fact]
    public async Task RefreshAsync_ShouldRotateToken_WhenTokenIsValid()
    {
        // Arrange
        using var context = CreateContext();
        var config = CreateConfiguration();
        var hasher = new PasswordHasher<User>();
        var emailService = new TestEmailService();
        var service = new AuthService(context, config, hasher, emailService);

        var user = new User { Username = "user", Email = "u@example.com", DisplayName = "User" };
        context.Users.Add(user);

        var rawToken = "valid-refresh-token";
        var hash = HashToken(rawToken);
        var refreshToken = new RefreshToken
        {
            UserId = user.Id,
            TokenHash = hash,
            ExpiresAt = DateTime.UtcNow.AddDays(7)
        };
        context.RefreshTokens.Add(refreshToken);
        await context.SaveChangesAsync();

        // Act
        var result = await service.RefreshAsync(rawToken);

        // Assert
        Assert.NotNull(result);
        Assert.NotEqual(rawToken, result.RefreshToken);

        var oldToken = await context.RefreshTokens.FirstOrDefaultAsync(rt => rt.TokenHash == hash);
        Assert.NotNull(oldToken);
        Assert.NotNull(oldToken.RevokedAt);

        var newToken = await context.RefreshTokens.FirstOrDefaultAsync(rt => rt.TokenHash == HashToken(result.RefreshToken));
        Assert.NotNull(newToken);
        Assert.Null(newToken.RevokedAt);
    }

    [Fact]
    public async Task RefreshAsync_ShouldRevokeAllTokens_WhenRevokedTokenIsReused()
    {
        // Arrange
        using var context = CreateContext();
        var config = CreateConfiguration();
        var hasher = new PasswordHasher<User>();
        var emailService = new TestEmailService();
        var service = new AuthService(context, config, hasher, emailService);

        var user = new User { Username = "user", Email = "u@example.com", DisplayName = "User" };
        context.Users.Add(user);

        var rawToken1 = "token1";
        var hash1 = HashToken(rawToken1);
        var revokedToken = new RefreshToken
        {
            UserId = user.Id,
            TokenHash = hash1,
            ExpiresAt = DateTime.UtcNow.AddDays(7),
            RevokedAt = DateTime.UtcNow.AddMinutes(-5)
        };

        var rawToken2 = "token2";
        var hash2 = HashToken(rawToken2);
        var activeToken = new RefreshToken
        {
            UserId = user.Id,
            TokenHash = hash2,
            ExpiresAt = DateTime.UtcNow.AddDays(7)
        };

        context.RefreshTokens.AddRange(revokedToken, activeToken);
        await context.SaveChangesAsync();

        // Act
        var result = await service.RefreshAsync(rawToken1);

        // Assert
        Assert.Null(result);

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
        var emailService = new TestEmailService();
        var service = new AuthService(context, config, hasher, emailService);

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

    [Fact]
    public async Task RequestPasswordResetAsync_ShouldCreateTokenAndCallEmailService()
    {
        // Arrange
        using var context = CreateContext();
        var config = CreateConfiguration();
        var hasher = new PasswordHasher<User>();
        var emailService = new TestEmailService();
        var service = new AuthService(context, config, hasher, emailService);

        var user = new User { Username = "resetuser", Email = "reset@example.com", DisplayName = "Reset User" };
        context.Users.Add(user);
        await context.SaveChangesAsync();

        // Act
        var result = await service.RequestPasswordResetAsync("reset@example.com");

        // Assert
        Assert.True(result);
        Assert.True(emailService.WasCalled);
        Assert.Equal("reset@example.com", emailService.LastToEmail);
        Assert.NotNull(emailService.LastResetToken);

        var tokenInDb = await context.PasswordResetTokens.FirstOrDefaultAsync(prt => prt.UserId == user.Id);
        Assert.NotNull(tokenInDb);
        Assert.Equal(HashToken(emailService.LastResetToken), tokenInDb.TokenHash);
    }

    [Fact]
    public async Task ResetPasswordAsync_ShouldUpdatePassword_WhenTokenIsValid()
    {
        // Arrange
        using var context = CreateContext();
        var config = CreateConfiguration();
        var hasher = new PasswordHasher<User>();
        var emailService = new TestEmailService();
        var service = new AuthService(context, config, hasher, emailService);

        var user = new User { Username = "resetuser2", Email = "reset2@example.com", DisplayName = "Reset User 2" };
        user.PasswordHash = hasher.HashPassword(user, "OldPassword123!");
        context.Users.Add(user);

        var rawToken = "valid-reset-token";
        var hash = HashToken(rawToken);
        var resetToken = new PasswordResetToken
        {
            UserId = user.Id,
            TokenHash = hash,
            ExpiresAt = DateTime.UtcNow.AddMinutes(15)
        };
        context.PasswordResetTokens.Add(resetToken);
        await context.SaveChangesAsync();

        // Act
        var success = await service.ResetPasswordAsync(rawToken, "NewPassword456!");

        // Assert
        Assert.True(success);

        var updatedUser = await context.Users.FindAsync(user.Id);
        Assert.NotNull(updatedUser);
        var verifyResult = hasher.VerifyHashedPassword(updatedUser, updatedUser.PasswordHash, "NewPassword456!");
        Assert.Equal(PasswordVerificationResult.Success, verifyResult);

        var dbResetToken = await context.PasswordResetTokens.FirstOrDefaultAsync(prt => prt.TokenHash == hash);
        Assert.NotNull(dbResetToken);
        Assert.NotNull(dbResetToken.UsedAt);
    }

    [Fact]
    public async Task ChangePasswordAsync_ShouldUpdatePassword_WhenCurrentPasswordIsCorrect()
    {
        // Arrange
        using var context = CreateContext();
        var config = CreateConfiguration();
        var hasher = new PasswordHasher<User>();
        var emailService = new TestEmailService();
        var service = new AuthService(context, config, hasher, emailService);

        var user = new User { Username = "changeuser", Email = "change@example.com", DisplayName = "Change User" };
        user.PasswordHash = hasher.HashPassword(user, "CurrentSecret123!");
        context.Users.Add(user);
        await context.SaveChangesAsync();

        // Act
        var success = await service.ChangePasswordAsync(user.Id, "CurrentSecret123!", "BrandNewSecret456!");

        // Assert
        Assert.True(success);

        var dbUser = await context.Users.FindAsync(user.Id);
        Assert.NotNull(dbUser);
        var verifyResult = hasher.VerifyHashedPassword(dbUser, dbUser.PasswordHash, "BrandNewSecret456!");
        Assert.Equal(PasswordVerificationResult.Success, verifyResult);
    }

    [Fact]
    public async Task ResetDemoAccountAsync_ShouldResetTestuserPassword()
    {
        // Arrange
        using var context = CreateContext();
        var config = CreateConfiguration();
        var hasher = new PasswordHasher<User>();
        var emailService = new TestEmailService();
        var service = new AuthService(context, config, hasher, emailService);

        var testUser = new User { Username = "testuser", Email = "test@runstreak.app", DisplayName = "Test User" };
        testUser.PasswordHash = hasher.HashPassword(testUser, "ModifiedPassword123!");
        context.Users.Add(testUser);
        await context.SaveChangesAsync();

        // Act
        var success = await service.ResetDemoAccountAsync();

        // Assert
        Assert.True(success);

        var dbTestUser = await context.Users.FirstOrDefaultAsync(u => u.Username == "testuser");
        Assert.NotNull(dbTestUser);
        var verifyResult = hasher.VerifyHashedPassword(dbTestUser, dbTestUser.PasswordHash, "Test1234!");
        Assert.Equal(PasswordVerificationResult.Success, verifyResult);
    }
}
