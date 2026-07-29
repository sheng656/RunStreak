# 013 — Shareable Brag Cards (Canvas API)

**Status:** decided  
**Date:** 2026-07-29

## Context
Gamification apps thrive on viral loop sharing (social proof). Users want a visually striking, branded card summarizing their streak, points, unlocked badges, or individual run stats to post on social media or send to friends.

## Decision
Implement a pure client-side brag card feature using the HTML5 Canvas API (`HTMLCanvasElement`) and standard 1200×630px OpenGraph layout.

- **Variants Supported:**
  1. Profile Summary Card (total distance, streak, points, longest streak)
  2. Badge Unlock Card (badge icon, name, description, rarity tier, unlocker)
  3. Run Completion Card (distance, pace, duration, points earned, active NZ route challenge name)
- **Image Generation:** Off-screen canvas drawing with dark theme gradient aesthetics, glowing borders, typography, and dynamic QR code pointing to `https://runstreak.sheng.nz`.
- **Export Options:** Direct PNG download (`canvas.toBlob()`) and formatted text clipboard copy (`navigator.clipboard.writeText()`).

## Why
- Zero third-party canvas library overhead (`html2canvas` is 150KB+ and often renders modern CSS flex/grid incorrectly).
- Instant, pixel-perfect 1200×630 rendering ready for social media shares.
- No backend image rendering cost or server compute needed.
