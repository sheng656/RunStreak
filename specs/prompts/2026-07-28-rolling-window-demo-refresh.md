# Rolling-Window Demo Data Refresh

**Date:** 2026-07-28

## Prompts

### Initial Request
> Is there a way to automatically seed mock data and dynamically update these users' running logs daily, making it easier for the marker to review the project? plan first

### Follow-up Response / Approval
> The user approved the implementation plan incorporating anti-race condition concurrency locking (`SemaphoreSlim`), bulk deletion (`ExecuteDeleteAsync`), dynamic testuser streak anchored to today, real `BadgeService` evaluation, and README marker note.

## Agent Summary

1. Added `DemoUsernames` hash set to `DbSeeder.cs` identifying the 20 pre-configured demo users (`sarah_j`, `mike_c`, ... `testuser`).
2. Implemented rolling-window freshness check: if the newest run among demo users is older than yesterday, `ExecuteDeleteAsync()` bulk-deletes all demo users (cascading dependent records) and regenerates demo activity relative to `DateTime.UtcNow.Date`.
3. Dynamically anchored `testuser`'s 14-day streak to end on **today** so the test account always shows live daily streaks and recent half-marathon history regardless of when the app is evaluated.
4. Integrated real `BadgeService.CheckAndAwardBadgesAsync` calls for demo users to guarantee 100% data consistency between unlocked badges and points formulas.
5. Added `SemaphoreSlim seedLock` to `Program.cs` to prevent race conditions during concurrent cold-start initialisations.
6. Updated `README.md` to note the rolling-window auto-refresh for markers.
7. Verified all 36 backend tests and 18 frontend tests pass with 0 build errors.
