using RunStreak.Api.DTOs.Leaderboard;

namespace RunStreak.Api.Services;

public interface ILeaderboardService
{
    Task<List<LeaderboardEntryDto>> GetLeaderboardAsync(string rankingType, int page = 1, int pageSize = 20);
}
