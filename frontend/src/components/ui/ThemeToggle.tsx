import { Sun, Moon, Monitor } from 'lucide-react'
import { useThemeStore } from '../../stores/themeStore'

export default function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { theme, setTheme } = useThemeStore()

  const options = [
    { value: 'light' as const, icon: Sun, label: 'Light' },
    { value: 'system' as const, icon: Monitor, label: 'System' },
    { value: 'dark' as const, icon: Moon, label: 'Dark' },
  ]

  if (compact) {
    // Simple cycling toggle for navbar
    const next = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light'
    const CurrentIcon = options.find((o) => o.value === theme)!.icon
    return (
      <button
        onClick={() => setTheme(next)}
        className="btn btn-ghost btn-icon"
        aria-label={`Switch to ${next} theme`}
        title={`Current: ${theme}. Click for ${next}`}
      >
        <CurrentIcon size={18} />
      </button>
    )
  }

  // Full 3-option segmented control for settings
  return (
    <div className="flex rounded-[var(--radius)] bg-[hsl(var(--color-surface-2))] p-1 gap-0.5">
      {options.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-sm)] text-sm font-medium transition-all ${
            theme === value
              ? 'bg-[hsl(var(--color-surface))] text-[hsl(var(--color-text))] shadow-sm'
              : 'text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-text))]'
          }`}
          aria-label={`${label} theme`}
        >
          <Icon size={14} />
          <span>{label}</span>
        </button>
      ))}
    </div>
  )
}
