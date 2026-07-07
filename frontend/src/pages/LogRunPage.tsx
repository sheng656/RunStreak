import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  MapPin, Timer, Calendar, FileText, Zap, ArrowLeft,
  Activity, Upload, X, CheckCircle
} from 'lucide-react'
import runsApi from '../api/runs'
import { useAuthStore } from '../stores/authStore'
import usersApi from '../api/users'
import toast from 'react-hot-toast'
import type { Badge, ScreenshotImportResponse } from '../types/api'
import { formatPace } from '../utils/formatPace'

// ── Perceived Effort (RPE) configuration ────────────────────────────────────
// Based on Borg CR10 RPE scale, adapted for running with 5 levels.
// Colors follow a traffic-light gradient from cool (easy) to hot (hard).
const EFFORT_LEVELS = [
  {
    value: 1,
    label: 'Very Easy',
    emoji: '😴',
    description: 'Like a walk — could sing the whole time',
    color: 'from-emerald-400/20 to-emerald-500/20 border-emerald-400/50 text-emerald-400',
    activeColor: 'from-emerald-400/40 to-emerald-500/40 border-emerald-400 text-emerald-300',
    dot: 'bg-emerald-400',
  },
  {
    value: 2,
    label: 'Easy',
    emoji: '🙂',
    description: 'Comfortable, full conversation possible',
    color: 'from-green-400/20 to-teal-500/20 border-green-400/50 text-green-400',
    activeColor: 'from-green-400/40 to-teal-500/40 border-green-400 text-green-300',
    dot: 'bg-green-400',
  },
  {
    value: 3,
    label: 'Moderate',
    emoji: '😤',
    description: 'Sweating, breathing deeper, short phrases only',
    color: 'from-yellow-400/20 to-amber-500/20 border-yellow-400/50 text-yellow-400',
    activeColor: 'from-yellow-400/40 to-amber-500/40 border-yellow-400 text-yellow-300',
    dot: 'bg-yellow-400',
  },
  {
    value: 4,
    label: 'Hard',
    emoji: '😰',
    description: 'Breathless, muscles fatiguing, can\'t finish sentences',
    color: 'from-orange-400/20 to-red-400/20 border-orange-400/50 text-orange-400',
    activeColor: 'from-orange-400/40 to-red-400/40 border-orange-400 text-orange-300',
    dot: 'bg-orange-400',
  },
  {
    value: 5,
    label: 'Very Hard',
    emoji: '🥵',
    description: 'All-out effort, near max heart rate',
    color: 'from-red-500/20 to-rose-600/20 border-red-500/50 text-red-400',
    activeColor: 'from-red-500/40 to-rose-600/40 border-red-500 text-red-300',
    dot: 'bg-red-500',
  },
]

// ── Initial form state ───────────────────────────────────────────────────────
const getTodayLocal = () => new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0]

const initialForm = {
  distanceKm: '',
  durationHours: '',
  durationMinutes: '',
  durationSeconds: '',
  runDate: getTodayLocal(),
  notes: '',
  perceivedEffort: null as number | null,
}

export default function LogRunPage() {
  const { user, setUser } = useAuthStore()
  const navigate = useNavigate()

  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  // Screenshot import state
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importPreview, setImportPreview] = useState<string | null>(null)
  const [importing, setImporting] = useState(false)
  const [importedFields, setImportedFields] = useState<Set<string>>(new Set())
  const [showImport, setShowImport] = useState(false)

  // Live pace preview — formatted as M:SS/km
  const distance = parseFloat(form.distanceKm) || 0
  const durationHours = parseInt(form.durationHours) || 0
  const durationMinutes = parseInt(form.durationMinutes) || 0
  const durationSeconds = parseInt(form.durationSeconds) || 0
  const totalDurationMinutes = durationHours * 60 + durationMinutes + durationSeconds / 60
  const rawPace = distance > 0 && totalDurationMinutes > 0 ? totalDurationMinutes / distance : 0
  const paceDisplay = formatPace(rawPace)

  function updateField(field: string, value: string | number | null) {
    setForm((prev) => ({ ...prev, [field]: value }))
    const errorKeyToClear = field.startsWith('duration') ? 'duration' : field
    if (errors[errorKeyToClear]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[errorKeyToClear]
        return next
      })
    }
  }

  function validate(): boolean {
    const errs: Record<string, string> = {}
    const dist = parseFloat(form.distanceKm)

    const h = parseInt(form.durationHours) || 0
    const m = parseInt(form.durationMinutes) || 0
    const s = parseInt(form.durationSeconds) || 0
    const totalMinutes = h * 60 + m + s / 60

    if (!form.distanceKm) errs.distanceKm = 'Distance is required'
    else if (isNaN(dist) || dist < 0.01) errs.distanceKm = 'Minimum distance is 0.01 km'
    else if (dist > 1000) errs.distanceKm = 'Maximum distance is 1000 km'

    if (form.durationHours === '' && form.durationMinutes === '' && form.durationSeconds === '') {
      errs.duration = 'Duration is required'
    } else if (isNaN(totalMinutes) || totalMinutes < 0.1) {
      errs.duration = 'Minimum duration is 0.1 minutes (6 seconds)'
    } else if (totalMinutes > 1440) {
      errs.duration = 'Maximum duration is 1440 minutes (24h)'
    }

    if (!form.runDate) errs.runDate = 'Date is required'
    else if (form.runDate > getTodayLocal()) errs.runDate = 'Date cannot be in the future'

    if (form.notes.length > 500) errs.notes = 'Notes cannot exceed 500 characters'

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setSubmitting(true)
    try {
      const h = parseInt(form.durationHours) || 0
      const m = parseInt(form.durationMinutes) || 0
      const s = parseInt(form.durationSeconds) || 0
      const totalMinutes = h * 60 + m + s / 60

      const res = await runsApi.create({
        distanceKm: parseFloat(form.distanceKm),
        durationMinutes: totalMinutes,
        runDate: form.runDate,
        notes: form.notes || undefined,
        perceivedEffort: form.perceivedEffort ?? undefined,
      })
      // Refresh user profile to update stats
      if (user) {
        try {
          const profileRes = await usersApi.getMe()
          setUser(profileRes.data)
        } catch { /* non-critical */ }
      }

      const newBadges: Badge[] = res.data.newlyUnlockedBadges || []
      toast.success(`Run logged! +${res.data.run.pointsEarned} points`)

      if (newBadges.length > 0) {
        // Navigate to badge celebration page, passing badge data via router state
        navigate('/badges/celebration', { state: { badges: newBadges, pointsEarned: res.data.run.pointsEarned } })
      } else {
        navigate('/runs')
      }
    } catch (err: unknown) {
      const axiosErr = err as { code?: string; message?: string; response?: { status?: number; data?: { message?: string } } }
      let msg = axiosErr.response?.data?.message || axiosErr.message || 'Failed to log run. Please try again.'
      if (axiosErr.code === 'ECONNABORTED' || msg.toLowerCase().includes('timeout')) {
        msg = 'Request timed out (database cold-start). Your run might have been saved. Please check your history before submitting again!'
      }
      toast.error(msg, { duration: 6000 })
    } finally {
      setSubmitting(false)
    }
  }

  // ── Screenshot import handlers ────────────────────────────────────────────
  function handleFileSelect(file: File) {
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (PNG, JPG, WEBP, etc.)')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image must be under 10MB')
      return
    }
    setImportFile(file)
    setImportPreview(URL.createObjectURL(file))
  }

  async function handleImport() {
    if (!importFile) return
    setImporting(true)
    try {
      const res = await runsApi.importScreenshot(importFile)
      const data: ScreenshotImportResponse = res.data

      if (!data.success) {
        toast.error(data.errorMessage || 'Could not extract run data. Please enter manually.')
        return
      }

      const autoFilled = new Set<string>()

      // Pre-fill required fields
      if (data.distanceKm) {
        updateField('distanceKm', data.distanceKm.toFixed(2))
        autoFilled.add('distanceKm')
      }
      if (data.durationMinutes) {
        const totalSecs = Math.round(data.durationMinutes * 60)
        const h = Math.floor(totalSecs / 3600)
        const m = Math.floor((totalSecs % 3600) / 60)
        const s = totalSecs % 60

        updateField('durationHours', h > 0 ? h.toString() : '0')
        updateField('durationMinutes', m.toString().padStart(2, '0'))
        updateField('durationSeconds', s.toString().padStart(2, '0'))
        autoFilled.add('duration')
      }
      if (data.activityDate) {
        updateField('runDate', data.activityDate.split('T')[0])
        autoFilled.add('runDate')
      }

      setImportedFields(autoFilled)
      setShowImport(false)

      const platform = data.detectedPlatform ? ` from ${data.detectedPlatform}` : ''
      toast.success(`Data imported${platform}! Please verify and submit.`)
    } catch {
      toast.error('Import failed. Try again or enter your run manually.')
    } finally {
      setImporting(false)
    }
  }

  function clearImport() {
    setImportFile(null)
    setImportPreview(null)
    setImportedFields(new Set())
    if (importPreview) URL.revokeObjectURL(importPreview)
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

      {/* Screenshot Import Section */}
      <div className="card p-4 mb-4">
        <button
          type="button"
          onClick={() => setShowImport(!showImport)}
          className="flex items-center gap-2 w-full text-left text-sm font-medium text-[hsl(var(--color-brand))] hover:opacity-80 transition-opacity"
        >
          <Upload size={16} />
          Import from screenshot (Strava, Garmin, Nike, etc.)
          <span className="ml-auto text-[hsl(var(--color-text-muted))]">{showImport ? '▲' : '▼'}</span>
        </button>

        {showImport && (
          <div className="mt-4 animate-fade-in">
            {!importFile ? (
              <label
                className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-[hsl(var(--color-border))] rounded-xl p-8 cursor-pointer hover:border-[hsl(var(--color-brand)/0.6)] hover:bg-[hsl(var(--color-brand)/0.05)] transition-all"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault()
                  const file = e.dataTransfer.files[0]
                  if (file) handleFileSelect(file)
                }}
              >
                <Upload size={32} className="text-[hsl(var(--color-text-muted))]" />
                <div className="text-center">
                  <p className="text-sm font-medium text-[hsl(var(--color-text))]">Drop your screenshot here</p>
                  <p className="text-xs text-[hsl(var(--color-text-muted))] mt-1">
                    Supports Strava, Garmin, Nike Run Club, Keep, Huawei Health
                  </p>
                  <p className="text-xs text-[hsl(var(--color-text-muted))]">PNG, JPG, WEBP · Max 10MB</p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleFileSelect(file)
                  }}
                />
                <span className="btn btn-secondary btn-sm">Choose file</span>
              </label>
            ) : (
              <div className="space-y-3">
                <div className="relative">
                  <img
                    src={importPreview!}
                    alt="Screenshot preview"
                    className="w-full max-h-48 object-contain rounded-lg border border-[hsl(var(--color-border))]"
                  />
                  <button
                    type="button"
                    onClick={clearImport}
                    className="absolute top-2 right-2 btn btn-ghost btn-icon btn-sm bg-[hsl(var(--color-surface)/0.9)]"
                  >
                    <X size={14} />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={handleImport}
                  disabled={importing}
                  className="btn btn-primary w-full"
                >
                  {importing ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Zap size={16} />
                      Extract run data with AI
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Pace preview */}
      {distance > 0 && totalDurationMinutes > 0 && (
        <div className="card p-4 mb-4 flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2 text-sm text-[hsl(var(--color-text-muted))]">
            <Timer size={16} />
            Average pace
          </div>
          <span className="text-lg font-bold text-[hsl(var(--color-brand))]">
            {paceDisplay}
          </span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="card p-6 space-y-5">
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
              className={`input pl-9 ${importedFields.has('distanceKm') ? 'ring-1 ring-[hsl(var(--color-brand))]' : ''} ${errors.distanceKm ? 'input-error' : ''}`}
            />
            {importedFields.has('distanceKm') && (
              <CheckCircle size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--color-brand))]" />
            )}
          </div>
          {errors.distanceKm && <p className="error-text">{errors.distanceKm}</p>}
        </div>

        {/* Duration (Hours : Minutes : Seconds) */}
        <div>
          <label className="label">Duration (Hours : Minutes : Seconds)</label>
          <div className={`flex items-center gap-2 p-2.5 rounded-xl bg-[hsl(var(--color-surface))] border border-[hsl(var(--color-border))] ${importedFields.has('duration') ? 'ring-1 ring-[hsl(var(--color-brand))]' : ''} ${errors.duration ? 'border-red-500 ring-1 ring-red-500' : ''}`}>
            <Timer size={16} className="text-[hsl(var(--color-text-muted))] ml-1 shrink-0" />
            <div className="flex items-center gap-1.5 w-full">
              <input
                id="run-duration-hours"
                type="number"
                min="0"
                max="23"
                value={form.durationHours}
                onChange={(e) => updateField('durationHours', e.target.value)}
                placeholder="0"
                className="w-full bg-transparent text-center focus:outline-none text-[hsl(var(--color-text))] placeholder-[hsl(var(--color-text-muted))]"
              />
              <span className="text-[hsl(var(--color-text-muted))] select-none font-bold">:</span>
              <input
                id="run-duration-minutes"
                type="number"
                min="0"
                max="59"
                value={form.durationMinutes}
                onChange={(e) => updateField('durationMinutes', e.target.value)}
                placeholder="00"
                className="w-full bg-transparent text-center focus:outline-none text-[hsl(var(--color-text))] placeholder-[hsl(var(--color-text-muted))]"
              />
              <span className="text-[hsl(var(--color-text-muted))] select-none font-bold">:</span>
              <input
                id="run-duration-seconds"
                type="number"
                min="0"
                max="59"
                value={form.durationSeconds}
                onChange={(e) => updateField('durationSeconds', e.target.value)}
                placeholder="00"
                className="w-full bg-transparent text-center focus:outline-none text-[hsl(var(--color-text))] placeholder-[hsl(var(--color-text-muted))]"
              />
            </div>
            {importedFields.has('duration') && (
              <CheckCircle size={14} className="text-[hsl(var(--color-brand))] mr-1 shrink-0" />
            )}
          </div>
          {errors.duration && <p className="error-text">{errors.duration}</p>}
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
              max={getTodayLocal()}
              className={`input pl-9 ${importedFields.has('runDate') ? 'ring-1 ring-[hsl(var(--color-brand))]' : ''} ${errors.runDate ? 'input-error' : ''}`}
            />
            {importedFields.has('runDate') && (
              <CheckCircle size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--color-brand))]" />
            )}
          </div>
          {errors.runDate && <p className="error-text">{errors.runDate}</p>}
        </div>

        {/* Perceived Effort */}
        <div>
          <label className="label flex items-center gap-2">
            <Activity size={14} />
            How hard was it?
            <span className="font-normal text-[hsl(var(--color-text-muted))]">(optional)</span>
          </label>
          <div className="grid grid-cols-5 gap-1.5 mt-2">
            {EFFORT_LEVELS.map((level) => {
              const isActive = form.perceivedEffort === level.value
              return (
                <button
                  key={level.value}
                  type="button"
                  onClick={() => updateField('perceivedEffort', isActive ? null : level.value)}
                  title={`${level.value} — ${level.label}: ${level.description}`}
                  className={`flex flex-col items-center gap-1 p-2 rounded-xl border bg-gradient-to-br transition-all duration-200 ${
                    isActive ? level.activeColor + ' scale-105 shadow-lg' : level.color + ' hover:scale-102 opacity-80 hover:opacity-100'
                  }`}
                >
                  <span className="text-xl leading-none">{level.emoji}</span>
                  <span className="text-[10px] font-semibold leading-tight text-center">{level.label}</span>
                </button>
              )
            })}
          </div>
          {form.perceivedEffort && (
            <p className="text-xs text-[hsl(var(--color-text-muted))] mt-2 text-center animate-fade-in">
              {EFFORT_LEVELS[form.perceivedEffort - 1].description}
            </p>
          )}
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
              Log Run &amp; Earn Points
            </>
          )}
        </button>
      </form>
    </div>
  )
}
