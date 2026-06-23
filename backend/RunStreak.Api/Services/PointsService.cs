namespace RunStreak.Api.Services;

public class PointsService : IPointsService
{
    private const int BasePoints = 10;
    private const decimal PointsPerKm = 5m;
    private const decimal StreakMultiplier = 1.5m;
    private const int StreakThreshold = 7;

    public int CalculatePoints(decimal distanceKm, decimal durationMinutes, int currentStreak)
    {
        if (distanceKm < 0 || durationMinutes < 0)
        {
            return 0;
        }

        // Base + Distance points
        decimal points = BasePoints + (distanceKm * PointsPerKm);

        // Apply streak multiplier if streak threshold met
        if (currentStreak >= StreakThreshold)
        {
            points *= StreakMultiplier;
        }

        return (int)Math.Round(points, MidpointRounding.AwayFromZero);
    }
}
