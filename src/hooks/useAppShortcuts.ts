import { dispatch } from '../lib/eventBus'
import { useMemo } from 'react'
import { useKeyboardShortcuts } from './useKeyboardShortcuts'
import type { ShortcutConfig } from './useKeyboardShortcuts'
import { useUIStore, useFileStore, useAIStore } from '../stores'
import { useIsMobile } from './useMediaQuery'

interface AppShortcutsParams {
  handleSaveFile: () => Promise<void>
  handleOpenFile: () => Promise<void>
  createNewWindow: () => Promise<void>
  handleCloseTab: (tabId: string) => void
  mobileSidebarOpen: boolean
  setMobileSidebarOpen: (fn: (prev: boolean) => boolean) => void
}

export function useAppShortcuts({
  handleSaveFile,
  handleOpenFile,
  createNewWindow,
  handleCloseTab,
  mobileSidebarOpen,
  setMobileSidebarOpen,
}: AppShortcutsParams) {
  const ui = useUIStore()
  const { openTab, getActiveTab, switchToNextTab, switchToPrevTab } = useFileStore()
  const isMobile = useIsMobile()

  const shortcuts: ShortcutConfig[] = useMemo(() => [
    // === 文件操作 ===
    { key: 's', ctrlKey: true, action: () => handleSaveFile(), description: '保存文件' },
    { key: 'o', ctrlKey: true, action: () => handleOpenFile(), description: '打开文件' },
    { key: 'n', ctrlKey: true, action: () => openTab(null, ''), description: '新建文件' },
    { key: 'N', ctrlKey: true, shiftKey: true, action: createNewWindow, description: '新建窗口' },
    { key: 'w', ctrlKey: true, action: () => { const tab = getActiveTab(); if (tab) handleCloseTab(tab.id) }, description: '关闭标签' },

    // === 面板切换 ===
    { key: 'P', ctrlKey: true, shiftKey: true, action: () => ui.toggleCommandPalette(), description: '命令面板' },
    { key: 'e', ctrlKey: true, shiftKey: true, action: () => ui.setActiveSidebarPanel('explorer'), description: '资源管理器' },
    { key: 'f', ctrlKey: true, shiftKey: true, action: () => ui.setActiveSidebarPanel('search'), description: '搜索面板' },
    { key: 'o', ctrlKey: true, shiftKey: true, action: () => ui.setActiveSidebarPanel('outline'), description: '大纲面板' },

    // === Ctrl+B 上下文判断：编辑器焦点时加粗，否则切换侧边栏 ===
    {
      key: 'b', ctrlKey: true,
      action: () => {
        if (ui.editorFocused) {
          dispatch('editor:insert', '**')
        } else {
          ui.toggleSidebar()
        }
      },
      description: '加粗/侧边栏',
    },

    // === 编辑器格式快捷键（编辑器焦点时生效）===
    {
      key: 'i', ctrlKey: true,
      action: () => {
        if (ui.editorFocused) {
          dispatch('editor:insert', '*')
        }
      },
      description: '斜体',
    },
    {
      key: 'k', ctrlKey: true,
      action: () => {
        if (ui.editorFocused) {
          dispatch('editor:insert', '[](url)')
        }
      },
      description: '链接',
    },

    // === 查找替换 ===
    { key: 'f', ctrlKey: true, action: () => ui.setFindReplaceMode('find'), description: '查找' },
    { key: 'h', ctrlKey: true, action: () => ui.setFindReplaceMode('replace'), description: '查找+替换' },

    // === 缩放 ===
    { key: '=', ctrlKey: true, action: () => ui.zoomIn(), description: '放大' },
    { key: '+', ctrlKey: true, action: () => ui.zoomIn(), description: '放大（+号）' },
    { key: '-', ctrlKey: true, action: () => ui.zoomOut(), description: '缩小' },
    { key: '0', ctrlKey: true, action: () => ui.setZoomLevel(14), description: '重置缩放' },

    // === 关闭面板 ===
    {
      key: 'Escape',
      action: () => {
        if (ui.commandPaletteOpen) ui.setCommandPaletteOpen(false)
        else if (useAIStore.getState().isOpen) useAIStore.getState().setOpen(false)
        else if (ui.findReplaceOpen) ui.setFindReplaceOpen(false)
        else if (isMobile && mobileSidebarOpen) setMobileSidebarOpen((prev: boolean) => !prev)
      },
      description: '关闭面板',
      preventDefault: false,
    },

    // === 标签页导航 ===
    { key: 'Tab', ctrlKey: true, action: () => switchToNextTab(), description: '下一个标签页', preventDefault: true },
    { key: 'Tab', ctrlKey: true, shiftKey: true, action: () => switchToPrevTab(), description: '上一个标签页', preventDefault: true },
    {
      key: 'ArrowLeft', altKey: true,
      action: () => { if (!ui.editorFocused) switchToPrevTab() },
      description: '上一个标签页（非编辑器焦点）',
      preventDefault: false,
    },
    {
      key: 'ArrowRight', altKey: true,
      action: () => { if (!ui.editorFocused) switchToNextTab() },
      description: '下一个标签页（非编辑器焦点）',
      preventDefault: false,
    },
  ], [handleSaveFile, handleOpenFile, openTab, ui, getActiveTab, handleCloseTab, isMobile, mobileSidebarOpen, setMobileSidebarOpen, createNewWindow, switchToNextTab, switchToPrevTab])

  useKeyboardShortcuts(shortcuts)
}
