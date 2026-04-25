import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SettingsState {
  fontSize: number
  tabSize: number
  autoSave: boolean
  autoSaveDelay: number // ms
  wordWrap: boolean
  showLineNumbers: boolean
  minimap: boolean
  language: string

  // Actions
  setFontSize: (size: number) => void
  setTabSize: (size: number) => void
  setAutoSave: (enabled: boolean) => void
  setAutoSaveDelay: (delay: number) => void
  setWordWrap: (enabled: boolean) => void
  setShowLineNumbers: (show: boolean) => void
  setMinimap: (enabled: boolean) => void
  setLanguage: (lang: string) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      fontSize: 14,
      tabSize: 2,
      autoSave: true,
      autoSaveDelay: 1000,
      wordWrap: true,
      showLineNumbers: true,
      minimap: false,
      language: 'zh',

      setFontSize: (size) => set({ fontSize: size }),
      setTabSize: (size) => set({ tabSize: size }),
      setAutoSave: (enabled) => set({ autoSave: enabled }),
      setAutoSaveDelay: (delay) => set({ autoSaveDelay: delay }),
      setWordWrap: (enabled) => set({ wordWrap: enabled }),
      setShowLineNumbers: (show) => set({ showLineNumbers: show }),
      setMinimap: (enabled) => set({ minimap: enabled }),
      setLanguage: (lang) => set({ language: lang }),
    }),
    {
      name: 'md-mate-settings',
    }
  )
)
