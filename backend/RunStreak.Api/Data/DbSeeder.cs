using RunStreak.Api.Models;
using RunStreak.Api.Services;
using Microsoft.EntityFrameworkCore;

namespace RunStreak.Api.Data;

/// <summary>
/// Seeds badge definitions on first startup.
/// Option A re-seed: if the badge set has been expanded (detected by count),
/// wipe all existing badges + UserBadge records and re-seed from scratch.
/// This is safe in early development where no real user data exists.
/// </summary>
public static class DbSeeder
{
    // Bump this when adding new badges so the re-seed trigger fires.
    private const int ExpectedBadgeCount = 48;

    // Bump this when adding new challenges so the re-seed trigger fires.
    private const int ExpectedChallengeCount = 16;

    public static async Task SeedBadgesAsync(AppDbContext context)
    {
        var currentCount = await context.Badges.CountAsync();

        if (currentCount == ExpectedBadgeCount)
        {
            return; // Already seeded with the correct set
        }

        // Option A: wipe and re-seed. Drop UserBadges first due to FK constraint.
        if (currentCount > 0)
        {
            context.UserBadges.RemoveRange(context.UserBadges);
            context.Badges.RemoveRange(context.Badges);
            await context.SaveChangesAsync();
        }

        var badges = new List<Badge>
        {
            // ─────────────────────────────────────────────────────────────────
            // MILESTONE — "You've run N times total" progression
            // ─────────────────────────────────────────────────────────────────
            new()
            {
                Name = "First Steps",
                Description = "Log your first run — every legend starts here.",
                IconUrl = "https://api.iconify.design/noto/running-shoe.svg",
                Category = "milestone", Rarity = "common",
                CriteriaJson = "{\"type\":\"total_runs\",\"threshold\":1}",
                PointsReward = 50
            },
            new()
            {
                Name = "Warming Up",
                Description = "Log 5 runs total. You're building momentum!",
                IconUrl = "https://api.iconify.design/noto/fire.svg",
                Category = "milestone", Rarity = "common",
                CriteriaJson = "{\"type\":\"total_runs\",\"threshold\":5}",
                PointsReward = 100
            },
            new()
            {
                Name = "Regular Mover",
                Description = "Log 10 runs. You've made running a habit.",
                IconUrl = "https://api.iconify.design/noto/person-running.svg",
                Category = "milestone", Rarity = "rare",
                CriteriaJson = "{\"type\":\"total_runs\",\"threshold\":10}",
                PointsReward = 150
            },
            new()
            {
                Name = "Dedicated Runner",
                Description = "Log 25 runs. Dedication defines you.",
                IconUrl = "https://api.iconify.design/noto/trophy.svg",
                Category = "milestone", Rarity = "rare",
                CriteriaJson = "{\"type\":\"total_runs\",\"threshold\":25}",
                PointsReward = 250
            },
            new()
            {
                Name = "Iron Will",
                Description = "Log 50 runs. Your commitment is unbreakable.",
                IconUrl = "https://api.iconify.design/noto/flexed-biceps.svg",
                Category = "milestone", Rarity = "epic",
                CriteriaJson = "{\"type\":\"total_runs\",\"threshold\":50}",
                PointsReward = 400
            },
            new()
            {
                Name = "Centurion",
                Description = "Log 100 runs. You are a true running warrior.",
                IconUrl = "https://api.iconify.design/noto/military-medal.svg",
                Category = "milestone", Rarity = "legendary",
                CriteriaJson = "{\"type\":\"total_runs\",\"threshold\":100}",
                PointsReward = 750
            },
            new()
            {
                Name = "Legend",
                Description = "Log 200 runs. Your name echoes in running history.",
                IconUrl = "https://api.iconify.design/noto/crown.svg",
                Category = "milestone", Rarity = "heroic",
                CriteriaJson = "{\"type\":\"total_runs\",\"threshold\":200}",
                PointsReward = 1500
            },

            // ─────────────────────────────────────────────────────────────────
            // STREAK — consecutive day streaks
            // ─────────────────────────────────────────────────────────────────
            new()
            {
                Name = "3-Day Spark",
                Description = "Maintain a 3-day running streak. Keep it going!",
                IconUrl = "https://api.iconify.design/noto/sparkles.svg",
                Category = "streak", Rarity = "common",
                CriteriaJson = "{\"type\":\"current_streak\",\"threshold\":3}",
                PointsReward = 75
            },
            new()
            {
                Name = "Week Warrior",
                Description = "Maintain a 7-day running streak. One week strong!",
                IconUrl = "https://api.iconify.design/noto/fire.svg",
                Category = "streak", Rarity = "rare",
                CriteriaJson = "{\"type\":\"current_streak\",\"threshold\":7}",
                PointsReward = 200
            },
            new()
            {
                Name = "Fortnight Force",
                Description = "Maintain a 14-day running streak. Two weeks of fire!",
                IconUrl = "https://api.iconify.design/noto/high-voltage.svg",
                Category = "streak", Rarity = "epic",
                CriteriaJson = "{\"type\":\"current_streak\",\"threshold\":14}",
                PointsReward = 400
            },
            new()
            {
                Name = "Monthly Master",
                Description = "Maintain a 30-day running streak. A full month of runs!",
                IconUrl = "https://api.iconify.design/noto/glowing-star.svg",
                Category = "streak", Rarity = "legendary",
                CriteriaJson = "{\"type\":\"current_streak\",\"threshold\":30}",
                PointsReward = 1000
            },
            new()
            {
                Name = "100-Day Immortal",
                Description = "Maintain a 100-day running streak. You are unstoppable.",
                IconUrl = "https://api.iconify.design/noto/dragon.svg",
                Category = "streak", Rarity = "heroic",
                CriteriaJson = "{\"type\":\"current_streak\",\"threshold\":100}",
                PointsReward = 3000
            },

            // ─────────────────────────────────────────────────────────────────
            // SINGLE-RUN DISTANCE — one run achievements
            // ─────────────────────────────────────────────────────────────────
            new()
            {
                Name = "5K Finisher",
                Description = "Complete a single run of 5km or more.",
                IconUrl = "https://api.iconify.design/noto/check-mark-button.svg",
                Category = "distance", Rarity = "common",
                CriteriaJson = "{\"type\":\"single_run_distance_km\",\"threshold\":5.0}",
                PointsReward = 100
            },
            new()
            {
                Name = "10K Finisher",
                Description = "Complete a single run of 10km or more.",
                IconUrl = "https://api.iconify.design/noto/star.svg",
                Category = "distance", Rarity = "rare",
                CriteriaJson = "{\"type\":\"single_run_distance_km\",\"threshold\":10.0}",
                PointsReward = 200
            },
            new()
            {
                Name = "Half Marathon",
                Description = "Run 21.1km or more in a single activity. That's a half marathon!",
                IconUrl = "https://api.iconify.design/noto/sports-medal.svg",
                Category = "distance", Rarity = "epic",
                CriteriaJson = "{\"type\":\"single_run_distance_km\",\"threshold\":21.1}",
                PointsReward = 500
            },
            new()
            {
                Name = "Marathon Finisher",
                Description = "Run the full 42.2km marathon distance in one go. Epic achievement!",
                IconUrl = "https://api.iconify.design/noto/trophy.svg",
                Category = "distance", Rarity = "legendary",
                CriteriaJson = "{\"type\":\"single_run_distance_km\",\"threshold\":42.2}",
                PointsReward = 1000
            },
            new()
            {
                Name = "Ultra Runner",
                Description = "Complete an ultra-distance run of 50km or more. You're superhuman.",
                IconUrl = "https://api.iconify.design/noto/superhero.svg",
                Category = "distance", Rarity = "heroic",
                CriteriaJson = "{\"type\":\"single_run_distance_km\",\"threshold\":50.0}",
                PointsReward = 2000
            },

            // ─────────────────────────────────────────────────────────────────
            // CUMULATIVE TOTAL DISTANCE — lifetime distance milestones
            // ─────────────────────────────────────────────────────────────────
            new()
            {
                Name = "10K Club",
                Description = "Accumulate 10km of total running distance.",
                IconUrl = "https://api.iconify.design/noto/world-map.svg",
                Category = "distance", Rarity = "common",
                CriteriaJson = "{\"type\":\"total_distance_km\",\"threshold\":10.0}",
                PointsReward = 50
            },
            new()
            {
                Name = "50K Explorer",
                Description = "Accumulate 50km of total running distance.",
                IconUrl = "https://api.iconify.design/noto/compass.svg",
                Category = "distance", Rarity = "common",
                CriteriaJson = "{\"type\":\"total_distance_km\",\"threshold\":50.0}",
                PointsReward = 100
            },
            new()
            {
                Name = "Century Club",
                Description = "Accumulate 100km of total running distance.",
                IconUrl = "https://api.iconify.design/noto/mountain.svg",
                Category = "distance", Rarity = "rare",
                CriteriaJson = "{\"type\":\"total_distance_km\",\"threshold\":100.0}",
                PointsReward = 300
            },
            new()
            {
                Name = "250K Voyager",
                Description = "Accumulate 250km of total running distance.",
                IconUrl = "https://api.iconify.design/noto/globe-showing-europe-africa.svg",
                Category = "distance", Rarity = "epic",
                CriteriaJson = "{\"type\":\"total_distance_km\",\"threshold\":250.0}",
                PointsReward = 600
            },
            new()
            {
                Name = "500K Legend",
                Description = "Accumulate 500km of total running distance.",
                IconUrl = "https://api.iconify.design/noto/rocket.svg",
                Category = "distance", Rarity = "legendary",
                CriteriaJson = "{\"type\":\"total_distance_km\",\"threshold\":500.0}",
                PointsReward = 1000
            },
            new()
            {
                Name = "1000K Immortal",
                Description = "Accumulate 1,000km of total running distance. You've run a Megameter.",
                IconUrl = "https://api.iconify.design/noto/milky-way.svg",
                Category = "distance", Rarity = "heroic",
                CriteriaJson = "{\"type\":\"total_distance_km\",\"threshold\":1000.0}",
                PointsReward = 2500
            },

            // ─────────────────────────────────────────────────────────────────
            // DISTANCE COUNT — cumulative 5K runs (main progression ladder)
            // Based on "complete 5km N times" — the core gamification loop
            // ─────────────────────────────────────────────────────────────────
            new()
            {
                Name = "5K × 5",
                Description = "Complete 5 runs of 5km or more. You're building a foundation!",
                IconUrl = "https://api.iconify.design/noto/seedling.svg",
                Category = "distance", Rarity = "common",
                CriteriaJson = "{\"type\":\"distance_count\",\"minDistanceKm\":5.0,\"count\":5}",
                PointsReward = 100
            },
            new()
            {
                Name = "5K × 10",
                Description = "Complete 10 runs of 5km or more. You've got a solid base.",
                IconUrl = "https://api.iconify.design/noto/evergreen-tree.svg",
                Category = "distance", Rarity = "rare",
                CriteriaJson = "{\"type\":\"distance_count\",\"minDistanceKm\":5.0,\"count\":10}",
                PointsReward = 200
            },
            new()
            {
                Name = "5K × 20",
                Description = "Complete 20 runs of 5km or more. Consistency is your superpower.",
                IconUrl = "https://api.iconify.design/noto/blue-circle.svg",
                Category = "distance", Rarity = "epic",
                CriteriaJson = "{\"type\":\"distance_count\",\"minDistanceKm\":5.0,\"count\":20}",
                PointsReward = 400
            },
            new()
            {
                Name = "5K × 30",
                Description = "Complete 30 runs of 5km or more. You're in the elite tier.",
                IconUrl = "https://api.iconify.design/noto/purple-circle.svg",
                Category = "distance", Rarity = "legendary",
                CriteriaJson = "{\"type\":\"distance_count\",\"minDistanceKm\":5.0,\"count\":30}",
                PointsReward = 600
            },
            new()
            {
                Name = "5K × 50",
                Description = "Complete 50 runs of 5km or more. Incredible dedication.",
                IconUrl = "https://api.iconify.design/noto/large-orange-diamond.svg",
                Category = "distance", Rarity = "legendary",
                CriteriaJson = "{\"type\":\"distance_count\",\"minDistanceKm\":5.0,\"count\":50}",
                PointsReward = 1000
            },
            new()
            {
                Name = "5K Centurion",
                Description = "Complete 100 runs of 5km or more. A century of 5Ks — you are a legend.",
                IconUrl = "https://api.iconify.design/noto/red-circle.svg",
                Category = "distance", Rarity = "heroic",
                CriteriaJson = "{\"type\":\"distance_count\",\"minDistanceKm\":5.0,\"count\":100}",
                PointsReward = 2500
            },

            // ─────────────────────────────────────────────────────────────────
            // DISTANCE COUNT — 10K runs progression
            // ─────────────────────────────────────────────────────────────────
            new()
            {
                Name = "10K × 5",
                Description = "Complete 5 runs of 10km or more. You're leveling up.",
                IconUrl = "https://api.iconify.design/noto/star-struck.svg",
                Category = "distance", Rarity = "rare",
                CriteriaJson = "{\"type\":\"distance_count\",\"minDistanceKm\":10.0,\"count\":5}",
                PointsReward = 250
            },
            new()
            {
                Name = "10K × 10",
                Description = "Complete 10 runs of 10km or more. Double figures in double digits!",
                IconUrl = "https://api.iconify.design/noto/gem-stone.svg",
                Category = "distance", Rarity = "epic",
                CriteriaJson = "{\"type\":\"distance_count\",\"minDistanceKm\":10.0,\"count\":10}",
                PointsReward = 500
            },
            new()
            {
                Name = "10K × 20",
                Description = "Complete 20 runs of 10km or more. True endurance athlete.",
                IconUrl = "https://api.iconify.design/noto/dizzy.svg",
                Category = "distance", Rarity = "legendary",
                CriteriaJson = "{\"type\":\"distance_count\",\"minDistanceKm\":10.0,\"count\":20}",
                PointsReward = 1000
            },
            new()
            {
                Name = "10K Master",
                Description = "Complete 50 runs of 10km or more. You've mastered the 10K.",
                IconUrl = "https://api.iconify.design/noto/lightning.svg",
                Category = "distance", Rarity = "heroic",
                CriteriaJson = "{\"type\":\"distance_count\",\"minDistanceKm\":10.0,\"count\":50}",
                PointsReward = 2000
            },

            // ─────────────────────────────────────────────────────────────────
            // SPECIAL — speed, effort-based, or unique conditions
            // ─────────────────────────────────────────────────────────────────
            new()
            {
                Name = "Speed Demon",
                Description = "Maintain a pace under 5:00/km on a run of 5km or more.",
                IconUrl = "https://api.iconify.design/noto/lightning.svg",
                Category = "special", Rarity = "rare",
                CriteriaJson = "{\"type\":\"pace_under\",\"paceThreshold\":5.0,\"minDistanceKm\":5.0}",
                PointsReward = 300
            },
            new()
            {
                Name = "Sub-4 Pacer",
                Description = "Maintain a pace under 4:00/km on a run of 5km or more. Blazing fast.",
                IconUrl = "https://api.iconify.design/noto/racing-car.svg",
                Category = "special", Rarity = "epic",
                CriteriaJson = "{\"type\":\"pace_under\",\"paceThreshold\":4.0,\"minDistanceKm\":5.0}",
                PointsReward = 600
            },
            new()
            {
                Name = "3:30 Speedster",
                Description = "Maintain a pace under 3:30/km on a run of 5km or more. Elite territory.",
                IconUrl = "https://api.iconify.design/noto/comet.svg",
                Category = "special", Rarity = "legendary",
                CriteriaJson = "{\"type\":\"pace_under\",\"paceThreshold\":3.5,\"minDistanceKm\":5.0}",
                PointsReward = 1000
            },
            new()
            {
                Name = "Distance Hunter",
                Description = "Accumulate 25km of total running distance.",
                IconUrl = "https://api.iconify.design/noto/bullseye.svg",
                Category = "special", Rarity = "common",
                CriteriaJson = "{\"type\":\"total_distance_km\",\"threshold\":25.0}",
                PointsReward = 75
            },
            new()
            {
                Name = "Marathon × 5",
                Description = "Complete 5 full marathon-distance runs (42.2km+). Absolute legend.",
                IconUrl = "https://api.iconify.design/noto/statue-of-liberty.svg",
                Category = "special", Rarity = "heroic",
                CriteriaJson = "{\"type\":\"distance_count\",\"minDistanceKm\":42.2,\"count\":5}",
                PointsReward = 5000
            },
        };

        context.Badges.AddRange(badges);
        await context.SaveChangesAsync();
    }

    public static async Task SeedChallengesAsync(AppDbContext context)
    {
        var currentCount = await context.Challenges.CountAsync();

        // Fix broken icon URL if present in existing database
        var brokenChallenges = await context.Challenges
            .Where(c => c.IconUrl.Contains("flag-new-zealand.svg"))
            .ToListAsync();

        if (brokenChallenges.Count > 0)
        {
            foreach (var c in brokenChallenges)
            {
                c.IconUrl = "https://api.iconify.design/circle-flags/nz.svg";
            }
            await context.SaveChangesAsync();
        }

        if (currentCount == ExpectedChallengeCount)
        {
            return; // Already seeded with the correct set
        }

        // Wipe existing challenges & user progress when challenge set expands
        if (currentCount > 0)
        {
            context.UserChallenges.RemoveRange(context.UserChallenges);
            context.Challenges.RemoveRange(context.Challenges);
            await context.SaveChangesAsync();
        }

        var challenges = new List<Challenge>
        {
            new()
            {
                Name = "Park Run Challenge",
                Description = "Complete a cumulative 5km distance. Perfect for getting started!",
                TargetDistanceKm = 5.0m,
                IconUrl = "https://api.iconify.design/noto/deciduous-tree.svg",
                Rarity = "common",
                SortOrder = 1
            },
            new()
            {
                Name = "Rangitoto Summit Track",
                Description = "Conquer Auckland's iconic volcanic island hike across lava fields to the summit (8km).",
                TargetDistanceKm = 8.0m,
                IconUrl = "https://api.iconify.design/noto/volcano.svg",
                Rarity = "common",
                SortOrder = 2
            },
            new()
            {
                Name = "City Loop Challenge",
                Description = "Cover a cumulative 10km across your daily runs to conquer the City Loop.",
                TargetDistanceKm = 10.0m,
                IconUrl = "https://api.iconify.design/noto/cityscape.svg",
                Rarity = "common",
                SortOrder = 3
            },
            new()
            {
                Name = "Auckland Coast to Coast Walkway",
                Description = "Traverse Auckland from the Waitematā Harbour to the Manukau Harbour (16km).",
                TargetDistanceKm = 16.0m,
                IconUrl = "https://api.iconify.design/noto/bridge-at-night.svg",
                Rarity = "common",
                SortOrder = 4
            },
            new()
            {
                Name = "Half Marathon Route",
                Description = "Tackle 21.1km total distance. Every step builds toward half-marathon glory.",
                TargetDistanceKm = 21.1m,
                IconUrl = "https://api.iconify.design/noto/sports-medal.svg",
                Rarity = "rare",
                SortOrder = 5
            },
            new()
            {
                Name = "Waitākere Ranges Loop",
                Description = "Explore 25km of lush rainforest and coastal views in Auckland's western ranges.",
                TargetDistanceKm = 25.0m,
                IconUrl = "https://api.iconify.design/noto/national-park.svg",
                Rarity = "rare",
                SortOrder = 6
            },
            new()
            {
                Name = "Routeburn Track",
                Description = "Conquer 32km of world-famous alpine crossing between Mt Aspiring and Fiordland.",
                TargetDistanceKm = 32.0m,
                IconUrl = "https://api.iconify.design/noto/evergreen-tree.svg",
                Rarity = "rare",
                SortOrder = 7
            },
            new()
            {
                Name = "Marathon Expedition",
                Description = "Accumulate 42.2km total. The classic marathon distance broken into your daily runs.",
                TargetDistanceKm = 42.2m,
                IconUrl = "https://api.iconify.design/noto/person-running.svg",
                Rarity = "rare",
                SortOrder = 8
            },
            new()
            {
                Name = "Milford Track",
                Description = "Tackle 53.5km inspired by New Zealand's 'finest walk in the world' through Fiordland.",
                TargetDistanceKm = 53.5m,
                IconUrl = "https://api.iconify.design/noto/mountain.svg",
                Rarity = "epic",
                SortOrder = 9
            },
            new()
            {
                Name = "Abel Tasman Coast Track",
                Description = "Run 60km along golden beaches and turquoise lagoons at the top of the South Island.",
                TargetDistanceKm = 60.0m,
                IconUrl = "https://api.iconify.design/noto/palm-tree.svg",
                Rarity = "epic",
                SortOrder = 10
            },
            new()
            {
                Name = "Kepler Track",
                Description = "A panoramic 60km loop through beech forests and ridge-top alpine tussock.",
                TargetDistanceKm = 60.0m,
                IconUrl = "https://api.iconify.design/noto/sunrise-over-mountains.svg",
                Rarity = "epic",
                SortOrder = 11
            },
            new()
            {
                Name = "Coast to Coast",
                Description = "Run 100km cumulatively to cross the country from sea to sea.",
                TargetDistanceKm = 100.0m,
                IconUrl = "https://api.iconify.design/noto/water-wave.svg",
                Rarity = "epic",
                SortOrder = 12
            },
            new()
            {
                Name = "Tongariro Crossing",
                Description = "Conquer 150km of volcanic terrain inspired by New Zealand's famous alpine crossing.",
                TargetDistanceKm = 150.0m,
                IconUrl = "https://api.iconify.design/noto/volcano.svg",
                Rarity = "epic",
                SortOrder = 13
            },
            new()
            {
                Name = "Tour de New Zealand",
                Description = "A monumental 300km journey across the North and South islands.",
                TargetDistanceKm = 300.0m,
                IconUrl = "https://api.iconify.design/circle-flags/nz.svg",
                Rarity = "legendary",
                SortOrder = 14
            },
            new()
            {
                Name = "Trans-Alpine Expedition",
                Description = "The ultimate 500km ultra-endurance challenge. For true legends.",
                TargetDistanceKm = 500.0m,
                IconUrl = "https://api.iconify.design/noto/snow-capped-mountain.svg",
                Rarity = "heroic",
                SortOrder = 15
            },
            new()
            {
                Name = "Te Araroa Trail",
                Description = "The ultimate 3,000km epic expedition spanning the entire length of New Zealand from Cape Reinga to Bluff.",
                TargetDistanceKm = 3000.0m,
                IconUrl = "https://api.iconify.design/noto/globe-showing-asia-australia.svg",
                Rarity = "heroic",
                SortOrder = 16
            }
        };

        context.Challenges.AddRange(challenges);
        await context.SaveChangesAsync();
    }

    // Known demo usernames — only these get refreshed, never real user accounts created via registration.
    private static readonly HashSet<string> DemoUsernames = new(
    [
        "sarah_j", "mike_c", "aarav_p", "elena_r", "david_k",
        "jess_t", "liam_o", "amara_o", "hiroshi_t", "chloe_d",
        "carlos_m", "zoe_v", "kai_t", "maya_s", "lucas_s",
        "hannah_s", "ethan_b", "freja_l", "tariq_a", "testuser"
    ]);

    public static async Task SeedDemoDataAsync(
        AppDbContext context,
        Microsoft.AspNetCore.Identity.IPasswordHasher<User> passwordHasher,
        IBadgeService badgeService)
    {
        var baseDate = DateTime.UtcNow.Date;

        // Check if demo data is complete and fresh (all 20 demo users exist, testuser has badges, and most recent run is today/yesterday)
        var demoUserCount = await context.Users.CountAsync(u => DemoUsernames.Contains(u.Username));
        var testUserBadgeCount = await context.UserBadges
            .Where(ub => ub.User.Username == "testuser")
            .CountAsync();
        var newestDemoRunDate = await context.Runs
            .Where(r => DemoUsernames.Contains(r.User.Username))
            .MaxAsync(r => (DateTime?)r.RunDate);

        bool isFreshAndComplete = demoUserCount == DemoUsernames.Count
            && testUserBadgeCount > 0
            && newestDemoRunDate.HasValue
            && newestDemoRunDate.Value.Date >= baseDate.AddDays(-1);

        if (isFreshAndComplete)
        {
            return; // Demo data is complete and up to date relative to today
        }

        // Bulk-delete existing demo users (cascades Runs, UserBadges, RefreshTokens, StreakFreezes, UserChallenges)
        // Real user accounts created via registration are left untouched.
        await context.Users
            .Where(u => DemoUsernames.Contains(u.Username))
            .ExecuteDeleteAsync();

        var rng = new Random(2026);

        // Fetch available route challenges to assign to demo users
        var challenges = await context.Challenges.ToListAsync();

        // Sample runner configurations (19 demo users + testuser)
        var runnerConfigs = new[]
        {
            ("Sarah Jenkins", "sarah_j", "avataaars"),
            ("Michael Chang", "mike_c", "personas"),
            ("Aarav Patel", "aarav_p", "lorelei"),
            ("Elena Rostova", "elena_r", "micah"),
            ("David Kim", "david_k", "notionists"),
            ("Jessica Taylor", "jess_t", "open-peeps"),
            ("Liam O'Connor", "liam_o", "adventurer"),
            ("Amara Okafor", "amara_o", "bottts"),
            ("Hiroshi Tanaka", "hiroshi_t", "pixel-art"),
            ("Chloe Dubois", "chloe_d", "croodles"),
            ("Carlos Mendez", "carlos_m", "avataaars"),
            ("Zoe Vance", "zoe_v", "personas"),
            ("Kai Thompson", "kai_t", "lorelei"),
            ("Maya Sharma", "maya_s", "micah"),
            ("Lucas Silva", "lucas_s", "notionists"),
            ("Hannah Schmidt", "hannah_s", "open-peeps"),
            ("Ethan Brown", "ethan_b", "adventurer"),
            ("Freja Lindberg", "freja_l", "bottts"),
            ("Tariq Al-Mansoor", "tariq_a", "pixel-art"),
        };

        int configIndex = 0;
        foreach (var (name, uname, style) in runnerConfigs)
        {
            configIndex++;
            var user = new User
            {
                Id = Guid.NewGuid(),
                Username = uname,
                Email = $"{uname}@example.com",
                DisplayName = name,
                AvatarUrl = $"https://api.dicebear.com/9.x/{style}/svg?seed={name.Replace(" ", "")}",
                WeeklyGoalKm = 20.0m,
                CreatedAt = baseDate.AddDays(-rng.Next(30, 90)),
                UpdatedAt = baseDate
            };
            user.PasswordHash = passwordHasher.HashPassword(user, "Runner123!");

            context.Users.Add(user);
            await context.SaveChangesAsync();

            // Generate 15-30 runs with distances from 2 to 43 km ending on or near today
            int runCount = rng.Next(15, 31);
            decimal totalDist = 0m;
            int totalPts = 0;

            for (int i = 0; i < runCount; i++)
            {
                int daysAgo = (runCount - 1 - i) * rng.Next(1, 3);
                var runDate = baseDate.AddDays(-daysAgo);

                decimal distance = rng.Next(1, 100) < 95
                    ? Math.Round((decimal)(rng.NextDouble() * 12 + 2), 2)
                    : Math.Round((decimal)(rng.NextDouble() * 23 + 20), 2);

                double paceMin = rng.NextDouble() * 2.5 + 4.5;
                decimal duration = Math.Round(distance * (decimal)paceMin, 1);
                int points = (int)(distance * 10m + duration);

                totalDist += distance;
                totalPts += points;

                context.Runs.Add(new Run
                {
                    UserId = user.Id,
                    DistanceKm = distance,
                    DurationMinutes = duration,
                    PaceMinPerKm = Math.Round(duration / distance, 2),
                    RunDate = runDate,
                    Notes = i % 4 == 0 ? "Great morning run!" : null,
                    PerceivedEffort = rng.Next(1, 6),
                    PointsEarned = points,
                    CreatedAt = runDate
                });
            }

            user.TotalRuns = runCount;
            user.TotalDistanceKm = Math.Round(totalDist, 2);
            user.TotalPoints = totalPts;
            user.CurrentStreak = rng.Next(1, 12);
            user.LongestStreak = Math.Max(user.CurrentStreak, rng.Next(5, 20));
            user.StreakFreezeCount = rng.Next(1, 5);

            await context.SaveChangesAsync();

            // Check & award badges for consistency via real BadgeService
            await badgeService.CheckAndAwardBadgesAsync(user.Id);

            // Assign active route challenge to ~half of the demo users
            if (challenges.Count > 0 && configIndex % 2 == 0)
            {
                var challenge = challenges[(configIndex - 1) % challenges.Count];
                context.UserChallenges.Add(new UserChallenge
                {
                    UserId = user.Id,
                    ChallengeId = challenge.Id,
                    ProgressDistanceKm = Math.Round(challenge.TargetDistanceKm * (decimal)(rng.NextDouble() * 0.7 + 0.1), 1),
                    IsActive = true,
                    StartedAt = baseDate.AddDays(-rng.Next(5, 30))
                });
                await context.SaveChangesAsync();
            }
        }

        // Seed designated test account for MSA marker (always up to date ending today)
        var testUser = new User
        {
            Id = Guid.NewGuid(),
            Username = "testuser",
            Email = "test@runstreak.app",
            DisplayName = "Sheng (Test Runner)",
            AvatarUrl = "https://api.dicebear.com/9.x/avataaars/svg?seed=Jack",
            WeeklyGoalKm = 35.0m,
            CreatedAt = baseDate.AddDays(-75),
            UpdatedAt = baseDate
        };
        testUser.PasswordHash = passwordHasher.HashPassword(testUser, "Test1234!");

        context.Users.Add(testUser);
        await context.SaveChangesAsync();

        decimal testTotalDist = 0m;
        int testTotalPts = 0;

        // Historical runs (days -56 to -14)
        for (int i = 28; i >= 15; i--)
        {
            var runDate = baseDate.AddDays(-i * 2);
            decimal dist = Math.Round((decimal)(rng.NextDouble() * 8 + 4), 2);
            decimal dur = Math.Round(dist * (decimal)(rng.NextDouble() * 1.5 + 4.8), 1);
            int pts = (int)(dist * 10m + dur);

            testTotalDist += dist;
            testTotalPts += pts;

            context.Runs.Add(new Run
            {
                UserId = testUser.Id,
                DistanceKm = dist,
                DurationMinutes = dur,
                PaceMinPerKm = Math.Round(dur / dist, 2),
                RunDate = runDate,
                Notes = "Pacing felt super smooth today.",
                PerceivedEffort = rng.Next(2, 4),
                PointsEarned = pts,
                CreatedAt = runDate
            });
        }

        // Continuous 14-day streak up to TODAY (days -13 to 0)
        for (int day = 13; day >= 0; day--)
        {
            var runDate = baseDate.AddDays(-day);
            decimal dist = day == 7 ? 21.1m : Math.Round((decimal)(rng.NextDouble() * 6 + 4), 2);
            decimal dur = Math.Round(dist * (decimal)(rng.NextDouble() * 1.2 + 5.0), 1);
            int pts = (int)(dist * 10m + dur) + 50;

            testTotalDist += dist;
            testTotalPts += pts;

            context.Runs.Add(new Run
            {
                UserId = testUser.Id,
                DistanceKm = dist,
                DurationMinutes = dur,
                PaceMinPerKm = Math.Round(dur / dist, 2),
                RunDate = runDate,
                Notes = day == 7 ? "Half Marathon completed! Felt amazing!" : "Daily streak run.",
                PerceivedEffort = day == 7 ? 5 : 3,
                PointsEarned = pts,
                CreatedAt = runDate
            });
        }

        testUser.TotalRuns = 42;
        testUser.TotalDistanceKm = Math.Round(testTotalDist, 2);
        testUser.TotalPoints = testTotalPts + 1200;
        testUser.CurrentStreak = 14;
        testUser.LongestStreak = 18;
        testUser.StreakFreezeCount = 3;

        await context.SaveChangesAsync();

        // Check & award badges for testuser
        await badgeService.CheckAndAwardBadgesAsync(testUser.Id);

        // Seed streak freeze record for test user
        context.StreakFreezes.Add(new StreakFreeze
        {
            UserId = testUser.Id,
            Type = "used",
            Source = "auto_applied",
            Date = baseDate.AddDays(-16)
        });

        // Start active route challenge for test user (Tour de NZ)
        var tourDeNz = challenges.FirstOrDefault(c => c.Name.Contains("Tour de New Zealand"));
        if (tourDeNz != null)
        {
            context.UserChallenges.Add(new UserChallenge
            {
                UserId = testUser.Id,
                ChallengeId = tourDeNz.Id,
                ProgressDistanceKm = 185.5m,
                IsActive = true,
                StartedAt = baseDate.AddDays(-30)
            });
        }

        await context.SaveChangesAsync();
    }
}

