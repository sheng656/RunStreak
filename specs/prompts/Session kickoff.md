# Session kickoff prompt — paste this first in every new AI coding session

---

Before doing anything else, open and read AGENTS.md and plan.md at the repo root, both in full. Then,
before writing or editing any code, reply with a short confirmation covering these points so I can
verify you actually read them and didn't skim:

1. Tech stack: state management lib, styling lib, auth approach (in one sentence — be specific about
   where the access token lives vs where the refresh token lives, not just "JWT").
2. The exact CSRF mitigation strategy for the refresh endpoint (name both mechanisms, not just one).
3. Which 3 advanced requirements are the ones being scored, per the README checklist.
4. What you need to create/update in /specs before you consider this session's work "done."
5. The Azure tier constraints you must not exceed.
6. From plan.md: what's currently marked in-progress or next-up, and anything marked done that you
   should NOT redo or re-architect without asking first.
7. Confirm: when you log this session's prompts to /specs/prompts/ per AGENTS.md, any prompt I give
   you in Chinese (or mixed Chinese/English) gets translated to English in the saved file — the log
   itself must be English-only, per AGENTS.md's language rule. Translate faithfully: preserve the
   technical meaning and intent exactly, don't paraphrase loosely or drop specifics. If a translation
   is ambiguous, keep the original Chinese term in parentheses next to your translation rather than
   guessing.

Do not start coding until you've given me that summary. If anything in my request below conflicts
with AGENTS.md or plan.md, flag the conflict instead of silently picking one or the other.
 
---