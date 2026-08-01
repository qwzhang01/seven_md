/**
 * Seven Markdown V2 - 主布局
 * VS Code 风格: Toolbar + [ActivityBar|Sidebar] + [Editor|Preview] + StatusBar
 */

import { useState, useCallback, useEffect } from 'react'
import { useIsMobile } from './hooks/useMediaQuery'
import { useFileActions } from './hooks/useFileActions'
import { useTauriMenuListeners } from './hooks/useTauriMenuListeners'
import { useAppShortcuts } from './hooks/useAppShortcuts'

import { TabBar } from './components/titlebar-v2/TabBar'
import { Toolbar } from './components/toolbar-v2/Toolbar'
import { ActivityBar } from './components/activitybar-v2/ActivityBar'
import { Sidebar } from './components/sidebar-v2/Sidebar'
import { CommandPalette } from './components/cmd-palette/CommandPalette'
import { AIPanel } from './components/ai-panel/AIPanel'
import { NotificationContainer } from './components/notification-v2/NotificationContainer'
import { DirtyTabModal } from './components/modal-v2/DirtyTabModal'
import { StatusBar as StatusBarV2 } from './components/statusbar-v2/StatusBar'
import { EditorPreviewArea } from './components/editor-v2'

import { ShortcutReferenceDialog } from './components/dialogs/ShortcutReferenceDialog'
import { AboutDialog } from './components/dialogs/AboutDialog'
import { WelcomeDialog } from './components/dialogs/WelcomeDialog'
import { WechatPanel } from './wechat'

import { ErrorBoundary } from './components/ErrorBoundary'
import { DefaultContextMenu } from './components/shared/DefaultContextMenu'

import { useUIStore, useFileStore, useThemeStore, useNotificationStore, useEditorStore, useWorkspaceStore } from './stores'
import { readFile, saveFile } from './tauriCommands'
import { addRecentDocument } from './utils/recentDocuments'
import { registerAllCommands } from './commands'

function AppV2() {
  const ui = useUIStore()
  const { tabs, openTab, closeTab, updateTabContent, getActiveTab } = useFileStore()
  const theme = useThemeStore((s) => s.currentTheme)
  const { addNotification } = useNotificationStore()
  const editorStore = useEditorStore()
  const isMobile = useIsMobile()

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [defaultContextMenu, setDefaultContextMenu] = useState<{ x: number; y: number } | null>(null)
  const [dirtyTabId, setDirtyTabId] = useState<string | null>(null)

  const activeTab = getActiveTab()
  const activeContent = activeTab?.content ?? ''
  const dirtyTab = dirtyTabId ? tabs.find((t) => t.id === dirtyTabId) : null

  // File operations (open, save, new window) + stable refs for menu listeners
  const fileActions = useFileActions()
  useTauriMenuListeners({
    handleOpenFileRef: fileActions.handleOpenFileRef,
    handleSaveFileRef: fileActions.handleSaveFileRef,
    openTabRef: fileActions.openTabRef,
    addNotificationRef: fileActions.addNotificationRef,
    createNewWindowRef: fileActions.createNewWindowRef,
  })

  // Keyboard shortcuts
  const handleCloseTab = useCallback((tabId: string) => {
    const tab = tabs.find((t) => t.id === tabId)
    if (!tab) return
    if (tab.isDirty) {
      setDirtyTabId(tabId)
    } else {
      closeTab(tabId)
    }
  }, [tabs, closeTab])

  useAppShortcuts({
    handleSaveFile: fileActions.handleSaveFile,
    handleOpenFile: fileActions.handleOpenFile,
    createNewWindow: fileActions.createNewWindow,
    handleCloseTab,
    mobileSidebarOpen,
    setMobileSidebarOpen,
  })

  // 全局 contextmenu 拦截
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      e.preventDefault()
      if ((e as any).__contextMenuHandled) return
      const target = e.target as HTMLElement
      const isSilentZone = !!(
        target.closest('[data-component="activitybar"]') ||
        target.closest('[data-component="toolbar"]') ||
        target.closest('[data-component="statusbar"]')
      )
      if (!isSilentZone) {
        setDefaultContextMenu({ x: e.clientX, y: e.clientY })
      }
    }
    document.addEventListener('contextmenu', handler)
    return () => document.removeEventListener('contextmenu', handler)
  }, [])

  // Handle export-pdf via window.print()
  useEffect(() => {
    const handler = () => window.print()
    window.addEventListener('app:export-pdf', handler)
    return () => window.removeEventListener('app:export-pdf', handler)
  }, [])

  // Handle WelcomeDialog quick-action events
  useEffect(() => {
    const onNewFile = () => openTab(null, '')
    const onOpenFile = () => fileActions.handleOpenFile()
    const onOpenFolder = async () => {
      await useWorkspaceStore.getState().openFolder()
      const folderPath = useWorkspaceStore.getState().folderPath
      if (folderPath) addRecentDocument(folderPath, 'folder')
    }
    window.addEventListener('app:new-file', onNewFile)
    window.addEventListener('app:open-file', onOpenFile)
    window.addEventListener('app:open-folder', onOpenFolder)
    return () => {
      window.removeEventListener('app:new-file', onNewFile)
      window.removeEventListener('app:open-file', onOpenFile)
      window.removeEventListener('app:open-folder', onOpenFolder)
    }
  }, [openTab, fileActions, addNotification])

  // Handle app:open-recent
  useEffect(() => {
    const handler = async (e: Event) => {
      const detail = (e as CustomEvent<{ path: string; type: 'file' | 'folder' } | string>).detail
      const path = typeof detail === 'string' ? detail : detail?.path
      const type = typeof detail === 'string' ? 'file' : (detail?.type ?? 'file')
      if (!path) return
      try {
        if (type === 'folder') {
          const { readDirectory, startFsWatch } = await import('./tauriCommands')
          const nodes = await readDirectory(path)
          const newTree = new Map<string, import('./types').FileTreeNode[]>()
          newTree.set(path, nodes)
          useWorkspaceStore.setState({
            folderPath: path,
            folderTree: newTree,
            expandedDirs: new Set(),
            rootNodes: nodes,
            isLoading: false,
          })
          await startFsWatch(path)
          addRecentDocument(path, 'folder')
        } else {
          const content = await readFile(path)
          openTab(path, content)
          addRecentDocument(path, 'file')
        }
      } catch (err) {
        addNotification({ type: 'error', message: `打开最近文档失败: ${err}`, autoClose: true, duration: 5000 })
      }
    }
    window.addEventListener('app:open-recent', handler)
    return () => window.removeEventListener('app:open-recent', handler)
  }, [openTab, addNotification])

  // Handle window resize: auto-close mobile sidebar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && mobileSidebarOpen) {
        setMobileSidebarOpen(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [mobileSidebarOpen])

  // Register commands + apply initial theme on mount
  useEffect(() => {
    registerAllCommands()
    document.documentElement.setAttribute('data-theme', theme)
  }, [])

  // Theme sync
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  // Handle content change
  const handleMarkdownChange = useCallback((value: string) => {
    if (activeTab) {
      updateTabContent(activeTab.id, value)
      editorStore.setContent(value)
    }
  }, [activeTab, updateTabContent, editorStore])

  return (
    <div
      className="flex flex-col overflow-hidden"
      style={{
        fontFamily: 'var(--font-primary, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif)',
        background: 'var(--bg-primary)',
        color: 'var(--text-primary)',
        fontSize: ui.zoomLevel,
        height: '100%',
      }}
      data-theme={theme}
    >
      {/* === TOOLBAR === */}
      <div data-component="toolbar">
        <Toolbar />
      </div>

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
            <div
              className="fixed inset-0 z-40 bg-black/50 transition-opacity duration-250"
              onClick={() => setMobileSidebarOpen(false)}
            />
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
          {/* Tab Bar */}
          {tabs.length > 0 && (
            <div
              className="flex items-stretch bg-[var(--bg-secondary)] border-b border-[var(--border-default)] select-none"
              style={{ height: 'var(--tabbar-height, 38px)', flexShrink: 0 }}
            >
              <TabBar onCloseTab={handleCloseTab} />
            </div>
          )}

          {/* Editor + Preview */}
          <EditorPreviewArea
            tabsLength={tabs.length}
            activeContent={activeContent}
            viewMode={ui.viewMode}
            editorWidth={ui.editorWidth}
            setEditorWidth={ui.setEditorWidth}
            isMobile={isMobile}
            onMarkdownChange={handleMarkdownChange}
          />
        </div>

        {/* AI Panel */}
        <AIPanel />
      </div>

      {/* === STATUS BAR === */}
      <div data-component="statusbar">
        <StatusBarV2 />
      </div>

      {/* === OVERLAYS === */}
      <CommandPalette />
      <NotificationContainer />

      {/* 全局兜底右键菜单 */}
      {defaultContextMenu && (
        <DefaultContextMenu
          x={defaultContextMenu.x}
          y={defaultContextMenu.y}
          onClose={() => setDefaultContextMenu(null)}
        />
      )}

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

      {/* WeChat Export Panel */}
      <WechatPanel />
    </div>
  )
}

export default AppV2
