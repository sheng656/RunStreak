import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import MotivationalInsight from './MotivationalInsight'
import type { UserProfile } from '../../types/api'

const mockUser: UserProfile = {
  id: 'user-1',
  username: 'runner1',
  email: 'r1@example.com',
  displayName: 'Runner One',
  avatarUrl: null,
  totalPoints: 100,
  currentStreak: 5,
  longestStreak: 10,
  totalDistanceKm: 50.0,
  totalRuns: 10,
  streakFreezeCount: 2,
  weeklyGoalKm: 20.0,
  createdAt: '2026-07-01T00:00:00Z',
}

describe('MotivationalInsight', () => {
  it('renders streak warning when user has active streak but has not run today', () => {
    render(
      <MotivationalInsight
        user={mockUser}
        recentRuns={[]}
        weeklyDistanceKm={10.0}
        weeklyGoalKm={20.0}
      />
    )

    expect(screen.getByText(/5-day streak is on the line/i)).toBeInTheDocument()
  })

  it('renders 7-day streak milestone text when currentStreak is 7', () => {
    const userWith7Streak = { ...mockUser, currentStreak: 7 }
    render(
      <MotivationalInsight
        user={userWith7Streak}
        recentRuns={[{ runDate: new Date().toISOString() } as any]}
        weeklyDistanceKm={10.0}
        weeklyGoalKm={20.0}
      />
    )

    expect(screen.getByText(/7-day streak unlocked/i)).toBeInTheDocument()
  })
})
