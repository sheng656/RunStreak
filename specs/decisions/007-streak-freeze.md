# 007 — Streak Freeze implementation

**Status:** decided
**Date:** 2026-07-07

## Context
Habit building apps face a common user churn vector: when a user breaks a long streak, they experience loss aversion and demotivation. To mitigate this while encouraging healthy habit building, a "Streak Freeze" (Rest Day Ticket) system is required.

## Decision
Introduce a `StreakFreeze` entity tracking used and earned streak freezes. A user has a banked count of streak freezes (capped at 5).
Earning methods:
- Spend 256 points to purchase.
- Every 5-day streak milestone awards 1 freeze.
- Every 60km cumulative distance milestone awards 1 freeze.

Streak calculation service will be updated to treat a day with an applied freeze as active, keeping the streak alive.

## Why
- **HCI Alignment**: Encourages rest days for injury prevention without punishing the user.
- **Milestone rewards**: Reinforces positive behavior by gifting free tickets on performance/streak milestones.
- **Bank Cap**: A limit of 5 prevents hoarding and ensures users don't go inactive for too long.
