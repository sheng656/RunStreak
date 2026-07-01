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
