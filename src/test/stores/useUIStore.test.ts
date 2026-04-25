import { describe, it, expect, beforeEach } from 'vitest'
import { act } from '@testing-library/react'
import { useUIStore } from '../../stores/useUIStore'

function resetStore() {
  useUIStore.setState({
    sidebarVisible: true,
    sidebarWidth: 260,
    activeSidebarPanel: 'explorer',
    viewMode: 'split',
    commandPaletteOpen: false,
    aiPanelOpen: false,
    findReplaceOpen: false,
    findReplaceMode: 'find',
    zoomLevel: 14,
  })
}

describe('useUIStore', () => {
  beforeEach(() => act(() => resetStore()))

  it('默认状态正确', () => {
    const s = useUIStore.getState()
    expect(s.sidebarVisible).toBe(true)
    expect(s.viewMode).toBe('split')
    expect(s.commandPaletteOpen).toBe(false)
    expect(s.zoomLevel).toBe(14)
  })

  it('toggleSidebar 切换侧边栏可见状态', () => {
    act(() => useUIStore.getState().toggleSidebar())
    expect(useUIStore.getState().sidebarVisible).toBe(false)
    act(() => useUIStore.getState().toggleSidebar())
    expect(useUIStore.getState().sidebarVisible).toBe(true)
  })

  it('setActiveSidebarPanel 切换面板，相同面板收起侧边栏', () => {
    act(() => useUIStore.getState().setActiveSidebarPanel('search'))
    expect(useUIStore.getState().activeSidebarPanel).toBe('search')
    expect(useUIStore.getState().sidebarVisible).toBe(true)

    // 再次点击同一面板收起
    act(() => useUIStore.getState().setActiveSidebarPanel('search'))
    expect(useUIStore.getState().sidebarVisible).toBe(false)
  })

  it('setViewMode 切换三种视图模式', () => {
    act(() => useUIStore.getState().setViewMode('editor-only'))
    expect(useUIStore.getState().viewMode).toBe('editor-only')

    act(() => useUIStore.getState().setViewMode('preview-only'))
    expect(useUIStore.getState().viewMode).toBe('preview-only')

    act(() => useUIStore.getState().setViewMode('split'))
    expect(useUIStore.getState().viewMode).toBe('split')
  })

  it('toggleCommandPalette 切换命令面板', () => {
    act(() => useUIStore.getState().toggleCommandPalette())
    expect(useUIStore.getState().commandPaletteOpen).toBe(true)
    act(() => useUIStore.getState().toggleCommandPalette())
    expect(useUIStore.getState().commandPaletteOpen).toBe(false)
  })

  it('setCommandPaletteOpen 直接设置状态', () => {
    act(() => useUIStore.getState().setCommandPaletteOpen(true))
    expect(useUIStore.getState().commandPaletteOpen).toBe(true)
  })

  it('zoomIn / zoomOut 缩放有上下边界', () => {
    act(() => {
      for (let i = 0; i < 20; i++) useUIStore.getState().zoomIn()
    })
    expect(useUIStore.getState().zoomLevel).toBe(32) // MAX

    act(() => {
      for (let i = 0; i < 30; i++) useUIStore.getState().zoomOut()
    })
    expect(useUIStore.getState().zoomLevel).toBe(10) // MIN
  })

  it('setSidebarWidth 宽度被限制在 180~500 之间', () => {
    act(() => useUIStore.getState().setSidebarWidth(50))
    expect(useUIStore.getState().sidebarWidth).toBe(180)

    act(() => useUIStore.getState().setSidebarWidth(9999))
    expect(useUIStore.getState().sidebarWidth).toBe(500)

    act(() => useUIStore.getState().setSidebarWidth(320))
    expect(useUIStore.getState().sidebarWidth).toBe(320)
  })

  it('setFindReplaceMode 同时打开查找替换栏', () => {
    act(() => useUIStore.getState().setFindReplaceMode('replace'))
    expect(useUIStore.getState().findReplaceMode).toBe('replace')
    expect(useUIStore.getState().findReplaceOpen).toBe(true)
  })
})
