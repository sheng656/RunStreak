# 2026-06-29 — CORS Fix for Custom Domain Deployment

## Session context

Phase 8 (Deployment) — fixing CORS configuration after switching from Vercel's default domain to a custom domain (`https://runstreak.sheng.nz`).

## Prompt 1

> Before doing anything else, open and read AGENTS.md and plan.md at the repo root, both in full. Then,
> before writing or editing any code, reply with a short confirmation covering these points so I can
> verify you actually read them and didn't skim:
>
> 1. Tech stack: state management lib, styling lib, auth approach (in one sentence — be specific about
>    where the access token lives vs where the refresh token lives, not just "JWT").
> 2. The exact CSRF mitigation strategy for the refresh endpoint (name both mechanisms, not just one).
> 3. Which 3 advanced requirements are the ones being scored, per the README checklist.
> 4. What you need to create/update in /specs before you consider this session's work "done."
> 5. The Azure tier constraints you must not exceed.
> 6. From plan.md: what's currently marked in-progress or next-up, and anything marked done that you
>    should NOT redo or re-architect without asking first.
> 7. Confirm: when you log this session's prompts to /specs/prompts/ per AGENTS.md, any prompt I give
>    you in Chinese (or mixed Chinese/English) gets translated to English in the saved file — the log
>    itself must be English-only, per AGENTS.md's language rule. Translate faithfully: preserve the
>    technical meaning and intent exactly, don't paraphrase loosely or drop specifics. If a translation
>    is ambiguous, keep the original Chinese term in parentheses next to your translation rather than
>    guessing.
>
> Do not start coding until you've given me that summary. If anything in my request below conflicts
> with AGENTS.md or plan.md, flag the conflict instead of silently picking one or the other.
>
> I've already deployed the frontend to https://runstreak.sheng.nz/ via Vercel, but registration fails.
> Error: `Uncaught (in promise) Error: No Listener: tabs:outgoing.message.ready`
> CORS error: `Access to XMLHttpRequest at 'https://runstreak-api-msa.azurewebsites.net/api/auth/register' from origin 'http://runstreak.sheng.nz' has been blocked by CORS policy: Response to preflight request doesn't pass access control check: No 'Access-Control-Allow-Origin' header is present on the requested resource.`
> `runstreak-api-msa.azurewebsites.net/api/auth/register: Failed to load resource: net::ERR_FAILED`
>
> Azure CORS was configured with `Cors__AllowedOrigins__0` through `Cors__AllowedOrigins__3` on the Azure App Service to allow requests from `https://runstreak-ten.vercel.app`, `https://runstreak.vercel.app`, and deployment/dev origins. Previously, registration worked when deployed at `https://runstreak-ten.vercel.app/`, but logging a run also produced CORS errors (`Access to XMLHttpRequest at 'https://runstreak-api-msa.azurewebsites.net/api/runs' from origin 'https://runstreak-ten.vercel.app' has been blocked by CORS policy`).
>
> Please help me fix the Azure CORS configuration.

**Agent produced:** Read both files in full, provided a 7-point confirmation summary, identified root causes (origin mismatch in Azure env vars, potential HTTP vs HTTPS issue), and asked clarifying questions about HTTPS status, portal CORS blade, and desired origin list before proposing changes.

## Prompt 2

> 1. https://runstreak.sheng.nz/ — with HTTPS.
> 2. Azure Portal's CORS blade is not enabled. Is `app.UseCors()` better or the Azure Portal CORS blade? The complete list of origins: `https://runstreak.sheng.nz` and `http://localhost:5173`. No others needed.

**Agent produced:**
- Recommended staying with `app.UseCors()` in code (version-controlled, no conflict with middleware) over the Azure Portal CORS blade.
- Updated `appsettings.json` to add `https://runstreak.sheng.nz` to the allowed origins.
- Updated `appsettings.Example.json` to use `<YOUR_CUSTOM_DOMAIN>` instead of the old Vercel placeholder.
- Confirmed frontend `client.ts` already has `withCredentials: true` and correct CSRF handling.
- Noted that the Azure App Service env vars (`Cors__AllowedOrigins__0–3`) still pointed to old Vercel domains and needed to be updated to match.

## Prompt 3

> Redeploy the backend to Azure App Service for me (I'm already logged in). Check if the `publish.zip` file/folder is useful (should it be gitignored?). Also create the prompt log. Update plan.md. Update the root README.md.

**Agent produced:**
- Confirmed `publish/` directory was already gitignored but `publish.zip` was not — added it to `.gitignore`.
- Updated Azure App Service CORS settings via Azure CLI:
  - Set `Cors__AllowedOrigins__0` = `https://runstreak.sheng.nz`
  - Set `Cors__AllowedOrigins__1` = `http://localhost:5173`
  - Deleted stale `Cors__AllowedOrigins__2` and `__3` (old Vercel domains)
- Verified Azure Portal CORS blade is empty (no conflict).
- Built backend with `dotnet publish`, zipped, and deployed via `az webapp deploy`.
- Created this prompt log.
- Updated `plan.md` with deployment progress.
- Updated `README.md` with live deployment URLs, filled in TODOs for tech stack and security measures.

## Prompt 4

> https://runstreak.sheng.nz/runs/new
> Access to XMLHttpRequest at 'https://runstreak-api-msa.azurewebsites.net/api/runs' from origin 'https://runstreak.sheng.nz' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.
> index-BODJQLLH.js:189  POST https://runstreak-api-msa.azurewebsites.net/api/runs net::ERR_FAILED 500 (Internal Server Error)
> I hit this issue when logging a run.

**Agent produced:**
- Explained that the CORS preflight block was a side effect of a `500 Internal Server Error` (the server fails before CORS headers are added).
- Enabled application filesystem logging on the Azure App Service.
- Added temporary try-catch blocks to return detailed stack traces in the 500 response, then ran a test script that reproduced the issue:
  `The configured execution strategy 'SqlServerRetryingExecutionStrategy' does not support user-initiated transactions. Use the execution strategy returned by 'DbContext.Database.CreateExecutionStrategy()' to execute all the operations in the transaction as a retriable unit.`
- Identified the root cause: enabling `EnableRetryOnFailure()` in EF Core (to tolerate Azure SQL auto-pause cold starts) requires wrapping manual transaction blocks inside `IExecutionStrategy.ExecuteAsync()`.
- Refactored `LogRunAsync`, `UpdateRunAsync`, and `DeleteRunAsync` in `RunService.cs` to wrap their transactions inside `strategy.ExecuteAsync()`.
- Added safety checks in `BadgeService.cs` to handle potentially null or empty criteria types (e.g. `criteria.Type.ToLowerInvariant()`).
- Reverted the temporary debugging stack trace responses from `RunsController.cs` to restore standard production response security.
- Redeployed the updated backend API to Azure App Service and verified that registering a user and logging a run now succeeds cleanly with a `201 Created` status (returning 38 points and unlocking badges: "First Steps" and "5K Club").

