# 2026-07-29 — Landing Page UI/UX Overhaul

## Prompts given

**Prompt 1**
> Add a carousel animation featuring screenshots of key pages in their mobile views on the homepage to make it more visually appealing. with simple words.

*Agent produced:* Original `AppShowcase.tsx` component with a phone-frame mockup carousel and `setInterval` auto-advance (5 slides). Integrated into `LoginPage.tsx` in a `md:grid-cols-2` layout. Added CSS keyframes.

---

**Prompt 2 (follow-up UI optimisation request)**
> Does the homepage currently support adaptive theme switching (Light / Dark mode)?
> Here are several UI/UX optimization proposals to elevate the aesthetic appeal of the landing page for unauthenticated users:
> - Modern Background Visuals: Implement smooth gradient backgrounds with subtle glassmorphic elements for a sleek, modern visual identity.
> - Dynamic Interactive Mockups: Replace rigid, static image carousels with fluid, interactive screenshot showcase animations (e.g., smooth parallax scrolling, subtle floating hover effects, or continuous seamless auto-scroll loops) to give page previews a dynamic and highly engageable feel.
> - Responsive Layout Structure: On mobile screens, stack the dynamic screenshot animation on top and position the login/signup form cleanly beneath it for an optimal vertical layout.
> - MSA Test Account Card Design: Refine the typography, contrast, and background color scheme for the MSA test credentials section to make it look prominent, polished, and effortlessly readable for markers.

*Agent produced:*

1. **`AppShowcase.tsx`** — Full rewrite:
   - Per-slide accent colour applied to pill tag, dot indicator, and glow behind phone
   - Smooth crossfade + translateY transition between slides (300 ms)
   - `animate-phone-float` (4 s ease-in-out infinite) on the phone frame when `compact=false`
   - `compact` prop added for mobile use (no float, no glow, tighter layout)
   - Dot navigation colours match each slide's accent
   - Navigation arrows styled as glassmorphic buttons

2. **`LoginPage.tsx`** — Full rewrite:
   - Three animated radial-gradient orbs in the background (`animate-orb-drift` 18 s, `animate-orb-drift-slow` 24 s)
   - Glassmorphic login form card (`backdrop-filter: blur(12px)`, semi-transparent surface)
   - Mobile layout: `AppShowcase compact` stacked above the form via `grid-cols-1`
   - Desktop layout: `AppShowcase` full in left column, form in right (unchanged)
   - MSA Demo Card completely redesigned:
     - Collapsible with animated `rotate(180deg)` chevron
     - Separate username + password rows with **Copy to clipboard** buttons (✓ check animation on success)
     - ⚡ Auto-fill & Sign In button + 🔄 Reset button, both glassmorphic styled
     - Dark glassmorphic dropdown panel with `backdrop-blur(16px)`

3. **`index.css`** — Added keyframes:
   - `phoneFloat` — gentle 10 px up/down oscillation
   - `orbDrift` / `orbDriftSlow` — slow, multi-point translate + scale drift for background orbs
   - Utility classes: `.animate-phone-float`, `.animate-orb-drift`, `.animate-orb-drift-slow`

## Theme support
The homepage is fully theme-aware:
- All surface colours use `hsl(var(--color-bg))`, `hsl(var(--color-surface))`, `hsl(var(--color-border))` tokens.
- The `.dark` class on `<html>` (applied by `themeStore`) remaps all tokens — the gradient orbs, cards, and inputs all adapt automatically.
- The `AppShowcase` phone frame uses hard-coded dark `bg-slate-900` by design (it represents a phone screen, not a UI card).

## Build result
`npm run build` — zero TypeScript errors, zero warnings.

---

## Follow-up Prompt 3 — Bug fixes & dual phone showcase

> When generating the card, the message "Generating card image..." keeps displaying and flashing. In the preview modal, the QR code is visible. However, if the image is downloaded while it is still flashing, the resulting card image is missing the QR code. Once the flashing stops and image generation completes, the newly downloaded image correctly includes the QR code, along with all other accurate information.
>
> Additionally, the current screenshots on the landing page are all captured in dark mode; separate screenshots for light mode are needed to make it look much better. Furthermore, on mobile layouts, changes in screenshot height cause the input form to shift up and down awkwardly, which needs to be fixed.

*Agent produced:*

1. **`useShareCard.ts`** — root-cause fix for QR flashing:
   - Added a **module-level QR image singleton** (`qrImageCache` + `qrLoadPromise`). The image is fetched once per page lifetime and reused — no more repeated async round-trips causing re-render loops.
   - Replaced `useCallback` object-reference dependencies (`user`, `badge`, `run`, etc.) with **`JSON.stringify`-derived string keys** so `drawCard` only re-fires when data genuinely changes, not on every parent re-render.
   - `downloadImage` now **guards on `isGenerating`** — it returns early if the canvas is still being drawn.

2. **`ShareCard.tsx`** — Download button disabled with `disabled={isGenerating}` + tooltip "Please wait — card is still rendering…".

3. **`AppShowcase.tsx`** — Full rewrite to dual-phone layout:
   - Two `PhoneFrame` components side-by-side: `mode="dark"` (slate-900) and `mode="light"` (white)
   - Each slide has `renderDark()` and `renderLight()` — identical data, opposite colour tokens
   - Float animation offset: dark phone at `animationDelay: 0s`, light phone at `2s` for a natural staggered bob
   - Dark/Light labels shown in full (desktop) mode, hidden in compact mode

4. **`LoginPage.tsx`** — Mobile showcase wrapper given `h-72 flex items-center justify-center overflow-hidden` to prevent the login form from shifting when slide content height changes.

## Build result (follow-up)
`npm run build` — zero TypeScript errors, zero warnings.

---

## Follow-up Prompt 4 — Orange Flame Favicon

> Use the orange flame icon—the same one located above the input fields on the login screen—for the website's favicon (browser tab icon).

*Agent produced:*
- Updated [`frontend/public/favicon.svg`](file:///d:/App/RunStreak/frontend/public/favicon.svg) to render an orange-to-amber gradient rounded square containing the centered white Lucide `Flame` icon, matching the brand icon on the login screen.

---

## Follow-up Prompt 5 — Points Earned Calculation Fix

> After logging a run, the app always displays that 0 points were earned. What could be the issue? / fix that for me

*Agent produced:*
- [`backend/RunStreak.Api/Services/RunService.cs`](file:///d:/App/RunStreak/backend/RunStreak.Api/Services/RunService.cs): Initialized `PointsEarned` during entity creation with `_pointsService.CalculatePoints(...)` instead of setting `0`, ensuring `PointsEarned` is calculated upfront.
- [`frontend/src/pages/LogRunPage.tsx`](file:///d:/App/RunStreak/frontend/src/pages/LogRunPage.tsx): Added fallback property extraction for camelCase and PascalCase (`pointsEarned` / `PointsEarned`, `run` / `Run`, `newlyUnlockedBadges` / `NewlyUnlockedBadges`).

---

## Follow-up Prompt 6 — Dynamic Theme Adaptive Showcase

> Do not display both dark and light modes at the same time at the login page; instead, dynamically detect and display the appropriate theme based on the user's browser or operating system preferences.

*Agent produced:*
- [`frontend/src/components/ui/AppShowcase.tsx`](file:///d:/App/RunStreak/frontend/src/components/ui/AppShowcase.tsx): Updated to read `resolvedTheme` from `useThemeStore` (which respects system `prefers-color-scheme`). Replaced the dual-phone side-by-side display with a single phone frame dynamically rendering in dark or light mode based on the user's OS/browser theme preference.

## Build & Test Result
- `npm run build` — zero TypeScript errors, zero warnings.
- `dotnet test` — 38/38 tests passed.

---

## Follow-up Prompt 7 — Mobile Responsiveness Audit & Optimization

> Please audit and review the mobile responsiveness across all pages and screens. Specifically, the dashboard / main landing view immediately following user login does not appear to be properly optimized for mobile layouts.

*Agent produced:*
- [`frontend/src/pages/DashboardPage.tsx`](file:///d:/App/RunStreak/frontend/src/pages/DashboardPage.tsx):
  - Refactored hero CTA buttons (`Share Stats` and `Log Run`) from rigid fixed-padding `.btn-lg` to responsive button sizes (`btn-md sm:btn-lg`) with full-width flex allocation (`flex-1 sm:flex-initial`) on narrow viewports (`< sm`), preventing button crowding and horizontal overflow.
  - Converted the Rest Day Ticket purchase panel to full-width (`w-full md:w-auto`) on mobile viewports for clean card alignment.
  - Adjusted page padding (`px-3.5 sm:px-6`) and spacing throughout for small mobile screens ($320\text{px} - 390\text{px}$).
- [`frontend/src/components/ui/PersonalRecords.tsx`](file:///d:/App/RunStreak/frontend/src/components/ui/PersonalRecords.tsx):
  - Converted 3-column layout to a responsive vertical stack on mobile (`grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x`), eliminating `PB!` badge overlaps and value text clipping on small screens.
- [`frontend/src/components/ui/WeeklyProgress.tsx`](file:///d:/App/RunStreak/frontend/src/components/ui/WeeklyProgress.tsx):
  - Made goal setting form responsive (`w-full sm:w-auto sm:ml-auto`) to prevent input fields from overflowing card boundaries on mobile screens.

---

## Follow-up Prompt 8 — Unclipped Landing Showcase & Sign-In Modal

> Please optimize the layout. Currently in the logged-out state, the screenshots at the top of the mobile view are being cut off. Also, to prevent the input fields from failing to fit on the same screen, we can redesign this so that clicking the "Start Now" button triggers a modal/popup for the login form.

*Agent produced:*
- [`frontend/src/pages/LoginPage.tsx`](file:///d:/App/RunStreak/frontend/src/pages/LoginPage.tsx):
  - **Removed Height Truncation:** Removed the restrictive `h-72 overflow-hidden` container around `AppShowcase` on mobile so screenshot previews display completely in full height without any top/bottom clipping.
  - **Hero Landing Layout:** Created a hero layout with brand header, tagline ("Run. Earn. Dominate."), description, and prominent CTA buttons ("Start Now" and "MSA Marker Demo").
  - **Glassmorphic Sign-In Modal:** Clicking **"Start Now"** or **"Sign In"** triggers a glassmorphic modal dialog (`backdrop-blur-md`, `bg-slate-900/95`, close button) containing the sign-in form and MSA Marker demo card with one-click auto-fill.
