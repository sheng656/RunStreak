import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  MapPin, Timer, Zap, Plus, ChevronLeft, ChevronRight,
  Calendar, Trash2, Pencil,
} from 'lucide-react'
import runsApi from '../api/runs'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import EmptyState from '../components/ui/EmptyState'
import toast from 'react-hot-toast'
import type { Run } from '../types/api'

export default function RunHistoryPage() {
  const [runs, setRuns] = useState<Run[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const pageSize = 10
  const totalPages = Math.ceil(totalCount / pageSize)

  const loadRuns = useCallback(async () => {
    setLoading(true)
    try {
      const res = await runsApi.list(page, pageSize)
      setRuns(res.data.runs)
      setTotalCount(res.data.totalCount)
    } catch {
      toast.error('Failed to load runs')
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => {
    loadRuns()
  }, [loadRuns])

  async function handleDelete(id: string) {
    setDeleting(id)
    try {
      await runsApi.delete(id)
      toast.success('Run deleted')
      setDeleteConfirm(null)
      loadRuns()
    } catch {
      toast.error('Failed to delete run')
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">Run History</h1>
          <p className="page-subtitle">{totalCount} run{totalCount !== 1 ? 's' : ''} logged</p>
        </div>
        <Link to="/runs/new" className="btn btn-fire">
          <Plus size={16} /> Log Run
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <LoadingSpinner size="lg" />
        </div>
      ) : runs.length === 0 ? (
        <EmptyState
          icon={<MapPin size={48} />}
          title="No runs yet"
          description="Log your first run to start tracking your progress and earning points."
          action={
            <Link to="/runs/new" className="btn btn-fire">
              <Plus size={16} /> Log Your First Run
            </Link>
          }
        />
      ) : (
        <>
          {/* Run list */}
          <div className="space-y-3">
            {runs.map((run, i) => (
              <div
                key={run.id}
                className={`card card-interactive p-4 animate-fade-in-up stagger-${Math.min(i + 1, 6)}`}
              >
                <div className="flex items-center gap-4">
                  {/* Date icon */}
                  <div className="hidden sm:flex flex-col items-center justify-center w-14 h-14 rounded-[var(--radius)] bg-[hsl(var(--color-surface-2))] shrink-0">
                    <span className="text-xs font-medium text-[hsl(var(--color-text-muted))] uppercase">
                      {new Date(run.runDate).toLocaleDateString(undefined, { month: 'short' })}
                    </span>
                    <span className="text-lg font-bold text-[hsl(var(--color-text))] -mt-0.5">
                      {new Date(run.runDate).getDate()}
                    </span>
                  </div>

                  {/* Run details */}
                  <div className="flex-1 min-w-0 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
                    <div>
                      <div className="flex items-center gap-1 text-xs text-[hsl(var(--color-text-muted))] mb-0.5">
                        <MapPin size={12} /> Distance
                      </div>
                      <p className="text-sm font-semibold text-[hsl(var(--color-text))]">
                        {Number(run.distanceKm).toFixed(2)} km
                      </p>
                    </div>
                    <div>
                      <div className="flex items-center gap-1 text-xs text-[hsl(var(--color-text-muted))] mb-0.5">
                        <Timer size={12} /> Duration
                      </div>
                      <p className="text-sm font-semibold text-[hsl(var(--color-text))]">
                        {Number(run.durationMinutes).toFixed(0)} min
                      </p>
                    </div>
                    <div>
                      <div className="flex items-center gap-1 text-xs text-[hsl(var(--color-text-muted))] mb-0.5">
                        <Timer size={12} /> Pace
                      </div>
                      <p className="text-sm font-semibold text-[hsl(var(--color-text))]">
                        {Number(run.paceMinPerKm).toFixed(2)} min/km
                      </p>
                    </div>
                    <div>
                      <div className="flex items-center gap-1 text-xs text-[hsl(var(--color-text-muted))] mb-0.5">
                        <Zap size={12} /> Points
                      </div>
                      <p className="text-sm font-semibold text-[hsl(var(--color-fire))]">
                        +{run.pointsEarned}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    {deleteConfirm === run.id ? (
                      <div className="flex items-center gap-1 animate-fade-in">
                        <button
                          onClick={() => handleDelete(run.id)}
                          disabled={deleting === run.id}
                          className="btn btn-danger btn-sm"
                        >
                          {deleting === run.id ? '...' : 'Delete'}
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="btn btn-ghost btn-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirm(run.id)}
                        className="btn btn-ghost btn-icon text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-danger))]"
                        title="Delete run"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Mobile date + notes */}
                <div className="sm:hidden mt-2 flex items-center gap-1 text-xs text-[hsl(var(--color-text-muted))]">
                  <Calendar size={12} />
                  {new Date(run.runDate).toLocaleDateString()}
                </div>
                {run.notes && (
                  <p className="mt-2 text-xs text-[hsl(var(--color-text-muted))] italic">
                    {run.notes}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn btn-secondary btn-sm"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm text-[hsl(var(--color-text-muted))]">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="btn btn-secondary btn-sm"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
