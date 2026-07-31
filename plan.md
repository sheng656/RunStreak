# RunStreak — Project Plan (LIVE)

> **Last updated:** 2026-07-31
> **Current focus:** Phase 16 — Login Modal Collapsed Dropdown & Cold-Start Seeding Prompt (DONE)
> **Overall status:** ✅ Phase 0-8 complete, Phase 10-16 complete


This file is the single source of truth for what's done, what's in progress, and what's next. Agents must read it at the start of every session and update it at the end.

---

## Phase 0 — Project Scaffolding & DevOps Foundation

**Goal:** Get both projects compiling, configured, and ready for feature development.

- [x] Initialize .NET 10 Web API project (`backend/RunStreak.Api/`)
  - Nullable reference types enabled
  - `appsettings.Example.json` with placeholder keys (JWT secret, connection string, CORS origin)
  - `appsettings.Development.json` gitignored
  - Scalar configured for OpenAPI docs (NOT Swagger UI)
  - JWT auth, CORS, rate limiting middleware wired in `Program.cs`
  - All 5 EF Core entities + `AppDbContext` created
- [x] Initialize xUnit test project (`backend/RunStreak.Tests/`) with `WebApplicationFactory` support
- [x] Initialize React + TypeScript project with Vite (`frontend/`)
- [x] Install and configure Tailwind CSS v4 via `@tailwindcss/vite` plugin
- [x] Install core frontend dependencies: `zustand`, `react-router-dom`, `axios`
- [x] Set up frontend folder structure:
  - `src/stores/` — all 4 Zustand stores created (`authStore`, `themeStore`, `runStore`, `gamificationStore`)
  - `src/api/` — typed API client + auth/runs/users/leaderboard/badges modules
  - `src/types/api.ts` — shared TypeScript types mirroring backend DTOs
  - `src/test/setup.ts` — Vitest + jest-dom setup
- [x] Verify both projects build cleanly (0 errors)
- [ ] Initial commit with project skeleton

---

## Phase 1 — Backend: Data Model, Auth & Security

**Goal:** Establish the database schema, implement the full auth flow (split-storage JWT), and wire up security middleware. This is the foundation everything else builds on.

### 1A — Data Model & Database

- [x] Define EF Core entities:
  - `User` (Id, Username, Email, PasswordHash, DisplayName, AvatarUrl, TotalPoints, CurrentStreak, LongestStreak, TotalDistanceKm, TotalRuns, CreatedAt, UpdatedAt)
  - `Run` (Id, UserId, DistanceKm, DurationMinutes, RunDate, Notes, PointsEarned, PaceMinPerKm, CreatedAt, UpdatedAt)
  - `Badge` (Id, Name, Description, IconUrl, Category, CriteriaJson, PointsReward, CreatedAt)
  - `UserBadge` (Id, UserId, BadgeId, UnlockedAt)
  - `RefreshToken` (Id, UserId, TokenHash, ExpiresAt, CreatedAt, RevokedAt, ReplacedByTokenHash)
- [x] Create `AppDbContext` with relationships and constraints
- [x] Generate initial EF Core migration
- [x] Provision Azure SQL Database (Free offer tier — 100k vCore-seconds/month, 32GB)
- [x] Apply migration to Azure SQL, verify cold-start tolerance
- [x] Create and commit `specs/01-data-model.md`

### 1B — Authentication (Split-Storage JWT)

- [x] Implement `AuthService`:
  - User registration (validate input → hash password → create user → issue tokens)
  - User login (validate credentials → issue tokens)
  - Token refresh (validate refresh cookie → rotate → issue new pair)
  - Logout (revoke refresh token)
- [x] Password hashing via `PasswordHasher<User>` (PBKDF2, ASP.NET Core Identity)
- [x] Access token: short-lived (15 min), signed with key from config, includes `sub`, `iss`, `aud`, `exp`
- [x] Refresh token: rotate-on-use, stored hashed (SHA-256) in `RefreshTokens` table
  - Set as `HttpOnly`, `Secure`, `SameSite=Strict` cookie, `Path=/api/auth/refresh`
- [x] Double-submit CSRF token: ~~removed~~ — superseded by ADR 006 (2026-07-01). Simplified to bearer-only auth; refresh token now in localStorage (body-based), no cookies.
- [x] CORS: explicit allow-list (Vercel origin only), no wildcard. `AllowCredentials()` removed (no cookies needed)
- [x] JWT validation middleware: validate `iss`, `aud`, `exp` on every protected request
- [x] Create ADR: `specs/decisions/001-split-storage-jwt.md`

### 1C — Rate Limiting & Data Validation

- [x] ASP.NET Core rate-limiting middleware:
  - `/api/auth/login` — fixed window, e.g. 5 attempts / 15 min per IP
  - `/api/runs` (POST) — sliding window, e.g. 10 submissions / hour per user (configured; to be applied in Phase 2)
- [x] Data validation via Data Annotations on all DTOs:
  - Reject negative distances, durations
  - Reject future run dates
  - Enforce max string lengths, required fields
  - Reject oversized payloads
- [x] Create ADR: `specs/decisions/002-rate-limiting-strategy.md`

---

## Phase 2 — Backend: CRUD & Gamification Engine

**Goal:** Implement the core domain logic — run management, points, streaks, badges, and leaderboard.

### 2A — Run Management (CRUD)

- [x] `RunsController` / service layer:
  - `POST /api/runs` — log a run (auto-calculates points, updates user stats)
  - `GET /api/runs` — list user's runs (paginated, sortable)
  - `GET /api/runs/{id}` — get a single run
  - `PUT /api/runs/{id}` — update a run (recalculate points)
  - `DELETE /api/runs/{id}` — delete a run (recalculate points, check badge revocation)
- [x] DTOs for all run operations (never expose EF entities)

### 2B — Gamification Rule Engine

- [x] `PointsService`:
  - Base points per run (e.g. 10 pts)
  - Distance bonus (e.g. 5 pts per km)
  - Streak multiplier (e.g. 1.5× if streak ≥ 7 days)
  - Configurable rules, not hardcoded magic numbers
- [x] `StreakService`:
  - Calculate current streak (consecutive days with a logged run)
  - Calculate longest streak
  - Detect streak break (reset current streak)
  - Update user's `CurrentStreak` and `LongestStreak` on each run CRUD op
- [x] `BadgeService`:
  - Check badge unlock conditions after each run (first run, 7-day streak, 50km total, etc.)
  - Seed initial badge definitions (migration or startup seeder)
  - Return newly unlocked badges in run-logging response
- [x] `LeaderboardService`:
  - `GET /api/leaderboard` — top users by points (paginated)
  - `GET /api/leaderboard?type=streaks` — top users by current streak
  - Include rank, display name, avatar, points, streak

### 2C — User Profile & Stats

- [x] `UsersController`:
  - `GET /api/users/me` — current user profile + stats
  - `PUT /api/users/me` — update display name, avatar
  - `GET /api/users/{id}/badges` — user's unlocked badges
  - `GET /api/users/{id}/stats` — aggregated run stats (total distance, avg pace, runs per week)

---

## Phase 3 — Backend Testing

**Goal:** Achieve meaningful test coverage on the highest-value, most bug-prone logic.

- [x] Gamification rule engine tests (highest priority):
  - Points calculation (base, distance bonus, streak multiplier)
  - Streak calculation (consecutive days, reset on gap, longest streak tracking)
  - Badge unlocking (condition evaluation, no duplicate unlock)
- [x] Auth service tests:
  - Registration (happy path, duplicate email, weak password)
  - Login (valid, invalid credentials)
  - Token refresh (valid, expired, revoked, reuse detection)
- [x] Controller/integration tests with `WebApplicationFactory`:
  - Runs CRUD (auth required, validation, pagination)
  - Leaderboard (correct ordering, pagination)
- [x] Data validation tests (reject invalid inputs at DTO level)

---

## Phase 4 — Frontend: Core Infrastructure

**Goal:** Set up the foundational frontend architecture — stores, API client, auth flow, theme, routing, and layout.

### 4A — Zustand Stores & API Client

- [x] `src/stores/authStore.ts` — access token (in memory), user profile, login/logout/refresh actions
- [x] `src/stores/themeStore.ts` — light/dark mode, persisted to localStorage
- [x] `src/stores/runStore.ts` — runs list, pagination, CRUD actions
- [x] `src/stores/gamificationStore.ts` — points, streak, badges, leaderboard
- [x] `src/api/client.ts` — Axios/fetch wrapper:
  - Auto-attach `Authorization: Bearer` header from authStore
  - Auto-refresh on 401 (call refresh endpoint, retry original request)
  - Read `csrf_token` cookie and send as `X-CSRF-Token` header on refresh calls
  - `withCredentials: true` for cookie-based refresh endpoint

### 4B — Theme Switching (Scored Advanced Requirement)

- [x] Implement dark/light mode toggle
- [x] Persist preference to localStorage via themeStore
- [x] Apply theme via Tailwind `dark:` variant (class strategy)
- [x] Respect system preference on first visit (`prefers-color-scheme`)
- [x] Smooth transition between themes

### 4C — Auth Pages & Flow

- [x] Login page
- [x] Registration page
- [x] Protected route wrapper (redirect to login if no token)
- [x] Silent refresh on app mount (attempt refresh, restore session)
- [x] Logout (clear in-memory token, call backend logout endpoint)

### 4D — Layout & Routing

- [x] React Router setup with routes:
  - `/` — landing / dashboard (protected)
  - `/login`, `/register` — auth pages
  - `/runs` — run history
  - `/runs/new` — log a run
  - `/badges` — achievements gallery
  - `/leaderboard` — leaderboard
  - `/profile` — user settings
- [x] App shell: responsive navbar, sidebar (desktop), bottom nav (mobile), footer
- [x] 404 page

---

## Phase 5 — Frontend: Feature Pages & UI

**Goal:** Build out all user-facing pages with polished, responsive UI.

### 5A — Dashboard

- [x] Current streak display (with streak-fire animation / visual urgency)
- [x] Points total & recent points earned
- [x] Quick "Log a Run" CTA
- [x] Recent runs summary (last 5)
- [x] Recently unlocked badges
- [x] Weekly distance stats & progress visualization

### 5B — Run Logging & History

- [x] Run logging form (distance, duration, date, notes)
  - Client-side validation matching backend rules
  - Success feedback with points earned + any badges unlocked
  - [x] 5-level Rate of Perceived Exertion (RPE) difficulty selector
  - [x] AI-powered screenshot OCR run import (multimodal Gemini 3.1 Flash Lite)
  - [x] Pace preview and display formatted as standard runner-friendly M:SS/km notation
- [x] Run history list (paginated, sortable by date/distance/duration)
  - [x] Uses formatted pace notation
- [x] Individual run list deletion with confirmation

### 5C — Badges & Achievements

- [x] Badge gallery grid (all badges, category and rarity filters)
- [x] Unlocked badge rendering and details with game rarity tier styling
- [x] "New badge unlocked!" feedback in run submission response
- [x] Progress bars for locked badges showing user's distance/count/streak toward next unlock
- [x] Dedicated full-screen celebration page with canvas-confetti bursts and rarity-colored glowing animations

### 5D — Leaderboard

- [x] Leaderboard table/list (rank, avatar, name, points, streak)
- [x] Toggle between points and streak rankings
- [x] Highlight current user's position

### 5E — Profile & Settings

- [x] User stats overview (total runs, total distance, avg pace, join date)
- [x] Edit display name, avatar
- [x] Theme toggle (also accessible from navbar)

---

## Phase 6 — Frontend Testing

**Goal:** Cover key components and Zustand store logic with Vitest + React Testing Library.

- [x] Zustand store tests:
  - authStore (login, logout, token management)
  - themeStore (toggle, persistence, system preference)
- [x] Component tests:
  - StatCard (rendering, dynamic styles)
  - Theme toggle (mode switching, cycle logic)

---

## Phase 7 — Visual Polish & Responsive Design

**Goal:** Ensure the app looks polished, professional, and works well on both desktop and mobile. The assessment rubric explicitly scores visual appeal.

- [x] Design system: consistent colour palette, typography (Google Font), spacing
- [x] Responsive layout pass: test on 320px, 768px, 1024px, 1440px breakpoints
- [x] Animations & micro-interactions:
  - Streak fire animation
  - Glow and scale effects on interactive components
  - Points increment indicator
  - Smooth page transitions
- [x] Loading states and spinners
- [x] Error states with clear messaging
- [x] Empty states with helpful CTAs ("No runs yet — log your first!")
- [x] Favicon and app metadata (title, meta description)

---

## Phase 8 — Deployment

**Goal:** Get the app live on Vercel (frontend) and Azure (backend).

- [x] Backend deployment to Azure App Service (F1 Free or B1 Basic):
  - [x] Configure connection string via Azure App Service Configuration (not in code)
  - [x] Configure JWT signing key via App Service Configuration
  - [x] Configure CORS allowed origin (`https://runstreak.sheng.nz`, `http://localhost:5173`)
  - [x] Verify Scalar API docs accessible at `/scalar/v1`
- [x] Frontend deployment to Vercel (Hobby tier):
  - [x] Set backend API URL as environment variable
  - [x] Verify build succeeds on Vercel
  - [x] Custom domain: `https://runstreak.sheng.nz`
  - [x] Test full auth flow against Azure backend
- [x] Smoke test on production:
  - [x] Register → login → log run → check points/streak → view leaderboard → logout
  - [x] Verify refresh token flow works cross-origin
  - [x] Verify CSRF token flow works
- [x] Update README with live deployment URLs

---

## Phase 9 — Stretch Goals (time permitting)

> **Reminder:** Only 3 advanced features are scored. These are extras for portfolio depth. Do NOT claim them in the README's scored checklist unless swapping one of the 3 above.

### 9A — WebSockets (real-time leaderboard)

- [ ] SignalR hub for leaderboard updates (check Azure free tier: SignalR Service free tier = 20 concurrent connections, 20k messages/day — sufficient for demo)
- [ ] Frontend: live-updating leaderboard when another user submits a run
- [ ] Auth: attach in-memory access token during SignalR handshake

### 9B — Performance Tests, Logging & Metrics

- [ ] Backend: structured logging with Serilog
- [ ] Application Insights (free tier: 5GB/month ingest, or use the new free basic tier)
- [ ] Simple load test with `dotnet-httprepl` or k6
- [ ] Frontend: performance monitoring (web vitals)

### 9C — Multiplayer Functionality

- [ ] Group challenges: create a challenge, invite users, track collective distance
- [ ] Challenge leaderboard within a group
- [ ] This is the lowest priority stretch goal

---

## Phase 11 — Solo Runner Self-Motivation UX

**Goal:** Make RunStreak compelling for solo users with no competitors on the leaderboard.
See ADR: `specs/decisions/011-solo-motivation-ux.md`.

### 11A — Backend (minimal additions)

- [x] Add `WeeklyGoalKm` (decimal, default 20.0) to `User.cs`
- [x] Extend `UserStatsDto` with weekly stats: `WeeklyDistanceKm`, `WeeklyRunCount`, `WeeklyGoalKm`, `WeeklyPoints`, `LastWeekDistanceKm`, `LastWeekRunCount`, `LastWeekPoints`, `BestWeekDistanceKm`
- [x] Extend `UserProfileDto` with `WeeklyGoalKm`
- [x] Implement `GetUserStatsAsync` — ISO-week grouping + best-week-ever calculation
- [x] Add `UpdateWeeklyGoalAsync` to `IUserService` + `UserService`
- [x] Add `PUT /api/users/me/weekly-goal` to `UsersController`
- [x] Create `UpdateWeeklyGoalRequest` DTO (validation: 1–500 km)
- [x] EF migration: `AddWeeklyGoalKm`
- [x] Apply migration to Azure SQL

### 11B — Frontend Types & API

- [x] Update `api.ts` — `UserStats` and `UserProfile` types extended
- [x] Update `users.ts` — add `updateWeeklyGoal(goalKm)` API call

### 11C — New UI Components

- [x] `WeeklyCalendar.tsx` — Mon–Sun activity strip; filled circles for run days, freeze-shield icon for freeze days, ring for today
- [x] `MotivationalInsight.tsx` — priority-ordered rule engine; 6 contextual message types
- [x] `PersonalRecords.tsx` — Longest Run / Best Pace / Best Week card with trophy icons and glow effects
- [x] `WeeklyProgress.tsx` — animated gradient progress bar; celebration state on goal achieved; inline goal editor

### 11D — Page Modifications

- [x] `DashboardPage.tsx` — integrated all 4 new components above the stats grid
- [x] `LeaderboardPage.tsx` — added "You vs Your Past Self" section (always visible, not just solo)
- [x] `LogRunPage.tsx` — added pre-run stats snapshot; rich multi-line post-run toast (points + streak + PB flags + badge proximity)

---

## Phase 10 — Submission Preparation

**Goal:** Ensure all submission requirements are met. Nothing should be TODO.

- [x] README final pass:
  - [x] Live deployment URLs filled in
  - [x] "What makes this project stand out" section filled in (AI OCR, 48-badge engine, Route Challenges, Solo habit UX)
  - [x] Tech stack section accurate & structured (backend/frontend separation)
  - [x] Advanced requirements checklist — exactly 3, all justified
  - [x] Security measures section — detailed write-up per measure
  - [x] Self-reflection section filled in
  - [x] Getting started / environment setup instructions complete
- [x] `/specs` completeness check:
  - [x] `specs/00-architecture.md` exists and is up to date
  - [x] `specs/01-data-model.md` exists and is up to date
  - [x] All ADRs in `specs/decisions/` for non-trivial choices (001–012)
  - [x] All prompt logs in `specs/prompts/` for every agent session
- [x] Commit history review: regular, meaningful commits
- [x] Submission video script drafted (`video_script.md` artifact ready)
- [x] Pre-submission polish items:
  - [x] Avatar category picker responsive layout & scrollbar fix
  - [x] Dashboard weekly goal custom numeric input box
  - [x] Rest day ticket balance auto-recalculation fix on dashboard load
  - [x] Route Challenge Mode (`Challenge`, `UserChallenge`, `/challenges` page, active widget)
  - [x] Classic New Zealand & Auckland Hiking Trails expansion (16 total challenges, including Rangitoto Summit, Auckland Coast to Coast, Waitākere Ranges, Milford Track, Routeburn, Abel Tasman, Kepler Track, and Te Araroa Trail) with themed Noto SVG icon rendering on cards and widgets
  - [x] Mock data seeding & rolling-window auto-refresh (20 users, 2-43km range, clear old test user, enriched `testuser` account, auto-refreshed relative to `DateTime.UtcNow.Date` on cold start via EF Core `ExecuteDeleteAsync` + `SemaphoreSlim` lock)
  - [x] Rest day ticket advance purchase constraint & confirmation modal (`StreakService.cs` advance purchase check, hover tooltips, and `DashboardPage.tsx` confirmation modal)
  - [x] Scalar API documentation content & route completeness audit
- [x] Final deployment verification & tests (36/36 backend tests pass, 18/18 frontend tests pass)


---

## Dependency Graph (build order)

```
Phase 0 (scaffold)
  └──▶ Phase 1 (backend auth + DB)
         ├──▶ Phase 2 (backend CRUD + gamification)
         │      └──▶ Phase 3 (backend tests)
         └──▶ Phase 4 (frontend core)
                └──▶ Phase 5 (frontend pages)
                       └──▶ Phase 6 (frontend tests)
                              └──▶ Phase 7 (polish)
                                     └──▶ Phase 8 (deploy)
                                            ├──▶ Phase 9 (stretch, if time)
                                            └──▶ Phase 10 (submission)
```

> **Note:** Phases 2 and 4 can be partially parallelised — frontend auth pages (4C) only need the auth endpoints from 1B, not all of Phase 2. Similarly, frontend feature pages (5A–5E) can begin with mock data while backend endpoints are being built.

---

## Key Decisions Log

| # | Decision | Status | ADR |
|---|----------|--------|-----|
| 1 | Split-storage JWT (access in memory, refresh in HttpOnly cookie) | Superseded | `specs/decisions/001-split-storage-jwt.md` |
| 2 | Rate limiting strategy (fixed window for login, sliding for submissions) | Decided | `specs/decisions/002-rate-limiting-strategy.md` |
| 3 | Perceived effort rating (RPE) 1-5 scale on Runs | Decided | `specs/decisions/003-perceived-effort-rating.md` |
| 4 | Badge rarity and cumulative progression system (48 badges) | Decided | `specs/decisions/004-badge-rarity-system.md` |
| 5 | AI-powered screenshot OCR import via Gemini | Decided | `specs/decisions/005-ai-screenshot-import.md` |
| 6 | Password hashing: ASP.NET Core Identity `PasswordHasher<T>` (PBKDF2) | Decided | Documented in AGENTS.md §5.2 |
| 7 | Frontend visual identity / design system | Decided | Tailwind CSS v4.3 + modern glassmorphism |
| 8 | Simplified bearer-only auth (access in memory, refresh in localStorage) | Decided | `specs/decisions/006-simplified-bearer-auth.md` |
| 9 | Streak Freeze Rest Day Ticket implementation | Decided | `specs/decisions/007-streak-freeze.md` |
| 10 | Rolling 7-day leaderboard tab | Decided | `specs/decisions/008-rolling-7day-leaderboard.md` |
| 11 | Timezone-agnostic RunDate and UTC+14 tolerance | Decided | `specs/decisions/009-rundate-timezone-fix.md` |
| 12 | Visual Avatar Picker using 14 styles, 300+ seeds and DiceBear HTTP API | Decided | `specs/decisions/010-avatar-picker-dicebear.md` |
| 13 | Shareable Brag Cards (Canvas API, OpenGraph 1200x630, QR Code) | Decided | `specs/decisions/013-shareable-brag-cards.md` |
| 14 | Password Reset Flow & Resend REST Email Integration | Decided | `specs/decisions/014-password-reset-resend.md` |
| 15 | Landing Page UI/UX Overhaul (glassmorphism, animated orbs, floating phone, mobile stacking) | Decided | See prompt log `2026-07-29-landing-page-uiux-overhaul.md` |
| 16 | 2-Step Registration with 6-Digit Email Verification Code & Test User Rename | Decided | `specs/decisions/015-email-verification-registration.md` |

---

## Phase 13 — Landing Page UI/UX Overhaul

**Goal:** Elevate the aesthetic appeal of the unauthenticated landing page.

- [x] Animated gradient orb background (`orbDrift` / `orbDriftSlow` — 18 s / 24 s ease-in-out, no stutter)
- [x] Glassmorphic login form card (`backdrop-blur(12px)`, `bg-surface/85` token)
- [x] `AppShowcase.tsx` full rewrite:
  - Per-slide accent colour applied to pill tag, dot nav, and glow behind phone frame
  - Smooth crossfade + translateY transition (300 ms) between slides
  - `animate-phone-float` (4 s, gentle 10 px vertical oscillation) on desktop
  - `compact` prop for mobile use (no float / no glow, tighter layout)
- [x] Responsive mobile layout: `AppShowcase compact` stacked above the form on `< md`
- [x] Desktop left column: hero tagline + full `AppShowcase`
- [x] MSA Demo Card redesigned:
  - Separate username + password rows with copy-to-clipboard buttons
  - ⚡ Auto-fill button + 🔄 Reset button with glassmorphic styling
  - Animated chevron rotation on collapse/expand
- [x] CSS additions: `phoneFloat`, `orbDrift`, `orbDriftSlow` keyframes + utility classes
- [x] Theme support verified: all surfaces use `hsl(var(--color-*))` tokens; adapts to both light and dark
- [x] Build verified: `npm run build` — 0 errors, 0 warnings
- [x] Prompt log written: `specs/prompts/2026-07-29-landing-page-uiux-overhaul.md`

---

## Phase 14 — Email Verification Code Confirmation & Test User Rename

**Goal:** Require 6-digit email verification code confirmation on registration and rename all test user references from "Sheng" to "Test Runner".

- [x] Renamed test user references from "Sheng (Test Runner)" / "Sheng" to "Test Runner" in `DbSeeder.cs`, `AppShowcase.tsx`, and `README.md` (author credit unchanged)
- [x] Created `EmailVerificationCode` EF Core model and migration `AddEmailVerificationCodes`
- [x] Extended `IEmailService` and `ResendEmailService` with `SendVerificationCodeEmailAsync` (includes dev/testing console fallback logging)
- [x] Added `VerifyRegistrationRequest` DTO and updated `IAuthService` / `AuthService` with `InitiateRegistrationAsync` and `VerifyRegistrationAsync`
- [x] Updated `AuthController` with `POST /api/auth/register` (initiates verification) and `POST /api/auth/verify-registration` (verifies & issues tokens)
- [x] Refactored `RegisterPage.tsx` into a 2-step flow with 6-digit code verification and a 60-second cooldown timer on the "Resend Code" button
- [x] Updated `AuthServiceTests.cs` and `ControllerTests.cs` (40/40 tests passing)
- [x] Created ADR `specs/decisions/015-email-verification-registration.md` and prompt log `specs/prompts/2026-07-29-email-verification-registration.md`

---

## Phase 15 — User Manual Creation & Live Screenshot Showcase

**Goal:** Create a comprehensive user manual in Markdown format featuring live app screenshots captured autonomously via browser subagent.

- [x] Autonomous browser subagent navigation to live site (`https://runstreak.sheng.nz/`)
- [x] Auto-filled demo account sign-in (`testuser` / `Test1234!`)
- [x] Captured 8 full-page screenshots for all major features: Landing, Dashboard, Log Run, Runs History, Badges, Route Challenges, Leaderboard, and Profile
- [x] Copied and formatted screenshots into `docs/assets/`
- [x] Created `USER_MANUAL.md` at repository root with detailed feature documentation, gamification mechanics walkthroughs, and inline image links
- [x] Prompt log written: `specs/prompts/2026-07-30-user-manual-creation.md`

---

## Phase 16 — Login Modal Collapsed Dropdown & Cold-Start Seeding Prompt

**Goal:** Ensure the MSA Marker Demo dropdown is collapsed by default and display warm, friendly cold-start & showcase seeding prompts during login.

- [x] Updated `LoginPage.tsx` so `showDemoDropdown` initializes to `false` by default
- [x] Added warm, friendly cold-start loading status card to `LoginPage.tsx` when `submitting` is active
- [x] Added dedicated demo showcase seeding prompt when authenticating with `testuser` / `test@runstreak.app`
- [x] Verified frontend TypeScript compilation (`npx tsc --noEmit` passed cleanly)
- [x] Prompt log written: `specs/prompts/2026-07-31-login-modal-seeding-prompt.md`

