import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Compass, ChevronRight, Award, CheckCircle2 } from 'lucide-react'
import challengesApi from '../../api/challenges'
import type { ActiveChallengeSummary } from '../../types/api'

export default function ActiveChallengeWidget() {
  const [activeChallenge, setActiveChallenge] = useState<ActiveChallengeSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadActive() {
      try {
        const res = await challengesApi.getActive()
        setActiveChallenge(res.data)
      } catch {
        // Silently handle
      } finally {
        setLoading(false)
      }
    }
    loadActive()
  }, [])

  if (loading) return null

  if (!activeChallenge) {
    return (
      <div className="card p-4 flex flex-col sm:flex-row items-center justify-between gap-3 bg-gradient-to-r from-[hsl(var(--color-surface))] to-[hsl(var(--color-surface-2))] border-[hsl(var(--color-border))]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[hsl(var(--color-brand))/0.1] text-[hsl(var(--color-brand))] flex items-center justify-center shrink-0">
            <Compass size={20} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[hsl(var(--color-text))]">No Active Challenge</h3>
            <p className="text-xs text-[hsl(var(--color-text-muted))]">Pick a classic long-distance route to start earning progress toward special badges.</p>
          </div>
        </div>
        <Link to="/challenges" className="btn btn-secondary btn-sm shrink-0 flex items-center gap-1">
          Explore Routes
          <ChevronRight size={14} />
        </Link>
      </div>
    )
  }

  const isNearCompletion = activeChallenge.completionPercentage >= 80

  return (
    <div className="card p-4 space-y-3 relative overflow-hidden bg-gradient-to-r from-[hsl(var(--color-surface))] via-[hsl(var(--color-surface-2))]/40 to-[hsl(var(--color-surface))]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[hsl(var(--color-brand))] to-indigo-600 text-white flex items-center justify-center shadow-sm shrink-0">
            <Compass size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[hsl(var(--color-text))]">{activeChallenge.name}</h3>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[hsl(var(--color-brand))]/10 text-[hsl(var(--color-brand))] border border-[hsl(var(--color-brand))]/20">
                {activeChallenge.rarity}
              </span>
            </div>
            <p className="text-xs text-[hsl(var(--color-text-muted))] truncate max-w-xs sm:max-w-md">
              {activeChallenge.description}
            </p>
          </div>
        </div>
        <Link to="/challenges" className="text-xs font-semibold text-[hsl(var(--color-brand))] hover:underline flex items-center gap-0.5 shrink-0">
          View All <ChevronRight size={12} />
        </Link>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5 pt-1">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-[hsl(var(--color-text))]">
            {activeChallenge.progressDistanceKm} / {activeChallenge.targetDistanceKm} km
          </span>
          <span className="font-bold text-[hsl(var(--color-brand))]">
            {activeChallenge.completionPercentage}%
          </span>
        </div>
        <div className="h-2.5 bg-[hsl(var(--color-surface-3))] rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              isNearCompletion
                ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_10px_rgba(52,211,153,0.4)]'
                : 'bg-gradient-to-r from-[hsl(var(--color-brand))] to-indigo-500'
            }`}
            style={{ width: `${activeChallenge.completionPercentage}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[11px] text-[hsl(var(--color-text-muted))]">
          <span>{activeChallenge.remainingDistanceKm} km remaining</span>
          {activeChallenge.remainingDistanceKm === 0 ? (
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 size={11} /> Completed!
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <Award size={11} className="text-amber-500" /> Challenge Badge awaiting finish
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
