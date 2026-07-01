# 001 — Split-Storage JWT Authentication

**Status:** superseded (by ADR 006 — 2026-07-01)
**Date:** 2026-06-22

## Context

RunStreak needs user authentication to protect run logging, profile management, and leaderboard integrity. The MSA assessment requires security measures as one of the 3 scored advanced requirements, with at least 2 measures justified. The auth approach must handle a cross-origin setup (React SPA on Vercel ↔ .NET API on Azure App Service) and provide a defensible CSRF story.

## Decision

Implement **split-storage JWT** with rotate-on-use refresh tokens:

- **Access token** (short-lived, ~15 min): stored **in memory only** (Zustand `authStore`), sent as `Authorization: Bearer` header. Never written to `localStorage` or `sessionStorage`.
- **Refresh token** (longer-lived, ~7 days): stored in an **`HttpOnly`, `Secure`, `SameSite=Strict` cookie**, scoped to `Path=/api/auth/refresh`. Never readable by JavaScript.
- **CSRF protection** on the refresh endpoint via two mechanisms:
  1. `SameSite=Strict` on the refresh cookie (primary defense)
  2. Double-submit CSRF token (defense-in-depth): server issues a non-HttpOnly `csrf_token` cookie; frontend reads it and sends as `X-CSRF-Token` header; server validates the match.
- **Refresh token rotation:** every refresh issues a new token and revokes the old one. Tokens stored hashed (SHA-256) server-side. Reuse of a revoked token triggers revocation of the entire token family.

## Why

- **In-memory access token** eliminates the XSS vector of scraping `localStorage`/`sessionStorage`. The tradeoff (token lost on page reload) is acceptable — the silent refresh flow restores the session automatically.
- **HttpOnly cookie for refresh** means even if an XSS payload executes, it cannot read or exfiltrate the refresh token.
- **`SameSite=Strict`** prevents the browser from attaching the refresh cookie on any cross-site request, which is the primary CSRF defense.
- **Double-submit CSRF token** is defense-in-depth: if a browser bug or misconfiguration allows the cookie through on a cross-site request, the attacker still can't populate the `X-CSRF-Token` header because they can't read the `csrf_token` cookie from a different origin.
- **Rotate-on-use with hashed storage** limits blast radius of a database breach (hashes are useless without the raw token) and enables detection of token theft (if a revoked token is reused, the family is poisoned).
