# 2026-07-01 — Fix Date Picker Timezone Bug

**Prompt:**
> vendor.js:132 Uncaught (in promise) Error: Uncaught Error: No Listener: tabs:outgoing.message.ready
what is this error? 
and now it is 10 am 1st July Auckland NZ, I can not chose the right date ,only can chose the 30 June and before, fix it

**Output:**
Fixed a timezone bug in `LogRunPage.tsx` where `new Date().toISOString()` produced the UTC date (which was still the previous day in positive UTC offset regions like New Zealand). Replaced it with a timezone-adjusted local date string so the `max` attribute properly allows selecting the user's actual current local day.
