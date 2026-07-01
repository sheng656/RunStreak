# Prompt Log — Simplify Auth: Bearer-Only with localStorage Refresh Token

**Date:** 2026-07-01
**Session context:** Architecture change to auth system, security measures documentation update.

---

## Session kickoff prompt (translated from Chinese/English mixed input)

> Before doing anything else, open and read AGENTS.md and plan.md at the repo root, both in full. Then, before writing or editing any code, reply with a short confirmation covering these points so I can verify you actually read them and didn't skim:
>
> 1. Tech stack: state management lib, styling lib, auth approach (in one sentence — be specific about where the access token lives vs where the refresh token lives, not just "JWT").
> 2. The exact CSRF mitigation strategy for the refresh endpoint (name both mechanisms, not just one).
> 3. Which 3 advanced requirements are the ones being scored, per the README checklist.
> 4. What you need to create/update in /specs before you consider this session's work "done."
> 5. The Azure tier constraints you must not exceed.
> 6. From plan.md: what's currently marked in-progress or next-up, and anything marked done that you should NOT redo or re-architect without asking first.
> 7. Confirm: when you log this session's prompts to /specs/prompts/ per AGENTS.md, any prompt I give you in Chinese (or mixed Chinese/English) gets translated to English in the saved file — the log itself must be English-only, per AGENTS.md's language rule. Translate faithfully: preserve the technical meaning and intent exactly, don't paraphrase loosely or drop specifics. If a translation is ambiguous, keep the original Chinese term in parentheses next to your translation rather than guessing.
>
> Our application uses the following design:
>
> Pure in-memory storage: your Access Token is stored only in memory (Zustand Store).
>
> This application does not need to greatly sacrifice user experience in order to achieve the extremely high XSS resistance that motivated this security upgrade [referring to the split-storage JWT/CSRF approach]. Please change this security measure (which was implemented to meet MSA project requirements) to something else, and update AGENTS.md and other documents that need to be modified:
>
> Security measures
> Implemented the following security measures, focusing on protecting user data and maintaining the integrity of the gamification system:
>
> 1. Data validation and sanitisation (Game Integrity Protection)
>    - Justification: In a gamified system with public leaderboards and streaks, ensuring data integrity is critical. Without strict validation, malicious users could submit negative distances, unrealistic paces, or future dates via raw API requests to artificially inflate their score and ruin the experience for legitimate users.
>    - Implementation: All incoming requests are strictly validated using ASP.NET Core Data Annotations on DTOs before touching the database. This acts as a robust first line of defence, rejecting malformed input (e.g., `DistanceKm < 0.1` or `RunDate > DateTime.UtcNow`) and mitigating injection-style attacks.
>
> 2. Rate limiting (Anti-Spam & Anti-Brute Force)
>    - Justification: A public leaderboard incentivises automated abuse (e.g., writing a script to submit hundreds of fake runs). Additionally, public-facing authentication endpoints are prime targets for credential stuffing.
>    - Implementation: Applied ASP.NET Core's built-in rate-limiting middleware at the endpoint level. The `/api/runs` POST route uses a sliding window (e.g., max 10 submissions per user per hour) to prevent leaderboard-inflation spam without affecting real runners. The `/api/auth/login` endpoint uses a fixed window policy to mitigate brute-force credential attacks.
>
> 3. Password hashing
>    - Justification: Protecting user credentials in the event of a database breach is a fundamental security requirement for any modern web application.
>    - Implementation: User passwords are mathematically hashed and salted using ASP.NET Core Identity's built-in `PasswordHasher<User>` (PBKDF2-based) before persistence. Raw passwords are never stored in the database or logged in the system.
>
> give me the plan first

**Agent produced:** A confirmation summary of AGENTS.md + plan.md contents, flagged the AGENTS.md conflict (split-storage JWT is marked mandatory), then asked a clarifying question about what to do with the refresh token.

---

## Clarification question (agent → user)

Agent asked: "You want to remove the split-storage JWT (HttpOnly refresh cookie + double-submit CSRF) flow entirely. This means the refresh token would also need to go somewhere else (or be dropped). Which approach do you want?"

**User selected:** Store Access Token in memory (Zustand), and store Refresh Token in `localStorage`. When the app initializes, read the Refresh Token from `localStorage` to fetch a new Access Token.

**Agent produced:** Implementation plan for bearer-only auth with localStorage refresh token.

---

## Plan approval

User approved the implementation plan without modifications.

---

## Implementation summary

Agent executed the following changes after plan approval:

**Backend:**
- `AuthResponse.cs` — added `RefreshToken` property (returned in JSON body, not cookie).
- `RefreshRequest.cs` — new DTO to accept refresh token from request body.
- `AuthController.cs` — completely rewritten: removed all cookie/CSRF logic (`SetRefreshTokenCookie`, `SetCsrfTokenCookie`, `ClearCookies`); both tokens now returned in JSON body; `Refresh` and `Logout` endpoints accept token from request body.
- `Program.cs` — removed `AllowCredentials()` from CORS (no cookies), updated comments.

**Frontend:**
- `types/api.ts` — added `refreshToken` to `AuthResponse` interface.
- `api/client.ts` — rewrote: removed `withCredentials`, removed CSRF cookie logic; added `localStorage` helpers (`getStoredRefreshToken`, `setStoredRefreshToken`, `clearStoredRefreshToken`); `refreshAccessToken()` reads/writes localStorage.
- `api/auth.ts` — updated: `logout` and `refresh` now accept refresh token as parameter (body-based).
- `stores/authStore.ts` — `clearAuth()` now also clears localStorage refresh token; updated comments.
- `App.tsx` — silent refresh on mount reads from localStorage first; skips network call if no token present; saves rotated token back.
- `pages/LoginPage.tsx` — saves `refreshToken` to localStorage after successful login.
- `pages/RegisterPage.tsx` — saves `refreshToken` to localStorage after successful registration.
- `components/layout/Navbar.tsx` — logout handler reads refresh token from localStorage before calling API.

**Documentation:**
- `AGENTS.md` — §5 rewritten: removed split-storage JWT/CSRF section, promoted data validation/rate limiting to primary scored measures, updated §10.
- `README.md` — security measures section rewritten with 3 new scored measures plus access-token-in-memory note.
- `specs/decisions/001-split-storage-jwt.md` — marked superseded.
- `specs/decisions/006-simplified-bearer-auth.md` — new ADR explaining the decision.
- `plan.md` — updated key decisions log (entry 8 added, entry 1 superseded), Phase 1B updated.

**Verification:** Backend build ✅ 0 warnings/errors. Backend tests ✅ 30/30. TypeScript check ✅ 0 errors. Frontend Vitest ✅ 17/17.
