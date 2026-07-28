# RunStreak — Architecture Overview

> Last updated: 2026-06-22

## System Architecture

RunStreak is a full-stack web application with a decoupled frontend and backend, deployed to separate hosting platforms.

```
┌──────────────────────┐         HTTPS          ┌─────────────────────────┐
│   React + TS SPA     │ ◄─────────────────────► │  .NET 10 Web API        │
│   (Vercel)           │   Bearer token (header) │  (Azure App Service)    │
│                      │   Refresh token (body)  │                         │
│   Zustand stores     │                         │  Scalar API docs        │
│   Tailwind CSS       │                         │  EF Core                │
│   React Router       │                         │  JWT auth & Security    │
└──────────────────────┘                         └────────┬────────────────┘
                                                          │
                                                          │ EF Core
                                                          ▼
                                                 ┌─────────────────────┐
                                                 │  Azure SQL Database  │
                                                 │  (Free offer tier)   │
                                                 └─────────────────────┘
```

## Frontend Architecture

- **Framework:** React + TypeScript (Vite)
- **State management:** Zustand — separate modular stores:
  - `authStore` — access token (in-memory only), user profile, login/logout/refresh actions
  - `themeStore` — light/dark mode, persisted to localStorage
  - `runStore` — runs list, pagination, CRUD actions
  - `gamificationStore` — points, streak, badges, leaderboard data
- **Styling:** Tailwind CSS (utility-first, `dark:` class strategy for theme switching)
- **Routing:** React Router (v7)
- **API client:** Single typed module (`src/api/client.ts`) — Axios wrapper with:
  - Auto-attach `Authorization: Bearer` header
  - Auto-refresh on 401 response using rotated refresh token from localStorage
- **Testing:** Vitest + React Testing Library

## Backend Architecture

- **Framework:** C# / .NET 10 Web API (Controllers)
- **ORM:** Entity Framework Core (code-first migrations)
- **Database:** Azure SQL Database (Free offer tier)
- **API documentation:** Scalar (replaces Swagger UI entirely)
- **Auth:** Bearer-only JWT — see `specs/decisions/006-simplified-bearer-auth.md`
- **Security layers:**
  1. Password hashing — `PasswordHasher<User>` (PBKDF2)
  2. Data validation & sanitisation — Data Annotations on DTOs
  3. Rate limiting — ASP.NET Core built-in rate-limiting middleware (fixed login policy & sliding run submission policy)
  4. Access token in-memory / Refresh token rotated & SHA-256 hashed in DB
  5. CORS — explicit allow-list, no wildcard
- **Code organization:**
  - Controllers → Services → EF Core (`AppDbContext`)
  - Domain Services: `AuthService`, `RunService`, `PointsService`, `StreakService`, `BadgeService`, `LeaderboardService`, `UserService`, `StreakFreezeService`, `ChallengeService`, `ScreenshotImportService`
  - DTOs for all API input/output
- **Testing:** xUnit + WebApplicationFactory for integration tests

## Authentication Flow

```
  Client                          Server
    │                               │
    │  POST /api/auth/login         │
    │  { email, password }          │
    │ ────────────────────────────► │
    │                               │ Validate credentials & password hash
    │                               │ Generate access token (15 min)
    │                               │ Generate refresh token (7 days)
    │                               │ Store SHA-256 hash(refresh) in DB
    │  ◄──────────────────────────  │
    │  200 { accessToken,           │
    │        refreshToken, user }   │
    │                               │
    │  GET /api/runs                │
    │  Authorization: Bearer <at>   │
    │ ────────────────────────────► │
    │                               │ Validate JWT bearer token
    │  ◄──────────────────────────  │
    │  200 { runs: [...] }          │
    │                               │
    │  POST /api/auth/refresh       │
    │  { refreshToken }             │
    │ ────────────────────────────► │
    │                               │ Verify hash(refreshToken) in DB
    │                               │ Rotate: revoke old, issue new pair
    │  ◄──────────────────────────  │
    │  200 { accessToken,           │
    │        refreshToken }         │
    │                               │
```


## Deployment Architecture

| Component | Platform | Tier | Notes |
|-----------|----------|------|-------|
| Frontend | Vercel | Hobby (free) | Auto-deploy from GitHub |
| Backend API | Azure App Service | F1 (Free) or B1 (Basic) | Free credit eligible |
| Database | Azure SQL Database | Free offer | 100k vCore-sec/month, auto-pauses |
| Secrets | Azure App Service Configuration | — | Connection string, JWT key, CORS origin |

## Key Constraints

1. **No budget** — all Azure resources must stay within free/student tiers.
2. **Single repo** — frontend and backend coexist in one GitHub repository.
3. **Scalar only** — no Swagger UI middleware.
4. **Exactly 3 scored advanced features** — Zustand, theme switching, security measures.
5. **English-only documentation** — all written output in the repo must be in English.
6. **Spec-driven** — every non-trivial feature needs an ADR and/or prompt log in `/specs`.
