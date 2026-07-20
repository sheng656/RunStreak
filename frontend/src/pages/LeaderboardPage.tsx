import { useEffect, useState, useCallback } from 'react'
import { Trophy, Flame, MapPin, Medal, Calendar, TrendingUp, TrendingDown, Minus, User } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import leaderboardApi from '../api/leaderboard'
import usersApi from '../api/users'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import EmptyState from '../components/ui/EmptyState'
import type { LeaderboardEntry, UserStats } from '../types/api'

function DeltaBadge({ current, previous, unit = '' }: { current: number; previous: number; unit?: string }) {
  const diff = current - previous
  if (previous === 0 && current === 0) return <span className="text-xs text-[hsl(var(--color-text-muted))]">–</span>
  if (diff === 0) return (
    <span className="inline-flex items-center gap-0.5 text-xs text-[hsl(var(--color-text-muted))]">
      <Minus size={10} /> same
    </span>
  )
  const isUp = diff > 0
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-semibold ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
      {isUp ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
      {isUp ? '+' : ''}{typeof diff === 'number' && !Number.isInteger(diff) ? diff.toFixed(1) : diff}{unit}
    </span>
  )
}

export default function LeaderboardPage() {
  const { user } = useAuthStore()
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [rankType, setRankType] = useState<'points' | 'streak' | 'weekly'>('points')
  const [userStats, setUserStats] = useState<UserStats | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [lbRes, statsRes] = await Promise.all([
        leaderboardApi.get(rankType),
        user ? usersApi.getStats(user.id) : Promise.resolve(null),
      ])
      setEntries(lbRes.data)
      if (statsRes) setUserStats(statsRes.data)
    } catch {
      // Silently handle
    } finally {
      setLoading(false)
    }
  }, [rankType, user])

  useEffect(() => {
    Promise.resolve().then(() => {
      load()
    })
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

  // Determine current user's rank from entries
  const myEntry = user ? entries.find(e => e.userId === user.id) : null

  return (
    <div className="page-container space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Leaderboard</h1>
          <p className="page-subtitle">See how you stack up</p>
        </div>
      </div>

      {/* Rank type toggle */}
      <div className="flex gap-1 bg-[hsl(var(--color-surface-2))] p-1 rounded-[var(--radius)] w-fit">
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
        <button
          onClick={() => setRankType('weekly')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-[var(--radius-sm)] text-sm font-medium transition-all ${
            rankType === 'weekly'
              ? 'bg-[hsl(var(--color-surface))] text-[hsl(var(--color-text))] shadow-sm'
              : 'text-[hsl(var(--color-text-muted))]'
          }`}
        >
          <Calendar size={14} />
          7-Day
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
            {rankType === 'streak' ? (
              <>
                <div className="col-span-2 text-right">Streak</div>
                <div className="col-span-2 text-right">Points</div>
              </>
            ) : (
              <>
                <div className="col-span-2 text-right">{rankType === 'weekly' ? '7-Day Pts' : 'Points'}</div>
                <div className="col-span-2 text-right">Streak</div>
              </>
            )}
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
                    {entry.avatarUrl ? (
                      <img
                        src={entry.avatarUrl}
                        alt={entry.displayName || entry.username}
                        className="w-8 h-8 rounded-full object-cover border border-[hsl(var(--color-border))]/60 shrink-0"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[hsl(var(--color-brand))] to-[hsl(var(--color-fire))] flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {entry.displayName?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className={`text-sm font-medium truncate ${isMe ? 'text-[hsl(var(--color-brand))]' : 'text-[hsl(var(--color-text))]'}`}>
                        {entry.displayName || entry.username}
                        {isMe && <span className="text-xs font-normal ml-1">(you)</span>}
                      </p>
                    </div>
                  </div>

                  {/* Dynamic Columns based on rankType */}
                  {rankType === 'streak' ? (
                    <>
                      {/* Primary metric: Streak */}
                      <div className="col-span-4 sm:col-span-2 text-right flex items-center justify-end gap-1">
                        <Flame size={14} className={entry.currentStreak > 0 ? 'text-[hsl(var(--color-fire))]' : 'text-[hsl(var(--color-text-muted))]'} />
                        <span className="text-sm font-semibold text-[hsl(var(--color-text))]">
                          {entry.currentStreak}
                        </span>
                        <span className="text-xs text-[hsl(var(--color-text-muted))] hidden sm:inline">days</span>
                      </div>
                      {/* Secondary metric: Points (Desktop only) */}
                      <div className="hidden sm:block col-span-2 text-right">
                        <span className="text-sm font-medium text-[hsl(var(--color-text))]">
                          {entry.totalPoints.toLocaleString()}
                        </span>
                        <span className="text-xs text-[hsl(var(--color-text-muted))] ml-1">pts</span>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Primary metric: Points */}
                      <div className="col-span-4 sm:col-span-2 text-right">
                        <span className="text-sm font-semibold text-[hsl(var(--color-text))]">
                          {entry.totalPoints.toLocaleString()}
                        </span>
                        <span className="text-xs text-[hsl(var(--color-text-muted))] ml-1">
                          {rankType === 'weekly' ? 'pts (7d)' : 'pts'}
                        </span>
                      </div>
                      {/* Secondary metric: Streak (Desktop only) */}
                      <div className="hidden sm:flex col-span-2 items-center justify-end gap-1">
                        <Flame size={14} className={entry.currentStreak > 0 ? 'text-[hsl(var(--color-fire))]' : 'text-[hsl(var(--color-text-muted))]'} />
                        <span className="text-sm font-medium text-[hsl(var(--color-text))]">
                          {entry.currentStreak}
                        </span>
                      </div>
                    </>
                  )}

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

      {/* ─── You vs Your Past Self ─── (always visible) */}
      {userStats && user && (
        <div className="card overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-[hsl(var(--color-border))]">
            <User size={15} className="text-[hsl(var(--color-brand))]" />
            <h2 className="text-sm font-semibold text-[hsl(var(--color-text))]">You vs Your Past Self</h2>
            {myEntry && (
              <span className="ml-auto text-xs text-[hsl(var(--color-text-muted))]">
                Your rank: <strong className="text-[hsl(var(--color-text))]">#{myEntry.rank}</strong>
              </span>
            )}
          </div>

          <div className="p-4">
            <p className="text-xs text-[hsl(var(--color-text-muted))] mb-4">
              This week vs last week — the only real competition is yesterday's you.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Distance */}
              <div className="flex flex-col gap-1 p-3 rounded-xl bg-[hsl(var(--color-surface-2))]/50 border border-[hsl(var(--color-border))]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--color-text-muted))] flex items-center gap-1">
                  <MapPin size={10} /> Distance
                </span>
                <span className="text-lg font-black text-[hsl(var(--color-text))]">
                  {Number(userStats.weeklyDistanceKm).toFixed(1)} km
                </span>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-[hsl(var(--color-text-muted))]">
                    last: {Number(userStats.lastWeekDistanceKm).toFixed(1)} km
                  </span>
                  <DeltaBadge current={userStats.weeklyDistanceKm} previous={userStats.lastWeekDistanceKm} unit=" km" />
                </div>
              </div>

              {/* Runs */}
              <div className="flex flex-col gap-1 p-3 rounded-xl bg-[hsl(var(--color-surface-2))]/50 border border-[hsl(var(--color-border))]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--color-text-muted))] flex items-center gap-1">
                  <Calendar size={10} /> Runs
                </span>
                <span className="text-lg font-black text-[hsl(var(--color-text))]">
                  {userStats.weeklyRunCount}
                </span>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-[hsl(var(--color-text-muted))]">
                    last: {userStats.lastWeekRunCount}
                  </span>
                  <DeltaBadge current={userStats.weeklyRunCount} previous={userStats.lastWeekRunCount} />
                </div>
              </div>

              {/* Points */}
              <div className="flex flex-col gap-1 p-3 rounded-xl bg-[hsl(var(--color-surface-2))]/50 border border-[hsl(var(--color-border))]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--color-text-muted))] flex items-center gap-1">
                  <Trophy size={10} /> Points
                </span>
                <span className="text-lg font-black text-[hsl(var(--color-fire))]">
                  {userStats.weeklyPoints}
                </span>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-[hsl(var(--color-text-muted))]">
                    last: {userStats.lastWeekPoints}
                  </span>
                  <DeltaBadge current={userStats.weeklyPoints} previous={userStats.lastWeekPoints} />
                </div>
              </div>

              {/* Streak */}
              <div className="flex flex-col gap-1 p-3 rounded-xl bg-[hsl(var(--color-surface-2))]/50 border border-[hsl(var(--color-border))]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--color-text-muted))] flex items-center gap-1">
                  <Flame size={10} /> Streak
                </span>
                <span className="text-lg font-black text-[hsl(var(--color-text))]">
                  {user.currentStreak} days
                </span>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-[hsl(var(--color-text-muted))]">
                    best: {user.longestStreak}d
                  </span>
                  <DeltaBadge current={user.currentStreak} previous={user.longestStreak > user.currentStreak ? user.longestStreak : user.currentStreak} />
                </div>
              </div>
            </div>

            {/* Best week callout */}
            {userStats.bestWeekDistanceKm > 0 && (
              <div className="mt-3 px-3 py-2 rounded-lg bg-amber-500/5 border border-amber-500/15 flex items-center gap-2">
                <Trophy size={13} className="text-amber-400 shrink-0" />
                <p className="text-xs text-[hsl(var(--color-text-muted))]">
                  Your best week ever: <strong className="text-amber-400">{Number(userStats.bestWeekDistanceKm).toFixed(1)} km</strong>
                  {userStats.weeklyDistanceKm >= userStats.bestWeekDistanceKm && userStats.bestWeekDistanceKm > 0 && (
                    <span className="ml-1 text-emerald-400 font-semibold"> — you're matching it this week! 🏆</span>
                  )}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
