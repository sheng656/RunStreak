import { NavLink } from 'react-router-dom'
import { LayoutDashboard, MapPin, PlusCircle, Medal, Trophy } from 'lucide-react'

const bottomNavItems = [
  { to: '/', icon: LayoutDashboard, label: 'Home' },
  { to: '/runs', icon: MapPin, label: 'Runs' },
  { to: '/runs/new', icon: PlusCircle, label: 'Log', isCenter: true },
  { to: '/badges', icon: Medal, label: 'Badges' },
  { to: '/leaderboard', icon: Trophy, label: 'Board' },
]

export default function BottomNav() {
  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-50 glass border-t border-[hsl(var(--color-border)/0.5)]">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {bottomNavItems.map(({ to, icon: Icon, label, isCenter }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-3 py-1 no-underline transition-colors ${
                isCenter
                  ? '' // Center button gets special styling below
                  : isActive
                    ? 'text-[hsl(var(--color-brand))]'
                    : 'text-[hsl(var(--color-text-muted))]'
              }`
            }
          >
            {isCenter ? (
              <div className="flex items-center justify-center w-12 h-12 -mt-4 rounded-full gradient-fire text-white shadow-lg shadow-[hsl(var(--color-fire)/0.3)]">
                <Icon size={24} />
              </div>
            ) : (
              <>
                <Icon size={20} />
                <span className="text-[10px] font-medium">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
