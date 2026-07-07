using Microsoft.EntityFrameworkCore;
using RunStreak.Api.Models;

namespace RunStreak.Api.Data;

/// <summary>
/// Single EF Core DbContext for the entire RunStreak application.
/// Contains all entities: users, runs, badges, achievements, and auth tokens.
/// </summary>
public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Run> Runs => Set<Run>();
    public DbSet<Badge> Badges => Set<Badge>();
    public DbSet<UserBadge> UserBadges => Set<UserBadge>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<StreakFreeze> StreakFreezes => Set<StreakFreeze>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // ── Users ───────────────────────────────────────────────────────────
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(u => u.Id);
            entity.HasIndex(u => u.Email).IsUnique();
            entity.HasIndex(u => u.Username).IsUnique();
            entity.HasIndex(u => u.TotalPoints); // leaderboard sort
            entity.HasIndex(u => u.CurrentStreak); // streak leaderboard sort

            entity.Property(u => u.Username).HasMaxLength(50).IsRequired();
            entity.Property(u => u.Email).HasMaxLength(256).IsRequired();
            entity.Property(u => u.PasswordHash).IsRequired();
            entity.Property(u => u.DisplayName).HasMaxLength(100).IsRequired();
            entity.Property(u => u.AvatarUrl).HasMaxLength(512);
            entity.Property(u => u.TotalDistanceKm).HasPrecision(10, 2);
        });

        // ── Runs ────────────────────────────────────────────────────────────
        modelBuilder.Entity<Run>(entity =>
        {
            entity.HasKey(r => r.Id);
            entity.HasIndex(r => new { r.UserId, r.RunDate }); // streak calculation + history
            entity.HasIndex(r => r.RunDate);

            entity.Property(r => r.DistanceKm).HasPrecision(8, 2).IsRequired();
            entity.Property(r => r.DurationMinutes).HasPrecision(8, 2).IsRequired();
            entity.Property(r => r.PaceMinPerKm).HasPrecision(8, 2);
            entity.Property(r => r.Notes).HasMaxLength(500);

            entity.HasOne(r => r.User)
                .WithMany(u => u.Runs)
                .HasForeignKey(r => r.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // ── Badges ──────────────────────────────────────────────────────────
        modelBuilder.Entity<Badge>(entity =>
        {
            entity.HasKey(b => b.Id);
            entity.HasIndex(b => b.Name).IsUnique();

            entity.Property(b => b.Name).HasMaxLength(100).IsRequired();
            entity.Property(b => b.Description).HasMaxLength(500).IsRequired();
            entity.Property(b => b.IconUrl).HasMaxLength(512).IsRequired();
            entity.Property(b => b.Category).HasMaxLength(50).IsRequired();
            entity.Property(b => b.Rarity).HasMaxLength(20).IsRequired().HasDefaultValue("common");
        });

        // ── UserBadges ──────────────────────────────────────────────────────
        modelBuilder.Entity<UserBadge>(entity =>
        {
            entity.HasKey(ub => ub.Id);
            // Each badge can be earned only once per user
            entity.HasIndex(ub => new { ub.UserId, ub.BadgeId }).IsUnique();

            entity.HasOne(ub => ub.User)
                .WithMany(u => u.UserBadges)
                .HasForeignKey(ub => ub.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(ub => ub.Badge)
                .WithMany(b => b.UserBadges)
                .HasForeignKey(ub => ub.BadgeId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // ── RefreshTokens ───────────────────────────────────────────────────
        modelBuilder.Entity<RefreshToken>(entity =>
        {
            entity.HasKey(rt => rt.Id);
            // Lookup by hash on every refresh request — must be fast
            entity.HasIndex(rt => rt.TokenHash).IsUnique();
            // Revoke all tokens for a user on logout
            entity.HasIndex(rt => rt.UserId);

            entity.Property(rt => rt.TokenHash).IsRequired();

            entity.HasOne(rt => rt.User)
                .WithMany(u => u.RefreshTokens)
                .HasForeignKey(rt => rt.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // ── StreakFreezes ───────────────────────────────────────────────────
        modelBuilder.Entity<StreakFreeze>(entity =>
        {
            entity.HasKey(sf => sf.Id);
            entity.HasIndex(sf => new { sf.UserId, sf.Date });
            entity.Property(sf => sf.Type).HasMaxLength(50).IsRequired();
            entity.Property(sf => sf.Source).HasMaxLength(50).IsRequired();

            entity.HasOne(sf => sf.User)
                .WithMany(u => u.StreakFreezes)
                .HasForeignKey(sf => sf.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
