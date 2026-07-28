import { useState, type FormEvent } from 'react'
import {
  MapPin, Timer, Calendar, FileText, Activity,
  X, Save, Zap
} from 'lucide-react'
import runsApi from '../../api/runs'
import usersApi from '../../api/users'
import { useAuthStore } from '../../stores/authStore'
import toast from 'react-hot-toast'
import type { Run } from '../../types/api'
import { formatPace } from '../../utils/formatPace'

const EFFORT_LEVELS = [
  {
    value: 1,
    label: 'Very Easy',
    emoji: '😴',
    description: 'Like a walk — could sing the whole time',
    color: 'from-emerald-400/20 to-emerald-500/20 border-emerald-400/50 text-emerald-400',
    activeColor: 'from-emerald-400/40 to-emerald-500/40 border-emerald-400 text-emerald-300',
  },
  {
    value: 2,
    label: 'Easy',
    emoji: '🙂',
    description: 'Comfortable, full conversation possible',
    color: 'from-green-400/20 to-teal-500/20 border-green-400/50 text-green-400',
    activeColor: 'from-green-400/40 to-teal-500/40 border-green-400 text-green-300',
  },
  {
    value: 3,
    label: 'Moderate',
    emoji: '😤',
    description: 'Sweating, breathing deeper, short phrases only',
    color: 'from-yellow-400/20 to-amber-500/20 border-yellow-400/50 text-yellow-400',
    activeColor: 'from-yellow-400/40 to-amber-500/40 border-yellow-400 text-yellow-300',
  },
  {
    value: 4,
    label: 'Hard',
    emoji: '😰',
    description: 'Breathless, muscles fatiguing, can\'t finish sentences',
    color: 'from-orange-400/20 to-red-400/20 border-orange-400/50 text-orange-400',
    activeColor: 'from-orange-400/40 to-red-400/40 border-orange-400 text-orange-300',
  },
  {
    value: 5,
    label: 'Very Hard',
    emoji: '🥵',
    description: 'All-out effort, near max heart rate',
    color: 'from-red-500/20 to-rose-600/20 border-red-500/50 text-red-400',
    activeColor: 'from-red-500/40 to-rose-600/40 border-red-500 text-red-300',
  },
]

const getTodayLocal = () => new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0]

interface EditRunModalProps {
  run: Run
  onClose: () => void
  onSuccess: () => void
}

export default function EditRunModal({ run, onClose, onSuccess }: EditRunModalProps) {
  const { setUser } = useAuthStore()

  // Calculate hours, minutes, seconds from run.durationMinutes
  const totalSecs = Math.round(Number(run.durationMinutes) * 60)
  const initialH = Math.floor(totalSecs / 3600)
  const initialM = Math.floor((totalSecs % 3600) / 60)
  const initialS = totalSecs % 60

  const [form, setForm] = useState({
    distanceKm: Number(run.distanceKm).toString(),
    durationHours: initialH > 0 ? initialH.toString() : '0',
    durationMinutes: initialM.toString().padStart(2, '0'),
    durationSeconds: initialS.toString().padStart(2, '0'),
    runDate: run.runDate ? run.runDate.split('T')[0] : getTodayLocal(),
    notes: run.notes || '',
    perceivedEffort: run.perceivedEffort ?? null,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  // Live pace calculation
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
    const totalMins = h * 60 + m + s / 60

    if (!form.distanceKm) errs.distanceKm = 'Distance is required'
    else if (isNaN(dist) || dist < 0.01) errs.distanceKm = 'Minimum distance is 0.01 km'
    else if (dist > 1000) errs.distanceKm = 'Maximum distance is 1000 km'

    if (form.durationHours === '' && form.durationMinutes === '' && form.durationSeconds === '') {
      errs.duration = 'Duration is required'
    } else if (isNaN(totalMins) || totalMins < 0.1) {
      errs.duration = 'Minimum duration is 0.1 minutes'
    } else if (totalMins > 1440) {
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
      const totalMins = h * 60 + m + s / 60

      await runsApi.update(run.id, {
        distanceKm: parseFloat(form.distanceKm),
        durationMinutes: totalMins,
        runDate: form.runDate,
        notes: form.notes || undefined,
        perceivedEffort: form.perceivedEffort ?? undefined,
      })

      // Refresh user profile to reflect recalculated stats
      try {
        const profileRes = await usersApi.getMe()
        setUser(profileRes.data)
      } catch { /* non-critical */ }

      toast.success('Run updated successfully!')
      onSuccess()
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to update run.'
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-[hsl(var(--color-overlay))] backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in overflow-y-auto">
      <div className="card max-w-lg w-full p-6 space-y-5 shadow-2xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface))] animate-fade-in-up relative my-8">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-text))] p-1 rounded-lg transition-colors"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[hsl(var(--color-brand))] to-indigo-600 text-white flex items-center justify-center shadow-md shrink-0">
            <Save size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[hsl(var(--color-text))]">Edit Running Log</h2>
            <p className="text-xs text-[hsl(var(--color-text-muted))]">Modify details of your activity</p>
          </div>
        </div>

        {/* Live pace preview */}
        {distance > 0 && totalDurationMinutes > 0 && (
          <div className="p-3.5 rounded-xl bg-[hsl(var(--color-surface-2))]/70 border border-[hsl(var(--color-border))]/50 flex items-center justify-between text-xs animate-fade-in">
            <div className="flex items-center gap-2 text-[hsl(var(--color-text-muted))]">
              <Timer size={14} />
              <span>Calculated average pace</span>
            </div>
            <span className="font-bold text-sm text-[hsl(var(--color-brand))]">
              {paceDisplay}
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Distance */}
          <div>
            <label htmlFor="edit-distance" className="label">Distance (km)</label>
            <div className="relative">
              <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--color-text-muted))]" />
              <input
                id="edit-distance"
                type="number"
                step="0.01"
                min="0.01"
                max="1000"
                value={form.distanceKm}
                onChange={(e) => updateField('distanceKm', e.target.value)}
                className={`input pl-9 ${errors.distanceKm ? 'input-error' : ''}`}
              />
            </div>
            {errors.distanceKm && <p className="error-text">{errors.distanceKm}</p>}
          </div>

          {/* Duration (Hours : Minutes : Seconds) */}
          <div>
            <label className="label">Duration (Hours : Minutes : Seconds)</label>
            <div className={`flex items-center gap-2 p-2.5 rounded-xl bg-[hsl(var(--color-surface))] border border-[hsl(var(--color-border))] ${errors.duration ? 'border-red-500 ring-1 ring-red-500' : ''}`}>
              <Timer size={16} className="text-[hsl(var(--color-text-muted))] ml-1 shrink-0" />
              <div className="flex items-center gap-1.5 w-full">
                <input
                  id="edit-duration-hours"
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
                  id="edit-duration-minutes"
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
                  id="edit-duration-seconds"
                  type="number"
                  min="0"
                  max="59"
                  value={form.durationSeconds}
                  onChange={(e) => updateField('durationSeconds', e.target.value)}
                  placeholder="00"
                  className="w-full bg-transparent text-center focus:outline-none text-[hsl(var(--color-text))] placeholder-[hsl(var(--color-text-muted))]"
                />
              </div>
            </div>
            {errors.duration && <p className="error-text">{errors.duration}</p>}
          </div>

          {/* Date */}
          <div>
            <label htmlFor="edit-date" className="label">Date</label>
            <div className="relative">
              <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--color-text-muted))]" />
              <input
                id="edit-date"
                type="date"
                value={form.runDate}
                onChange={(e) => updateField('runDate', e.target.value)}
                max={getTodayLocal()}
                className={`input pl-9 ${errors.runDate ? 'input-error' : ''}`}
              />
            </div>
            {errors.runDate && <p className="error-text">{errors.runDate}</p>}
          </div>

          {/* Perceived Effort */}
          <div>
            <label className="label flex items-center gap-2">
              <Activity size={14} />
              Perceived Effort (RPE)
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
            <label htmlFor="edit-notes" className="label">
              Notes <span className="font-normal text-[hsl(var(--color-text-muted))]">(optional)</span>
            </label>
            <div className="relative">
              <FileText size={16} className="absolute left-3 top-3 text-[hsl(var(--color-text-muted))]" />
              <textarea
                id="edit-notes"
                value={form.notes}
                onChange={(e) => updateField('notes', e.target.value)}
                placeholder="How did it feel?"
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

          {/* Submit / Cancel Buttons */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-[hsl(var(--color-border))]/40">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="btn btn-secondary text-xs px-4"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary text-xs px-4 flex items-center gap-1.5"
            >
              {submitting ? (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Zap size={14} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
