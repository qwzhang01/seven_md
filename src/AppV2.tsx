/**
 * MD Mate V2 - 新版主布局
 * VS Code 风格: TitleBar + MenuBar + Toolbar + [ActivityBar|Sidebar] + [Editor|Preview] + StatusBar
 */

import { useState, useCallback, useEffect } from 'react'
import { open } from '@tauri-apps/plugin-dialog'

// New V2 Components
import { TitleBar } from './components/titlebar-v2/TitleBar'
import { MenuBar } from './components/menubar-v2/MenuBar'
import { Toolbar } from './components/toolbar-v2/Toolbar'
import { ActivityBar } from './components/activitybar-v2/ActivityBar'
import { Sidebar } from './components/sidebar-v2/Sidebar'
import { CommandPalette } from './components/cmd-palette/CommandPalette'
import { AIPanel } from './components/ai-panel/AIPanel'
import { NotificationContainer } from './components/notification-v2/NotificationContainer'
import { DirtyTabModal } from './components/modal-v2/DirtyTabModal'
import { StatusBar as StatusBarV2 } from './components/statusbar-v2/StatusBar'
import { Gutter, EditorPaneV2, FindReplaceBar, PreviewPaneV2 } from './components/editor-v2'

// Legacy components (removed - using V2 now)
import { ErrorBoundary } from './components/ErrorBoundary'

// Stores
import { useUIStore, useFileStore, useThemeStore, useNotificationStore, useEditorStore } from './stores'
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

  const activeTab = getActiveTab()
  const activeContent = activeTab?.content ?? ''

  // Editor pixel width state (null = flex:1, auto split)
  const [editorWidth, setEditorWidth] = useState<number | null>(null)

  // Dirty tab modal
  const [dirtyTabId, setDirtyTabId] = useState<string | null>(null)
  const dirtyTab = dirtyTabId ? tabs.find((t) => t.id === dirtyTabId) : null

  // Handle window resize: auto-adjust sidebar and layout
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      // Auto-collapse sidebar on small screens
      if (width < 768 && ui.sidebarVisible) {
        ui.setSidebarVisible(false)
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
  }, [ui, editorWidth])

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
      addNotification({ type: 'error', message: `打开文件失败: ${e}`, autoClose: true, duration: 4000 })
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

  // Listen to custom events from menus/toolbar
  useEffect(() => {
    const handlers = [
      ['app:save-file', handleSaveFile],
      ['app:open-file', handleOpenFile],
      ['app:new-file', () => openTab(null, '')],
    ] as const

    handlers.forEach(([event, handler]) => {
      window.addEventListener(event, handler as EventListener)
    })

    return () => {
      handlers.forEach(([event, handler]) => {
        window.removeEventListener(event, handler as EventListener)
      })
    }
  }, [handleSaveFile, handleOpenFile, openTab])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMeta = e.metaKey || e.ctrlKey
      if (isMeta && e.key === 's') { e.preventDefault(); handleSaveFile() }
      if (isMeta && e.key === 'o') { e.preventDefault(); handleOpenFile() }
      if (isMeta && e.key === 'n') { e.preventDefault(); openTab(null, '') }
      if (isMeta && e.shiftKey && e.key === 'P') { e.preventDefault(); ui.toggleCommandPalette() }
      if (isMeta && e.key === 'b' && !e.shiftKey) { e.preventDefault(); ui.toggleSidebar() }
      if (isMeta && e.key === 'f' && !e.shiftKey) { e.preventDefault(); ui.setFindReplaceMode('find') }
      if (isMeta && e.key === '=' || (isMeta && e.key === '+')) { e.preventDefault(); ui.zoomIn() }
      if (isMeta && e.key === '-') { e.preventDefault(); ui.zoomOut() }
      if (isMeta && e.key === '0') { e.preventDefault(); ui.setZoomLevel(14) }
      if (e.key === 'Escape') {
        if (ui.commandPaletteOpen) ui.setCommandPaletteOpen(false)
        if (ui.aiPanelOpen) ui.setAIPanelOpen(false)
        if (ui.findReplaceOpen) ui.setFindReplaceOpen(false)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleSaveFile, handleOpenFile, openTab, ui])

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
      {/* === TITLE BAR === */}
      <div data-tauri-drag-region style={{ height: 'var(--titlebar-height, 38px)', flexShrink: 0 }}>
        <TitleBar onCloseTab={handleCloseTab} />
      </div>

      {/* === MENU BAR === */}
      <MenuBar />

      {/* === TOOLBAR === */}
      <Toolbar />

      {/* === MAIN AREA === */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Activity Bar */}
        <div data-component="activitybar">
          <ActivityBar />
        </div>

        {/* Sidebar */}
        <ErrorBoundary boundaryName="Sidebar">
          <div data-component="sidebar" data-collapsed={!ui.sidebarVisible}>
            <Sidebar content={activeContent} />
          </div>
        </ErrorBoundary>

        {/* Editor Area */}
        <div className="flex-1 flex flex-col overflow-hidden" style={{ minWidth: 0 }}>
          {/* Editor + Preview */}
          <div id="md-mate-editor-preview" data-component="editor-preview" className="flex-1 flex overflow-hidden relative">
            {/* Editor Pane */}
            {showEditor && tabs.length > 0 && (
              <div
                data-component="editor-pane"
                className="relative flex-col flex"
                style={{
                  flex: editorWidth ? `0 0 ${editorWidth}px` : 1,
                  overflow: 'hidden',
                  transition: 'flex 0.1s ease',
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

            {/* Gutter */}
            {showGutter && tabs.length > 0 && (
              <div data-component="gutter">
                <Gutter onResize={handleGutterResize} />
              </div>
            )}

            {/* Preview Pane */}
            {showPreview && tabs.length > 0 && (
              <div data-component="preview-pane" style={{ flex: 1, overflow: 'hidden', minWidth: MIN_EDITOR_WIDTH }}>
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
