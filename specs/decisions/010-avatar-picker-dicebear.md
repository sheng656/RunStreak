# 010 — Avatar Picker with DiceBear Library

**Status:** decided
**Date:** 2026-07-07

## Context
Users need a way to personalize their profile without copy-pasting raw image URLs. They need a curated library of visual avatars built directly into the UI.

## Decision
We implemented a client-side visual selector using the **DiceBear** API:
1. Defined 48 distinct seed strings.
2. Grouped them into 3 visual styles: Characters (`adventurer`), Robots (`bottts`), and Emojis (`fun-emoji`).
3. Stored the resulting DiceBear URLs (`https://api.dicebear.com/9.x/{style}/svg?seed={seed}`) in the database.
4. Rendered the circular avatars in the Profile card, Navbar, and Leaderboard listings with a letter-initial fallback for users who haven't selected one.

## Why
- **No storage costs**: The avatars are generated dynamically from deterministic seeds, so we only need to store a simple string URL.
- **Zero package footprint**: Using the DiceBear HTTP API requires no heavy external React/JavaScript packages to package SVGs, keeping bundle size small.
- **Engaging gamified feel**: The 48 curated styles provide a wide variety of fun, high-quality, and modern options matching the gamification theme.
