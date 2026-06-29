# RunStreak — Frontend Application

This directory contains the React + TypeScript Single Page Application (SPA) for **RunStreak**, a gamified running habit builder.

## Tech Stack & Architecture

- **Framework**: React 18 + TypeScript + Vite
- **Routing**: React Router v6
- **State Management**: **Zustand** (Advanced Requirement #1)
  - Split stores: `authStore`, `themeStore`, `runStore`, and `gamificationStore` under `src/stores/`
  - Keeps Access Token in-memory only (never persisted to `localStorage` or `sessionStorage` for XSS protection)
- **Styling**: **Tailwind CSS v4** (Advanced Requirement #2)
  - Persistent Light/Dark theme switching using the Tailwind `dark` variant (custom theme toggler cycles and syncs with OS system preferences)
- **HTTP Client**: Axios with centralized interception under `src/api/client.ts`
  - Attaches `Bearer` access tokens automatically
  - Handles silent refresh on `401 Unauthorized` responses via rotate-on-use cookies
  - Handles Double-Submit Anti-CSRF verification by echoing the `csrf_token` cookie back as the `X-CSRF-Token` header on refresh requests (Advanced Security measure)
- **Testing**: Vitest + React Testing Library

## Getting Started Locally

### Prerequisites
- Node.js 18+
- npm (comes with Node.js)

### Installation
1. Navigate to this directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a local environment variables file:
   ```bash
   cp .env.example .env.local
   ```
   *(Or create `.env.local` manually with `VITE_API_URL=https://localhost:5001/api` representing your local backend URL).*

### Running in Development Mode
```bash
npm run dev
```
Open [http://localhost:5173/](http://localhost:5173/) in your browser.

### Running Unit Tests
```bash
npm run test
```

## Production Build & Deployment

To build the static files ready for deployment on Vercel or other hosts:
```bash
npm run build
```
This outputs compiled, optimized HTML/CSS/JS artifacts into the `dist/` directory.

### Host Integration
- **Platform**: Vercel Hobby Tier
- **Routing rewrite rule**: Handled via `vercel.json` to route all virtual path requests to `index.html` (supporting React Router client-side path resolution)
