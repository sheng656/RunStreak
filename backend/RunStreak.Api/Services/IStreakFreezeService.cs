using System;
using System.Threading.Tasks;

namespace RunStreak.Api.Services;

public interface IStreakFreezeService
{
    Task<int> GetAvailableFreezeCountAsync(Guid userId);
    Task<bool> PurchaseStreakFreezeAsync(Guid userId);
    Task<int> CheckAutoEarnAsync(Guid userId);
}
