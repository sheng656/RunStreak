using Microsoft.EntityFrameworkCore;
using RunStreak.Api.Data;

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

        // Project only the Date component to reduce data transfer and simplify date-only operations
        var runDates = await query
            .Select(r => r.RunDate)
            .ToListAsync();

        if (runDates.Count == 0)
        {
            return new StreakResult { CurrentStreak = 0, LongestStreak = 0 };
        }

        // 2. Convert to Date only (UTC date) and get distinct sorted dates
        var distinctSortedDates = runDates
            .Select(d => d.Date)
            .Distinct()
            .OrderBy(d => d)
            .ToList();

        int longestStreak = 0;
        int currentStreakSequence = 0;
        DateTime? previousDate = null;

        foreach (var date in distinctSortedDates)
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

        // 3. Determine if the current streak is active today or yesterday (server UTC date)
        var today = DateTime.UtcNow.Date;
        var lastRunDate = distinctSortedDates[^1];
        
        int currentStreak = 0;
        if (lastRunDate == today || lastRunDate == today.AddDays(-1))
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
