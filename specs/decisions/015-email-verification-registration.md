# 015 — 2-Step Registration with 6-Digit Email Verification Code

**Status:** decided  
**Date:** 2026-07-29

## Context
Previously, registration (`POST /api/auth/register`) directly created the `User` account and returned JWT access and refresh tokens. This allowed unverified email addresses to register and start using the application immediately, creating a risk of fake account creation, invalid email storage, and bot spam.

## Decision
We implemented a **2-Step Registration Flow with Email Verification Code Confirmation**:
1. **Step 1 (`POST /api/auth/register`)**: Validates input data, generates a 6-digit numeric verification code (10-minute expiration), pre-hashes the user's password, stores pending registration data in a dedicated `EmailVerificationCodes` table, and sends a verification code email via Resend (`ResendEmailService`).
2. **Step 2 (`POST /api/auth/verify-registration`)**: Receives the email and 6-digit code, verifies the SHA-256 hash against `EmailVerificationCodes`, creates the actual `User` record in `Users`, revokes/marks the code as verified, and returns JWT access + refresh tokens.
3. **Frontend Cooldown**: Added a 60-second cooldown timer to the "Resend Code" button to prevent spamming Resend API endpoints or hitting rate limits.
4. **Dev Fallback**: In local development or testing environments where `RESEND_API_KEY` is not set or placeholder, the code is logged directly to console output via `logger.LogInformation("Verification Code for {Email}: {Code}")`.

## Why
- Keeps the `Users` table clean from unverified signups.
- Ensures all registered accounts correspond to valid, owned email addresses.
- Prevents Resend API quota exhaustion via a 60s frontend cooldown timer.
- Facilitates smooth developer and marker testing via console fallback logging.
