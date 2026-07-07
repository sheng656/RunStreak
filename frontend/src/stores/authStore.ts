import { create } from 'zustand'
import { clearStoredRefreshToken } from '../api/client'

// ── Types ──────────────────────────────────────────────────────────────────
export interface UserProfile {
  id: string
  username: string
  email: string
  displayName: string
  avatarUrl: string | null
  totalPoints: number
  currentStreak: number
  longestStreak: number
  totalDistanceKm: number
  totalRuns: number
  streakFreezeCount: number
  createdAt: string
}

interface AuthState {
  // The access token lives ONLY in this Zustand store — never in
  // localStorage or sessionStorage. It is intentionally lost on page reload;
  // the silent refresh flow in App.tsx restores it from the refresh token
  // stored in localStorage. Keeping the short-lived access token in memory
  // limits the blast radius of an XSS attack to at most one 15-minute window.
  accessToken: string | null
  user: UserProfile | null
  isAuthenticated: boolean
  isLoading: boolean

  // Actions
  setAccessToken: (token: string) => void
  setUser: (user: UserProfile) => void
  clearAuth: () => void
  setLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  isAuthenticated: false,
  isLoading: true, // true on startup — waiting for silent refresh attempt

  setAccessToken: (token) =>
    set({ accessToken: token, isAuthenticated: true }),

  setUser: (user) =>
    set({ user }),

  // Clears both the in-memory access token and the persisted refresh token
  // so logout is complete on all fronts.
  clearAuth: () => {
    clearStoredRefreshToken()
    set({ accessToken: null, user: null, isAuthenticated: false })
  },

  setLoading: (loading) =>
    set({ isLoading: loading }),
}))
