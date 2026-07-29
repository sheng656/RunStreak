# 2026-07-29 — Shareable Cards, Password Reset (Resend), Demo Account UX & Homepage Showcase

## User Prompt (Verbatim)

> Before doing anything else, open and read AGENTS.md and plan.md at the repo root, both in full. Then, before writing or editing any code, reply with a short confirmation covering these points so I can verify you actually read them and didn't skim...
>
> Shareable Achievement / Challenge / Monthly Summary Cards: Implement a shareable card feature by designing a visually appealing "brag card" component (including username, completed route name / badge icon, total distance, pace, streak count, and the RunStreak logo/QR code). Users can download the image or copy the formatted share text to their clipboard with one click.
> Password Reset Flow: Use Resend's email service to implement password reset requests for unauthenticated users. For logged-in users, resetting/changing the password must require validating their current password.
> Demo Account UX on Login Page: On the homepage/login screen, display the demo account option as a compact button with a dropdown arrow. Clicking the dropdown reveals an introduction and allows users to auto-fill the preset testuser credentials. Also include a quick reset button for the test account password to prevent an issue where User A changes the password, locking User B out.
> Documentation: Ensure all of these features and enhancements are documented in the appropriate sections of the README.md file.
> Store the Resend API key in the .env file (or backend environment variables) so that sensitive credentials remain secure and are not committed to source control.
> Add a carousel animation featuring screenshots of key pages in their mobile views on the homepage to make it more visually appealing with simple words. Replace browser tab favicon with application icon.

## What the Agent Produced

1. **Shareable Brag Cards (`ShareCard.tsx`, `useShareCard.ts`):**
   - Built a custom Canvas API drawing hook supporting Profile Summary, Badge Unlock, and Run Completion card variants.
   - Generates OpenGraph 1200×630px social media images with dark theme gradient aesthetics, glowing borders, brand logo, user stats/badges/runs, and QR code pointing to `https://runstreak.sheng.nz`.
   - Added PNG download button and clipboard formatted text copy.
   - Integrated Share buttons across Dashboard, Badge Celebration, Badges Page, and Run History.

2. **Password Reset Flow (`ResendEmailService`, `PasswordResetToken`, `AuthController`, `ForgotPasswordPage`, `ResetPasswordPage`, `ProfilePage`):**
   - Created `PasswordResetToken` EF model with SHA-256 hash storage and 15-minute expiry.
   - Implemented `ResendEmailService` using Resend REST API (`noreply@runstreak.sheng.nz`).
   - Endpoints: `POST /api/auth/forgot-password`, `POST /api/auth/reset-password`, `POST /api/auth/change-password`.
   - Added `ForgotPasswordPage` and `ResetPasswordPage` frontend routes.
   - Added collapsible Security/Change Password section to `ProfilePage.tsx` requiring current password validation.

3. **Demo Account UX & Quick Reset (`LoginPage.tsx`, `AuthService.cs`):**
   - Redesigned login page demo section into a compact button with expandable dropdown panel (`ChevronDown`/`ChevronUp`).
   - Added "Quick Reset" button calling `POST /api/auth/reset-demo` to restore `testuser` password back to `Test1234!`.

4. **Login/Register Homepage Showcase (`AppShowcase.tsx`):**
   - Created a mobile device mockup carousel component featuring animated slides for Dashboard, AI OCR Import, 48 Badges, NZ Route Challenges, and Leaderboard.
   - Configured responsive two-column split layout on login and register pages.

5. **Favicon Multi-Format (`index.html`):**
   - Enhanced SVG favicon tags and application theme metadata in `index.html`.

6. **Documentation & Spec Updates:**
   - Created ADRs `013-shareable-brag-cards.md` and `014-password-reset-resend.md`.
   - Updated `README.md` and `plan.md`.

## Follow-up / Corrections During Session
- Fixed raw string literal interpolation syntax (`$$"""`) in `ResendEmailService.cs`.
- Resolved TypeScript `title` property type check on Lucide `<Sparkles />` icon in `BadgesPage.tsx`.
- Added missing `authApi` import in `ProfilePage.tsx`.
