# 003 — Rate of Perceived Exertion (RPE) Integration

**Status:** decided
**Date:** 2026-06-30

## Context
Running metrics are heavily dependent on how the runner feels, not just distance and time. To help users track training intensity, we need a simple metric for training difficulty.

## Decision
Implement a 5-level Rate of Perceived Exertion (RPE) scale (1: Very Easy, 2: Easy, 3: Moderate, 4: Hard, 5: Very Hard) as a nullable integer on the `Run` model.

## Why
- **Simplicity**: A 5-point scale is more intuitive for casual runners than the traditional 10-point Borg CR10 scale.
- **Nullable**: Existing runs do not have this data; making it optional ensures compatibility and zero friction for users who prefer not to use it.
- **Visual Feedback**: The frontend maps each of the 5 levels to distinct colors and emojis for enhanced UX.
