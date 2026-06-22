import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useThemeStore } from './stores/themeStore'
import { useAuthStore } from './stores/authStore'
import authApi from './api/auth'

// Pages — to be implemented in Phase 4/5
// Using placeholder components for Phase 0 so the app compiles and routes work
function PlaceholderPage({ name }: { name: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[hsl(var(--color-bg))]">
      <div className="text-center">
        <h1 className="text-4xl font-bold gradient-text mb-4">RunStreak</h1>
        <p className="text-[hsl(var(--color-text-muted))]">{name} — coming soon</p>
      </div>
    </div>
  )
}

function App() {
  // Initialize theme from persisted preference on mount
  const { theme, setTheme } = useThemeStore()
  const { setAccessToken, setLoading, clearAuth } = useAuthStore()

  // Apply persisted theme on first render
  useEffect(() => {
    setTheme(theme)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Silent refresh on mount — attempt to restore session from the HttpOnly
  // refresh cookie. If it succeeds, the user stays logged in across page reloads
  // without storing the access token anywhere persistent.
  useEffect(() => {
    async function attemptSilentRefresh() {
      try {
        const res = await authApi.refresh()
        setAccessToken(res.data.accessToken)
        // TODO (Phase 4): fetch user profile after successful refresh
      } catch {
        // No valid session — user needs to log in
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
        <Route path="/" element={<PlaceholderPage name="Dashboard" />} />
        <Route path="/login" element={<PlaceholderPage name="Login" />} />
        <Route path="/register" element={<PlaceholderPage name="Register" />} />
        <Route path="/runs" element={<PlaceholderPage name="Run History" />} />
        <Route path="/runs/new" element={<PlaceholderPage name="Log a Run" />} />
        <Route path="/badges" element={<PlaceholderPage name="Badges & Achievements" />} />
        <Route path="/leaderboard" element={<PlaceholderPage name="Leaderboard" />} />
        <Route path="/profile" element={<PlaceholderPage name="Profile" />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
