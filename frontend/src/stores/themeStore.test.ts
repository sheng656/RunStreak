import { describe, it, expect, beforeEach } from 'vitest'
import { useThemeStore } from './themeStore'

describe('themeStore', () => {
  beforeEach(() => {
    // Reset state before tests
    useThemeStore.setState({
      theme: 'system',
      resolvedTheme: 'light',
    })
    document.documentElement.classList.remove('dark')
  })

  it('should initialize with default system theme', () => {
    const state = useThemeStore.getState()
    expect(state.theme).toBe('system')
  })

  it('should resolve system theme to light if matchMedia is false', () => {
    const { setTheme } = useThemeStore.getState()
    setTheme('system')
    
    const state = useThemeStore.getState()
    expect(state.theme).toBe('system')
    expect(state.resolvedTheme).toBe('light')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('should apply dark theme directly and add dark class to documentElement', () => {
    const { setTheme } = useThemeStore.getState()
    setTheme('dark')

    const state = useThemeStore.getState()
    expect(state.theme).toBe('dark')
    expect(state.resolvedTheme).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('should apply light theme directly and remove dark class from documentElement', () => {
    const { setTheme } = useThemeStore.getState()
    setTheme('dark') // set first to add class
    expect(document.documentElement.classList.contains('dark')).toBe(true)

    setTheme('light') // then set light
    const state = useThemeStore.getState()
    expect(state.theme).toBe('light')
    expect(state.resolvedTheme).toBe('light')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })
})
