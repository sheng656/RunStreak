import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, Flame } from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import authApi from '../../api/auth'
import ThemeToggle from '../ui/ThemeToggle'

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const { user, clearAuth } = useAuthStore()

  async function handleLogout() {
    try {
      await authApi.logout()
    } catch {
      // Best-effort — clear local state regardless
    }
    clearAuth()
  }

  const navLinks = [
    { to: '/', label: 'Dashboard' },
    { to: '/runs', label: 'Runs' },
    { to: '/badges', label: 'Badges' },
    { to: '/leaderboard', label: 'Leaderboard' },
  ]

  return (
    <header className="sticky top-0 z-50 glass border-b border-[hsl(var(--color-border)/0.5)]">
      <div className="max-w-screen-xl mx-auto flex items-center justify-between h-14 px-4">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2 text-decoration-none group">
          <Flame
            size={24}
            className="text-[hsl(var(--color-fire))] group-hover:animate-fire transition-transform"
          />
          <span className="text-lg font-bold gradient-text">RunStreak</span>
        </Link>

        {/* Desktop nav links — hidden below lg */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-3 py-1.5 rounded-[var(--radius-sm)] text-sm font-medium transition-colors no-underline ${
                location.pathname === link.to
                  ? 'bg-[hsl(var(--color-brand)/0.1)] text-[hsl(var(--color-brand))]'
                  : 'text-[hsl(var(--color-text-secondary))] hover:text-[hsl(var(--color-text))] hover:bg-[hsl(var(--color-surface-2))]'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right section */}
        <div className="flex items-center gap-2">
          <ThemeToggle compact />

          {/* User menu — desktop */}
          {user && (
            <div className="hidden lg:flex items-center gap-2">
              <Link
                to="/profile"
                className="flex items-center gap-2 px-2 py-1 rounded-[var(--radius-sm)] hover:bg-[hsl(var(--color-surface-2))] transition-colors no-underline"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[hsl(var(--color-brand))] to-[hsl(var(--color-fire))] flex items-center justify-center text-white text-xs font-bold">
                  {user.displayName?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <span className="text-sm font-medium text-[hsl(var(--color-text))]">
                  {user.displayName || user.username}
                </span>
              </Link>
              <button onClick={handleLogout} className="btn btn-ghost btn-sm text-[hsl(var(--color-text-muted))]">
                Log out
              </button>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            className="lg:hidden btn btn-ghost btn-icon"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <div className="lg:hidden absolute top-14 inset-x-0 glass border-b border-[hsl(var(--color-border)/0.5)] animate-slide-down">
          <nav className="flex flex-col p-4 gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={`px-3 py-2.5 rounded-[var(--radius-sm)] text-sm font-medium no-underline ${
                  location.pathname === link.to
                    ? 'bg-[hsl(var(--color-brand)/0.1)] text-[hsl(var(--color-brand))]'
                    : 'text-[hsl(var(--color-text-secondary))]'
                }`}
              >
                {link.label}
              </Link>
            ))}
            {user && (
              <>
                <Link
                  to="/profile"
                  onClick={() => setMobileOpen(false)}
                  className="px-3 py-2.5 rounded-[var(--radius-sm)] text-sm font-medium text-[hsl(var(--color-text-secondary))] no-underline"
                >
                  Profile
                </Link>
                <button
                  onClick={() => {
                    setMobileOpen(false)
                    handleLogout()
                  }}
                  className="px-3 py-2.5 rounded-[var(--radius-sm)] text-sm font-medium text-[hsl(var(--color-danger))] text-left"
                >
                  Log out
                </button>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
