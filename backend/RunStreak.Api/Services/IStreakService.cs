namespace RunStreak.Api.Services;

public class StreakResult
{
    public int CurrentStreak { get; set; }
    public int LongestStreak { get; set; }
}

public interface IStreakService
{
    Task<StreakResult> RecalculateStreakAsync(Guid userId, Guid? excludeRunId = null);
}
