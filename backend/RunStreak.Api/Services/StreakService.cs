using Microsoft.EntityFrameworkCore;
using RunStreak.Api.Data;
using RunStreak.Api.Models;

namespace RunStreak.Api.Services;

public class StreakService(AppDbContext context) : IStreakService
{
    private readonly AppDbContext _context = context;

    public async Task<StreakResult> RecalculateStreakAsync(Guid userId, Guid? excludeRunId = null)
    {
        // 1. Fetch all run dates for the user (excluding a specific run if needed, e.g. during delete/update)
        var query = _context.Runs.Where(r => r.UserId == userId);
        if (excludeRunId.HasValue)
        {
            query = query.Where(r => r.Id != excludeRunId.Value);
        }

        var runDates = await query
            .Select(r => r.RunDate)
            .ToListAsync();

        var usedFreezes = await _context.StreakFreezes
            .Where(sf => sf.UserId == userId && sf.Type == "used")
            .ToListAsync();

        var usedFreezeDates = usedFreezes.Select(sf => sf.Date.Date).ToList();

        // 2. Merge distinct sorted active dates
        var activeDates = runDates
            .Select(d => d.Date)
            .Concat(usedFreezeDates)
            .Distinct()
            .OrderBy(d => d)
            .ToList();

        if (activeDates.Count == 0)
        {
            return new StreakResult { CurrentStreak = 0, LongestStreak = 0 };
        }

        // 3. Scan for gaps of exactly 1 day and auto-apply freezes if available
        var user = await _context.Users.FindAsync(userId);
        if (user != null && user.StreakFreezeCount > 0)
        {
            var todayLocal = DateTime.UtcNow.AddHours(14).Date; // max timezone NZ/Kiribati
            bool changesMade = false;

            var updatedActiveDates = new List<DateTime>(activeDates);

            for (int i = 1; i < updatedActiveDates.Count; i++)
            {
                var prev = updatedActiveDates[i - 1];
                var curr = updatedActiveDates[i];
                var gapDays = (curr - prev).Days - 1;

                if (gapDays > 0 && user.StreakFreezeCount >= gapDays)
                {
                    for (int g = 1; g <= gapDays; g++)
                    {
                        var freezeDate = prev.AddDays(g);
                        var newFreeze = new StreakFreeze
                        {
                            UserId = userId,
                            Type = "used",
                            Source = "auto_applied",
                            Date = freezeDate
                        };
                        _context.StreakFreezes.Add(newFreeze);
                        user.StreakFreezeCount--;
                        changesMade = true;
                    }
                }
            }

            var lastActiveDate = updatedActiveDates[^1];
            if (lastActiveDate < todayLocal.AddDays(-1))
            {
                var gapDays = (todayLocal.AddDays(-1) - lastActiveDate).Days;
                if (gapDays > 0 && user.StreakFreezeCount >= gapDays)
                {
                    for (int g = 1; g <= gapDays; g++)
                    {
                        var freezeDate = lastActiveDate.AddDays(g);
                        var newFreeze = new StreakFreeze
                        {
                            UserId = userId,
                            Type = "used",
                            Source = "auto_applied",
                            Date = freezeDate
                        };
                        _context.StreakFreezes.Add(newFreeze);
                        user.StreakFreezeCount--;
                        changesMade = true;
                    }
                }
            }

            if (changesMade)
            {
                await _context.SaveChangesAsync();

                // Re-fetch used freezes and merge again
                var reFetchedUsedFreezes = await _context.StreakFreezes
                    .Where(sf => sf.UserId == userId && sf.Type == "used")
                    .Select(sf => sf.Date.Date)
                    .ToListAsync();

                activeDates = runDates
                    .Select(d => d.Date)
                    .Concat(reFetchedUsedFreezes)
                    .Distinct()
                    .OrderBy(d => d)
                    .ToList();
            }
        }

        int longestStreak = 0;
        int currentStreakSequence = 0;
        DateTime? previousDate = null;

        foreach (var date in activeDates)
        {
            if (previousDate == null)
            {
                currentStreakSequence = 1;
            }
            else
            {
                var diff = (date - previousDate.Value).Days;
                if (diff == 1)
                {
                    currentStreakSequence++;
                }
                else if (diff > 1)
                {
                    currentStreakSequence = 1;
                }
            }
            previousDate = date;

            if (currentStreakSequence > longestStreak)
            {
                longestStreak = currentStreakSequence;
            }
        }

        // 4. Determine if the current streak is active today or yesterday (server UTC date)
        var todayUtc = DateTime.UtcNow.Date;
        var tomorrowUtc = todayUtc.AddDays(1);
        var lastActiveDateFinal = activeDates[^1];
        
        int currentStreak = 0;
        if (lastActiveDateFinal >= todayUtc.AddDays(-1) && lastActiveDateFinal <= tomorrowUtc)
        {
            currentStreak = currentStreakSequence;
        }

        return new StreakResult
        {
            CurrentStreak = currentStreak,
            LongestStreak = longestStreak
        };
    }
}
