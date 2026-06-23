namespace RunStreak.Api.Services;

public interface IPointsService
{
    int CalculatePoints(decimal distanceKm, decimal durationMinutes, int currentStreak);
}
