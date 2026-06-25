import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import ThemeToggle from './ThemeToggle'
import { useThemeStore } from '../../stores/themeStore'

describe('ThemeToggle Component', () => {
  beforeEach(() => {
    useThemeStore.setState({
      theme: 'system',
      resolvedTheme: 'light',
    })
  })

  it('renders all options in full mode', () => {
    render(<ThemeToggle compact={false} />)
    
    expect(screen.getByLabelText('Light theme')).toBeInTheDocument()
    expect(screen.getByLabelText('System theme')).toBeInTheDocument()
    expect(screen.getByLabelText('Dark theme')).toBeInTheDocument()
  })

  it('highlights the active theme button', () => {
    useThemeStore.setState({ theme: 'dark' })
    render(<ThemeToggle compact={false} />)

    const darkButton = screen.getByLabelText('Dark theme')
    expect(darkButton).toHaveClass('bg-[hsl(var(--color-surface))]')
  })

  it('calls setTheme when option is clicked', () => {
    render(<ThemeToggle compact={false} />)

    const darkButton = screen.getByLabelText('Dark theme')
    fireEvent.click(darkButton)

    expect(useThemeStore.getState().theme).toBe('dark')
  })

  it('renders compact mode as a single button', () => {
    render(<ThemeToggle compact={true} />)

    const cycleButton = screen.getByRole('button', { name: /Switch to/ })
    expect(cycleButton).toBeInTheDocument()
  })

  it('cycles theme correctly in compact mode when clicked', () => {
    // Initial theme: 'system' -> cycles to 'light' -> 'dark' -> 'system'
    useThemeStore.setState({ theme: 'system' })
    const { rerender } = render(<ThemeToggle compact={true} />)

    const cycleButton = screen.getByRole('button', { name: 'Switch to light theme' })
    fireEvent.click(cycleButton)

    expect(useThemeStore.getState().theme).toBe('light')
    
    rerender(<ThemeToggle compact={true} />)
    const nextCycleButton = screen.getByRole('button', { name: 'Switch to dark theme' })
    fireEvent.click(nextCycleButton)
    
    expect(useThemeStore.getState().theme).toBe('dark')
  })
})
