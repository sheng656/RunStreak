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
