import { describe, it, expect, beforeEach } from 'vitest'
import { useRunStore } from './runStore'
import type { Run } from '../types/api'

const mockRun: Run = {
  id: 'run-1',
  userId: 'user-1',
  distanceKm: 5.0,
  durationMinutes: 25,
  paceMinPerKm: 5.0,
  runDate: '2026-07-30T00:00:00Z',
  notes: 'Morning run',
  pointsEarned: 35,
  perceivedEffort: 3,
  createdAt: '2026-07-30T00:00:00Z',
  updatedAt: '2026-07-30T00:00:00Z',
}

describe('runStore', () => {
  beforeEach(() => {
    useRunStore.setState({
      runs: [],
      totalRuns: 0,
      currentPage: 1,
      pageSize: 10,
      isLoading: false,
    })
  })

  it('should initialize with empty runs list', () => {
    const state = useRunStore.getState()
    expect(state.runs).toEqual([])
    expect(state.totalRuns).toBe(0)
    expect(state.currentPage).toBe(1)
    expect(state.isLoading).toBe(false)
  })

  it('should set runs and total count', () => {
    const { setRuns } = useRunStore.getState()
    setRuns([mockRun], 1)

    const state = useRunStore.getState()
    expect(state.runs).toEqual([mockRun])
    expect(state.totalRuns).toBe(1)
  })

  it('should add a run to the beginning of the list', () => {
    const { addRun } = useRunStore.getState()
    addRun(mockRun)

    const state = useRunStore.getState()
    expect(state.runs.length).toBe(1)
    expect(state.runs[0]).toEqual(mockRun)
    expect(state.totalRuns).toBe(1)
  })

  it('should update an existing run', () => {
    const { addRun, updateRun } = useRunStore.getState()
    addRun(mockRun)

    const updatedRun = { ...mockRun, notes: 'Updated notes', distanceKm: 6.0 }
    updateRun(updatedRun)

    const state = useRunStore.getState()
    expect(state.runs[0].notes).toBe('Updated notes')
    expect(state.runs[0].distanceKm).toBe(6.0)
  })

  it('should delete a run by id', () => {
    const { addRun, removeRun } = useRunStore.getState()
    addRun(mockRun)

    removeRun('run-1')

    const state = useRunStore.getState()
    expect(state.runs.length).toBe(0)
    expect(state.totalRuns).toBe(0)
  })
})
