import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import WeeklyProgress from './WeeklyProgress'

describe('WeeklyProgress', () => {
  it('renders weekly distance and goal progress correctly', () => {
    render(
      <WeeklyProgress
        weeklyDistanceKm={15.0}
        weeklyRunCount={3}
        weeklyGoalKm={20.0}
        weeklyPoints={150}
      />
    )

    expect(screen.getByText('15.0 km')).toBeInTheDocument()
    expect(screen.getByText('Weekly Goal')).toBeInTheDocument()
    expect(screen.getByText(/5\.0 km left/i)).toBeInTheDocument()
  })

  it('renders goal achieved state when weekly distance reaches or exceeds goal', () => {
    render(
      <WeeklyProgress
        weeklyDistanceKm={25.0}
        weeklyRunCount={5}
        weeklyGoalKm={20.0}
        weeklyPoints={250}
      />
    )

    expect(screen.getByText('25.0 km')).toBeInTheDocument()
    expect(screen.getByText(/Goal reached!/i)).toBeInTheDocument()
  })
})
