import { NavLink } from 'react-router-dom'
import { LayoutDashboard, MapPin, Trophy, Medal, User } from 'lucide-react'

const sidebarLinks = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/runs', icon: MapPin, label: 'My Runs' },
  { to: '/badges', icon: Medal, label: 'Badges' },
  { to: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
  { to: '/profile', icon: User, label: 'Profile' },
]

export default function Sidebar() {
  return (
    <aside className="hidden lg:flex flex-col w-56 shrink-0 border-r border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface))] min-h-[calc(100vh-3.5rem)]">
      <nav className="flex flex-col gap-0.5 p-3 pt-4">
        {sidebarLinks.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-[var(--radius-sm)] text-sm font-medium transition-all no-underline ${
                isActive
                  ? 'bg-[hsl(var(--color-brand)/0.1)] text-[hsl(var(--color-brand))]'
                  : 'text-[hsl(var(--color-text-secondary))] hover:bg-[hsl(var(--color-surface-2))] hover:text-[hsl(var(--color-text))]'
              }`
            }
          >
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
