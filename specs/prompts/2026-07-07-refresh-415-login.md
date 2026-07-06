# 2026-07-07 — Fix refresh 415 on login page

## Prompt 1 (translated to English)
At https://runstreak.sheng.nz/login, I hit this error on the login page:

POST https://runstreak.sheng.nz/api/auth/refresh 415 (Unsupported Media Type)

(plus browser stack trace from the built frontend bundle).

## Agent output
- Traced frontend and backend refresh flow.
- Identified media type mismatch sensitivity in backend model binding for `POST /api/auth/refresh`.
- Implemented a backend compatibility fix in `AuthController` so refresh/logout token parsing accepts:
  - JSON body (`{"refreshToken":"..."}`)
  - `application/x-www-form-urlencoded` body (`refreshToken=...`)
  - query-string fallback for compatibility.
- Added explicit `Content-Type: application/json` headers in frontend refresh calls.
- Added integration test coverage for form-urlencoded refresh payloads.

## Follow-up prompts
No additional follow-up prompts were needed in this session.