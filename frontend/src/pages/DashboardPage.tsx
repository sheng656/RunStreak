import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Flame, Trophy, MapPin, TrendingUp, Plus,
  Medal, Zap, CalendarDays, Shield,
} from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { useGamificationStore } from '../stores/gamificationStore'
import runsApi from '../api/runs'
import usersApi from '../api/users'
import streakFreezeApi from '../api/streakFreeze'
import StatCard from '../components/ui/StatCard'
import EmptyState from '../components/ui/EmptyState'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import WeeklyCalendar from '../components/ui/WeeklyCalendar'
import WeeklyProgress from '../components/ui/WeeklyProgress'
import MotivationalInsight from '../components/ui/MotivationalInsight'
import PersonalRecords from '../components/ui/PersonalRecords'
import toast from 'react-hot-toast'
import type { Run, UserBadge, UserStats, BadgeWithProgress } from '../types/api'

export default function DashboardPage() {
  const { user, setUser } = useAuthStore()
  const { setUserStats } = useGamificationStore()

  const [recentRuns, setRecentRuns] = useState<Run[]>([])
  const [recentBadges, setRecentBadges] = useState<UserBadge[]>([])
  const [stats, setStats] = useState<UserStats | null>(null)
  const [badgesWithProgress, setBadgesWithProgress] = useState<BadgeWithProgress[]>([])
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState(false)

  async function handlePurchaseFreeze() {
    if (!user) return
    setPurchasing(true)
    try {
      const res = await streakFreezeApi.purchase()
      toast.success(res.data.message)
      setUser({
        ...user,
        streakFreezeCount: res.data.streakFreezeCount,
        totalPoints: res.data.totalPoints,
      })
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to purchase shield.'
      toast.error(msg)
    } finally {
      setPurchasing(false)
    }
  }

  useEffect(() => {
    async function loadDashboard() {
      if (!user) return
      try {
        const [runsRes, badgesRes, statsRes, progressRes] = await Promise.all([
          runsApi.list(1, 7),  // fetch 7 most recent so we have a week's worth for calendar
          usersApi.getBadges(user.id),
          usersApi.getStats(user.id),
          usersApi.getBadgesWithProgress(),
        ])
        setRecentRuns(runsRes.data.runs)
        setRecentBadges(badgesRes.data.slice(0, 5))
        setStats(statsRes.data)
        setBadgesWithProgress(progressRes.data)
        setUserStats({
          totalPoints: user.totalPoints,
          currentStreak: user.currentStreak,
          longestStreak: user.longestStreak,
          totalDistanceKm: user.totalDistanceKm,
        })
      } catch {
        // Silently handle — stats from user profile are still available
      } finally {
        setLoading(false)
      }
    }
    loadDashboard()
  }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    )
  }

  if (!user) return null

  const streakActive = user.currentStreak > 0

  // Find the closest locked badge the user is nearest to unlocking (by percentage)
  const closestBadge = badgesWithProgress
    .filter(b => !b.isUnlocked && b.targetThreshold > 0)
    .sort((a, b) => (b.currentProgress / b.targetThreshold) - (a.currentProgress / a.targetThreshold))[0]

  const closestBadgeKmLeft =
    closestBadge && (closestBadge.category === 'distance' || closestBadge.category === 'milestone')
      ? Math.max(closestBadge.targetThreshold - closestBadge.currentProgress, 0)
      : undefined

  // Current week's run dates for the calendar (YYYY-MM-DD)
  const thisWeekRunDates = recentRuns.map(r => r.runDate)

  return (
    <div className="page-container space-y-4">
      {/* Welcome + streak hero */}
      <div className="card p-6 sm:p-8 overflow-hidden relative animate-fade-in-up">
        {/* Decorative gradient background */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            background: streakActive
              ? 'linear-gradient(135deg, hsl(25 95% 53%), hsl(35 92% 58%))'
              : 'linear-gradient(135deg, hsl(250 84% 64%), hsl(250 70% 72%))',
          }}
        />
        <div className="relative">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-[hsl(var(--color-text))]">
                Hey, {user.displayName || user.username}! 👋
              </h1>
              {/* Dynamic motivational insight replaces static subtitle */}
              <div className="mt-2">
                {stats ? (
                  <MotivationalInsight
                    user={user}
                    recentRuns={recentRuns}
                    weeklyDistanceKm={stats.weeklyDistanceKm}
                    weeklyGoalKm={stats.weeklyGoalKm}
                    closestBadgeName={closestBadge?.name}
                    closestBadgeKmLeft={closestBadgeKmLeft}
                  />
                ) : (
                  <p className="text-sm text-[hsl(var(--color-text-muted))] mt-1">
                    {streakActive
                      ? "Keep the fire burning — don't break your streak!"
                      : 'Start a streak today by logging a run.'}
                  </p>
                )}
              </div>
            </div>
            <Link to="/runs/new" className="btn btn-fire btn-lg shrink-0">
              <Plus size={18} />
              Log a Run
            </Link>
          </div>

          {/* Streak display */}
          <div className="mt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6 border-t border-[hsl(var(--color-border))/0.3] pt-6">
            <div className="flex items-center gap-4">
              <div
                className={`relative flex items-center justify-center w-20 h-20 rounded-2xl ${
                  streakActive
                    ? 'gradient-fire animate-pulse-glow'
                    : 'bg-[hsl(var(--color-surface-2))]'
                }`}
              >
                <Flame
                  size={40}
                  className={streakActive ? 'text-white animate-fire' : 'text-[hsl(var(--color-text-muted))]'}
                />
                {user.streakFreezeCount > 0 && (
                  <div className="absolute -top-2 -right-2 bg-blue-500 border-2 border-[hsl(var(--color-surface))] text-white text-xs font-black w-6 h-6 rounded-full flex items-center justify-center shadow-lg" title={`${user.streakFreezeCount} Rest Day Tickets Available`}>
                    <Shield size={12} fill="white" className="inline" />
                  </div>
                )}
              </div>
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl sm:text-5xl font-extrabold text-[hsl(var(--color-text))]">
                    {user.currentStreak}
                  </span>
                  <span className="text-lg text-[hsl(var(--color-text-muted))] font-medium">
                    day{user.currentStreak !== 1 ? 's' : ''}
                  </span>
                  {user.streakFreezeCount > 0 && (
                    <span className="inline-flex items-center gap-1 ml-2.5 px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold animate-pulse">
                      <Shield size={10} fill="currentColor" />
                      Protected
                    </span>
                  )}
                </div>
                <p className="text-sm text-[hsl(var(--color-text-muted))]">
                  Current streak · Best: {user.longestStreak} days
                </p>
              </div>
            </div>

            {/* Streak Freeze Purchase panel */}
            <div className="flex flex-col items-start md:items-end gap-1.5 bg-[hsl(var(--color-surface-2))]/30 border border-[hsl(var(--color-border))/0.5] rounded-2xl p-4 md:p-3 shrink-0">
              <div className="text-xs text-[hsl(var(--color-text-muted))] flex items-center gap-1.5 font-semibold uppercase tracking-wider">
                <Shield size={12} className="text-blue-400" />
                <span>Rest Day Tickets: <strong className="text-[hsl(var(--color-text))]">{user.streakFreezeCount} / 5</strong></span>
              </div>
              <button
                type="button"
                onClick={handlePurchaseFreeze}
                disabled={purchasing || user.streakFreezeCount >= 5 || user.totalPoints < 256}
                className="btn btn-secondary btn-sm flex items-center gap-1.5 shadow-sm text-xs py-1.5 border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-2))] hover:bg-[hsl(var(--color-border))] disabled:opacity-50"
                title="Use 256 points to purchase a rest day ticket to protect your streak."
              >
                {purchasing ? (
                  <div className="w-3.5 h-3.5 border-2 border-[hsl(var(--color-text-muted))]/30 border-t-[hsl(var(--color-text))] rounded-full animate-spin" />
                ) : (
                  <>
                    <Zap size={12} className="text-amber-500" />
                    <span>Buy Shield (256 pts)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Calendar — "Don't break the chain" */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-[hsl(var(--color-text))]">This Week</h2>
          <span className="text-xs text-[hsl(var(--color-text-muted))]">Mon – Sun</span>
        </div>
        <WeeklyCalendar runDates={thisWeekRunDates} />
      </div>

      {/* Weekly Progress bar */}
      {stats && (
        <WeeklyProgress
          weeklyDistanceKm={stats.weeklyDistanceKm}
          weeklyRunCount={stats.weeklyRunCount}
          weeklyGoalKm={stats.weeklyGoalKm}
          weeklyPoints={stats.weeklyPoints}
        />
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          icon={<Zap size={20} />}
          label="Total Points"
          value={user.totalPoints.toLocaleString()}
          accent="brand"
        />
        <StatCard
          icon={<MapPin size={20} />}
          label="Distance"
          value={`${Number(user.totalDistanceKm).toFixed(1)} km`}
          accent="success"
        />
        <StatCard
          icon={<CalendarDays size={20} />}
          label="Total Runs"
          value={user.totalRuns}
          accent="fire"
        />
        <StatCard
          icon={<TrendingUp size={20} />}
          label="Best Streak"
          value={`${user.longestStreak} days`}
          accent="warning"
        />
      </div>

      {/* Personal Records */}
      {stats && <PersonalRecords stats={stats} />}

      {/* Two-column layout: Recent Runs + Badges */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Recent Runs — 2/3 width */}
        <div className="lg:col-span-2 card overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-[hsl(var(--color-border))]">
            <h2 className="font-semibold text-[hsl(var(--color-text))]">Recent Runs</h2>
            <Link to="/runs" className="text-sm font-medium text-[hsl(var(--color-brand))] hover:underline">
              View all
            </Link>
          </div>
          {recentRuns.length === 0 ? (
            <EmptyState
              icon={<MapPin size={40} />}
              title="No runs yet"
              description="Log your first run to start earning points and building your streak."
              action={
                <Link to="/runs/new" className="btn btn-primary">
                  <Plus size={16} /> Log a Run
                </Link>
              }
            />
          ) : (
            <div className="divide-y divide-[hsl(var(--color-border))]">
              {recentRuns.slice(0, 5).map((run, i) => (
                <div
                  key={run.id}
                  className={`flex items-center gap-4 px-4 py-3 hover:bg-[hsl(var(--color-surface-2))] transition-colors animate-fade-in-up stagger-${i + 1}`}
                >
                  <div className="w-9 h-9 rounded-[var(--radius-sm)] bg-[hsl(var(--color-brand)/0.1)] flex items-center justify-center shrink-0">
                    <MapPin size={16} className="text-[hsl(var(--color-brand))]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[hsl(var(--color-text))]">
                      {Number(run.distanceKm).toFixed(2)} km
                    </p>
                    <p className="text-xs text-[hsl(var(--color-text-muted))]">
                      {new Date(run.runDate).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                      })}
                      {' · '}
                      {Number(run.durationMinutes).toFixed(0)} min
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-sm font-semibold text-[hsl(var(--color-fire))]">
                    <Zap size={14} />
                    +{run.pointsEarned}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Badges — 1/3 width */}
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-[hsl(var(--color-border))]">
            <h2 className="font-semibold text-[hsl(var(--color-text))]">Badges</h2>
            <Link to="/badges" className="text-sm font-medium text-[hsl(var(--color-brand))] hover:underline">
              View all
            </Link>
          </div>
          {recentBadges.length === 0 ? (
            <EmptyState
              icon={<Medal size={40} />}
              title="No badges yet"
              description="Log runs to unlock badges and earn bonus points."
            />
          ) : (
            <div className="p-4 space-y-3">
              {recentBadges.map((badge, i) => (
                <div
                  key={badge.badgeId}
                  className={`flex items-center gap-3 p-2 rounded-[var(--radius-sm)] hover:bg-[hsl(var(--color-surface-2))] transition-colors animate-fade-in-up stagger-${i + 1}`}
                >
                  <div className="w-9 h-9 rounded-full bg-[hsl(var(--color-fire)/0.1)] flex items-center justify-center shrink-0">
                    <Trophy size={16} className="text-[hsl(var(--color-fire))]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[hsl(var(--color-text))] truncate">
                      {badge.name}
                    </p>
                    <p className="text-xs text-[hsl(var(--color-text-muted))] truncate">
                      {badge.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
