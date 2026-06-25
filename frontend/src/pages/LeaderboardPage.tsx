import { useEffect, useState, useCallback } from 'react'
import { Trophy, Flame, MapPin, Medal } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import leaderboardApi from '../api/leaderboard'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import EmptyState from '../components/ui/EmptyState'
import type { LeaderboardEntry } from '../types/api'

export default function LeaderboardPage() {
  const { user } = useAuthStore()
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [rankType, setRankType] = useState<'points' | 'streak'>('points')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await leaderboardApi.get(rankType)
      setEntries(res.data)
    } catch {
      // Silently handle
    } finally {
      setLoading(false)
    }
  }, [rankType])

  useEffect(() => {
    load()
  }, [load])

  function getRankStyle(rank: number): string {
    if (rank === 1) return 'rank-gold'
    if (rank === 2) return 'rank-silver'
    if (rank === 3) return 'rank-bronze'
    return 'text-[hsl(var(--color-text-muted))]'
  }

  function getRankIcon(rank: number) {
    if (rank <= 3) {
      return <Medal size={20} className={getRankStyle(rank)} />
    }
    return <span className="text-sm font-medium text-[hsl(var(--color-text-muted))] w-5 text-center">{rank}</span>
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">Leaderboard</h1>
          <p className="page-subtitle">See how you stack up</p>
        </div>
      </div>

      {/* Rank type toggle */}
      <div className="flex gap-1 mb-6 bg-[hsl(var(--color-surface-2))] p-1 rounded-[var(--radius)] w-fit">
        <button
          onClick={() => setRankType('points')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-[var(--radius-sm)] text-sm font-medium transition-all ${
            rankType === 'points'
              ? 'bg-[hsl(var(--color-surface))] text-[hsl(var(--color-text))] shadow-sm'
              : 'text-[hsl(var(--color-text-muted))]'
          }`}
        >
          <Trophy size={14} />
          Points
        </button>
        <button
          onClick={() => setRankType('streak')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-[var(--radius-sm)] text-sm font-medium transition-all ${
            rankType === 'streak'
              ? 'bg-[hsl(var(--color-surface))] text-[hsl(var(--color-text))] shadow-sm'
              : 'text-[hsl(var(--color-text-muted))]'
          }`}
        >
          <Flame size={14} />
          Streaks
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <LoadingSpinner size="lg" />
        </div>
      ) : entries.length === 0 ? (
        <EmptyState
          icon={<Trophy size={48} />}
          title="No runners yet"
          description="Be the first to log a run and claim the top spot!"
        />
      ) : (
        <div className="card overflow-hidden">
          {/* Table header */}
          <div className="hidden sm:grid grid-cols-12 gap-2 px-4 py-3 border-b border-[hsl(var(--color-border))] text-xs font-medium uppercase tracking-wider text-[hsl(var(--color-text-muted))]">
            <div className="col-span-1">Rank</div>
            <div className="col-span-4">Runner</div>
            <div className="col-span-2 text-right">Points</div>
            <div className="col-span-2 text-right">Streak</div>
            <div className="col-span-3 text-right">Distance</div>
          </div>

          {/* Entries */}
          <div className="divide-y divide-[hsl(var(--color-border))]">
            {entries.map((entry, i) => {
              const isMe = user?.id === entry.userId
              return (
                <div
                  key={entry.userId}
                  className={`grid grid-cols-12 gap-2 items-center px-4 py-3 transition-colors animate-fade-in-up stagger-${Math.min(i + 1, 6)} ${
                    isMe
                      ? 'bg-[hsl(var(--color-brand)/0.05)]'
                      : 'hover:bg-[hsl(var(--color-surface-2))]'
                  }`}
                >
                  {/* Rank */}
                  <div className="col-span-2 sm:col-span-1 flex items-center justify-center">
                    {getRankIcon(entry.rank)}
                  </div>

                  {/* User info */}
                  <div className="col-span-6 sm:col-span-4 flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[hsl(var(--color-brand))] to-[hsl(var(--color-fire))] flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {entry.displayName?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div className="min-w-0">
                      <p className={`text-sm font-medium truncate ${isMe ? 'text-[hsl(var(--color-brand))]' : 'text-[hsl(var(--color-text))]'}`}>
                        {entry.displayName || entry.username}
                        {isMe && <span className="text-xs font-normal ml-1">(you)</span>}
                      </p>
                    </div>
                  </div>

                  {/* Points */}
                  <div className="col-span-4 sm:col-span-2 text-right">
                    <span className="text-sm font-semibold text-[hsl(var(--color-text))]">
                      {entry.totalPoints.toLocaleString()}
                    </span>
                    <span className="text-xs text-[hsl(var(--color-text-muted))] ml-1 hidden sm:inline">pts</span>
                  </div>

                  {/* Streak */}
                  <div className="hidden sm:flex col-span-2 items-center justify-end gap-1">
                    <Flame size={14} className={entry.currentStreak > 0 ? 'text-[hsl(var(--color-fire))]' : 'text-[hsl(var(--color-text-muted))]'} />
                    <span className="text-sm font-medium text-[hsl(var(--color-text))]">
                      {entry.currentStreak}
                    </span>
                  </div>

                  {/* Distance */}
                  <div className="hidden sm:flex col-span-3 items-center justify-end gap-1">
                    <MapPin size={14} className="text-[hsl(var(--color-text-muted))]" />
                    <span className="text-sm text-[hsl(var(--color-text))]">
                      {Number(entry.totalDistanceKm).toFixed(1)} km
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
