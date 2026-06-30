# 004 — Badge Rarity and Cumulative Progression System

**Status:** decided
**Date:** 2026-06-30

## Context
The gamification system needs to motivate habit building. A flat set of 14 badges is quickly completed and offers no tiered sense of accomplishment.

## Decision
1. Overhaul the badge system to use **Rarity Tiers** (Common, Rare, Epic, Legendary, Heroic).
2. Seed **48 distinct badges** targeting cumulative milestones (e.g., 5K runs completed 5, 10, 20, 30, 50, 100 times).
3. Introduce a custom `distance_count` criteria type evaluated in the backend.
4. Redesign the Badges Page to display all locked/unlocked badges with progress indicators.
5. Create a dedicated full-screen Badge Celebration Page with animation effects on unlock.

## Why
- **Motivation**: Progression ladders (e.g., 5K × 10 → 5K × 20) keep users engaged long-term.
- **Rarity Psychology**: Gamified rarity tiers create psychological reward triggers.
- **Progress Tracking**: Showing locked achievements with progress bars turns the badges gallery into an interactive roadmap.
