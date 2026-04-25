/**
 * 集成测试：命令注册与执行
 * 验证 registerAllCommands 注册后命令面板可以正确执行操作
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { act } from '@testing-library/react'
import { useCommandStore } from '../../stores/useCommandStore'
import { useUIStore } from '../../stores/useUIStore'
import { useThemeStore } from '../../stores/useThemeStore'
import { useFileStore } from '../../stores/useFileStore'
import { registerAllCommands } from '../../commands'

function resetAll() {
  useCommandStore.setState({ commands: new Map(), searchQuery: '', filteredCommands: [] })
  useUIStore.setState({
    sidebarVisible: true,
    viewMode: 'split',
    commandPaletteOpen: false,
    aiPanelOpen: false,
    findReplaceOpen: false,
    zoomLevel: 14,
  } as any)
  useThemeStore.setState({ currentTheme: 'dark' })
  useFileStore.setState({ tabs: [], activeTabId: null, recentlyClosed: [] })
  document.documentElement.setAttribute('data-theme', 'dark')
}

describe('命令注册与执行集成测试', () => {
  beforeEach(() => act(() => { resetAll(); registerAllCommands() }))

  it('registerAllCommands 注册了主要命令', () => {
    const commands = useCommandStore.getState().getFilteredCommands()
    const ids = commands.map((c) => c.id)
    expect(ids).toContain('file.new')
    expect(ids).toContain('file.save')
    expect(ids).toContain('view.split')
    expect(ids).toContain('theme.dark')
    expect(ids).toContain('ai.open')
  })

  it('执行 file.new 打开新标签页', () => {
    act(() => useCommandStore.getState().executeCommand('file.new'))
    expect(useFileStore.getState().tabs).toHaveLength(1)
  })

  it('执行 theme.monokai 切换主题', () => {
    act(() => useCommandStore.getState().executeCommand('theme.monokai'))
    expect(useThemeStore.getState().currentTheme).toBe('monokai')
  })

  it('执行 view.editor 切换到仅编辑器模式', () => {
    act(() => useCommandStore.getState().executeCommand('view.editor'))
    expect(useUIStore.getState().viewMode).toBe('editor-only')
  })

  it('执行 view.preview 切换到仅预览模式', () => {
    act(() => useCommandStore.getState().executeCommand('view.preview'))
    expect(useUIStore.getState().viewMode).toBe('preview-only')
  })

  it('执行 view.split 恢复分栏视图', () => {
    act(() => useCommandStore.getState().executeCommand('view.editor'))
    act(() => useCommandStore.getState().executeCommand('view.split'))
    expect(useUIStore.getState().viewMode).toBe('split')
  })

  it('执行 ai.open 打开 AI 助手面板', () => {
    act(() => useCommandStore.getState().executeCommand('ai.open'))
    expect(useUIStore.getState().aiPanelOpen).toBe(true)
  })

  it('执行 view.commandPalette 打开命令面板', () => {
    act(() => useCommandStore.getState().executeCommand('view.commandPalette'))
    expect(useUIStore.getState().commandPaletteOpen).toBe(true)
  })

  it('执行 view.zoomIn 增大字号', () => {
    const before = useUIStore.getState().zoomLevel
    act(() => useCommandStore.getState().executeCommand('view.zoomIn'))
    expect(useUIStore.getState().zoomLevel).toBeGreaterThan(before)
  })

  it('命令搜索：模糊查找 "dark" 返回深色主题命令', () => {
    act(() => useCommandStore.getState().setSearchQuery('深色'))
    const filtered = useCommandStore.getState().filteredCommands
    expect(filtered.some((c) => c.id === 'theme.dark')).toBe(true)
    expect(filtered.every((c) => c.category === 'theme' || c.title.includes('深色'))).toBe(true)
  })
})
