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
 
## What makes this project stand out
 
- TODO: fill in once built — e.g. "real-time leaderboard updates via WebSockets", "custom badge rule engine that's easy to extend", "ink-wash / custom visual identity", etc.
- TODO
- TODO
## Tech stack
 
**Backend**
- C# / .NET 10
- Entity Framework Core
- Azure SQL Database
- Scalar (OpenAPI documentation UI)
- xUnit (unit testing)
- Hosted on Azure App Service
**Frontend**
- React + TypeScript
- Zustand (state management)
- React Router
- Tailwind CSS (utility-first styling)
- Vitest / React Testing Library (unit testing)
- Hosted on Vercel
## Basic requirements checklist
 
**Backend**
- [x] Built with C# / .NET 10+
- [x] Entity Framework Core for data access
- [x] SQL database (Azure SQL Database) for persistence
- [x] Full CRUD operations (runs, badges, users)
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
   Implementing the following, with justification:
   - **Split-storage JWT with anti-CSRF** — Access tokens are short-lived (15 min) and kept in memory only (Zustand store, never `localStorage`); refresh tokens are stored in `HttpOnly`, `Secure`, `SameSite=Strict` cookies scoped to `/api/auth/refresh`. CSRF is mitigated via both `SameSite=Strict` and a double-submit CSRF token (server sets a non-HttpOnly `csrf_token` cookie; frontend echoes it as `X-CSRF-Token` header on refresh calls; server validates the match). Refresh tokens are rotated on each use and stored hashed (SHA-256) server-side, so a database breach does not expose usable tokens.
   - **Password hashing** — user passwords are hashed using ASP.NET Core Identity's `PasswordHasher<User>` (PBKDF2-based) before persistence. Raw passwords are never logged, even in debug builds. This protects user credentials in the event of a database breach.
   - **Data validation / sanitisation** — all incoming requests are validated via Data Annotations on DTOs before touching the database, rejecting negative distances, future run dates, oversized payloads, and malformed input. This prevents corrupted gamification logic (e.g. negative-distance runs inflating streaks) and injection-style attacks.
   - **Rate limiting** — ASP.NET Core's built-in rate-limiting middleware is applied to `/api/auth/login` (fixed window: 5 attempts / 15 min per IP, preventing brute-force credential attacks) and `/api/runs` POST (sliding window: 10 submissions / hour per user, preventing leaderboard-inflation spam — a direct incentive given the public leaderboard).
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
```bash
cd backend/RunStreak.Api
# Copy the example config and fill in your real values
cp appsettings.Example.json appsettings.Development.json
# Edit appsettings.Development.json — set ConnectionStrings:DefaultConnection and Jwt:Key
dotnet restore
dotnet ef database update
dotnet run
```

### Frontend
```bash
cd frontend
npm install
# Create .env.local with:
#   VITE_API_URL=https://localhost:<port>/api
npm run dev
```

> **Note:** `appsettings.Development.json` and `.env.local` are gitignored and must never be committed. See `appsettings.Example.json` for the expected shape.
 
## Testing
 
```bash
# Backend
cd backend
dotnet test
 
# Frontend
cd frontend
npm run test
```
 
## Self-reflection
 
*TODO — fill in at the end of the project: what would you do differently if you started again?*
 
## Author
 
Sheng Chen — [LinkedIn](https://www.linkedin.com/in/sheng-chen-chsh48/) · [Portfolio: [sheng.nz](https://www.sheng.nz/)]
