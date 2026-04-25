import { describe, it, expect, beforeEach } from 'vitest'
import { act } from '@testing-library/react'
import { useThemeStore } from '../../stores/useThemeStore'

describe('useThemeStore', () => {
  beforeEach(() => {
    // Reset store to default
    act(() => {
      useThemeStore.setState({ currentTheme: 'dark' })
    })
    document.documentElement.setAttribute('data-theme', 'dark')
  })

  it('默认主题为 dark', () => {
    const { currentTheme } = useThemeStore.getState()
    expect(currentTheme).toBe('dark')
  })

  it('setTheme 切换主题并更新 data-theme 属性', () => {
    act(() => {
      useThemeStore.getState().setTheme('monokai')
    })
    expect(useThemeStore.getState().currentTheme).toBe('monokai')
    expect(document.documentElement.getAttribute('data-theme')).toBe('monokai')
  })

  it('支持所有 7 种主题', () => {
    const themes = ['dark', 'light', 'monokai', 'solarized', 'nord', 'dracula', 'github'] as const
    for (const theme of themes) {
      act(() => {
        useThemeStore.getState().setTheme(theme)
      })
      expect(useThemeStore.getState().currentTheme).toBe(theme)
    }
  })

  it('切换主题后 data-theme 反映最新主题', () => {
    act(() => { useThemeStore.getState().setTheme('dracula') })
    expect(document.documentElement.getAttribute('data-theme')).toBe('dracula')
    act(() => { useThemeStore.getState().setTheme('github') })
    expect(document.documentElement.getAttribute('data-theme')).toBe('github')
  })
})
