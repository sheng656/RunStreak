import { useState } from 'react'
import { Target, Check, ChevronDown, ChevronUp } from 'lucide-react'
import usersApi from '../../api/users'
import { useAuthStore } from '../../stores/authStore'
import toast from 'react-hot-toast'

interface WeeklyProgressProps {
  weeklyDistanceKm: number
  weeklyRunCount: number
  weeklyGoalKm: number
  weeklyPoints: number
}

const PRESET_GOALS = [10, 15, 20, 25, 30, 40, 50]

export default function WeeklyProgress({
  weeklyDistanceKm,
  weeklyRunCount,
  weeklyGoalKm,
  weeklyPoints,
}: WeeklyProgressProps) {
  const { user, setUser } = useAuthStore()
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  const progress = weeklyGoalKm > 0 ? Math.min((weeklyDistanceKm / weeklyGoalKm) * 100, 100) : 0
  const isComplete = weeklyGoalKm > 0 && weeklyDistanceKm >= weeklyGoalKm
  const remaining = Math.max(weeklyGoalKm - weeklyDistanceKm, 0)

  async function handleGoalChange(newGoal: number) {
    if (!user || newGoal === weeklyGoalKm) {
      setEditing(false)
      return
    }
    setSaving(true)
    try {
      const res = await usersApi.updateWeeklyGoal(newGoal)
      setUser(res.data)
      setEditing(false)
      toast.success(`Weekly goal set to ${newGoal} km`)
    } catch {
      toast.error('Failed to update goal')
    } finally {
      setSaving(false)
    }
  }

  const [customGoal, setCustomGoal] = useState<string>('')

  function handleCustomSubmit(e: React.FormEvent) {
    e.preventDefault()
    const val = parseFloat(customGoal)
    if (isNaN(val) || val < 1 || val > 500) {
      toast.error('Please enter a goal between 1 and 500 km')
      return
    }
    handleGoalChange(val)
  }

  return (
    <div className="card p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <Target size={16} className={`shrink-0 ${isComplete ? 'text-emerald-400' : 'text-[hsl(var(--color-brand))]'}`} />
          <h2 className="text-sm font-semibold text-[hsl(var(--color-text))] truncate">Weekly Goal</h2>
          {isComplete && (
            <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[10px] font-bold uppercase tracking-wider shrink-0">
              <Check size={9} strokeWidth={3} /> Goal reached!
            </span>
          )}
        </div>
        <button
          onClick={() => setEditing(!editing)}
          className="flex items-center gap-1 text-[11px] font-semibold text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-brand))] transition-colors shrink-0 ml-2"
        >
          Goal: {weeklyGoalKm} km
          {editing ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>
      </div>

      {/* Goal picker */}
      {editing && (
        <div className="flex flex-wrap items-center gap-1.5 animate-fade-in pt-1 border-t border-[hsl(var(--color-border))/0.4]">
          {PRESET_GOALS.map((g) => (
            <button
              key={g}
              disabled={saving}
              onClick={() => handleGoalChange(g)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                g === weeklyGoalKm
                  ? 'bg-[hsl(var(--color-brand))] border-[hsl(var(--color-brand))] text-white'
                  : 'border-[hsl(var(--color-border))] text-[hsl(var(--color-text-muted))] hover:border-[hsl(var(--color-brand)/0.5)] hover:text-[hsl(var(--color-brand))]'
              }`}
            >
              {g} km
            </button>
          ))}
          <form onSubmit={handleCustomSubmit} className="flex items-center gap-1 w-full sm:w-auto mt-1 sm:mt-0 sm:ml-auto">
            <div className="relative flex items-center flex-1 sm:flex-initial">
              <input
                type="number"
                min="1"
                max="500"
                step="0.5"
                placeholder="Custom"
                value={customGoal}
                onChange={(e) => setCustomGoal(e.target.value)}
                className="w-full sm:w-20 px-2 py-1 text-xs rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface))] text-[hsl(var(--color-text))] focus:border-[hsl(var(--color-brand))] focus:outline-none"
              />
              <span className="absolute right-2 text-[10px] text-[hsl(var(--color-text-muted))] pointer-events-none">km</span>
            </div>
            <button
              type="submit"
              disabled={saving || !customGoal}
              className="btn btn-primary btn-sm text-xs py-1 px-3 shrink-0"
            >
              Set
            </button>
          </form>
        </div>
      )}

      {/* Progress bar */}
      <div className="space-y-1.5">
        <div className="h-3 bg-[hsl(var(--color-surface-2))] rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              isComplete
                ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]'
                : 'bg-gradient-to-r from-[hsl(var(--color-brand))] to-[hsl(var(--color-fire))]'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-xs text-[hsl(var(--color-text-muted))]">
          <span>
            <strong className="text-[hsl(var(--color-text))]">{Number(weeklyDistanceKm).toFixed(1)} km</strong>
            {' '}/{' '}{weeklyGoalKm} km goal
          </span>
          <span className="flex gap-2 sm:gap-3">
            <span>{weeklyRunCount} run{weeklyRunCount !== 1 ? 's' : ''}</span>
            {weeklyPoints > 0 && <span className="text-[hsl(var(--color-fire))] font-semibold">+{weeklyPoints} pts</span>}
          </span>
        </div>
      </div>

      {/* Completion or remaining message */}
      {!isComplete && remaining > 0 && remaining <= weeklyGoalKm && (
        <p className="text-[11px] text-[hsl(var(--color-text-muted))]">
          {remaining.toFixed(1)} km left to hit your goal
        </p>
      )}
    </div>
  )
}
