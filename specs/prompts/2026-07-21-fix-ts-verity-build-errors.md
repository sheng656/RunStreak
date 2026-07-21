# 2026-07-21 — Fix Frontend TypeScript Build Errors

## Session goal

Fix Vercel build failure caused by TypeScript errors (`TS2741`, `TS6133`, `TS2551`, `TS2345`) in `DashboardPage.tsx`, `LogRunPage.tsx`, `LoginPage.tsx`, `RegisterPage.tsx`, and `authStore.ts`.

## Prompt 1 — Build Error Log

> '11:48:31.267 Running build in Washington, D.C., USA (East) – iad1... [Vercel build log]'

**Agent produced:**
- `backend/RunStreak.Api/DTOs/Auth/UserDto.cs`: Added `WeeklyGoalKm` property to align `UserDto` with `UserProfileDto` and `UserProfile`.
- `backend/RunStreak.Api/Services/AuthService.cs`: Added `WeeklyGoalKm = user.WeeklyGoalKm` in `MapToUserDto`.
- `frontend/src/types/api.ts`: Updated `AuthResponse` interface to use `UserProfile` for `user` property.
- `frontend/src/stores/authStore.ts`: Replaced local `UserProfile` definition missing `weeklyGoalKm` with re-export of `UserProfile` from `types/api.ts`.
- `frontend/src/stores/authStore.test.ts`: Added missing `weeklyGoalKm` property to `mockUser`.
- `frontend/src/pages/LogRunPage.tsx`: Removed unused imports (`useRef`, `Flame`, `Trophy`) and updated `res.data` property accesses to match `LogRunResponse` camelCase properties (`newlyUnlockedBadges`, `run`, `pointsEarned`).
- Verified build and tests: `npm run build` and `npx vitest run` succeeded on frontend, `dotnet test` passed on backend.
