import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios'
import { useAuthStore } from '../stores/authStore'

// ── Constants ─────────────────────────────────────────────────────────────────
const REFRESH_TOKEN_KEY = 'runstreak_refresh_token'

// ── localStorage helpers ──────────────────────────────────────────────────────
// The refresh token is persisted in localStorage so sessions survive page
// reloads. The access token lives in memory only (Zustand authStore), so a
// full page reload requires one round-trip to /auth/refresh to restore it.
export function getStoredRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

export function setStoredRefreshToken(token: string): void {
  localStorage.setItem(REFRESH_TOKEN_KEY, token)
}

export function clearStoredRefreshToken(): void {
  localStorage.removeItem(REFRESH_TOKEN_KEY)
}

// ── Axios instance ───────────────────────────────────────────────────────────
// All API calls go through this single client — never scattered fetch() calls
// in components. Centralised here so auth and error handling are applied
// consistently.
const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// ── Request interceptor: attach access token ─────────────────────────────────
// The access token lives only in the Zustand authStore (in memory).
// We read it here rather than passing it through every call site.
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ── Response interceptor: handle 401 → silent refresh → retry ───────────────
let isRefreshing = false
let refreshQueue: Array<(token: string) => void> = []

function processRefreshQueue(newToken: string) {
  refreshQueue.forEach((resolve) => resolve(newToken))
  refreshQueue = []
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest: AxiosRequestConfig & { _retry?: boolean } =
      error.config

    // Only attempt a refresh on 401, and only once per request
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      if (isRefreshing) {
        // Another refresh is in flight — queue this request to retry
        // after the refresh resolves
        return new Promise<string>((resolve) => {
          refreshQueue.push(resolve)
        }).then((newToken) => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`
          }
          return apiClient(originalRequest)
        })
      }

      isRefreshing = true

      try {
        const newToken = await refreshAccessToken()
        useAuthStore.getState().setAccessToken(newToken)
        processRefreshQueue(newToken)

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`
        }
        return apiClient(originalRequest)
      } catch {
        // Refresh failed — clear auth and redirect to login
        useAuthStore.getState().clearAuth()
        window.location.href = '/login'
        return Promise.reject(error)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  },
)

// ── Token refresh ─────────────────────────────────────────────────────────────
// Reads the refresh token from localStorage, sends it in the request body.
// The server rotates the token on use — we must save the new one.
async function refreshAccessToken(): Promise<string> {
  const refreshToken = getStoredRefreshToken()
  if (!refreshToken) {
    throw new Error('No refresh token available')
  }

  const response = await axios.post<{ accessToken: string; refreshToken: string }>(
    `${import.meta.env.VITE_API_URL ?? '/api'}/auth/refresh`,
    { refreshToken },
  )

  // Persist the rotated refresh token
  setStoredRefreshToken(response.data.refreshToken)

  return response.data.accessToken
}

// ── Typed API modules ─────────────────────────────────────────────────────────
// Each domain has its own module to keep this file manageable.
export { apiClient }
export { default as authApi } from './auth'
export { default as runsApi } from './runs'
export { default as usersApi } from './users'
export { default as leaderboardApi } from './leaderboard'
export { default as badgesApi } from './badges'
