# 009 — Run Date Timezone Fix

**Status:** decided
**Date:** 2026-07-07

## Context
When NZ users log a run, the run date is recorded on the client side in their local date (e.g. `2026-07-07`). However, the backend was saving this after calling `.ToUniversalTime()`. In server UTC dates, NZ is +12 or +13 hours ahead. If a user logs a run in the morning NZ time, the UTC date is still the day before. Comparing the raw stored date against `DateTime.UtcNow.Date` causes active streaks to reset to 0 because the stored date is considered in the future relative to UTC.

## Decision
Treat `RunDate` as a timezone-agnostic logical calendar date.
- Store the raw `Date` without timezone conversions.
- Modify the `StreakService` to use a UTC-relative window check that tolerates up to UTC+14 dates (so runs logged "tomorrow" relative to UTC are considered active for today's streak calculation).

## Why
- **Accuracy**: Streak continuity depends on the user's local day-to-day behavior, not the server's UTC calendar.
- **Robustness**: Prevents timezone-induced streak breakage for any user east of UTC.
