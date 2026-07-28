# Rest Day Ticket Optimization Prompt Log

**Date:** 2026-07-28  
**Feature:** Rest Day Ticket Advance Purchase Constraint & Confirmation Modal

## Prompts

### User Prompt
> The logic for purchasing and using rest day tickets needs to be optimized—they must be purchased in advance and cannot be applied retroactively to a rest day that has already passed (when hovering over the option, display a tooltip advising users to purchase tickets ahead of time before taking a rest day). Additionally, during purchase, display a confirmation modal matching the current visual style to remind users of these relevant rules.

### Agent Actions
1. **Backend Logic Enforcement (`StreakService.cs`)**:
   - Updated `RecalculateStreakAsync` in `StreakService.cs`.
   - Before auto-applying a banked freeze to candidate rest day date $D$, verified `earnedCountUpToDate(D) - usedCountUpToDate(D) > 0`.
   - Prevented tickets purchased/earned after date $D$ from retroactively patching date $D$.

2. **Frontend UI Optimization (`DashboardPage.tsx`)**:
   - Added hover tooltip on Rest Day Ticket purchase panel:
     *"Rest day tickets must be purchased in advance before taking a rest day. They cannot be applied retroactively to past missed days."*
   - Added `showPurchaseConfirm` state and visual confirmation modal.
   - Summarized ticket rules, 256 points cost, points balance before & after, and banked ticket count before & after.

3. **Documentation**:
   - Updated `plan.md` progress tracker.
   - Updated ADR `specs/decisions/007-streak-freeze.md`.
   - Created this prompt log.

## Output & Result
- Backend `.NET` builds cleanly (0 errors); all 36 xUnit tests pass.
- Frontend React build succeeds (0 errors); all 18 Vitest tests pass.
