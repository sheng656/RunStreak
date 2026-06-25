import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Timer, Calendar, FileText, Zap, Medal, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import runsApi from '../api/runs'
import { useAuthStore } from '../stores/authStore'
import usersApi from '../api/users'
import toast from 'react-hot-toast'
import type { Badge } from '../types/api'

export default function LogRunPage() {
  const navigate = useNavigate()
  const { user, setUser } = useAuthStore()

  const [form, setForm] = useState({
    distanceKm: '',
    durationMinutes: '',
    runDate: new Date().toISOString().split('T')[0],
    notes: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState<{
    pointsEarned: number
    badges: Badge[]
  } | null>(null)

  // Live pace preview
  const distance = parseFloat(form.distanceKm) || 0
  const duration = parseFloat(form.durationMinutes) || 0
  const pace = distance > 0 && duration > 0 ? (duration / distance).toFixed(2) : '—'

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  function validate(): boolean {
    const errs: Record<string, string> = {}
    const dist = parseFloat(form.distanceKm)
    const dur = parseFloat(form.durationMinutes)

    if (!form.distanceKm) errs.distanceKm = 'Distance is required'
    else if (isNaN(dist) || dist < 0.01) errs.distanceKm = 'Minimum distance is 0.01 km'
    else if (dist > 1000) errs.distanceKm = 'Maximum distance is 1000 km'

    if (!form.durationMinutes) errs.durationMinutes = 'Duration is required'
    else if (isNaN(dur) || dur < 0.1) errs.durationMinutes = 'Minimum duration is 0.1 minutes'
    else if (dur > 1440) errs.durationMinutes = 'Maximum duration is 1440 minutes (24h)'

    if (!form.runDate) errs.runDate = 'Date is required'
    else if (new Date(form.runDate) > new Date()) errs.runDate = 'Date cannot be in the future'

    if (form.notes.length > 500) errs.notes = 'Notes cannot exceed 500 characters'

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setSubmitting(true)
    try {
      const res = await runsApi.create({
        distanceKm: parseFloat(form.distanceKm),
        durationMinutes: parseFloat(form.durationMinutes),
        runDate: form.runDate,
        notes: form.notes || undefined,
      })
      setSuccess({
        pointsEarned: res.data.run.pointsEarned,
        badges: res.data.newlyUnlockedBadges || [],
      })
      // Refresh user profile to update stats
      if (user) {
        try {
          const profileRes = await usersApi.getMe()
          setUser(profileRes.data)
        } catch { /* non-critical */ }
      }
      toast.success(`Run logged! +${res.data.run.pointsEarned} points`)
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to log run. Please try again.'
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  // Success state
  if (success) {
    return (
      <div className="page-container flex items-center justify-center min-h-[60vh]">
        <div className="text-center animate-bounce-in max-w-sm">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full gradient-fire mb-4">
            <Zap size={40} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-[hsl(var(--color-text))] mb-1">
            Run Logged!
          </h2>
          <p className="text-3xl font-extrabold text-[hsl(var(--color-fire))] mb-2 animate-count-up">
            +{success.pointsEarned} pts
          </p>
          {success.badges.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-semibold text-[hsl(var(--color-text))] mb-2">
                🎉 Badge{success.badges.length > 1 ? 's' : ''} unlocked!
              </p>
              <div className="flex justify-center gap-2 flex-wrap">
                {success.badges.map((b) => (
                  <span
                    key={b.id}
                    className="badge-chip bg-[hsl(var(--color-fire)/0.1)] text-[hsl(var(--color-fire))]"
                  >
                    <Medal size={12} /> {b.name}
                  </span>
                ))}
              </div>
            </div>
          )}
          <div className="flex gap-2 justify-center mt-6">
            <button onClick={() => { setSuccess(null); setForm({ distanceKm: '', durationMinutes: '', runDate: new Date().toISOString().split('T')[0], notes: '' }) }} className="btn btn-secondary">
              Log Another
            </button>
            <Link to="/runs" className="btn btn-primary">
              View History
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link to="/" className="btn btn-ghost btn-icon">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="page-title">Log a Run</h1>
          <p className="page-subtitle">Record your run and earn points</p>
        </div>
      </div>

      {/* Pace preview */}
      {distance > 0 && duration > 0 && (
        <div className="card p-4 mb-4 flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2 text-sm text-[hsl(var(--color-text-muted))]">
            <Timer size={16} />
            Estimated pace
          </div>
          <span className="text-lg font-bold text-[hsl(var(--color-brand))]">
            {pace} min/km
          </span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="card p-6 space-y-4">
        {/* Distance */}
        <div>
          <label htmlFor="run-distance" className="label">Distance (km)</label>
          <div className="relative">
            <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--color-text-muted))]" />
            <input
              id="run-distance"
              type="number"
              step="0.01"
              min="0.01"
              max="1000"
              value={form.distanceKm}
              onChange={(e) => updateField('distanceKm', e.target.value)}
              placeholder="5.00"
              className={`input pl-9 ${errors.distanceKm ? 'input-error' : ''}`}
            />
          </div>
          {errors.distanceKm && <p className="error-text">{errors.distanceKm}</p>}
        </div>

        {/* Duration */}
        <div>
          <label htmlFor="run-duration" className="label">Duration (minutes)</label>
          <div className="relative">
            <Timer size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--color-text-muted))]" />
            <input
              id="run-duration"
              type="number"
              step="0.1"
              min="0.1"
              max="1440"
              value={form.durationMinutes}
              onChange={(e) => updateField('durationMinutes', e.target.value)}
              placeholder="25"
              className={`input pl-9 ${errors.durationMinutes ? 'input-error' : ''}`}
            />
          </div>
          {errors.durationMinutes && <p className="error-text">{errors.durationMinutes}</p>}
        </div>

        {/* Date */}
        <div>
          <label htmlFor="run-date" className="label">Date</label>
          <div className="relative">
            <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--color-text-muted))]" />
            <input
              id="run-date"
              type="date"
              value={form.runDate}
              onChange={(e) => updateField('runDate', e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className={`input pl-9 ${errors.runDate ? 'input-error' : ''}`}
            />
          </div>
          {errors.runDate && <p className="error-text">{errors.runDate}</p>}
        </div>

        {/* Notes */}
        <div>
          <label htmlFor="run-notes" className="label">
            Notes <span className="font-normal text-[hsl(var(--color-text-muted))]">(optional)</span>
          </label>
          <div className="relative">
            <FileText size={16} className="absolute left-3 top-3 text-[hsl(var(--color-text-muted))]" />
            <textarea
              id="run-notes"
              value={form.notes}
              onChange={(e) => updateField('notes', e.target.value)}
              placeholder="How did it feel? Any highlights?"
              rows={3}
              maxLength={500}
              className={`input pl-9 resize-none ${errors.notes ? 'input-error' : ''}`}
            />
          </div>
          <div className="flex justify-between items-center mt-1">
            {errors.notes ? (
              <p className="error-text">{errors.notes}</p>
            ) : (
              <span />
            )}
            <span className="text-xs text-[hsl(var(--color-text-muted))]">
              {form.notes.length}/500
            </span>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="btn btn-fire w-full btn-lg"
        >
          {submitting ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Zap size={18} />
              Log Run & Earn Points
            </>
          )}
        </button>
      </form>
    </div>
  )
}
