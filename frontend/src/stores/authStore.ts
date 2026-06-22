import { create } from 'zustand'

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
  createdAt: string
}

interface AuthState {
  // The access token lives ONLY in this Zustand store — never in
  // localStorage or sessionStorage. It is intentionally lost on page reload;
  // the silent refresh flow in the API client restores it from the HttpOnly
  // refresh cookie on mount. This is the core XSS mitigation.
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

  clearAuth: () =>
    set({ accessToken: null, user: null, isAuthenticated: false }),

  setLoading: (loading) =>
    set({ isLoading: loading }),
}))
