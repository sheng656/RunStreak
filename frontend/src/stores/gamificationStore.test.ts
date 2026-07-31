import { describe, it, expect, beforeEach } from 'vitest'
import { useGamificationStore } from './gamificationStore'
import type { LeaderboardEntry, BadgeWithProgress, ActiveChallengeSummary } from '../types/api'

const mockLeaderboardEntry: LeaderboardEntry = {
  rank: 1,
  userId: 'u1',
  username: 'runner1',
  displayName: 'Runner One',
  avatarUrl: null,
  totalPoints: 500,
  currentStreak: 10,
  longestStreak: 15,
  totalDistanceKm: 120,
  totalRuns: 20,
}

const mockBadge: BadgeWithProgress = {
  id: 'b1',
  name: 'First Steps',
  description: 'Log your first run',
  iconUrl: '',
  category: 'milestone',
  rarity: 'common',
  pointsReward: 50,
  isUnlocked: true,
  unlockedAt: '2026-07-30T00:00:00Z',
  currentProgress: 1,
  targetThreshold: 1,
  progressLabel: '1 / 1 runs',
}

const mockChallenge: ActiveChallengeSummary = {
  challengeId: 'c1',
  name: 'Rangitoto Summit',
  description: 'Conquer Auckland volcano',
  targetDistanceKm: 8.0,
  progressDistanceKm: 4.0,
  remainingDistanceKm: 4.0,
  completionPercentage: 50,
  iconUrl: '',
  rarity: 'common',
}

describe('gamificationStore', () => {
  beforeEach(() => {
    useGamificationStore.setState({
      leaderboard: [],
      badges: [],
      unlockedBadgeIds: new Set(),
      totalPoints: 0,
      currentStreak: 0,
      longestStreak: 0,
      totalDistanceKm: 0,
      isLoading: false,
    })
  })

  it('should initialize with default state', () => {
    const state = useGamificationStore.getState()
    expect(state.leaderboard).toEqual([])
    expect(state.badges).toEqual([])
    expect(state.totalPoints).toBe(0)
  })

  it('should set leaderboard entries', () => {
    const { setLeaderboard } = useGamificationStore.getState()
    setLeaderboard([mockLeaderboardEntry])

    const state = useGamificationStore.getState()
    expect(state.leaderboard).toEqual([mockLeaderboardEntry])
  })

  it('should set badges and unlocked ids', () => {
    const { setBadges } = useGamificationStore.getState()
    setBadges([mockBadge as any], ['b1'])

    const state = useGamificationStore.getState()
    expect(state.badges).toEqual([mockBadge])
    expect(state.unlockedBadgeIds.has('b1')).toBe(true)
  })

  it('should update user stats', () => {
    const { setUserStats } = useGamificationStore.getState()
    setUserStats({
      totalPoints: 250,
      currentStreak: 7,
      longestStreak: 12,
      totalDistanceKm: 45.5,
    })

    const state = useGamificationStore.getState()
    expect(state.totalPoints).toBe(250)
    expect(state.currentStreak).toBe(7)
    expect(state.longestStreak).toBe(12)
    expect(state.totalDistanceKm).toBe(45.5)
  })
})
