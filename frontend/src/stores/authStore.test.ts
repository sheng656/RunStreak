import { describe, it, expect, beforeEach } from 'vitest'
import { useAuthStore, type UserProfile } from './authStore'

const mockUser: UserProfile = {
  id: 'user-123',
  username: 'runner1',
  email: 'runner1@example.com',
  displayName: 'Runner One',
  avatarUrl: null,
  totalPoints: 100,
  currentStreak: 5,
  longestStreak: 10,
  totalDistanceKm: 25.5,
  totalRuns: 6,
  createdAt: new Date().toISOString(),
}

describe('authStore', () => {
  beforeEach(() => {
    // Reset Zustand store state before each test
    const { clearAuth, setLoading } = useAuthStore.getState()
    clearAuth()
    setLoading(true)
  })

  it('should initialize with default values', () => {
    const state = useAuthStore.getState()
    expect(state.accessToken).toBeNull()
    expect(state.user).toBeNull()
    expect(state.isAuthenticated).toBe(false)
    expect(state.isLoading).toBe(true)
  })

  it('should set access token and set isAuthenticated to true', () => {
    const { setAccessToken } = useAuthStore.getState()
    setAccessToken('mock-access-token')

    const state = useAuthStore.getState()
    expect(state.accessToken).toBe('mock-access-token')
    expect(state.isAuthenticated).toBe(true)
  })

  it('should set user profile', () => {
    const { setUser } = useAuthStore.getState()
    setUser(mockUser)

    const state = useAuthStore.getState()
    expect(state.user).toEqual(mockUser)
  })

  it('should clear authentication state on clearAuth', () => {
    const { setAccessToken, setUser, clearAuth } = useAuthStore.getState()
    setAccessToken('some-token')
    setUser(mockUser)

    clearAuth()

    const state = useAuthStore.getState()
    expect(state.accessToken).toBeNull()
    expect(state.user).toBeNull()
    expect(state.isAuthenticated).toBe(false)
  })

  it('should set loading state', () => {
    const { setLoading } = useAuthStore.getState()
    setLoading(false)

    const state = useAuthStore.getState()
    expect(state.isLoading).toBe(false)
  })
})
