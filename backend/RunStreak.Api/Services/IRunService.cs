using RunStreak.Api.DTOs.Runs;
using RunStreak.Api.Models;

namespace RunStreak.Api.Services;

public interface IRunService
{
    Task<RunDto?> GetRunByIdAsync(Guid runId, Guid userId);
    Task<(List<RunDto> Runs, int TotalCount)> GetUserRunsAsync(Guid userId, int page, int pageSize);
    Task<(RunDto Run, List<Badge> UnlockedBadges)> LogRunAsync(Guid userId, LogRunRequest request);
    Task<(RunDto Run, List<Badge> UnlockedBadges)?> UpdateRunAsync(Guid userId, Guid runId, UpdateRunRequest request);
    Task<bool> DeleteRunAsync(Guid userId, Guid runId);
}
