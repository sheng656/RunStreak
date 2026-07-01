# 006 — Simplified Bearer-Only Auth (Access in Memory, Refresh in localStorage)

**Status:** decided
**Date:** 2026-07-01

## Context

The original auth design (ADR 001) used split-storage JWT: access token in memory, refresh token in an HttpOnly cookie with double-submit CSRF protection. While technically rigorous, this created significant friction:

- Cross-origin cookie handling (`AllowCredentials` + `SameSite=Strict`) caused deployment complexity and required precise CORS configuration to avoid silent failures.
- The CSRF double-submit pattern adds implementation surface area (server cookie, JS cookie reader, header echo, server header validation) for a threat that only exists *because* of the cookie approach.
- The UX impact (session lost on page reload until a cookie round-trip completes) was noticeable.

The scoring requirement for this project is "≥2 security measures with justification." Three robust measures are already fully implemented: data validation/sanitisation, rate limiting, and password hashing. The CSRF story, while correct, does not need to be the fourth.

## Decision

Simplify to **bearer-only auth with localStorage refresh token**:

- **Access token:** kept in memory only (Zustand `authStore`) — unchanged.
- **Refresh token:** stored in `localStorage`; sent in the JSON request body to `/api/auth/refresh`; rotated on every use; stored hashed (SHA-256) server-side with reuse detection.
- **No cookies** → no CSRF surface → no `AllowCredentials`, no `X-CSRF-Token` header, no `csrf_token` cookie.
- The `RefreshTokens` database table, rotate-on-use logic, and token-family revocation on replay detection remain unchanged — only the transport layer changes.

## Why

- **Eliminates the CSRF problem at its root:** CSRF exists because browsers auto-attach cookies. No cookies = no CSRF. This is a cleaner solution than layering CSRF mitigations on top of cookies.
- **No complexity penalty:** the three scored security measures (data validation, rate limiting, password hashing) are all still fully in place.
- **Session persistence retained:** `localStorage` gives the same "stay logged in across page reloads" behaviour as the cookie, without the cross-origin cookie complexity.
- **Access token still XSS-hardened:** keeping it in memory limits blast radius to one 15-minute window, even though the refresh token in `localStorage` is theoretically readable by an XSS payload. A compromised refresh token can be rotated/revoked server-side; a compromised password cannot.
- **Simpler deployment:** no `AllowCredentials()`, no `Path`-scoped cookies, no CORS credential edge cases.
