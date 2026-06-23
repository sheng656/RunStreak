using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using RunStreak.Api.Data;
using RunStreak.Api.DTOs.Runs;
using RunStreak.Api.Models;
using Xunit;

namespace RunStreak.Tests;

public class ControllerTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;

    public ControllerTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory.WithWebHostBuilder(builder =>
        {
            builder.ConfigureServices(services =>
            {
                // Remove the existing DbContextOptions registration to swap providers
                var descriptor = services.SingleOrDefault(
                    d => d.ServiceType == typeof(DbContextOptions<AppDbContext>));
                if (descriptor != null)
                {
                    services.Remove(descriptor);
                }

                // Register DbContextOptions directly to avoid competing database provider registration issues
                services.AddScoped(sp =>
                {
                    return new DbContextOptionsBuilder<AppDbContext>()
                        .UseInMemoryDatabase("InMemoryControllerTestsDb")
                        .ConfigureWarnings(x => x.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.InMemoryEventId.TransactionIgnoredWarning))
                        .Options;
                });
            });
        });
    }

    private string GenerateTestJwtToken(Guid userId, string username)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.UTF8.GetBytes("dev-only-key-change-this-in-production-must-be-32-chars-or-more!");
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
                new Claim(ClaimTypes.Name, username)
            }),
            Expires = DateTime.UtcNow.AddMinutes(15),
            Issuer = "RunStreakApi",
            Audience = "RunStreakClient",
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };
        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }

    private async Task SeedDatabaseAsync(Func<AppDbContext, Task> seedAction)
    {
        using var scope = _factory.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        await context.Database.EnsureDeletedAsync();
        await context.Database.EnsureCreatedAsync();
        await seedAction(context);
    }

    [Fact]
    public async Task GetRuns_ShouldReturnUnauthorized_WhenTokenIsMissing()
    {
        // Arrange
        var client = _factory.CreateClient();

        // Act
        var response = await client.GetAsync("/api/runs");

        // Assert
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task GetRuns_ShouldReturnRuns_WhenTokenIsValid()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var token = GenerateTestJwtToken(userId, "runner1");
        var client = _factory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        await SeedDatabaseAsync(async context =>
        {
            context.Runs.Add(new Run
            {
                UserId = userId,
                DistanceKm = 5.2m,
                DurationMinutes = 26m,
                RunDate = DateTime.UtcNow.AddDays(-1)
            });
            await context.SaveChangesAsync();
        });

        // Act
        var response = await client.GetAsync("/api/runs");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var content = await response.Content.ReadFromJsonAsync<dynamic>();
        Assert.NotNull(content);
    }

    [Fact]
    public async Task LogRun_ShouldReturnBadRequest_WhenDistanceIsNegative()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var token = GenerateTestJwtToken(userId, "runner1");
        var client = _factory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var badRequest = new LogRunRequest
        {
            DistanceKm = -1.0m, // Invalid distance
            DurationMinutes = 20m,
            RunDate = DateTime.UtcNow
        };

        // Act
        var response = await client.PostAsJsonAsync("/api/runs", badRequest);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task GetLeaderboard_ShouldReturnEntries_WhenRequestIsValid()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var token = GenerateTestJwtToken(userId, "runner1");
        var client = _factory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        await SeedDatabaseAsync(async context =>
        {
            context.Users.AddRange(
                new User { Username = "alice", Email = "alice@example.com", DisplayName = "Alice", TotalPoints = 150 },
                new User { Username = "bob", Email = "bob@example.com", DisplayName = "Bob", TotalPoints = 300 }
            );
            await context.SaveChangesAsync();
        });

        // Act
        var response = await client.GetAsync("/api/leaderboard?type=points");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var entries = await response.Content.ReadFromJsonAsync<List<dynamic>>();
        Assert.NotNull(entries);
        Assert.Equal(2, entries.Count);
    }
}
