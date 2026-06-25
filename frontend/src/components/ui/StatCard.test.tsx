import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import StatCard from './StatCard'

describe('StatCard Component', () => {
  it('renders card with label, value, and icon', () => {
    render(
      <StatCard
        icon={<span data-testid="mock-icon">🔥</span>}
        label="Test Streak"
        value="5 days"
      />
    )

    expect(screen.getByText('Test Streak')).toBeInTheDocument()
    expect(screen.getByText('5 days')).toBeInTheDocument()
    expect(screen.getByTestId('mock-icon')).toBeInTheDocument()
  })

  it('renders subtitle if provided', () => {
    render(
      <StatCard
        icon={<span>🔥</span>}
        label="Test Streak"
        value="5 days"
        subtitle="Keep going!"
      />
    )

    expect(screen.getByText('Keep going!')).toBeInTheDocument()
  })

  it('applies correct accent class names', () => {
    const { container, rerender } = render(
      <StatCard
        icon={<span>🔥</span>}
        label="Test"
        value="1"
        accent="fire"
      />
    )
    
    // Check for the class in fire accent
    expect(container.querySelector('.text-\\[hsl\\(var\\(--color-fire\\)\\)\\]')).toBeInTheDocument()

    rerender(
      <StatCard
        icon={<span>🔥</span>}
        label="Test"
        value="1"
        accent="success"
      />
    )
    expect(container.querySelector('.text-\\[hsl\\(var\\(--color-success\\)\\)\\]')).toBeInTheDocument()
  })
})
