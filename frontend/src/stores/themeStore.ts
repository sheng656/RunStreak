import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Theme = 'light' | 'dark' | 'system'

interface ThemeState {
  theme: Theme
  // Resolved theme: the actual light/dark value after evaluating 'system'
  resolvedTheme: 'light' | 'dark'
  setTheme: (theme: Theme) => void
}

function resolveTheme(theme: Theme): 'light' | 'dark' {
  if (theme === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'
  }
  return theme
}

function applyTheme(resolved: 'light' | 'dark') {
  const root = document.documentElement
  if (resolved === 'dark') {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'system',
      resolvedTheme: resolveTheme('system'),

      setTheme: (theme) => {
        const resolved = resolveTheme(theme)
        applyTheme(resolved)
        set({ theme, resolvedTheme: resolved })
      },
    }),
    {
      name: 'runstreak-theme', // localStorage key
      // Only persist the user's explicit preference (not the resolved value,
      // since that depends on the system preference at the time)
      partialize: (state) => ({ theme: state.theme }),
      onRehydrateStorage: () => (state) => {
        // When the store is rehydrated from localStorage, re-apply the theme
        // to the DOM. This runs before first paint if possible.
        if (state) {
          const resolved = resolveTheme(state.theme)
          applyTheme(resolved)
          state.resolvedTheme = resolved
        }
      },
    },
  ),
)
