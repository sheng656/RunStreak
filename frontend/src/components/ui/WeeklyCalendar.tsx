import { Shield } from 'lucide-react'

interface WeeklyCalendarProps {
  // ISO date strings (YYYY-MM-DD) of days the user ran
  runDates: string[]
  // ISO date strings of days where a freeze was used
  freezeDates?: string[]
  className?: string
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function getThisWeekDates(): Date[] {
  const today = new Date()
  // Day of week: 0=Sun, 1=Mon, ... → Monday-anchored offset
  const daysSinceMonday = (today.getDay() + 6) % 7
  const monday = new Date(today)
  monday.setDate(today.getDate() - daysSinceMonday)
  monday.setHours(0, 0, 0, 0)

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })
}

function toLocalDateString(date: Date): string {
  // Produce YYYY-MM-DD in local time (matches run date stored by user)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export default function WeeklyCalendar({ runDates, freezeDates = [], className = '' }: WeeklyCalendarProps) {
  const weekDates = getThisWeekDates()
  const todayStr = toLocalDateString(new Date())

  const runSet = new Set(runDates.map(d => d.split('T')[0]))
  const freezeSet = new Set(freezeDates.map(d => d.split('T')[0]))

  return (
    <div className={`flex items-center gap-1.5 sm:gap-2.5 ${className}`}>
      {weekDates.map((date, i) => {
        const dateStr = toLocalDateString(date)
        const isToday = dateStr === todayStr
        const hasRun = runSet.has(dateStr)
        const hasFroze = freezeSet.has(dateStr)
        const isFuture = dateStr > todayStr

        return (
          <div key={dateStr} className="flex flex-col items-center gap-1 flex-1">
            <span className={`text-[10px] font-semibold uppercase tracking-wider ${
              isToday ? 'text-[hsl(var(--color-brand))]' : 'text-[hsl(var(--color-text-muted))]'
            }`}>
              {DAYS[i]}
            </span>

            {/* Day circle */}
            <div
              title={
                hasRun ? `Ran on ${date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`
                : hasFroze ? 'Rest day (shield used)'
                : isFuture ? 'Upcoming'
                : 'Rest day'
              }
              className={`relative w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all duration-300 ${
                isToday ? 'ring-2 ring-[hsl(var(--color-brand))] ring-offset-1 ring-offset-[hsl(var(--color-surface))]' : ''
              } ${
                hasRun
                  ? 'gradient-fire shadow-[0_0_10px_hsl(var(--color-fire)/0.4)] scale-105'
                  : hasFroze
                  ? 'bg-blue-500/20 border border-blue-500/40'
                  : isFuture
                  ? 'bg-[hsl(var(--color-surface-2))]/30 border border-dashed border-[hsl(var(--color-border))/0.4]'
                  : 'bg-[hsl(var(--color-surface-2))] border border-[hsl(var(--color-border))]'
              }`}
            >
              {hasRun ? (
                <span className="text-white text-xs font-bold">✓</span>
              ) : hasFroze ? (
                <Shield size={12} className="text-blue-400" fill="currentColor" />
              ) : (
                <span className={`text-xs font-medium ${isFuture ? 'text-[hsl(var(--color-border))]' : 'text-[hsl(var(--color-text-muted))]'}`}>
                  {date.getDate()}
                </span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
