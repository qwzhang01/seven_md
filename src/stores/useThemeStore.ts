import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useNotificationStore } from './useNotificationStore'

export type ThemeId = 'dark' | 'light' | 'monokai' | 'solarized' | 'nord' | 'dracula' | 'github'

const THEME_NAMES: Record<ThemeId, string> = {
  dark: '深色',
  light: '浅色',
  monokai: 'Monokai',
  solarized: 'Solarized',
  nord: 'Nord',
  dracula: 'Dracula',
  github: 'GitHub',
}

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
        // 主题切换通知
        const name = THEME_NAMES[theme] || theme
        useNotificationStore.getState().addNotification({
          type: 'info',
          message: `主题已切换为 ${name}`,
          autoClose: true,
          duration: 3000,
        })
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
