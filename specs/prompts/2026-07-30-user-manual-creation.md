# User Manual Creation & Live Browser Screenshot Capture

**Date:** 2026-07-30

## Prompts

### Prompt 1
> Before doing anything else, open and read AGENTS.md and plan.md at the repo root, both in full. Then, before writing or editing any code, reply with a short confirmation covering these points so I can verify you actually read them and didn't skim:
> 1. Tech stack: state management lib, styling lib, auth approach (in one sentence — be specific about where the access token lives vs where the refresh token lives, not just "JWT").
> 2. The exact rate limiting strategy for the login and run submission endpoints (name the windows and limits for both).
> 3. Which 3 advanced requirements are the ones being scored, per the README checklist.
> 4. What you need to create/update in /specs before you consider this session's work "done."
> 5. The Azure tier constraints you must not exceed.
> 6. From plan.md: what's currently marked in-progress or next-up, and anything marked done that you should NOT redo or re-architect without asking first.
> 7. Confirm: when you log this session's prompts to /specs/prompts/ per AGENTS.md, any prompt I give you in Chinese (or mixed Chinese/English) gets translated to English in the saved file — the log itself must be English-only, per AGENTS.md's language rule. Translate faithfully: preserve the technical meaning and intent exactly, don't paraphrase loosely or drop specifics. If a translation is ambiguous, keep the original Chinese term in parentheses next to your translation rather than guessing.
> Do not start coding until you've given me that summary. If anything in my request below conflicts with AGENTS.md or plan.md, flag the conflict instead of silently picking one or the other.
> Create a very detailed user manual in Markdown (.md) format, including showcase sections for all key features alongside their corresponding screenshots. Please provide the plan first.

**Agent Action:**
- Read `AGENTS.md` and `plan.md` in full.
- Generated the required 7-point summary response.
- Created `implementation_plan.md` outlining the proposed User Manual layout and asking how screenshots should be acquired.

### Prompt 2
> Selection: "My proposal: I will create the manual with styled Markdown image placeholders (e.g., ![Dashboard View](./docs/assets/dashboard.png)) and detailed descriptions. You can then drop the actual screenshot files into the specified docs/assets/ folder. Does this approach work for you, or would you prefer I attempt to launch the frontend and capture them autonomously?"
> Comment: "yes, but try to access the website and login as test user ,capture them autoly as many as you can.https://runstreak.sheng.nz/"

**Agent Action:**
- Dispatched `browser_subagent` to open `https://runstreak.sheng.nz/`, auto-fill credentials for `testuser`, log in, and navigate across all 8 main application routes (Landing, Dashboard, Log Run, Runs History, Badges, Challenges, Leaderboard, Profile).
- Captured screenshots at each step and saved them into `docs/assets/`.
- Created `USER_MANUAL.md` at the repo root incorporating descriptive text and image links for all 8 application pages.
