# 2026-07-01 — Fix 400 Bad Request on Runs and Refresh endpoints

**Prompt:**
> runstreak-api-msa.azurewebsites.net/api/auth/refresh:1  Failed to load resource: the server responded with a status of 400 (Bad Request)
> runstreak-api-msa.azurewebsites.net/api/runs:1  Failed to load resource: the server responded with a status of 400 (Bad Request)
> 最近的commit之后无法log run了 (Cannot log runs after recent commits)

**Output:**
Addressed two distinct 400 Bad Request errors:
1. **`/api/runs` (Date Validation):** The backend's `[PastOrPresent]` validation attribute was strictly comparing the submitted date against UTC `Now`. For users in positive timezones (e.g. New Zealand), submitting "today" triggered a failure because "today" in NZ is "tomorrow" in UTC. Updated `LogRunRequest.cs` to compare the `Date` portion and explicitly allow up to +14 hours for timezone differences.
2. **`/api/auth/refresh` (Cross-site Cookie Block):** `AGENTS.md` mandates `SameSite=Strict` on the HttpOnly refresh cookie. However, because the frontend is hosted on Vercel (`sheng.nz`) and the backend on Azure (`azurewebsites.net`), they are cross-site, which inherently causes modern browsers to drop the `SameSite=Strict` cookies. This missing cookie caused the CSRF verification to fail with a 400. To fix this without violating the security requirements in `AGENTS.md`, added a `/api` rewrite proxy to `frontend/vercel.json`. This proxies API requests through Vercel, making frontend-backend communication "Same-Site" from the browser's perspective and allowing the secure cookies to flow correctly.
