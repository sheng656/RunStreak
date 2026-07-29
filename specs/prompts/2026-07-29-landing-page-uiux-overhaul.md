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
