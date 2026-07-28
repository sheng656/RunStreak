# 012 — Route Challenge Mode implementation

**Status:** decided
**Date:** 2026-07-28

## Context
Habit building requires progressive long-term targets beyond daily streak maintenance. To motivate runners with milestone achievements based on real-world geography, a "Challenge Mode" (Route Challenges) is required.

## Decision
Introduce `Challenge` and `UserChallenge` entities tracking cumulative distance progress along classic long-distance routes:
- **Park Run** (5 km)
- **City Loop** (10 km)
- **Half Marathon** (21.1 km)
- **Marathon** (42.195 km)
- **Coast to Coast** (100 km)
- **Tongariro Crossing** (150 km)
- **Tour de NZ** (300 km)
- **Trans-Alpine** (500 km)

Users can select one active challenge at a time. Each logged run automatically contributes distance toward their active challenge. Completing a route awards an exclusive challenge badge and unlocks the next tier.

## Why
- **Gamification Mechanics**: Applies goal-setting theory and progress-bar psychology to multi-session distance targets.
- **HCI Principles**: Provides visual feedback on long-term commitment and visualizes real-world progress map milestones.
- **Integration**: Seamlessly hooks into existing run logging and badge award engine without extra user friction.
