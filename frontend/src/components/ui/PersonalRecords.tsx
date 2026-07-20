import { TrendingUp, MapPin, CalendarDays, Trophy } from 'lucide-react'
import { formatPace } from '../../utils/formatPace'
import type { UserStats } from '../../types/api'

interface PersonalRecordsProps {
  stats: UserStats
  isNewPBPace?: boolean
  isNewPBDistance?: boolean
  isNewPBWeek?: boolean
}

interface RecordItem {
  icon: React.ReactNode
  label: string
  value: string
  subLabel?: string
  isPB?: boolean
  accent: string
}

export default function PersonalRecords({ stats, isNewPBPace, isNewPBDistance, isNewPBWeek }: PersonalRecordsProps) {
  const records: RecordItem[] = [
    {
      icon: <MapPin size={16} />,
      label: 'Longest Run',
      value: `${Number(stats.longestRunKm).toFixed(2)} km`,
      isPB: isNewPBDistance,
      accent: 'text-emerald-400',
    },
    {
      icon: <TrendingUp size={16} />,
      label: 'Best Pace',
      value: stats.averagePaceMinPerKm > 0 ? formatPace(stats.averagePaceMinPerKm) : '–',
      subLabel: 'overall avg',
      isPB: isNewPBPace,
      accent: 'text-[hsl(var(--color-brand))]',
    },
    {
      icon: <CalendarDays size={16} />,
      label: 'Best Week',
      value: `${Number(stats.bestWeekDistanceKm).toFixed(1)} km`,
      isPB: isNewPBWeek,
      accent: 'text-amber-400',
    },
  ]

  if (stats.totalRuns === 0) return null

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[hsl(var(--color-border))]">
        <Trophy size={15} className="text-amber-400" />
        <h2 className="text-sm font-semibold text-[hsl(var(--color-text))]">Personal Records</h2>
      </div>
      <div className="grid grid-cols-3 divide-x divide-[hsl(var(--color-border))]">
        {records.map((rec) => (
          <div key={rec.label} className="relative flex flex-col items-center justify-center py-4 px-2 text-center gap-1 hover:bg-[hsl(var(--color-surface-2))] transition-colors">
            {rec.isPB && (
              <span className="absolute top-2 right-2 text-[9px] font-black uppercase text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1 rounded tracking-wider animate-pulse">
                PB!
              </span>
            )}
            <span className={`${rec.accent}`}>{rec.icon}</span>
            <p className="text-xs text-[hsl(var(--color-text-muted))] font-medium">{rec.label}</p>
            <p className="text-base font-bold text-[hsl(var(--color-text))]">{rec.value}</p>
            {rec.subLabel && (
              <p className="text-[10px] text-[hsl(var(--color-text-muted))]">{rec.subLabel}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
