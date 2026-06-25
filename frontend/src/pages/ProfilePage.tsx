import { useEffect, useState, type FormEvent } from 'react'
import {
  User, MapPin, Timer, Flame, TrendingUp,
  CalendarDays, Zap, Trophy, Save,
} from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import usersApi from '../api/users'
import StatCard from '../components/ui/StatCard'
import ThemeToggle from '../components/ui/ThemeToggle'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import toast from 'react-hot-toast'
import type { UserStats } from '../types/api'

export default function ProfilePage() {
  const { user, setUser } = useAuthStore()
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)

  // Edit form
  const [editing, setEditing] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '')
      setAvatarUrl(user.avatarUrl || '')
    }
  }, [user])

  useEffect(() => {
    async function load() {
      if (!user) return
      try {
        const res = await usersApi.getStats(user.id)
        setStats(res.data)
      } catch {
        // Silently handle
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user])

  async function handleSave(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await usersApi.updateMe({
        displayName: displayName.trim(),
        avatarUrl: avatarUrl.trim() || undefined,
      })
      setUser(res.data)
      setEditing(false)
      toast.success('Profile updated!')
    } catch {
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  if (!user) return null

  return (
    <div className="page-container max-w-3xl mx-auto">
      {/* Profile header */}
      <div className="card p-6 sm:p-8 mb-6 animate-fade-in-up">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[hsl(var(--color-brand))] to-[hsl(var(--color-fire))] flex items-center justify-center text-white text-2xl font-bold shrink-0">
            {user.displayName?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-[hsl(var(--color-text))] truncate">
              {user.displayName || user.username}
            </h1>
            <p className="text-sm text-[hsl(var(--color-text-muted))]">
              @{user.username} · Member since {new Date(user.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
            </p>
          </div>
          {!editing && (
            <button onClick={() => setEditing(true)} className="btn btn-secondary btn-sm">
              Edit
            </button>
          )}
        </div>

        {/* Edit form */}
        {editing && (
          <form onSubmit={handleSave} className="space-y-4 p-4 rounded-[var(--radius)] bg-[hsl(var(--color-surface-2))] animate-fade-in">
            <div>
              <label htmlFor="profile-display-name" className="label">Display Name</label>
              <input
                id="profile-display-name"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="input"
                maxLength={100}
              />
            </div>
            <div>
              <label htmlFor="profile-avatar" className="label">Avatar URL</label>
              <input
                id="profile-avatar"
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://example.com/avatar.jpg"
                className="input"
              />
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={saving} className="btn btn-primary btn-sm">
                {saving ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Save size={14} /> Save
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditing(false)
                  setDisplayName(user.displayName || '')
                  setAvatarUrl(user.avatarUrl || '')
                }}
                className="btn btn-ghost btn-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Stats */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner text="Loading stats..." />
        </div>
      ) : stats ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <StatCard icon={<CalendarDays size={20} />} label="Total Runs" value={stats.totalRuns} accent="brand" />
          <StatCard icon={<MapPin size={20} />} label="Total Distance" value={`${Number(stats.totalDistanceKm).toFixed(1)} km`} accent="success" />
          <StatCard icon={<Timer size={20} />} label="Avg Pace" value={`${Number(stats.averagePaceMinPerKm).toFixed(2)} min/km`} accent="warning" />
          <StatCard icon={<TrendingUp size={20} />} label="Longest Run" value={`${Number(stats.longestRunKm).toFixed(1)} km`} accent="fire" />
          <StatCard icon={<Flame size={20} />} label="Current Streak" value={`${stats.currentStreak} days`} accent="fire" />
          <StatCard icon={<Trophy size={20} />} label="Best Streak" value={`${stats.longestStreak} days`} accent="warning" />
          <StatCard icon={<Zap size={20} />} label="Total Points" value={user.totalPoints.toLocaleString()} accent="brand" />
          <StatCard icon={<MapPin size={20} />} label="Avg Distance" value={`${Number(stats.averageDistanceKm).toFixed(1)} km`} accent="success" />
        </div>
      ) : null}

      {/* Theme setting */}
      <div className="card p-5">
        <h2 className="font-semibold text-[hsl(var(--color-text))] mb-3">Appearance</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-[hsl(var(--color-text))]">Theme</p>
            <p className="text-xs text-[hsl(var(--color-text-muted))]">Choose your preferred theme</p>
          </div>
          <ThemeToggle />
        </div>
      </div>
    </div>
  )
}
