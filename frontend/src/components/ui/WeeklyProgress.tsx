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

  return (
    <div className="card p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target size={16} className={isComplete ? 'text-emerald-400' : 'text-[hsl(var(--color-brand))]'} />
          <h2 className="text-sm font-semibold text-[hsl(var(--color-text))]">This Week</h2>
          {isComplete && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
              <Check size={9} strokeWidth={3} /> Goal reached!
            </span>
          )}
        </div>
        <button
          onClick={() => setEditing(!editing)}
          className="flex items-center gap-1 text-[10px] font-semibold text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-brand))] transition-colors"
        >
          Goal: {weeklyGoalKm} km
          {editing ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>
      </div>

      {/* Goal picker */}
      {editing && (
        <div className="flex flex-wrap gap-1.5 animate-fade-in">
          {PRESET_GOALS.map((g) => (
            <button
              key={g}
              disabled={saving}
              onClick={() => handleGoalChange(g)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
                g === weeklyGoalKm
                  ? 'bg-[hsl(var(--color-brand))] border-[hsl(var(--color-brand))] text-white'
                  : 'border-[hsl(var(--color-border))] text-[hsl(var(--color-text-muted))] hover:border-[hsl(var(--color-brand)/0.5)] hover:text-[hsl(var(--color-brand))]'
              }`}
            >
              {g} km
            </button>
          ))}
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
          <span className="flex gap-3">
            <span>{weeklyRunCount} run{weeklyRunCount !== 1 ? 's' : ''}</span>
            {weeklyPoints > 0 && <span className="text-[hsl(var(--color-fire))]">+{weeklyPoints} pts</span>}
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
