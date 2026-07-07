using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using RunStreak.Api.Data;
using RunStreak.Api.Models;

namespace RunStreak.Api.Services;

public class StreakFreezeService(AppDbContext context) : IStreakFreezeService
{
    private readonly AppDbContext _context = context;
    private const int PurchaseCost = 256;
    private const int MaxBankedFreezes = 5;

    public async Task<int> GetAvailableFreezeCountAsync(Guid userId)
    {
        var user = await _context.Users.FindAsync(userId);
        return user?.StreakFreezeCount ?? 0;
    }

    public async Task<bool> PurchaseStreakFreezeAsync(Guid userId)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null) return false;

        if (user.StreakFreezeCount >= MaxBankedFreezes)
        {
            return false; // Already at cap
        }

        if (user.TotalPoints < PurchaseCost)
        {
            return false; // Not enough points
        }

        // Deduct points and award freeze
        user.TotalPoints -= PurchaseCost;
        user.StreakFreezeCount++;
        user.UpdatedAt = DateTime.UtcNow;

        var freeze = new StreakFreeze
        {
            UserId = userId,
            Type = "earned",
            Source = "points_purchase",
            Date = DateTime.UtcNow.Date
        };

        _context.StreakFreezes.Add(freeze);
        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<int> CheckAutoEarnAsync(Guid userId)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null) return 0;

        int earnedCount = 0;

        // 1. Check 5-day streak milestone
        if (user.CurrentStreak > 0 && user.CurrentStreak % 5 == 0)
        {
            var latestRunDate = await _context.Runs
                .Where(r => r.UserId == userId)
                .OrderByDescending(r => r.RunDate)
                .Select(r => r.RunDate.Date)
                .FirstOrDefaultAsync();

            if (latestRunDate != default)
            {
                var alreadyEarned = await _context.StreakFreezes.AnyAsync(sf =>
                    sf.UserId == userId &&
                    sf.Type == "earned" &&
                    sf.Source == "streak_milestone" &&
                    sf.Date == latestRunDate);

                if (!alreadyEarned && user.StreakFreezeCount < MaxBankedFreezes)
                {
                    user.StreakFreezeCount++;
                    var freeze = new StreakFreeze
                    {
                        UserId = userId,
                        Type = "earned",
                        Source = "streak_milestone",
                        Date = latestRunDate
                    };
                    _context.StreakFreezes.Add(freeze);
                    earnedCount++;
                }
            }
        }

        // 2. Check 60km cumulative distance milestone
        int expectedDistanceFreezes = (int)Math.Floor(user.TotalDistanceKm / 60m);
        int actualDistanceFreezes = await _context.StreakFreezes.CountAsync(sf =>
            sf.UserId == userId &&
            sf.Type == "earned" &&
            sf.Source == "distance_milestone");

        if (expectedDistanceFreezes > actualDistanceFreezes)
        {
            int runsToAward = expectedDistanceFreezes - actualDistanceFreezes;
            for (int i = 0; i < runsToAward; i++)
            {
                if (user.StreakFreezeCount < MaxBankedFreezes)
                {
                    user.StreakFreezeCount++;
                    var freeze = new StreakFreeze
                    {
                        UserId = userId,
                        Type = "earned",
                        Source = "distance_milestone",
                        Date = DateTime.UtcNow.Date
                    };
                    _context.StreakFreezes.Add(freeze);
                    earnedCount++;
                }
                else
                {
                    break;
                }
            }
        }

        if (earnedCount > 0)
        {
            user.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }

        return earnedCount;
    }
}
