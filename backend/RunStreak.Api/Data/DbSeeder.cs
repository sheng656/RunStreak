using RunStreak.Api.Models;

namespace RunStreak.Api.Data;

public static class DbSeeder
{
    public static async Task SeedBadgesAsync(AppDbContext context)
    {
        if (context.Badges.Any())
        {
            return; // Badges already seeded
        }

        var badges = new List<Badge>
        {
            // Milestone category
            new()
            {
                Name = "First Steps",
                Description = "Log your first run",
                IconUrl = "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=100&auto=format&fit=crop&q=60",
                Category = "milestone",
                CriteriaJson = "{\"type\":\"total_runs\",\"threshold\":1}",
                PointsReward = 50
            },
            new()
            {
                Name = "Getting Started",
                Description = "Log 5 runs total",
                IconUrl = "https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?w=100&auto=format&fit=crop&q=60",
                Category = "milestone",
                CriteriaJson = "{\"type\":\"total_runs\",\"threshold\":5}",
                PointsReward = 100
            },
            new()
            {
                Name = "Dedicated Runner",
                Description = "Log 25 runs total",
                IconUrl = "https://images.unsplash.com/photo-1502224562085-639556652f33?w=100&auto=format&fit=crop&q=60",
                Category = "milestone",
                CriteriaJson = "{\"type\":\"total_runs\",\"threshold\":25}",
                PointsReward = 250
            },
            new()
            {
                Name = "Centurion",
                Description = "Log 100 runs total",
                IconUrl = "https://images.unsplash.com/photo-1486218119243-13883505764c?w=100&auto=format&fit=crop&q=60",
                Category = "milestone",
                CriteriaJson = "{\"type\":\"total_runs\",\"threshold\":100}",
                PointsReward = 500
            },

            // Single Run Distance category
            new()
            {
                Name = "5K Club",
                Description = "Run 5km or more in a single activity",
                IconUrl = "https://images.unsplash.com/photo-1530541930197-ff16ac917b0e?w=100&auto=format&fit=crop&q=60",
                Category = "distance",
                CriteriaJson = "{\"type\":\"single_run_distance_km\",\"threshold\":5.0}",
                PointsReward = 100
            },
            new()
            {
                Name = "10K Club",
                Description = "Run 10km or more in a single activity",
                IconUrl = "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=100&auto=format&fit=crop&q=60",
                Category = "distance",
                CriteriaJson = "{\"type\":\"single_run_distance_km\",\"threshold\":10.0}",
                PointsReward = 200
            },
            new()
            {
                Name = "Half Marathon",
                Description = "Run 21.1km or more in a single activity",
                IconUrl = "https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?w=100&auto=format&fit=crop&q=60",
                Category = "distance",
                CriteriaJson = "{\"type\":\"single_run_distance_km\",\"threshold\":21.1}",
                PointsReward = 500
            },
            new()
            {
                Name = "Marathon",
                Description = "Run 42.2km or more in a single activity",
                IconUrl = "https://images.unsplash.com/photo-1502224562085-639556652f33?w=100&auto=format&fit=crop&q=60",
                Category = "distance",
                CriteriaJson = "{\"type\":\"single_run_distance_km\",\"threshold\":42.2}",
                PointsReward = 1000
            },

            // Streak category
            new()
            {
                Name = "Week Warrior",
                Description = "Maintain a 7-day running streak",
                IconUrl = "https://images.unsplash.com/photo-1486218119243-13883505764c?w=100&auto=format&fit=crop&q=60",
                Category = "streak",
                CriteriaJson = "{\"type\":\"current_streak\",\"threshold\":7}",
                PointsReward = 200
            },
            new()
            {
                Name = "Fortnight Force",
                Description = "Maintain a 14-day running streak",
                IconUrl = "https://images.unsplash.com/photo-1530541930197-ff16ac917b0e?w=100&auto=format&fit=crop&q=60",
                Category = "streak",
                CriteriaJson = "{\"type\":\"current_streak\",\"threshold\":14}",
                PointsReward = 400
            },
            new()
            {
                Name = "Monthly Master",
                Description = "Maintain a 30-day running streak",
                IconUrl = "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=100&auto=format&fit=crop&q=60",
                Category = "streak",
                CriteriaJson = "{\"type\":\"current_streak\",\"threshold\":30}",
                PointsReward = 1000
            },

            // Total Distance category
            new()
            {
                Name = "Century Club",
                Description = "Accumulate 100km total running distance",
                IconUrl = "https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?w=100&auto=format&fit=crop&q=60",
                Category = "distance",
                CriteriaJson = "{\"type\":\"total_distance_km\",\"threshold\":100.0}",
                PointsReward = 500
            },
            new()
            {
                Name = "500K Explorer",
                Description = "Accumulate 500km total running distance",
                IconUrl = "https://images.unsplash.com/photo-1502224562085-639556652f33?w=100&auto=format&fit=crop&q=60",
                Category = "distance",
                CriteriaJson = "{\"type\":\"total_distance_km\",\"threshold\":500.0}",
                PointsReward = 1000
            },

            // Special category
            new()
            {
                Name = "Speed Demon",
                Description = "Maintain a pace under 5:00 min/km on a run of 5km or more",
                IconUrl = "https://images.unsplash.com/photo-1486218119243-13883505764c?w=100&auto=format&fit=crop&q=60",
                Category = "special",
                CriteriaJson = "{\"type\":\"pace_under\",\"paceThreshold\":5.0,\"minDistanceKm\":5.0}",
                PointsReward = 300
            }
        };

        context.Badges.AddRange(badges);
        await context.SaveChangesAsync();
    }
}
