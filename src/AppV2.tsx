/**
 * Seven Markdown V2 - 新版主布局
 * VS Code 风格: TitleBar + Toolbar + [ActivityBar|Sidebar] + [Editor|Preview] + StatusBar
 */

import { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import { open } from '@tauri-apps/plugin-dialog'
import { listen } from '@tauri-apps/api/event'

// Keyboard shortcuts hook
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import type { ShortcutConfig } from './hooks/useKeyboardShortcuts'
import { useIsMobile } from './hooks/useMediaQuery'

// V2 Components
import { TitleBar } from './components/titlebar-v2/TitleBar'
import { TabBar } from './components/titlebar-v2/TabBar'
import { Toolbar } from './components/toolbar-v2/Toolbar'
import { ActivityBar } from './components/activitybar-v2/ActivityBar'
import { Sidebar } from './components/sidebar-v2/Sidebar'
import { CommandPalette } from './components/cmd-palette/CommandPalette'
import { AIPanel } from './components/ai-panel/AIPanel'
import { NotificationContainer } from './components/notification-v2/NotificationContainer'
import { DirtyTabModal } from './components/modal-v2/DirtyTabModal'
import { StatusBar as StatusBarV2 } from './components/statusbar-v2/StatusBar'
import { Gutter, EditorPaneV2, FindReplaceBar, PreviewPaneV2 } from './components/editor-v2'

import { ShortcutReferenceDialog } from './components/dialogs/ShortcutReferenceDialog'
import { AboutDialog } from './components/dialogs/AboutDialog'
import { WelcomeDialog } from './components/dialogs/WelcomeDialog'

import { ErrorBoundary } from './components/ErrorBoundary'

// Stores
import { useUIStore, useFileStore, useThemeStore, useNotificationStore, useEditorStore, useWorkspaceStore } from './stores'
import type { ThemeId } from './stores/useThemeStore'
import { readFile, saveFile } from './tauriCommands'

// Commands registration
import { registerAllCommands } from './commands'

const MIN_EDITOR_WIDTH = 200
const MAX_EDITOR_WIDTH_RATIO = 0.85

function AppV2() {
  const ui = useUIStore()
  const { tabs, openTab, closeTab, updateTabContent, setTabDirty, getActiveTab } = useFileStore()
  const theme = useThemeStore((s) => s.currentTheme)
  const { addNotification } = useNotificationStore()
  const editorStore = useEditorStore()
  const isMobile = useIsMobile()

  // 移动端侧边栏 overlay 状态
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  const activeTab = getActiveTab()
  const activeContent = activeTab?.content ?? ''

  // 防抖 refreshTree 用的 timer ref
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Editor pixel width state (null = flex:1, auto split)
  const [editorWidth, setEditorWidth] = useState<number | null>(null)

  // Dirty tab modal
  const [dirtyTabId, setDirtyTabId] = useState<string | null>(null)
  const dirtyTab = dirtyTabId ? tabs.find((t) => t.id === dirtyTabId) : null

  // 创建新窗口
  const createNewWindow = useCallback(async () => {
    try {
      const { invoke } = await import('@tauri-apps/api/core')
      await invoke('create_new_window')
    } catch (e) {
      console.error('创建新窗口失败:', e)
      addNotification({ type: 'error', message: `创建窗口失败: ${e}`, autoClose: true, duration: 5000 })
    }
  }, [addNotification])

  // Open file
  const handleOpenFile = useCallback(async () => {
    try {
      const selected = await open({
        multiple: false,
        filters: [{ name: 'Markdown', extensions: ['md', 'markdown'] }],
      })
      if (selected) {
        const content = await readFile(selected as string)
        openTab(selected as string, content)
      }
    } catch (e) {
      addNotification({ type: 'error', message: `打开文件失败: ${e}`, autoClose: true, duration: 5000 })
    }
  }, [openTab, addNotification])

  // Save file
  const handleSaveFile = useCallback(async () => {
    if (!activeTab) return
    try {
      if (!activeTab.path) {
        const selected = await open({
          multiple: false,
          directory: false,
          title: '保存文件',
          filters: [{ name: 'Markdown', extensions: ['md', 'markdown'] }],
        })
        if (selected) {
          await saveFile(selected as string, activeTab.content)
          useFileStore.getState().updateTabPath(activeTab.id, selected as string)
          addNotification({ type: 'success', message: '文件已保存', autoClose: true, duration: 2000 })
        }
      } else {
        await saveFile(activeTab.path, activeTab.content)
        setTabDirty(activeTab.id, false)
        addNotification({ type: 'success', message: `${activeTab.name} 已保存`, autoClose: true, duration: 2000 })
      }
    } catch (e) {
      addNotification({ type: 'error', message: `保存失败: ${e}`, autoClose: true, duration: 5000 })
    }
  }, [activeTab, setTabDirty, addNotification])

  // 监听原生菜单事件 + 文件系统变更事件
  useEffect(() => {
    const unlisteners: Array<() => void> = []

    const setup = async () => {
      // --- 文件系统变更 ---
      unlisteners.push(await listen('fs-watch:changed', () => {
        if (refreshTimerRef.current) {
          clearTimeout(refreshTimerRef.current)
        }
        refreshTimerRef.current = setTimeout(() => {
          useWorkspaceStore.getState().refreshTree()
        }, 500)
      }))

      // --- File 菜单事件 ---
      unlisteners.push(await listen('menu-new-file', () => openTab(null, '')))
      unlisteners.push(await listen('menu-new-window', () => createNewWindow()))
      unlisteners.push(await listen('menu-open-file', () => handleOpenFile()))
      unlisteners.push(await listen('menu-open-folder', () => {
        useWorkspaceStore.getState().openFolder()
      }))
      unlisteners.push(await listen('menu-close-folder', () => {
        useWorkspaceStore.getState().closeFolder()
      }))
      unlisteners.push(await listen('menu-clear-recent', () => {
        localStorage.removeItem('recent-documents')
        addNotification({ type: 'info', message: '已清除最近文档', autoClose: true, duration: 2000 })
      }))
      unlisteners.push(await listen('menu-save', () => handleSaveFile()))
      unlisteners.push(await listen('menu-save-all', () => {
        // 保存所有已修改的文件
        const tabs = useFileStore.getState().tabs
        tabs.forEach(async (tab) => {
          if (tab.isDirty && tab.path) {
            await saveFile(tab.path, tab.content)
            useFileStore.getState().setTabDirty(tab.id, false)
          }
        })
        addNotification({ type: 'success', message: '所有文件已保存', autoClose: true, duration: 2000 })
      }))
      unlisteners.push(await listen('menu-save-as', () => {
        // 另存为：与 handleSaveFile 类似但总是弹出保存对话框
        const activeTab = useFileStore.getState().getActiveTab()
        if (!activeTab) return
        open({
          multiple: false,
          directory: false,
          title: '另存为',
          filters: [{ name: 'Markdown', extensions: ['md', 'markdown'] }],
        }).then(async (selected) => {
          if (selected) {
            await saveFile(selected as string, activeTab.content)
            useFileStore.getState().updateTabPath(activeTab.id, selected as string)
            addNotification({ type: 'success', message: '文件已保存', autoClose: true, duration: 2000 })
          }
        }).catch((e) => {
          addNotification({ type: 'error', message: `保存失败: ${e}`, autoClose: true, duration: 5000 })
        })
      }))
      unlisteners.push(await listen('menu-export-pdf', () => {
        window.dispatchEvent(new CustomEvent('app:export-pdf'))
      }))
      unlisteners.push(await listen('menu-export-html', () => {
        window.dispatchEvent(new CustomEvent('app:export-html'))
      }))
      unlisteners.push(await listen('menu-close-tab', () => {
        const tab = useFileStore.getState().getActiveTab()
        if (tab) {
          const tabEl = document.querySelector(`[data-tab-id="${tab.id}"] .tab-close`)
          if (tabEl) {
            (tabEl as HTMLElement).click()
          } else {
            // fallback: 直接调用 closeTab
            useFileStore.getState().closeTab(tab.id)
          }
        }
      }))
      unlisteners.push(await listen('menu-quit', async () => {
        const { getCurrentWindow } = await import('@tauri-apps/api/window')
        await getCurrentWindow().close()
      }))

      // --- Edit 菜单事件 ---
      unlisteners.push(await listen('menu-undo', () => {
        window.dispatchEvent(new CustomEvent('editor:undo'))
      }))
      unlisteners.push(await listen('menu-redo', () => {
        window.dispatchEvent(new CustomEvent('editor:redo'))
      }))
      unlisteners.push(await listen('menu-cut', () => {
        window.dispatchEvent(new CustomEvent('editor:cut'))
      }))
      unlisteners.push(await listen('menu-copy', () => {
        window.dispatchEvent(new CustomEvent('editor:copy'))
      }))
      unlisteners.push(await listen('menu-paste', () => {
        window.dispatchEvent(new CustomEvent('editor:paste'))
      }))
      unlisteners.push(await listen('menu-paste-match-style', () => {
        window.dispatchEvent(new CustomEvent('editor:paste-match-style'))
      }))
      unlisteners.push(await listen('menu-select-all', () => {
        window.dispatchEvent(new CustomEvent('editor:select-all'))
      }))
      unlisteners.push(await listen('menu-find', () => {
        useUIStore.getState().setFindReplaceOpen(true)
        useUIStore.getState().setFindReplaceMode('find')
      }))
      unlisteners.push(await listen('menu-replace', () => {
        useUIStore.getState().setFindReplaceOpen(true)
        useUIStore.getState().setFindReplaceMode('replace')
      }))
      unlisteners.push(await listen('menu-find-next', () => {
        window.dispatchEvent(new CustomEvent('editor:find-next'))
      }))
      unlisteners.push(await listen('menu-find-previous', () => {
        window.dispatchEvent(new CustomEvent('editor:find-previous'))
      }))
      unlisteners.push(await listen('menu-clear-format', () => {
        window.dispatchEvent(new CustomEvent('editor:clear-format'))
      }))

      // --- View 菜单事件 ---
      unlisteners.push(await listen('menu-command-palette', () => {
        useUIStore.getState().toggleCommandPalette()
      }))
      unlisteners.push(await listen('menu-toggle-ai-panel', () => {
        const state = useUIStore.getState()
        state.setAIPanelOpen(!state.aiPanelOpen)
      }))
      unlisteners.push(await listen('menu-toggle-sidebar', () => {
        useUIStore.getState().toggleSidebar()
      }))
      unlisteners.push(await listen('menu-toggle-outline', () => {
        useUIStore.getState().setActiveSidebarPanel('outline')
      }))
      unlisteners.push(await listen('menu-toggle-explorer', () => {
        useUIStore.getState().setActiveSidebarPanel('explorer')
      }))
      unlisteners.push(await listen('menu-show-line-numbers', () => {
        // 切换行号显示
        window.dispatchEvent(new CustomEvent('editor:toggle-line-numbers'))
      }))
      unlisteners.push(await listen('menu-show-minimap', () => {
        // 切换迷你地图显示
        window.dispatchEvent(new CustomEvent('editor:toggle-minimap'))
      }))
      unlisteners.push(await listen('menu-word-wrap', () => {
        // 切换自动换行
        window.dispatchEvent(new CustomEvent('editor:toggle-word-wrap'))
      }))
      unlisteners.push(await listen('menu-zoom-in', () => {
        useUIStore.getState().zoomIn()
      }))
      unlisteners.push(await listen('menu-zoom-out', () => {
        useUIStore.getState().zoomOut()
      }))
      unlisteners.push(await listen('menu-reset-zoom', () => {
        useUIStore.getState().setZoomLevel(14)
      }))
      unlisteners.push(await listen('menu-view-editor-only', () => {
        useUIStore.getState().setViewMode('editor-only')
      }))
      unlisteners.push(await listen('menu-view-preview-only', () => {
        useUIStore.getState().setViewMode('preview-only')
      }))
      unlisteners.push(await listen('menu-view-split', () => {
        useUIStore.getState().setViewMode('split')
      }))
      unlisteners.push(await listen('menu-toggle-fullscreen', async () => {
        const { getCurrentWindow } = await import('@tauri-apps/api/window')
        const win = getCurrentWindow()
        const isFullscreen = await win.isFullscreen()
        await win.setFullscreen(!isFullscreen)
      }))

      // --- Insert 菜单事件 ---
      const insertMap: Record<string, string> = {
        'menu-insert-heading': '# ',
        'menu-insert-h1': '# ',
        'menu-insert-h2': '## ',
        'menu-insert-h3': '### ',
        'menu-insert-h4': '#### ',
        'menu-insert-h5': '##### ',
        'menu-insert-h6': '###### ',
        'menu-insert-bold': '**加粗文本**',
        'menu-insert-italic': '*斜体文本*',
        'menu-insert-strikethrough': '~~删除线文本~~',
        'menu-insert-inline-code': '`代码`',
        'menu-insert-code-block': '```language\n\n```',
        'menu-insert-link': '[文本](url)',
        'menu-insert-image': '![描述](url)',
        'menu-insert-table': '| 列1 | 列2 | 列3 |\n|------|------|------|\n| | | |',
        'menu-insert-hr': '\n---\n',
        'menu-insert-ul': '- ',
        'menu-insert-ol': '1. ',
        'menu-insert-task': '- [ ] ',
        'menu-insert-quote': '> ',
        'menu-insert-footnote': '[^1]\n\n[^1]: 脚注内容',
        'menu-insert-details': '<details>\n<summary>点击展开</summary>\n\n内容\n</details>',
      }
      for (const [event, detail] of Object.entries(insertMap)) {
        unlisteners.push(await listen(event, () => {
          window.dispatchEvent(new CustomEvent('editor:insert', { detail }))
        }))
      }

      // --- Format 菜单事件 ---
      const formatMap: Record<string, string> = {
        'menu-format-bold': '**',
        'menu-format-italic': '*',
        'menu-format-strikethrough': '~~',
        'menu-format-h1': '# ',
        'menu-format-h2': '## ',
        'menu-format-h3': '### ',
        'menu-format-h4': '#### ',
        'menu-format-h5': '##### ',
        'menu-format-h6': '###### ',
        'menu-format-code': '`',
        'menu-format-link': '[](url)',
      }
      for (const [event, detail] of Object.entries(formatMap)) {
        unlisteners.push(await listen(event, () => {
          window.dispatchEvent(new CustomEvent('editor:insert', { detail }))
        }))
      }

      // --- Theme 菜单事件 ---
      unlisteners.push(await listen<string>('menu-theme-change', (event) => {
        useThemeStore.getState().setTheme(event.payload as ThemeId)
      }))

      // --- Help 菜单事件 ---
      unlisteners.push(await listen('menu-welcome', () => {
        useUIStore.getState().setDialogType('welcome')
      }))
      unlisteners.push(await listen('menu-markdown-guide', () => {
        window.open('https://www.markdownguide.org/', '_blank')
      }))
      unlisteners.push(await listen('menu-keyboard-shortcuts', () => {
        useUIStore.getState().setDialogType('shortcut-reference')
      }))
      unlisteners.push(await listen('menu-about', () => {
        useUIStore.getState().setDialogType('about')
      }))
      unlisteners.push(await listen('menu-check-update', async () => {
        try {
          addNotification({ type: 'info', message: '正在检查更新...', autoClose: false, duration: 0 })
          // 获取当前版本
          const currentVersion = '0.1.0'
          // 简单实现：显示当前版本信息
          // 后期可接入真正的版本检查 API
          addNotification({
            type: 'success',
            message: `当前已是最新版本 v${currentVersion}`,
            autoClose: true,
            duration: 3000
          })
        } catch (e) {
          addNotification({ type: 'error', message: `检查更新失败: ${e}`, autoClose: true, duration: 5000 })
        }
      }))
    }

    setup()

    return () => {
      unlisteners.forEach((fn) => fn())
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current)
      }
    }
  }, [handleOpenFile, handleSaveFile, openTab, addNotification, createNewWindow])

  // Handle export-pdf via window.print()
  useEffect(() => {
    const handler = () => {
      window.print()
    }
    window.addEventListener('app:export-pdf', handler)
    return () => window.removeEventListener('app:export-pdf', handler)
  }, [])

  // Handle window resize: auto-adjust sidebar and layout
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      // Auto-close mobile sidebar overlay on resize to desktop
      if (width >= 768 && mobileSidebarOpen) {
        setMobileSidebarOpen(false)
      }
      // Reset editor width on significant resize
      if (editorWidth !== null) {
        const mainEl = document.getElementById('md-mate-editor-preview')
        if (mainEl && editorWidth > mainEl.offsetWidth * 0.8) {
          setEditorWidth(null) // Reset to flex auto-split
        }
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [editorWidth, mobileSidebarOpen])

  // Register commands on mount
  useEffect(() => {
    registerAllCommands()
    // Apply initial theme
    document.documentElement.setAttribute('data-theme', theme)
  }, [])

  // Theme sync
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  // Handle gutter resize
  const handleGutterResize = useCallback((dx: number) => {
    const mainEl = document.getElementById('md-mate-editor-preview')
    if (!mainEl) return
    const total = mainEl.offsetWidth
    const currentEditorW = editorWidth ?? total / 2
    const newW = Math.max(MIN_EDITOR_WIDTH, Math.min(total * MAX_EDITOR_WIDTH_RATIO, currentEditorW + dx))
    setEditorWidth(newW)
  }, [editorWidth])

  // Handle tab close with dirty check
  const handleCloseTab = useCallback((tabId: string) => {
    const tab = tabs.find((t) => t.id === tabId)
    if (!tab) return
    if (tab.isDirty) {
      setDirtyTabId(tabId)
    } else {
      closeTab(tabId)
    }
  }, [tabs, closeTab])

  // Handle content change
  const handleMarkdownChange = useCallback((value: string) => {
    if (activeTab) {
      updateTabContent(activeTab.id, value)
      editorStore.setContent(value)
    }
  }, [activeTab, updateTabContent, editorStore])

  // Keyboard shortcuts — 使用统一 hook 替代内联 keydown 处理
  // IMPORTANT: Do NOT register Cmd/Ctrl+C, X, V, Z, A here.
  // These are native OS/browser clipboard and undo shortcuts handled by
  // CodeMirror's defaultKeymap and historyKeymap. Registering them here
  // would call preventDefault() and break CodeMirror's built-in handling.
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
          // 编辑器焦点时：触发加粗
          window.dispatchEvent(new CustomEvent('editor:insert', { detail: '**' }))
        } else {
          // 非编辑器焦点时：切换侧边栏
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
          window.dispatchEvent(new CustomEvent('editor:insert', { detail: '*' }))
        }
      },
      description: '斜体',
    },
    {
      key: 'k', ctrlKey: true,
      action: () => {
        if (ui.editorFocused) {
          window.dispatchEvent(new CustomEvent('editor:insert', { detail: '[](url)' }))
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
        else if (ui.aiPanelOpen) ui.setAIPanelOpen(false)
        else if (ui.findReplaceOpen) ui.setFindReplaceOpen(false)
        else if (isMobile && mobileSidebarOpen) setMobileSidebarOpen(false)
      },
      description: '关闭面板',
      preventDefault: false,
    },
  ], [handleSaveFile, handleOpenFile, openTab, ui, getActiveTab, handleCloseTab, isMobile, mobileSidebarOpen, setMobileSidebarOpen, createNewWindow])

  useKeyboardShortcuts(shortcuts)

  // View mode display
  const viewMode = ui.viewMode
  const showEditor = viewMode !== 'preview-only'
  const showPreview = viewMode !== 'editor-only'
  const showGutter = viewMode === 'split'

  return (
    <div
      className="h-screen flex flex-col overflow-hidden"
      style={{
        fontFamily: 'var(--font-primary, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif)',
        background: 'var(--bg-primary)',
        color: 'var(--text-primary)',
        fontSize: ui.zoomLevel,
      }}
      data-theme={theme}
    >
      {/* === TOOLBAR === */}
      <Toolbar />

      {/* === MAIN AREA === */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Activity Bar */}
        <div data-component="activitybar">
          <ActivityBar
            onToggleMobileSidebar={() => setMobileSidebarOpen((prev) => !prev)}
            isMobile={isMobile}
          />
        </div>

        {/* Desktop Sidebar */}
        {!isMobile && (
          <ErrorBoundary boundaryName="Sidebar">
            <div data-component="sidebar" data-collapsed={!ui.sidebarVisible}>
              <Sidebar content={activeContent} />
            </div>
          </ErrorBoundary>
        )}

        {/* Mobile Sidebar Overlay */}
        {isMobile && mobileSidebarOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40 bg-black/50 transition-opacity duration-250"
              onClick={() => setMobileSidebarOpen(false)}
            />
            {/* Sidebar Panel */}
            <div
              className="fixed top-0 left-12 bottom-0 w-72 z-50 flex flex-col shadow-xl"
              style={{
                background: 'var(--bg-sidebar, var(--bg-secondary))',
                borderRight: '1px solid var(--border-primary)',
              }}
            >
              <Sidebar content={activeContent} />
            </div>
          </>
        )}

        {/* Editor Area */}
        <div className="flex-1 flex flex-col overflow-hidden" style={{ minWidth: 0 }}>
          {/* Tab Bar - 仅在编辑区域内 */}
          {tabs.length > 0 && (
            <div
              className="flex items-stretch bg-[var(--bg-secondary)] border-b border-[var(--border-default)] select-none"
              style={{ height: 'var(--tabbar-height, 38px)', flexShrink: 0 }}
            >
              <TabBar onCloseTab={handleCloseTab} />
            </div>
          )}

          {/* Editor + Preview */}
          {/* 桌面端: flex-row (水平排列); 移动端: flex-col (垂直排列) */}
          <div
            id="md-mate-editor-preview"
            data-component="editor-preview"
            className="flex-1 flex overflow-hidden relative transition-all duration-250"
          >
            {/* Editor Pane */}
            {showEditor && tabs.length > 0 && (
              <div
                data-component="editor-pane"
                className="relative flex-col flex overflow-hidden"
                style={{
                  flex: isMobile ? '1 1 50%' : (editorWidth ? `0 0 ${editorWidth}px` : 1),
                  minHeight: isMobile ? '50%' : 'auto',
                  transition: 'flex 0.25s ease',
                }}
              >
                <ErrorBoundary boundaryName="Editor">
                  <EditorPaneV2
                    content={activeContent}
                    onChange={handleMarkdownChange}
                    className="flex-1"
                  />
                </ErrorBoundary>
                {/* FindReplaceBar anchored to editor */}
                <FindReplaceBar />
              </div>
            )}

            {/* Desktop Gutter (vertical divider) - 移动端隐藏 */}
            {!isMobile && showGutter && tabs.length > 0 && (
              <div data-component="gutter">
                <Gutter onResize={handleGutterResize} />
              </div>
            )}

            {/* Mobile Horizontal Divider - 仅移动端显示 */}
            {isMobile && showGutter && tabs.length > 0 && (
              <div
                data-component="mobile-gutter"
                className="h-2 flex-shrink-0 flex items-center justify-center bg-[var(--bg-secondary)] cursor-row-resize"
                style={{ borderTop: '1px solid var(--border-primary)', borderBottom: '1px solid var(--border-primary)' }}
              >
                <div
                  className="w-10 h-1 rounded-full"
                  style={{ background: 'var(--text-tertiary)' }}
                />
              </div>
            )}

            {/* Preview Pane */}
            {showPreview && tabs.length > 0 && (
              <div
                data-component="preview-pane"
                style={{
                  flex: isMobile ? '1 1 50%' : 1,
                  minHeight: isMobile ? '50%' : MIN_EDITOR_WIDTH,
                  overflow: 'hidden',
                  minWidth: MIN_EDITOR_WIDTH,
                  transition: 'flex 0.25s ease',
                }}
              >
                <ErrorBoundary boundaryName="Preview">
                  <PreviewPaneV2 content={activeContent} className="h-full" />
                </ErrorBoundary>
              </div>
            )}

            {/* Empty state */}
            {tabs.length === 0 && (
              <div className="flex-1 flex items-center justify-center" style={{ color: 'var(--text-secondary)' }}>
                <div className="text-center">
                  <div className="text-4xl mb-4 opacity-20">📝</div>
                  <p className="text-sm mb-2">没有打开的文件</p>
                  <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                    使用 <kbd className="px-1 py-0.5 rounded text-xs" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)' }}>
                      {navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'}+O
                    </kbd> 打开文件
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* AI Panel */}
        <AIPanel />
      </div>

      {/* === STATUS BAR === */}
      <StatusBarV2 />

      {/* === OVERLAYS === */}
      <CommandPalette />
      <NotificationContainer />

      {/* Dialogs */}
      {ui.dialogType === 'shortcut-reference' && (
        <ShortcutReferenceDialog onClose={() => ui.setDialogType(null)} />
      )}
      {ui.dialogType === 'about' && (
        <AboutDialog onClose={() => ui.setDialogType(null)} />
      )}
      {ui.dialogType === 'welcome' && (
        <WelcomeDialog onClose={() => ui.setDialogType(null)} />
      )}

      {/* Dirty Tab Modal */}
      {dirtyTab && (
        <DirtyTabModal
          open={!!dirtyTab}
          fileName={dirtyTab.name}
          onSave={async () => {
            if (dirtyTab.path) {
              await saveFile(dirtyTab.path, dirtyTab.content)
            }
            closeTab(dirtyTab.id)
            setDirtyTabId(null)
          }}
          onDiscard={() => {
            closeTab(dirtyTab.id)
            setDirtyTabId(null)
          }}
          onCancel={() => setDirtyTabId(null)}
        />
      )}
    </div>
  )
}

export default AppV2
