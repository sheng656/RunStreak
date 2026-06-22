# RunStreak — Architecture Overview

> Last updated: 2026-06-22

## System Architecture

RunStreak is a full-stack web application with a decoupled frontend and backend, deployed to separate hosting platforms.

```
┌──────────────────────┐         HTTPS          ┌─────────────────────────┐
│   React + TS SPA     │ ◄─────────────────────► │  .NET 10 Web API        │
│   (Vercel)           │   Bearer token (header) │  (Azure App Service)    │
│                      │   Refresh cookie (auto) │                         │
│   Zustand stores     │   CSRF token (header)   │  Scalar API docs        │
│   Tailwind CSS       │                         │  EF Core                │
│   React Router       │                         │  JWT auth               │
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
- **State management:** Zustand — one store per domain:
  - `authStore` — access token (in-memory only), user profile, login/logout/refresh actions
  - `themeStore` — light/dark mode, persisted to localStorage
  - `runStore` — runs list, pagination, CRUD actions
  - `gamificationStore` — points, streak, badges, leaderboard data
- **Styling:** Tailwind CSS (utility-first, `dark:` class strategy for theme switching)
- **Routing:** React Router (v6+)
- **API client:** Single typed module (`src/api/client.ts`) — Axios or fetch wrapper with:
  - Auto-attach `Authorization: Bearer` header
  - Auto-refresh on 401 response
  - `withCredentials: true` for refresh endpoint cookies
  - CSRF token echoing (`X-CSRF-Token` header from `csrf_token` cookie)
- **Testing:** Vitest + React Testing Library, co-located with components

## Backend Architecture

- **Framework:** C# / .NET 10 Web API (Controllers — chosen for clarity and conventional structure)
- **ORM:** Entity Framework Core (code-first migrations)
- **Database:** Azure SQL Database (Free offer tier)
- **API documentation:** Scalar (replaces Swagger UI entirely)
- **Auth:** Split-storage JWT — see `specs/decisions/001-split-storage-jwt.md`
- **Security layers:**
  1. Password hashing — `PasswordHasher<User>` (PBKDF2)
  2. Anti-CSRF — `SameSite=Strict` cookie + double-submit CSRF token
  3. Data validation — Data Annotations on DTOs
  4. Rate limiting — ASP.NET Core built-in rate-limiting middleware
  5. CORS — explicit allow-list, `AllowCredentials()`, no wildcard
- **Code organization:**
  - Controllers → Services → EF Core (one `AppDbContext`)
  - DTOs for all API input/output (never expose EF entities)
  - Async all the way down
  - Nullable reference types enabled
- **Testing:** xUnit + WebApplicationFactory for integration tests

## Authentication Flow

```
  Client                          Server
    │                               │
    │  POST /api/auth/login         │
    │  { email, password }          │
    │ ────────────────────────────► │
    │                               │ Validate credentials
    │                               │ Hash-compare password
    │                               │ Generate access token (15 min)
    │                               │ Generate refresh token
    │                               │ Store hash(refresh) in DB
    │                               │ Set HttpOnly cookie (refresh)
    │                               │ Set non-HttpOnly cookie (csrf_token)
    │  ◄──────────────────────────  │
    │  200 { accessToken, user }    │
    │  Set-Cookie: refresh_token    │
    │  Set-Cookie: csrf_token       │
    │                               │
    │  GET /api/runs                │
    │  Authorization: Bearer <at>   │
    │ ────────────────────────────► │
    │                               │ Validate JWT
    │  ◄──────────────────────────  │
    │  200 { runs: [...] }          │
    │                               │
    │  POST /api/auth/refresh       │
    │  Cookie: refresh_token (auto) │
    │  X-CSRF-Token: <csrf_value>   │
    │ ────────────────────────────► │
    │                               │ Validate cookie
    │                               │ Verify CSRF header = cookie
    │                               │ Verify hash(cookie) exists in DB
    │                               │ Rotate: revoke old, issue new
    │  ◄──────────────────────────  │
    │  200 { accessToken }          │
    │  Set-Cookie: refresh_token    │
    │  Set-Cookie: csrf_token       │
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
