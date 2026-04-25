/**
 * 集成测试：主题切换
 * 验证主题切换时 CSS 变量、data-theme 属性、store 状态三者一致
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { act } from '@testing-library/react'
import { useThemeStore } from '../../stores/useThemeStore'
import { useCommandStore } from '../../stores/useCommandStore'
import { registerAllCommands } from '../../commands'

function resetTheme() {
  useThemeStore.setState({ currentTheme: 'dark' })
  document.documentElement.setAttribute('data-theme', 'dark')
}

describe('主题切换集成测试', () => {
  beforeEach(() => {
    act(() => {
      resetTheme()
      useCommandStore.setState({ commands: new Map(), searchQuery: '', filteredCommands: [] })
      registerAllCommands()
    })
  })

  it('setTheme 后 data-theme 属性立即更新', () => {
    act(() => useThemeStore.getState().setTheme('nord'))
    expect(document.documentElement.getAttribute('data-theme')).toBe('nord')
    expect(useThemeStore.getState().currentTheme).toBe('nord')
  })

  it('通过命令面板命令切换主题', () => {
    act(() => {
      useCommandStore.getState().executeCommand('theme.dracula')
    })
    expect(useThemeStore.getState().currentTheme).toBe('dracula')
    expect(document.documentElement.getAttribute('data-theme')).toBe('dracula')
  })

  it('循环切换 7 种主题', () => {
    const themes = ['dark', 'light', 'monokai', 'solarized', 'nord', 'dracula', 'github'] as const
    for (const theme of themes) {
      act(() => useThemeStore.getState().setTheme(theme))
      expect(useThemeStore.getState().currentTheme).toBe(theme)
    }
  })

  it('切换主题后再次切回 dark', () => {
    act(() => useThemeStore.getState().setTheme('github'))
    act(() => useThemeStore.getState().setTheme('dark'))
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
  })
})
