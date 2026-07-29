import { useEffect, useState, type FormEvent } from 'react'
import {
  MapPin, Timer, Flame, TrendingUp,
  CalendarDays, Zap, Trophy, Save, Edit3,
} from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import usersApi from '../api/users'
import authApi from '../api/auth'
import StatCard from '../components/ui/StatCard'
import ThemeToggle from '../components/ui/ThemeToggle'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import AvatarPicker from '../components/ui/AvatarPicker'
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
      Promise.resolve().then(() => {
        setDisplayName(user.displayName || '')
        setAvatarUrl(user.avatarUrl || '')
      })
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
        <div className="flex flex-col sm:flex-row items-center gap-6 mb-6 pb-6 border-b border-[hsl(var(--color-border))]/30">
          {/* Avatar display */}
          <div className="relative group shrink-0">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.displayName || user.username}
                className="w-24 h-24 rounded-full object-cover border-4 border-[hsl(var(--color-brand))]/20 shadow-md transition-all group-hover:scale-105"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[hsl(var(--color-brand))] to-[hsl(var(--color-fire))] flex items-center justify-center text-white text-3xl font-black shadow-md transition-all group-hover:scale-105">
                {user.displayName?.charAt(0)?.toUpperCase() || user.username?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            )}
          </div>

          <div className="flex-1 text-center sm:text-left min-w-0">
            <h1 className="text-2xl font-black text-[hsl(var(--color-text))] truncate">
              {user.displayName || user.username}
            </h1>
            <p className="text-sm text-[hsl(var(--color-text-muted))] mt-1">
              @{user.username} · Member since {new Date(user.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
            </p>
          </div>
          
          {!editing && (
            <button onClick={() => setEditing(true)} className="btn btn-secondary btn-sm flex items-center gap-1.5 shrink-0">
              <Edit3 size={14} />
              Edit Profile
            </button>
          )}
        </div>

        {/* Edit form */}
        {editing && (
          <form onSubmit={handleSave} className="space-y-6 p-5 rounded-2xl bg-[hsl(var(--color-surface-2))]/50 border border-[hsl(var(--color-border))]/20 animate-fade-in">
            <h3 className="font-bold text-sm uppercase tracking-wider text-[hsl(var(--color-text-muted))]">Edit Profile</h3>
            
            {/* Display Name Input */}
            <div className="space-y-1.5">
              <label htmlFor="profile-display-name" className="label font-semibold text-xs">Display Name</label>
              <input
                id="profile-display-name"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="input"
                maxLength={100}
                placeholder="Enter display name"
                required
              />
            </div>

            {/* Avatar Selection Picker */}
            <div className="space-y-2">
              <label className="label font-semibold text-xs">Select Avatar</label>
              <AvatarPicker
                selectedUrl={avatarUrl}
                onSelect={(url) => setAvatarUrl(url)}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2 border-t border-[hsl(var(--color-border))]/30">
              <button type="submit" disabled={saving} className="btn btn-primary btn-sm flex items-center gap-1.5">
                {saving ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Save size={14} /> Save Changes
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

      {/* Security & Password */}
      <SecuritySection />

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

function SecuritySection() {
  const { clearAuth } = useAuthStore()
  const [open, setOpen] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  async function handleChangePassword(e: FormEvent) {
    e.preventDefault()
    const errs: Record<string, string> = {}
    if (!currentPassword) errs.currentPassword = 'Current password is required'
    if (!newPassword) errs.newPassword = 'New password is required'
    else if (newPassword.length < 8) errs.newPassword = 'Password must be at least 8 characters'
    if (newPassword !== confirmPassword) errs.confirmPassword = 'Passwords do not match'

    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    setSubmitting(true)
    try {
      await authApi.changePassword(currentPassword, newPassword)
      toast.success('Password updated successfully! Please sign in with your new password.')
      clearAuth()
      window.location.href = '/login'
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to change password. Check your current password.'
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="card p-5 mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-[hsl(var(--color-text))]">Security</h2>
          <p className="text-xs text-[hsl(var(--color-text-muted))]">Manage password and account access</p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="btn btn-secondary btn-sm"
        >
          {open ? 'Hide' : 'Change Password'}
        </button>
      </div>

      {open && (
        <form onSubmit={handleChangePassword} className="mt-5 space-y-4 pt-4 border-t border-[hsl(var(--color-border))]/30 animate-fade-in">
          <div>
            <label htmlFor="current-pw" className="label font-semibold text-xs">Current Password</label>
            <input
              id="current-pw"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className={`input ${errors.currentPassword ? 'input-error' : ''}`}
              placeholder="••••••••"
            />
            {errors.currentPassword && <p className="error-text mt-1">{errors.currentPassword}</p>}
          </div>

          <div>
            <label htmlFor="new-pw" className="label font-semibold text-xs">New Password</label>
            <input
              id="new-pw"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={`input ${errors.newPassword ? 'input-error' : ''}`}
              placeholder="At least 8 characters"
            />
            {errors.newPassword && <p className="error-text mt-1">{errors.newPassword}</p>}
          </div>

          <div>
            <label htmlFor="confirm-pw" className="label font-semibold text-xs">Confirm New Password</label>
            <input
              id="confirm-pw"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`input ${errors.confirmPassword ? 'input-error' : ''}`}
              placeholder="Repeat new password"
            />
            {errors.confirmPassword && <p className="error-text mt-1">{errors.confirmPassword}</p>}
          </div>

          <div className="flex gap-2 pt-2">
            <button type="submit" disabled={submitting} className="btn btn-primary btn-sm">
              {submitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Update Password'
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                setOpen(false)
                setCurrentPassword('')
                setNewPassword('')
                setConfirmPassword('')
                setErrors({})
              }}
              className="btn btn-ghost btn-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
