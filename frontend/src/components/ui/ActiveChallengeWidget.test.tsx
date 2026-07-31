import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ActiveChallengeWidget from './ActiveChallengeWidget'

vi.mock('../../api/challenges', () => ({
  default: {
    getActive: vi.fn().mockResolvedValue({ data: null })
  }
}))

describe('ActiveChallengeWidget', () => {
  it('renders no active challenge state when activeChallenge is null', async () => {
    render(
      <MemoryRouter>
        <ActiveChallengeWidget />
      </MemoryRouter>
    )

    expect(await screen.findByText('No Active Challenge')).toBeInTheDocument()
    expect(screen.getByText('Explore Routes')).toBeInTheDocument()
  })
})
