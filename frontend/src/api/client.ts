import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios'
import { useAuthStore } from '../stores/authStore'

// ── Axios instance ───────────────────────────────────────────────────────────
// All API calls go through this single client — never scattered fetch() calls
// in components. Centralised here so auth, CSRF, and error handling are
// applied consistently.
const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
  withCredentials: true, // required for the HttpOnly refresh cookie
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
// Reads the csrf_token cookie (non-HttpOnly, set by the server) and echoes it
// as X-CSRF-Token header. The refresh cookie is HttpOnly and auto-attached.
// Together, this implements the double-submit CSRF pattern — see ADR 001.
async function refreshAccessToken(): Promise<string> {
  const csrfToken = getCsrfCookie()

  const response = await axios.post<{ accessToken: string }>(
    `${import.meta.env.VITE_API_URL ?? '/api'}/auth/refresh`,
    {},
    {
      withCredentials: true,
      headers: {
        'X-CSRF-Token': csrfToken ?? '',
      },
    },
  )

  return response.data.accessToken
}

function getCsrfCookie(): string | null {
  const match = document.cookie
    .split('; ')
    .find((row) => row.startsWith('csrf_token='))
  return match ? decodeURIComponent(match.split('=')[1]) : null
}

// ── Typed API modules ─────────────────────────────────────────────────────────
// Each domain has its own module to keep this file manageable.
export { apiClient }
export { default as authApi } from './auth'
export { default as runsApi } from './runs'
export { default as usersApi } from './users'
export { default as leaderboardApi } from './leaderboard'
export { default as badgesApi } from './badges'
