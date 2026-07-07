# 008 — Rolling 7-Day Leaderboard

**Status:** decided
**Date:** 2026-07-07

## Context
All-time points leaderboards can discourage new or returning users because established top runners accumulate points that are mathematically impossible for newcomers to catch. We need a way to keep competition fresh and active.

## Decision
Introduce a "Rolling 7-Day" leaderboard tab that calculates points accumulated from runs completed in the last 7 days only.

## Why
- **Fresh Competition**: Anyone has a chance to reach the top of the board every week.
- **Engagement**: Encourages ongoing activity rather than sitting on a high all-time rank.
- **Simplicity**: Keeps the same `LeaderboardEntryDto` payload signature, just modifying the points total to represent the rolling window.
