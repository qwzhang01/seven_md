/**
 * 微信公众号导出状态管理
 */

import type { ThemeName } from '../theme-css'
import { create } from 'zustand'

interface WechatState {
  isOpen: boolean
  themeName: ThemeName
  primaryColor: string
  fontFamily: string
  fontSize: string
  customCSS: string
}

interface WechatActions {
  open: () => void
  close: () => void
  setTheme: (themeName: ThemeName) => void
  setPrimaryColor: (color: string) => void
  setFontFamily: (fontFamily: string) => void
  setFontSize: (fontSize: string) => void
  setCustomCSS: (css: string) => void
}

export const useWechatStore = create<WechatState & WechatActions>((set) => ({
  // State
  isOpen: false,
  themeName: 'default',
  primaryColor: '#1a73e8',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  fontSize: '15px',
  customCSS: '',

  // Actions
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  setTheme: (themeName) => set({ themeName }),
  setPrimaryColor: (primaryColor) => set({ primaryColor }),
  setFontFamily: (fontFamily) => set({ fontFamily }),
  setFontSize: (fontSize) => set({ fontSize }),
  setCustomCSS: (customCSS) => set({ customCSS }),
}))
