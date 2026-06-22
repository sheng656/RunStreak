import { create } from 'zustand'
import type { Run } from '../types/api'

interface RunState {
  runs: Run[]
  totalRuns: number
  currentPage: number
  pageSize: number
  isLoading: boolean
  error: string | null

  setRuns: (runs: Run[], total: number) => void
  addRun: (run: Run) => void
  updateRun: (run: Run) => void
  removeRun: (id: string) => void
  setPage: (page: number) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const useRunStore = create<RunState>((set) => ({
  runs: [],
  totalRuns: 0,
  currentPage: 1,
  pageSize: 10,
  isLoading: false,
  error: null,

  setRuns: (runs, total) =>
    set({ runs, totalRuns: total, isLoading: false, error: null }),

  addRun: (run) =>
    set((state) => ({
      runs: [run, ...state.runs],
      totalRuns: state.totalRuns + 1,
    })),

  updateRun: (updated) =>
    set((state) => ({
      runs: state.runs.map((r) => (r.id === updated.id ? updated : r)),
    })),

  removeRun: (id) =>
    set((state) => ({
      runs: state.runs.filter((r) => r.id !== id),
      totalRuns: Math.max(0, state.totalRuns - 1),
    })),

  setPage: (page) => set({ currentPage: page }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
}))
