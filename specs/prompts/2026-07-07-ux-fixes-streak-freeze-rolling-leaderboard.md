# 2026-07-07 — UX Fixes, Streak Freeze, and Rolling 7-Day Leaderboard

## Prompt 1 (translated/paraphrased to English)
I need five items implemented in a single session:
1. Update run logging time input: The durationMinutes input is a decimal. Make this hours, minutes, seconds instead so users don't have to calculate decimals.
2. Fix badge icon URLs: checkmark-button.svg and medal.svg are throwing 404 errors. Find out why and fix it.
3. Leaderboard display: when I switch to the Streaks leaderboard, it still shows points instead of the streak count.
4. Introduce Streak Freeze: add a Rest Day Ticket (streak shield) feature. Users can spend points to purchase them (256 points, max cap of 5). Also, they auto-earn 1 every 5 streak days and every 60km cumulative distance. It should automatically protect their streak if they miss a run.
5. Rolling 7-Day Leaderboard: add a third tab to the leaderboard that ranks runners based only on points earned in the last 7 days.

I also observed two bugs during the review:
- Timezone bug: My run streak went back to 0 days even after deleting and adding runs back. (NZ timezone issue).
- Duplicate run bug: The celebration page is never reached because the first submit failed but actually saved on the server, so the second submit created a duplicate and skipped badges.

## Agent output
- Prepared a detailed v2 implementation plan addressing all 5 features + 2 critical bugs.
- Built a timezone-agnostic `RunDate.Date` storage system in the backend and updated the `StreakService` check window to handle up to UTC+14 timezone offset dates.
- Implemented duplicate run detection (409 Conflict) and increased Axios timeout to 60 seconds to tolerate database cold-starts.
- Replaced checkmark-button and medal URLs with correct Iconify names in `DbSeeder.cs`.
- Refactored `LeaderboardPage.tsx` to dynamically swap metric columns (Streak and Points) based on active tab.
- Created `StreakFreeze` model, migration, `StreakFreezeService`, and controller endpoints (`POST /purchase`, `GET /status`).
- Added shield badges, "Protected" tags, and purchase panels on the React frontend dashboard page.
- Created a rolling 7-day points aggregation query in `LeaderboardService` and mapped it to a new 7-Day tab on the frontend.
- Added 4 new integration unit tests in `GamificationTests.cs` and verified 35/35 backend and 18/18 frontend tests passed successfully.

## Follow-up prompts
- The user highlighted typescript compilation errors on frontend build and requested a visual avatar picker of 48 options to edit display names and select avatars from.
- Handled two bugfixes to make `npm run build` succeed:
  - Added `streakFreezeCount` to `UserProfile` in `authStore.ts` and updated mock test data in `authStore.test.ts`.
  - Replaced stale reference to `duration` with `totalDurationMinutes` in `LogRunPage.tsx` pace preview condition.
- Created `AvatarPicker.tsx` component with 48 distinct avatar seeds (16 Characters, 16 Robots, 16 Emojis) powered by the DiceBear SVG API.
- Integrated `AvatarPicker` in `ProfilePage.tsx`, replacing the raw URL text input field.
- Updated `ProfilePage.tsx`, `Navbar.tsx`, and `LeaderboardPage.tsx` to render the user's selected avatar image dynamically (with initials fallback).
- Ran builds and tests successfully on Windows PowerShell.
