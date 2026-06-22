# 002 — Rate Limiting Strategy

**Status:** decided
**Date:** 2026-06-22

## Context

RunStreak has a public leaderboard ranked by points. Points are earned by logging runs. Without rate limiting, an attacker (or bored user) could:
1. Brute-force login attempts to compromise accounts.
2. Spam fake run submissions to inflate their leaderboard position.

Both threats are specific to a gamified app — the leaderboard creates a direct incentive to cheat, and public registration means the login endpoint is always exposed.

## Decision

Use ASP.NET Core's built-in rate-limiting middleware (`Microsoft.AspNetCore.RateLimiting`) with two policies:

1. **Login rate limit** — Fixed window: 5 attempts per 15-minute window, keyed by client IP.
   - Protects against credential brute-forcing.
   - Returns `429 Too Many Requests` with `Retry-After` header.

2. **Run submission rate limit** — Sliding window: 10 submissions per 60-minute window, keyed by authenticated user ID.
   - Prevents leaderboard inflation via fake run spam.
   - Keyed by user (not IP) so legitimate users sharing an IP aren't blocked.
   - Only applies to `POST /api/runs`.

## Why

- **Built-in middleware** — no third-party dependency, well-integrated with ASP.NET Core pipeline, configurable via code.
- **Fixed window for login** — simple, effective for brute-force prevention; the precision of sliding window isn't needed here.
- **Sliding window for submissions** — more forgiving than fixed window for legitimate burst usage (e.g. user logging multiple past runs at once), while still preventing sustained abuse.
- **IP-keyed for login, user-keyed for submissions** — login is unauthenticated so IP is the only key available; submissions are authenticated so user ID is more precise and avoids false positives from shared IPs.
- **Free tier safe** — no external service required (unlike Redis-backed distributed rate limiting), which fits the zero-budget constraint.
