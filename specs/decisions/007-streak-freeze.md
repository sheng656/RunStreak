# 007 — Streak Freeze & Advance Purchase Constraint

**Status:** decided
**Date:** 2026-07-07 (Updated: 2026-07-28)

## Context
Habit building apps face a common user churn vector: when a user breaks a long streak, they experience loss aversion and demotivation. To mitigate this while encouraging healthy habit building, a "Streak Freeze" (Rest Day Ticket) system was introduced.

Previously, banked tickets were auto-applied to any gap in run history regardless of when the ticket was purchased. This allowed users to retroactively purchase a ticket after a streak broke to repair past missed days. To preserve game integrity and promote planned habit building, rest day tickets must be purchased in advance before taking a rest day.

## Decision

### 1. Core Mechanics & Earning
Introduce a `StreakFreeze` entity tracking used and earned streak freezes. A user has a banked count of streak freezes (capped at 5).
- **Points Purchase**: Spend 256 points to purchase a ticket.
- **Streak Milestone**: Every 5-day streak milestone awards 1 ticket.
- **Distance Milestone**: Every 60km cumulative distance milestone awards 1 ticket.

### 2. Advance Purchase Constraint (Backend)
- In `StreakService.cs`, when scanning for gaps to auto-apply banked tickets to a rest day date $D$:
  - The system checks `earnedFreezes.Count(sf => sf.Date.Date <= D) - usedFreezes.Count(sf => sf.Date.Date <= D) > 0`.
  - Rest day tickets purchased or earned **after** date $D$ cannot be applied to date $D$.
  - Retroactive repair of past broken streaks is strictly prohibited.

### 3. Hover Tooltips & Confirmation Modal (Frontend)
- Rest Day Ticket purchase buttons feature a hover tooltip explicitly communicating:
  *"Rest day tickets must be purchased in advance before taking a rest day. They cannot be applied retroactively to past missed days."*
- Clicking "Buy Shield (256 pts)" presents a visual confirmation modal in `DashboardPage.tsx` summarizing advance purchase rules, points cost (256 pts), points balance impact, and banked ticket count.

## Why
- **HCI Alignment**: Encourages rest days for injury prevention without punishing the user.
- **Milestone Rewards**: Reinforces positive behavior by gifting free tickets on performance/streak milestones.
- **Bank Cap**: A limit of 5 prevents hoarding and ensures users don't go inactive for too long.
- **Game Integrity**: Prevents users from retroactively patching old broken streaks with points earned long after the streak ended.
- **Habit Formation**: Encourages runners to plan rest days intentionally ahead of time.
- **Clear UX**: The confirmation modal prevents accidental points spending while educating users on ticket mechanics.
