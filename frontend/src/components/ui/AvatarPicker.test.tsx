import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import AvatarPicker from './AvatarPicker'

describe('AvatarPicker', () => {
  it('renders avatar style options', () => {
    render(<AvatarPicker selectedUrl="" onSelect={vi.fn()} />)

    expect(screen.getByText('Portraits')).toBeInTheDocument()
    expect(screen.getByText('Watercolor')).toBeInTheDocument()
    expect(screen.getByText('Flat Color')).toBeInTheDocument()
  })

  it('triggers onSelect when an avatar thumbnail is clicked', () => {
    const onSelectMock = vi.fn()
    render(<AvatarPicker selectedUrl="" onSelect={onSelectMock} />)

    const thumbnail = screen.getByTitle('avataaars Jack')
    fireEvent.click(thumbnail)

    expect(onSelectMock).toHaveBeenCalled()
    expect(onSelectMock.mock.calls[0][0]).toContain('api.dicebear.com')
  })
})
