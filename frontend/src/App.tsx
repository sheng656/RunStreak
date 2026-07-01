import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useThemeStore } from './stores/themeStore'
import { useAuthStore } from './stores/authStore'
import authApi from './api/auth'
import usersApi from './api/users'
import { getStoredRefreshToken, setStoredRefreshToken } from './api/client'

// Pages
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import RunHistoryPage from './pages/RunHistoryPage'
import LogRunPage from './pages/LogRunPage'
import BadgesPage from './pages/BadgesPage'
import BadgeCelebrationPage from './pages/BadgeCelebrationPage'
import LeaderboardPage from './pages/LeaderboardPage'
import ProfilePage from './pages/ProfilePage'
import NotFoundPage from './pages/NotFoundPage'

// Wrappers
import ProtectedRoute from './components/ui/ProtectedRoute'
import AppLayout from './components/layout/AppLayout'

function App() {
  // Initialize theme from persisted preference on mount
  const { theme, setTheme } = useThemeStore()
  const { setAccessToken, setUser, setLoading, clearAuth } = useAuthStore()

  // Apply persisted theme on first render
  useEffect(() => {
    setTheme(theme)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Silent refresh on mount — attempt to restore session from the stored refresh token.
  // Reads from localStorage: if no token is present, the user needs to log in.
  // On success: saves the rotated refresh token back to localStorage, restores access token in memory.
  useEffect(() => {
    async function attemptSilentRefresh() {
      const storedRefreshToken = getStoredRefreshToken()
      if (!storedRefreshToken) {
        // No session to restore — skip the network call
        setLoading(false)
        return
      }

      try {
        const res = await authApi.refresh(storedRefreshToken)
        // Persist rotated refresh token (old one is now revoked server-side)
        setStoredRefreshToken(res.data.refreshToken)
        setAccessToken(res.data.accessToken)

        // Fetch user profile after successful refresh
        const userRes = await usersApi.getMe()
        setUser(userRes.data)
      } catch {
        // Refresh token invalid or expired — user needs to log in
        clearAuth()
      } finally {
        setLoading(false)
      }
    }

    attemptSilentRefresh()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected App Routes (inside AppLayout shell) */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="runs" element={<RunHistoryPage />} />
          <Route path="runs/new" element={<LogRunPage />} />
          <Route path="badges" element={<BadgesPage />} />
          <Route path="leaderboard" element={<LeaderboardPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>

        <Route
          path="/badges/celebration"
          element={
            <ProtectedRoute>
              <BadgeCelebrationPage />
            </ProtectedRoute>
          }
        />

        {/* 404 Route */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Toaster
        position="top-right"
        toastOptions={{
          className: 'glass text-[hsl(var(--color-text))] border-[hsl(var(--color-border))]',
          duration: 4000,
          style: {
            background: 'hsl(var(--color-surface) / 0.8)',
            color: 'hsl(var(--color-text))',
            border: '1px solid hsl(var(--color-border) / 0.5)',
            backdropFilter: 'blur(12px)',
          },
        }}
      />
    </BrowserRouter>
  )
}

export default App
