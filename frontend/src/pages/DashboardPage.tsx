import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Flame, Trophy, MapPin, Timer, TrendingUp, Plus,
  Medal, Zap, CalendarDays,
} from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { useGamificationStore } from '../stores/gamificationStore'
import runsApi from '../api/runs'
import usersApi from '../api/users'
import StatCard from '../components/ui/StatCard'
import EmptyState from '../components/ui/EmptyState'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import type { Run, UserBadge } from '../types/api'

export default function DashboardPage() {
  const { user } = useAuthStore()
  const { setUserStats } = useGamificationStore()

  const [recentRuns, setRecentRuns] = useState<Run[]>([])
  const [recentBadges, setRecentBadges] = useState<UserBadge[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadDashboard() {
      if (!user) return
      try {
        const [runsRes, badgesRes] = await Promise.all([
          runsApi.list(1, 5),
          usersApi.getBadges(user.id),
        ])
        setRecentRuns(runsRes.data.runs)
        setRecentBadges(badgesRes.data.slice(0, 5))
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

  return (
    <div className="page-container space-y-6">
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
              <p className="text-sm text-[hsl(var(--color-text-muted))] mt-1">
                {streakActive
                  ? "Keep the fire burning — don't break your streak!"
                  : 'Start a streak today by logging a run.'}
              </p>
            </div>
            <Link to="/runs/new" className="btn btn-fire btn-lg shrink-0">
              <Plus size={18} />
              Log a Run
            </Link>
          </div>

          {/* Streak display */}
          <div className="mt-6 flex items-center gap-4">
            <div
              className={`flex items-center justify-center w-20 h-20 rounded-2xl ${
                streakActive
                  ? 'gradient-fire animate-pulse-glow'
                  : 'bg-[hsl(var(--color-surface-2))]'
              }`}
            >
              <Flame
                size={40}
                className={streakActive ? 'text-white animate-fire' : 'text-[hsl(var(--color-text-muted))]'}
              />
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl sm:text-5xl font-extrabold text-[hsl(var(--color-text))]">
                  {user.currentStreak}
                </span>
                <span className="text-lg text-[hsl(var(--color-text-muted))] font-medium">
                  day{user.currentStreak !== 1 ? 's' : ''}
                </span>
              </div>
              <p className="text-sm text-[hsl(var(--color-text-muted))]">
                Current streak · Best: {user.longestStreak} days
              </p>
            </div>
          </div>
        </div>
      </div>

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
              {recentRuns.map((run, i) => (
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
