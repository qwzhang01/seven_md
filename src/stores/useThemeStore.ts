import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ThemeId = 'dark' | 'light' | 'monokai' | 'solarized' | 'nord' | 'dracula' | 'github'

interface ThemeState {
  currentTheme: ThemeId
  setTheme: (theme: ThemeId) => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      currentTheme: 'dark',
      setTheme: (theme: ThemeId) => {
        // Update HTML data-theme attribute for CSS variables
        document.documentElement.setAttribute('data-theme', theme)
        set({ currentTheme: theme })
      },
    }),
    {
      name: 'md-mate-theme',
      onRehydrateStorage: () => (state) => {
        // Apply theme on rehydration
        if (state) {
          document.documentElement.setAttribute('data-theme', state.currentTheme)
        }
      },
    }
  )
)
