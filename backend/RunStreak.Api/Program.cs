using System.Text;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.Identity;
using RunStreak.Api.Data;
using RunStreak.Api.Models;
using RunStreak.Api.Services;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

// ─── DI Services ─────────────────────────────────────────────────────────────
builder.Services.AddScoped<IPasswordHasher<User>, PasswordHasher<User>>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IPointsService, PointsService>();
builder.Services.AddScoped<IStreakService, StreakService>();
builder.Services.AddScoped<IBadgeService, BadgeService>();
builder.Services.AddScoped<ILeaderboardService, LeaderboardService>();
builder.Services.AddScoped<IRunService, RunService>();
builder.Services.AddScoped<IUserService, UserService>();
// AI screenshot import via Google Gemini (Google.GenAI + Microsoft.Extensions.AI)
builder.Services.AddScoped<IScreenshotImportService, ScreenshotImportService>();

// ─── Controllers ────────────────────────────────────────────────────────────
builder.Services.AddControllers();

// ─── OpenAPI (used by Scalar — NOT Swagger UI) ───────────────────────────────
builder.Services.AddOpenApi();

// ─── Database (EF Core → Azure SQL) ─────────────────────────────────────────
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        sqlOptions =>
        {
            // Tolerate Azure SQL auto-pause cold-start latency
            sqlOptions.EnableRetryOnFailure(
                maxRetryCount: 5,
                maxRetryDelay: TimeSpan.FromSeconds(30),
                errorNumbersToAdd: null);
        }));

// ─── JWT Authentication ───────────────────────────────────────────────────────
// Access token lives in memory on the client; only the refresh cookie touches
// the HttpOnly cookie path. This middleware validates the Bearer token on every
// protected request (iss, aud, exp validation is on by default — do NOT disable).
var jwtSettings = builder.Configuration.GetSection("Jwt");
var jwtKey = jwtSettings["Key"]
    ?? throw new InvalidOperationException("JWT signing key is not configured.");

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSettings["Issuer"],
            ValidAudience = jwtSettings["Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
            ClockSkew = TimeSpan.FromSeconds(30), // tight clock skew — access tokens are short-lived
        };
    });

builder.Services.AddAuthorization();

// ─── CORS ────────────────────────────────────────────────────────────────────
// Explicit allow-list (Vercel frontend URL only). AllowCredentials() is required
// for the HttpOnly refresh cookie to be sent cross-origin.
// NEVER use a wildcard origin with AllowCredentials — it is rejected by browsers
// and is a security misconfiguration.
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
    ?? ["http://localhost:5173"]; // Vite dev server default as fallback

builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        policy
            .WithOrigins(allowedOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials(); // required for refresh cookie
    });
});

// ─── Rate Limiting ───────────────────────────────────────────────────────────
// Two policies:
//   "login"     — fixed window: 5 attempts / 15 min per IP (brute-force protection)
//   "run-submit" — sliding window: 10 submissions / 60 min per user (leaderboard spam protection)
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

    // Login: keyed by IP address
    options.AddPolicy("login", httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 5,
                Window = TimeSpan.FromMinutes(15),
                QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                QueueLimit = 0,
            }));

    // Run submission: keyed by authenticated user ID
    options.AddPolicy("run-submit", httpContext =>
    {
        var userId = httpContext.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
            ?? httpContext.Connection.RemoteIpAddress?.ToString()
            ?? "anonymous";

        return RateLimitPartition.GetSlidingWindowLimiter(
            partitionKey: userId,
            factory: _ => new SlidingWindowRateLimiterOptions
            {
                PermitLimit = 10,
                Window = TimeSpan.FromMinutes(60),
                SegmentsPerWindow = 6,
                QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                QueueLimit = 0,
            });
    });
});

var app = builder.Build();

// ─── Middleware pipeline ─────────────────────────────────────────────────────
app.MapOpenApi();
// Scalar replaces Swagger UI — see §10 of AGENTS.md
app.MapScalarApiReference(options =>
{
    options.Title = "RunStreak API";
    options.Theme = ScalarTheme.Mars;
});

app.UseHttpsRedirection();

// CORS must be applied before auth and before any middleware that might
// generate an error response (like the exception handler). This ensures that
// CORS headers appear on ALL responses — including 4xx/5xx — so the browser
// does not misreport validation errors as CORS failures.
app.UseCors("Frontend");
app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.MapGet("/api/health", () => Results.Ok(new { status = "healthy", timestamp = DateTime.UtcNow }))
    .AllowAnonymous();

// Seed database on startup
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var dbContext = services.GetRequiredService<AppDbContext>();
        await DbSeeder.SeedBadgesAsync(dbContext);
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred while seeding the database.");
    }
}

app.Run();

// Expose Program for WebApplicationFactory integration tests
public partial class Program { }
