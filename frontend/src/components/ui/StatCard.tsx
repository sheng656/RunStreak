import type { ReactNode } from 'react'

interface StatCardProps {
  icon: ReactNode
  label: string
  value: string | number
  subtitle?: string
  /** Optional accent color for the icon background */
  accent?: 'brand' | 'fire' | 'success' | 'warning'
  className?: string
}

const accentColors = {
  brand: 'bg-[hsl(var(--color-brand)/0.1)] text-[hsl(var(--color-brand))]',
  fire: 'bg-[hsl(var(--color-fire)/0.1)] text-[hsl(var(--color-fire))]',
  success: 'bg-[hsl(var(--color-success)/0.1)] text-[hsl(var(--color-success))]',
  warning: 'bg-[hsl(var(--color-warning)/0.1)] text-[hsl(var(--color-warning))]',
}

export default function StatCard({ icon, label, value, subtitle, accent = 'brand', className = '' }: StatCardProps) {
  return (
    <div className={`card p-4 sm:p-5 animate-fade-in-up ${className}`}>
      <div className="flex items-start gap-3">
        <div className={`p-2.5 rounded-[var(--radius-sm)] ${accentColors[accent]}`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-[hsl(var(--color-text-muted))] uppercase tracking-wider">
            {label}
          </p>
          <p className="text-2xl font-bold text-[hsl(var(--color-text))] mt-0.5 animate-count-up">
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-[hsl(var(--color-text-muted))] mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
