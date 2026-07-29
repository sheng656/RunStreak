# RunStreak — Gamified Running Habit Tracker
 
> Microsoft Student Accelerator 2026 — Phase 2, Software Stream
> Theme: **Gamification**
 
## Live deployment
 
| Layer | URL | Status |
|---|---|---|
| Frontend | https://runstreak.sheng.nz | ✅ |
| Backend API | https://runstreak-api-msa.azurewebsites.net | ✅ |
| API docs (Scalar) | https://runstreak-api-msa.azurewebsites.net/scalar/v1 | ✅ |
 
> Deployment will remain live until MSA Phase 2 results are released.
 
## Introduction
 
RunStreak is a full-stack web application that turns the habit of going for a run into a game. Users log their runs, earn points, unlock badges, build up streaks, and compete with other runners on a leaderboard — all built on top of a .NET 10 Web API and a React + TypeScript frontend.
 
The project is built by Sheng Chen, an MIT graduate (University of Auckland) and recreational marathon runner, as an individual submission for MSA 2026 Phase 2.
 
## How this relates to the theme
 
Gamification works by layering game mechanics on top of a non-game task to drive motivation and engagement. RunStreak applies the core HCI gamification elements directly to running:
 
- **Points** — every logged run earns points based on distance and consistency.
- **Badges / achievements** — unlocked automatically when a user hits a milestone (first run, 7-day streak, 100km lifetime distance, etc.).
- **Streaks** — consecutive days/weeks with a logged run are tracked and displayed prominently, with visual pressure to keep the streak alive.
- **Leaderboard** — users can see how their points and streaks compare to other runners.
- **Progress tracking** — distance, pace, and streak history are visualised over time.
The goal is to take an activity people often struggle to stick with (running consistently) and apply proven engagement mechanics to encourage long-term habit formation — exactly the kind of non-game application the brief describes.
 
## Test Account (for markers)

| Field | Value |
|---|---|
| **Email** | `test@runstreak.app` |
| **Password** | `Test1234!` |
| **Profile** | Sheng (Test Runner) |
| **Pre-populated Data** | 42 logged runs (~300 km total), 14-day active streak, 18-day longest streak, active Route Challenge (*Tour de New Zealand*), 3 Rest Day Tickets remaining, multiple unlocked badges across rarity tiers |

> *Note: Demo accounts (including `testuser`) automatically refresh their activity relative to the current date on every cold start, ensuring continuous streak and leaderboard demonstrations. Real user accounts created via registration are never affected.*

## What makes this project stand out

1. **Multimodal AI Screenshot OCR Run Import** — Users can upload a screenshot from Strava, Garmin, Nike Run Club, or Apple Health. The app uses Google Gemini (multimodal vision) to automatically parse run metrics (distance, duration, pace, date, heart rate, elevation, platform) with fallback validation.
2. **Shareable "Brag Card" Component** — Fully client-side Canvas API rendering engine that generates OpenGraph 1200×630px social media images for Profile Stats, Badge Unlocks, and Run Logs. Features customized dark theme styling, logo branding, stats breakdown, and a dynamic QR code pointing to `https://runstreak.sheng.nz`. Offers instant 1-click PNG image downloads and formatted markdown/text clipboard copying across the Dashboard, Badges, and Run History pages.
3. **Transactional Password Reset & Resend Email Integration** — Self-service password recovery for unauthenticated users via Resend REST API (`noreply@runstreak.sheng.nz`). Implements cryptographically secure, 15-minute expiring single-use reset tokens stored as SHA-256 hashes (`PasswordResetTokens` table). Authenticated users can also safely change their password from `ProfilePage.tsx` after validating their current password.
4. **Interactive Demo Account UX & Quick Recovery** — Redesigned login screen with a collapsible demo account panel (`ChevronDown`/`ChevronUp`). Includes an auto-fill button for `testuser` credentials and a "Quick Reset" recovery button (`POST /api/auth/reset-demo`) that restores the marker account password back to `Test1234!` if locked out. *(Note: The demo reset endpoint is strictly scoped to the hardcoded `testuser` account and rate-limited for demo convenience only; it is not available for regular user accounts in production).*
5. **Homepage App Showcase Carousel & Favicon** — An animated mobile phone device frame carousel on the login and register pages showcasing key app screens (Dashboard, AI OCR Import, 48 Badges, NZ Route Challenges, and Leaderboard) with automatic 4.5-second rotation. Enhanced with multi-format SVG favicon branding and browser metadata.
6. **Comprehensive 48-Badge Gamification Engine** — An extensible rule engine with 5 rarity tiers (Common, Rare, Epic, Legendary, Heroic). Features single-run distance, streak milestones, speed pace thresholds, cumulative distance counts (e.g. 5K × 10, 10K × 20), and dedicated celebration views with particle effects.
7. **Route Challenge Mode (Iconic Long-Distance Routes)** — Solves long-term motivation decay by allowing users to pick real-world cumulative routes (from a 5km Park Run to the 300km Tour de New Zealand or 500km Trans-Alpine Expedition). Each run contributes to their active challenge, displayed via a dedicated route dashboard widget.
8. **Solo-Runner Habit UX & Rest Day Ticket System** — Designed for solo runners who may not have active friends on a leaderboard. Includes weekly goal progress tracking with custom numeric goal setting, a 7-day activity calendar ("don't break the chain"), motivational insights engine, personal records tracking, and a 5-ticket "Streak Freeze" protection system so rest days don't unfairly destroy long streaks.

## Tech stack

### Backend
- **Framework:** C# / .NET 10 Web API
- **ORM & Database:** Entity Framework Core with Azure SQL Database
- **API Documentation:** Scalar API Reference 
- **Security:** Bearer-only JWT authentication (access token in memory, refresh token in localStorage with SHA-256 server-side hashing & rotation), ASP.NET Core Identity PBKDF2 password hashing, ASP.NET Core Rate Limiting middleware (login IP & run-submit user policies)
- **Testing:** xUnit unit tests + WebApplicationFactory integration tests
- **Hosting:** Azure App Service (F1/B1 tier, Australia East)

### Frontend
- **Framework & Build:** React + TypeScript (scaffolded via Vite)
- **State Management:** Zustand (scored advanced requirement #1) — separate modular stores for `authStore`, `runStore`, `gamificationStore`, and `themeStore`
- **Routing:** React Router v7
- **Styling:** Tailwind CSS v4 (utility-first with glassmorphism aesthetics, custom CSS design system tokens)
- **Theme Switching:** Dark / Light mode toggle persisted to localStorage (scored advanced requirement #2)
- **Testing:** Vitest + React Testing Library
- **Hosting:** Vercel

## Basic requirements checklist

**Backend**
- [x] Built with C# / .NET 10+
- [x] Entity Framework Core for data access
- [x] SQL database (Azure SQL Database) for persistence
- [x] Full CRUD operations (runs, badges, users, challenges)
- [x] Regular, meaningful commit history
- [x] Unit tests covering key backend logic
- [x] Deployed (Azure App Service)
- [x] Scalar API documentation exposed (instead of Swagger UI)

**Frontend**
- [x] Built with React + TypeScript
- [x] Visually appealing, responsive UI (desktop + mobile)
- [x] Routing via React Router
- [x] Regular, meaningful commit history
- [x] Unit tests covering key components
- [x] Deployed (Vercel)

## Advanced requirements

> Only the top 3 listed below will be marked, per the assessment brief.

1. **State management library — Zustand**
   Used to manage auth state, run/activity data, gamification state (points, badges, streaks), and theme preference across the app without prop-drilling.
2. **Theme switching — light / dark mode**
   Full light/dark theme support across all pages and components, persisted across sessions.
3. **Security measures**
   Implemented the following security measures, focusing on protecting user data and maintaining the integrity of the gamification system:

   - **Data validation and sanitisation (Game Integrity Protection)** — All incoming requests are strictly validated using ASP.NET Core Data Annotations on DTOs before touching the database. Justification: in a gamified system with public leaderboards and streaks, without strict validation malicious users could submit negative distances, unrealistic paces, or future dates via raw API requests to artificially inflate their score and ruin the experience for legitimate users. This acts as a robust first line of defence, rejecting malformed input (e.g. `DistanceKm < 0.1` or `RunDate > DateTime.UtcNow`).

   - **Rate limiting (Anti-Spam & Anti-Brute-Force)** — Applied ASP.NET Core's built-in rate-limiting middleware at the endpoint level. The `/api/runs` POST route uses a sliding window (max 10 submissions per user per hour) to prevent leaderboard-inflation spam without affecting real runners. The `/api/auth/login` endpoint uses a fixed window policy (5 attempts / 15 min per IP) to mitigate brute-force credential attacks. Justification: a public leaderboard is a direct incentive for automated abuse; credential stuffing is a universal risk for any public auth endpoint.

   - **Password hashing** — User passwords are hashed and salted using ASP.NET Core Identity's built-in `PasswordHasher<User>` (PBKDF2-based) before persistence. Raw passwords are never stored in the database or logged anywhere in the system. Justification: protecting user credentials in the event of a database breach is a fundamental security requirement for any modern web application.

   > **Note on access token storage:** the short-lived access token (15 min) is stored in memory only (Zustand store, never `localStorage`/`sessionStorage`), limiting XSS blast radius to one short window. The refresh token is stored in `localStorage` for session persistence across page reloads; it is rotated on every use and stored hashed (SHA-256) server-side, so a database breach does not expose usable tokens.

### Stretch goals (not submitted for marking, time permitting)

These are extra features that may be implemented for portfolio depth, but per the brief only the 3 features above are scored:

- [ ] WebSockets — real-time leaderboard updates
- [ ] Performance tests, system logging and metrics
- [ ] Multiplayer functionality (group challenges)

## Project structure

```
/
├── backend/          # .NET 10 Web API
├── frontend/         # React + TypeScript SPA
├── specs/            # Planning docs, AI prompts, architecture decisions
└── README.md
```

## AI usage

AI tools were used throughout planning, architecture design, and development. A full record of prompts, agent instructions, and design rationale is kept in [`/specs`](./specs), as required by the assessment brief — see that folder for the detailed log rather than a summary here.

## Getting started locally

### Prerequisites
- .NET 10 SDK
- Node.js 18+
- Azure SQL Database (or a local SQL Server instance)

### Backend
```powershell
Set-Location backend/RunStreak.Api
# Copy the example config and fill in your real values
Copy-Item appsettings.Example.json appsettings.Development.json
# Edit appsettings.Development.json — set ConnectionStrings:DefaultConnection and Jwt:Key
dotnet restore
dotnet ef database update
dotnet run
```

### Frontend
```powershell
Set-Location frontend
npm install
# Create .env.local with:
#   VITE_API_URL=https://localhost:<port>/api
npm run dev
```

> **Note:** `appsettings.Development.json` and `.env.local` are gitignored and must never be committed. See `appsettings.Example.json` for the expected shape.

## Testing

```powershell
# Backend
Set-Location backend
dotnet test

# Frontend
Set-Location frontend
npm run test
```

## Self-reflection

Building RunStreak was a rewarding experience that bridged domain knowledge in running and habit formation with modern full-stack web engineering. If I were to start this project over, I would focus on three main areas:

1. **Earlier Integration Testing for Cold Starts**: Azure SQL Free Tier auto-pauses after inactivity. While EF Core retry policies handle cold-start reconnects well, early development assumption of an always-on DB led to small timeout tweaks during Phase 8 deployment. Planning for transient database latency from Day 1 is crucial.
2. **Simplified Security Architecture Earlier**: My initial auth design used a split HttpOnly cookie / CSRF double-submit approach. While robust for standard web apps, managing cross-origin cookies between Vercel and Azure App Service added CORS complexity. Switching to a bearer-only JWT token model (in-memory access token + localStorage rotated refresh token) eliminated CSRF surface while dramatically streamlining client-server communication.
3. **Spec-Driven Prompt Logging as a Core Habit**: Maintaining `/specs` required discipline. Automating prompt logging via agent instruction files early on ensured every architecture decision (ADRs 001–012) had clear technical justification documented alongside code implementations.

## Author

Sheng Chen — [LinkedIn](https://www.linkedin.com/in/sheng-chen-chsh48/) · [Portfolio: sheng.nz](https://www.sheng.nz/)

