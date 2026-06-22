import { create } from 'zustand'
import type { Badge, LeaderboardEntry } from '../types/api'

interface GamificationState {
  // User's own gamification data
  totalPoints: number
  currentStreak: number
  longestStreak: number
  totalDistanceKm: number
  badges: Badge[]       // all badges (locked + unlocked)
  unlockedBadgeIds: Set<string>
  newlyUnlockedBadges: Badge[] // cleared after being shown to the user

  // Leaderboard
  leaderboard: LeaderboardEntry[]
  leaderboardType: 'points' | 'streak'
  isLeaderboardLoading: boolean

  isLoading: boolean

  // Actions
  setUserStats: (stats: {
    totalPoints: number
    currentStreak: number
    longestStreak: number
    totalDistanceKm: number
  }) => void
  setBadges: (badges: Badge[], unlockedIds: string[]) => void
  addNewlyUnlockedBadges: (badges: Badge[]) => void
  clearNewlyUnlockedBadges: () => void
  setLeaderboard: (entries: LeaderboardEntry[]) => void
  setLeaderboardType: (type: 'points' | 'streak') => void
  setLeaderboardLoading: (loading: boolean) => void
  setLoading: (loading: boolean) => void
}

export const useGamificationStore = create<GamificationState>((set) => ({
  totalPoints: 0,
  currentStreak: 0,
  longestStreak: 0,
  totalDistanceKm: 0,
  badges: [],
  unlockedBadgeIds: new Set(),
  newlyUnlockedBadges: [],
  leaderboard: [],
  leaderboardType: 'points',
  isLeaderboardLoading: false,
  isLoading: false,

  setUserStats: (stats) => set(stats),

  setBadges: (badges, unlockedIds) =>
    set({ badges, unlockedBadgeIds: new Set(unlockedIds) }),

  addNewlyUnlockedBadges: (badges) =>
    set((state) => ({
      newlyUnlockedBadges: [...state.newlyUnlockedBadges, ...badges],
    })),

  clearNewlyUnlockedBadges: () => set({ newlyUnlockedBadges: [] }),

  setLeaderboard: (entries) =>
    set({ leaderboard: entries, isLeaderboardLoading: false }),

  setLeaderboardType: (type) => set({ leaderboardType: type }),

  setLeaderboardLoading: (loading) => set({ isLeaderboardLoading: loading }),

  setLoading: (loading) => set({ isLoading: loading }),
}))
