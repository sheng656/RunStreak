# RunStreak — Gamified Running Habit Tracker
 
> Microsoft Student Accelerator 2026 — Phase 2, Software Stream
> Theme: **Gamification**
 
## Live deployment
 
| Layer | URL | Status |
|---|---|---|
| Frontend | `TODO: Vercel URL` | 🚧 |
| Backend API | `TODO: Azure App Service URL` | 🚧 |
| API docs (Scalar) | `TODO: <backend-url>/scalar/v1` | 🚧 |
 
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
- TODO: styling library (e.g. Tailwind CSS / MUI / custom)
- Vitest / React Testing Library (unit testing)
- Hosted on Vercel
## Basic requirements checklist
 
**Backend**
- [ ] Built with C# / .NET 10+
- [ ] Entity Framework Core for data access
- [ ] SQL database (Azure SQL Database) for persistence
- [ ] Full CRUD operations (runs, badges, users)
- [ ] Regular, meaningful commit history
- [ ] Unit tests covering key backend logic
- [ ] Deployed (Azure App Service)
- [ ] Scalar API documentation exposed (instead of Swagger UI)
**Frontend**
- [ ] Built with React + TypeScript
- [ ] Visually appealing, responsive UI (desktop + mobile)
- [ ] Routing via React Router
- [ ] Regular, meaningful commit history
- [ ] Unit tests covering key components
- [ ] Deployed (Vercel)
## Advanced requirements
 
> Only the top 3 listed below will be marked, per the assessment brief.
 
1. **State management library — Zustand**
   Used to manage auth state, run/activity data, gamification state (points, badges, streaks), and theme preference across the app without prop-drilling.
2. **Theme switching — light / dark mode**
   Full light/dark theme support across all pages and components, persisted across sessions.
3. **Security measures**
   Implementing the following, with justification:
   - **Password hashing** — user passwords are never stored or transmitted in plaintext; hashed using `TODO: BCrypt / ASP.NET Core Identity PasswordHasher` before persistence. This protects user credentials in the event of a database breach.
   - **Data validation / sanitisation** — all incoming requests are validated (model validation / FluentValidation) before touching the database, preventing malformed or malicious input (e.g. negative distances, oversized payloads) from corrupting gamification logic or enabling injection-style attacks.
   - **Rate limiting** — login and run-submission endpoints are rate-limited using ASP.NET Core's built-in rate limiting middleware, to prevent brute-force login attempts and abuse of the points system (e.g. spamming fake runs to inflate the leaderboard).
   *(TODO: expand this section with implementation specifics once built — middleware used, code snippets/links, and why each measure matters specifically for a gamified app with a public leaderboard.)*
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
 
```bash
# Backend
cd backend
dotnet restore
dotnet ef database update
dotnet run
 
# Frontend
cd frontend
npm install
npm run dev
```
 
TODO: environment variables / connection string setup instructions once finalised.
 
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
