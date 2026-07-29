# 014 — Password Reset Flow & Resend Email Integration

**Status:** decided  
**Date:** 2026-07-29

## Context
Unauthenticated users who forget their passwords need a secure self-service recovery mechanism, and authenticated users need a way to change their password while validating their current credentials.

## Decision
- **Email Delivery Service:** Resend API (`POST https://api.resend.com/emails`) using `HttpClient` with domain `noreply@runstreak.sheng.nz`.
- **Token Security:**
  - Password reset tokens are generated as 32-byte cryptographically random raw strings.
  - Only SHA-256 hashes are stored in the database (`PasswordResetTokens` table).
  - Tokens expire strictly in **15 minutes** and are single-use (`UsedAt` timestamp).
  - Resetting a password immediately revokes all active user refresh tokens server-side.
- **Authenticated Change Password:** Endpoint `POST /api/auth/change-password` strictly requires `[Authorize]` and validates the user's current password via ASP.NET Core Identity's `PasswordHasher<User>`.
- **Demo Account Recovery Endpoint (`POST /api/auth/reset-demo`):** Unauthenticated, rate-limited endpoint specifically hard-scoped to the designated MSA marker `testuser` account to reset its password back to `Test1234!`. Documented as a demo/eval feature only.

## Why
- Resend offers modern REST APIs, rapid delivery, and domain configuration (`sheng.nz`).
- SHA-256 hashed token storage ensures zero risk if the database is exposed.
- Anti-user-enumeration response handling on forgot password requests.
