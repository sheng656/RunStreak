# AGENTS.md — RunStreak

This file tells AI coding agents (Claude Code, GitHub Copilot, Cursor, etc.) how to work in this repository. It is the single source of truth for stack decisions, conventions, and process — read it before writing any code.

**Language rule (applies everywhere in this repo):** all written output — README, `/specs` files, ADRs, prompt logs, commit messages, code comments — must be in English, regardless of what language a request to the agent was made in. This includes prompt logs in `specs/prompts/`: if the user's actual prompt was in Chinese (or mixed Chinese/English), translate it faithfully into English before saving.

**Context:** This is a solo submission for Microsoft Student Accelerator (MSA) 2026, Phase 2, Software Stream. Theme: **Gamification**. The assessment is individually marked and explicitly rewards visible, well-documented AI usage — every agent session that produces non-trivial work must leave a trace in `/specs` (see "Spec-driven workflow" below). Treat that requirement as a hard constraint, not a suggestion.

---

## 1. Project summary

RunStreak is a full-stack app that gamifies running habit-building: points, badges/achievements, streaks, a leaderboard, and progress tracking.

- **Frontend:** React + TypeScript, deployed on Vercel
- **Backend:** C# / .NET 10 Web API, deployed on Azure App Service
- **Database:** Azure SQL Database (Free offer tier — see §6 Cost constraints)
- **API docs:** Scalar UI (NOT Swagger UI — the brief explicitly requires Scalar)

## 2. Tech stack (do not substitute without asking)

| Layer | Choice | Notes |
|---|---|---|
| Frontend framework | React + TypeScript | Vite, not CRA |
| Routing | React Router | |
| State management | **Zustand** | Advanced requirement #1 — auth, run/activity data, gamification state, theme |
| Styling | **Tailwind CSS** | Utility-first; no MUI, no styled-components |
| Frontend testing | Vitest + React Testing Library | |
| Component docs | Storybook | Only if pursued as a 4th/optional advanced item — not in the scored 3 |
| Backend framework | C# / .NET 10 Web API | Minimal APIs or Controllers — pick one and stay consistent |
| ORM | Entity Framework Core | Code-first migrations |
| Database | Azure SQL Database | Free offer tier |
| Auth | **JWT Bearer tokens** | Access + refresh token pattern — see §5.1 |
| API docs | **Scalar** | Replaces Swagger UI entirely; do not add SwaggerUI middleware |
| Backend testing | xUnit | + WebApplicationFactory for integration tests where useful |
| Frontend hosting | Vercel | |
| Backend hosting | Azure App Service | Free/Basic tier — see §6 |

**Scored advanced requirements (exactly 3 — list these in README, no more, no less):**
1. State management library (Zustand)
2. Theme switching (light/dark mode, persisted)
3. Security measures (≥2 with justification — see §5)

**Optional/stretch (build only if time remains, do NOT claim for marking unless README is updated to swap one of the 3 above):**
- WebSockets (real-time leaderboard updates)
- Performance tests, logging & metrics
- Multiplayer functionality

If asked to "add" a 4th advanced feature, implement it but explicitly warn that only 3 will be marked per the brief, and ask which one should be swapped in the README checklist before editing it.

## 3. Repository structure

```
/
├── AGENTS.md                  # this file
├── README.md                  # public-facing project README (submission requirement)
├── plan.md                    # LIVE progress tracker — what's done, in-progress, next up
├── backend/                   # .NET 10 Web API
│   ├── RunStreak.Api/
│   ├── RunStreak.Tests/
│   └── ...
├── frontend/                  # React + TS SPA
│   ├── src/
│   ├── tests/
│   └── ...
└── specs/                     # REQUIRED by assessment — see §4
    ├── 00-architecture.md
    ├── 01-data-model.md
    ├── prompts/                # raw prompt logs, one .md per session/feature
    └── decisions/              # short ADRs for non-trivial choices
```

Do not flatten this structure or move `specs/` — the marking rubric explicitly checks for it at the repo root.

**`plan.md` is a live document, not a one-time artifact.** Read it at the start of every session to know current state (don't assume — check what's actually marked done vs in-progress). Update it at the end of every session: mark what was finished, move the next task up, note anything newly discovered. If a session ends without this update, the next session's context will be stale.

## 4. Spec-driven workflow (read this before coding)

The MSA brief requires evidence of planning and AI-assisted development in `/specs`, including **prompts used during development, not just final code**. This is not optional documentation — it is part of the score. Treat it as part of the definition of "done" for any feature.

For every non-trivial unit of work (a new feature, a schema change, a non-obvious bugfix, an architecture decision):

1. **Before coding:** if a `specs/decisions/` entry doesn't already cover the approach, write a short one first (template below). For routine work (typo fixes, formatting, dependency bumps) skip this.
2. **While coding:** work normally.
3. **After coding:** append the prompt(s) that drove the work to `specs/prompts/`, one file per feature/session, named `YYYY-MM-DD-short-feature-name.md`. Include:
   - The actual prompt(s) given to the agent (verbatim, not paraphrased)
   - A one-line note on what the agent produced
   - Any correction/follow-up prompts if the first attempt was wrong

**ADR template** (`specs/decisions/NNN-title.md`):
```markdown
# NNN — Title

**Status:** decided
**Date:** YYYY-MM-DD

## Context
What problem are we solving?

## Decision
What we're doing.

## Why
Why this over the alternatives. Keep it to 3-5 bullets.
```

Agents should proactively create/update these files as part of completing a task, without waiting to be asked. If you (the agent) are about to do meaningful design work and no spec file will exist for it, stop and create one first.

## 5. Security requirements (scored advanced requirement #3)

Three measures are implemented, all with written justification in `README.md`. These are the measures counted for scoring:

### 5.1 Authentication — bearer-only JWT with localStorage refresh token

Simplified from the original split-storage/CSRF design (see superseded ADR 001; new ADR 006 explains the decision):

- **Access token:** short-lived (15 min), kept **in memory only** (Zustand `authStore`, never `localStorage`/`sessionStorage`). Sent via `Authorization: Bearer <token>` header. Lost on page reload by design — the silent refresh flow restores it. This limits XSS blast radius to one 15-minute window.
- **Refresh token:** longer-lived (7 days), stored in **`localStorage`** so sessions survive page reloads. Passed in the request body (not a cookie) to `/api/auth/refresh`. Server stores only a SHA-256 hash; rotated on every use (old token revoked); reuse of a revoked token triggers revocation of all the user's tokens.
- **No cookies** → **no CSRF surface.** CORS is configured with an explicit origin allow-list (no wildcard). `AllowCredentials()` is not needed.
- Sign access tokens from configuration — never hardcode a signing key. Validate `iss`, `aud`, `exp` on every request.

**`refresh_tokens` table (unchanged):**

| Column | Type | Notes |
|---|---|---|
| `Id` | Guid (PK) | |
| `UserId` | Guid (FK → Users) | |
| `TokenHash` | string | SHA-256 hash — never store the raw token |
| `ExpiresAt` | datetime | |
| `CreatedAt` | datetime | |
| `RevokedAt` | datetime? | null = still valid |
| `ReplacedByTokenHash` | string? | token reuse/replay detection |

### 5.2 Password hashing

- Use ASP.NET Core Identity's `PasswordHasher<TUser>` (PBKDF2-based) — already implemented. Don't swap without asking.
- Never log raw passwords, even in debug builds. Never include them in `/specs` prompt logs.

### 5.3 Data validation / sanitisation (Game Integrity Protection)

- Model validation via Data Annotations on every write endpoint: reject negative distances, future run dates, oversized payloads.
- Justification: in a gamified system with public leaderboards, missing validation lets malicious users inflate scores via raw API calls.

### 5.4 Rate limiting (Anti-Spam & Anti-Brute-Force)

- `/api/auth/login`: fixed window — 5 attempts / 15 min per IP.
- `/api/runs` POST: sliding window — 10 submissions / hour per user.
- Justification: public leaderboard incentivises automated fake-run spam; rate limiting closes that abuse vector.

Each measure needs a README paragraph: what it protects against, and why that threat matters for this app specifically.

## 6. Cost constraints — stay inside Azure free tiers

This is a student project with no budget. Agents must default to free-tier-safe choices and flag anything that risks cost.

- **Azure SQL Database:** use the **Free offer** database (100,000 vCore-seconds/month, 32GB storage, auto-pauses, deployment region `LOCATION="australiaeast"`). Do not provision a paid tier, elastic pool, or Hyperscale. Connection strings should tolerate auto-pause/cold-start latency (don't assume always-on).
- **Azure App Service:** use **F1 (Free)** tier if it fits, or **B1 (Basic, Always Free credit)** if F1's limitations (60 CPU min/day, no custom domain SSL needed here) are a blocker (deployment region `LOCATION="australiaeast"`) — confirm with the user before provisioning anything above Free/Basic.
- **Vercel:** free Hobby tier is sufficient; no action needed.
- Before suggesting or provisioning any Azure resource, check it against the free/student tier list. If a desired feature (e.g. SignalR for WebSockets, Application Insights for metrics) has a paid-only mode, default to its free-tier equivalent and say so explicitly rather than silently provisioning something billable.
- Never commit connection strings, JWT signing keys, or any secret to git — use `appsettings.Development.json` (gitignored) locally and environment variables / Azure App Service configuration / GitHub Actions secrets in deployment. Add a `appsettings.Example.json` with placeholder keys instead.

## 7. Coding conventions

**Backend (.NET)**
- Nullable reference types enabled.
- DTOs in/out of controllers — never return EF entities directly (avoids over-exposure and circular-reference serialization issues).
- Async all the way down (`async`/`await`, `Task<T>` returns) for anything touching the DB.
- EF Core migrations committed to source control; never hand-edit generated migration files.
- One `DbContext`, repository/service layer between controllers and EF Core if complexity warrants it — don't over-engineer for a student project, but don't put query logic directly in controllers either.

**Frontend (React/TS)**
- Functional components + hooks only.
- Zustand stores live in `src/stores/`, one store per domain (`authStore`, `runStore`, `gamificationStore`, `themeStore`) — don't create one giant global store.
- API calls go through a single typed client module (`src/api/`), not scattered `fetch` calls in components.
- Tailwind: prefer utility classes; extract to a component only when a pattern repeats 3+ times.
- Co-locate tests with components (`Component.tsx` + `Component.test.tsx`).

**Both**
- Commit early, commit often, with meaningful messages (`feat:`, `fix:`, `chore:`, `test:`, `docs:` prefixes). The brief explicitly marks commit history quality and explicitly penalizes a single end-of-project commit dump — agents should commit at natural checkpoints (a passing feature, a passing test suite) rather than batching large diffs.
- Never commit directly to `main` for anything non-trivial if the user has set up branch protection — check for a `develop`/feature-branch convention before assuming `main` is the working branch.

## 8. Testing expectations

- Backend: xUnit tests for controller/service logic and for the gamification rule engine (points calculation, streak calculation, badge unlocking) specifically — these are the most bug-prone, highest-value-to-test parts of this app.
- Frontend: Vitest + RTL for key components (run logging form, leaderboard, streak display, badge unlock UI) and for Zustand store logic.
- Do not skip writing tests "to save time" — both basic requirements explicitly require unit test coverage, and the rubric scores it.

## 9. What "done" looks like for any feature

A feature an agent works on is not complete until:
1. Code compiles/builds and existing tests pass.
2. New tests are added for new logic.
3. The relevant `specs/` file is created or updated (architecture note, ADR, or prompt log per §4).
4. If it touches an advanced-requirement area, the README checklist/justification is updated.
5. Changes are committed with a clear message.

If time pressure means one of these has to be skipped, skip last-mile polish (e.g. extra styling), not the spec log or tests — those are directly scored.

## 10. Things to never do

- Don't add Swagger/Swashbuckle UI — Scalar only.
- Don't use any backend language/framework other than C#/.NET — instant fail per the brief.
- Don't claim more than 3 advanced requirements in the README checklist.
- Don't provision paid-tier Azure resources without flagging it first.
- Don't commit secrets, connection strings, or signing keys.
- Don't skip the `/specs` prompt log "to move faster" — it's graded.
- Don't store the access token in `localStorage` or `sessionStorage` — it must stay in memory only (Zustand). The refresh token is in `localStorage`; the access token is not.
- **All documentation in this repository — README, `/specs` files, ADRs, prompt logs, code comments — must be written in English.** This applies even if a prompt given to an agent was in another language; the agent's written output to any file in this repo must still be English.