# 011 — Solo Runner Self-Motivation UX

**Status:** decided
**Date:** 2026-07-21

## Context

RunStreak's gamification loop relied heavily on social comparison (leaderboard, competitive rankings). A new user running alone sees an empty leaderboard with only themselves, no friendly competition, and no external nudge to keep going. The features that *should* drive intrinsic motivation — streaks, personal progress, and achievement milestones — existed but were underserved in the UI. The dashboard showed only raw lifetime-aggregate stats with no narrative, trends, goal-setting, or encouragement.

Specifically missing for a solo user:
1. No weekly/monthly trends — no visual sense of whether they're improving.
2. No personal goals — no way to set a weekly distance target.
3. No motivational messaging — the dashboard greeting was static.
4. No activity calendar/heatmap — no visual representation of *when* they ran.
5. No personal bests / records — users couldn't see or celebrate their fastest pace, longest run, or biggest week.
6. Leaderboard felt empty solo — a single-user leaderboard is demotivating.

## Decision

Implement six self-motivation UX improvements, prioritising frontend-first changes that reuse existing backend data, with minimal targeted backend additions:

1. **Weekly Activity Calendar** (`WeeklyCalendar.tsx`) — a Mon-Sun strip showing filled/empty circles for days with a logged run vs rest days. Freeze-shield icon on freeze-protected days. Placed on dashboard above stats.
2. **Motivational Insights Banner** (`MotivationalInsight.tsx`) — a priority-ordered rule engine that reads user stats + recent runs and picks the single most impactful contextual message (streak at risk, milestone, PB proximity, consistency praise, comeback nudge, new user welcome). Replaces the static subtitle.
3. **Personal Records Card** (`PersonalRecords.tsx`) — shows Longest Run, Best Pace, Best Week in a horizontal card with trophy iconography.
4. **Weekly Distance Progress Bar** (`WeeklyProgress.tsx`) — animated gradient progress bar showing 'X.X km / Y km this week'. Goal is user-configurable (stored in DB via User.WeeklyGoalKm). Shows celebration state with animated glow when goal is exceeded.
5. **You vs Your Past Self** section on `LeaderboardPage.tsx` — always-visible section (regardless of user count) comparing this week vs last week across distance, runs, points, and streak. Includes 'best week ever' callout.
6. **Rich post-run toast** on `LogRunPage.tsx` — after successful run submission, shows +X points, streak count, new PB flags, and proximity to closest locked badge.

**Backend additions:**
- `User.WeeklyGoalKm` column (decimal, default 20.0) with EF Core migration `AddWeeklyGoalKm`.
- `UserStatsDto` extended with: WeeklyDistanceKm, WeeklyRunCount, WeeklyGoalKm, WeeklyPoints, LastWeekDistanceKm, LastWeekRunCount, LastWeekPoints, BestWeekDistanceKm.
- `PUT /api/users/me/weekly-goal` endpoint — updates WeeklyGoalKm for the authenticated user.
- Weekly stats calculated in `UserService.GetUserStatsAsync` via ISO-week grouping (Monday-Sunday) of run records.

## Why

- **Intrinsic motivation over social comparison:** Research consistently shows habit formation apps succeed by making users compare against themselves (Duolingo calendar, GitHub contribution graph, Nike Run Club) rather than requiring multi-user competition. A solo user should feel rewarded by their own progress.
- **Goal-setting drives engagement:** Having a concrete weekly target creates daily intent and a progress feedback loop even when there are no other users to compete with.
- **Contextual messaging is more effective than static copy:** A message that adapts to the user's real state is significantly more motivating than a fixed subtitle.
- **Scope discipline:** All six features reuse existing data where possible. The backend additions are a single column plus a stats endpoint expansion — no new entities, no complex queries, no new infrastructure cost.
- **Weekly goal stored in DB (not localStorage):** Survives device switches and browser clears. Minimal cost — a single decimal column with a migration.
