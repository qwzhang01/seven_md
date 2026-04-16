import { useEffect, useCallback, useState, useTransition } from 'react'
import { open } from '@tauri-apps/plugin-dialog'
import { listen } from '@tauri-apps/api/event'
import { readFile, saveFile } from './tauriCommands'
import EditorPane from './components/EditorPane'
import PreviewPane from './components/PreviewPane'
import Sidebar from './components/Sidebar'
import CollapsiblePane from './components/CollapsiblePane'
import { TitleBar } from './components/TitleBar'
import { StatusBar } from './components/StatusBar'
import { TabBar } from './components/TabBar'
import { DirtyTabDialog } from './components/DirtyTabDialog'
import { ErrorBoundary } from './components/ErrorBoundary'
import { AppProvider, useAppState } from './context/AppContext'
import { EditorProvider, useEditor } from './context/EditorContext'
import { useSidebarState, usePaneState, useFolder } from './hooks/useAppState'
import { useTheme } from './hooks/useTheme'
import { useKeyboardShortcuts, isMacOS } from './hooks/useKeyboardShortcuts'
import { usePerformanceMonitor } from './hooks/usePerformanceMonitor'
import { useExport } from './hooks/useExport'
import { loadPersistedState, savePersistedState } from './utils/persistence'
import { migrateToTabState, restoreTabsFromStorage, saveTabState, startTabAutosave } from './utils/tabPersistence'
import { createLogger } from './utils/logger'

const logger = createLogger('App')

function AppContent() {
  const { state, dispatch } = useAppState()
  const { theme, toggleTheme } = useTheme()
  const { collapsed: sidebarCollapsed, toggle: toggleSidebar } = useSidebarState()
  const { 
    editorCollapsed, 
    previewCollapsed, 
    toggleEditor, 
    togglePreview 
  } = usePaneState()
  const { openFolder, closeFolder } = useFolder()
  const { undo, redo, selectAll, openSearch, openReplace, cut, copy, paste } = useEditor()
  
  // Performance monitoring (development only)
  usePerformanceMonitor('App', { 
    slowRenderThreshold: 16,
    warnOnSlowRender: import.meta.env.DEV 
  })
  
  logger.debug('App component rendered', { theme })
  
  // Zoom constants
  const MIN_ZOOM = 10
  const MAX_ZOOM = 32
  const ZOOM_STEP = 2
  
  // Derive active tab state
  const activeTab = state.tabs.tabs.find(t => t.id === state.tabs.activeTabId) ?? null
  const activeContent = activeTab?.content ?? ''
  const activeTabId = state.tabs.activeTabId

  // Export hook — uses active tab content and path
  const { exportPdf, exportHtml } = useExport(activeContent, activeTab?.path ?? null)

  // Dirty tab dialog state
  const [dirtyTabToClose, setDirtyTabToClose] = useState<string | null>(null)
  const dirtyTab = dirtyTabToClose ? state.tabs.tabs.find(t => t.id === dirtyTabToClose) ?? null : null

  // Max tab limit warning
  const MAX_TABS = 50
  const WARN_TABS = 40
  const tabCount = state.tabs.tabs.length
  const showTabLimitWarning = tabCount >= WARN_TABS && tabCount < MAX_TABS

  // Handle tab close with dirty check
  const handleCloseTab = useCallback((tab: { id: string; isDirty: boolean; path: string | null; content: string }) => {
    if (tab.isDirty) {
      setDirtyTabToClose(tab.id)
    } else {
      dispatch({ type: 'CLOSE_TAB', payload: tab.id })
    }
  }, [dispatch])

  // Handle new file
  const handleNewFile = useCallback(() => {
    dispatch({ type: 'OPEN_TAB', payload: { path: null, content: '' } })
    logger.debug('New file tab created')
  }, [dispatch])
  
  // Large file loading indicator
  const [isLoadingLargeFile, setIsLoadingLargeFile] = useState(false)
  const LARGE_FILE_THRESHOLD = 1024 * 1024 // 1MB

  // Handle open file
  const handleOpenFile = useCallback(async () => {
    try {
      const selected = await open({
        multiple: false,
        filters: [{
          name: 'Markdown',
          extensions: ['md', 'markdown']
        }]
      })
      
      if (selected) {
        // Show loading indicator for large files
        setIsLoadingLargeFile(true)
        try {
          const content = await readFile(selected as string)
          if (content.length > LARGE_FILE_THRESHOLD) {
            logger.debug('Large file opened', { path: selected, size: content.length })
          }
          dispatch({ type: 'OPEN_TAB', payload: { path: selected as string, content } })
        } finally {
          setIsLoadingLargeFile(false)
        }
      }
    } catch (error) {
      setIsLoadingLargeFile(false)
      logger.error('Failed to open file', { error: String(error) })
    }
  }, [dispatch])
  
  // Save error state
  const [saveError, setSaveError] = useState<string | null>(null)

  // Handle save file
  const handleSaveFile = useCallback(async () => {
    if (!activeTab) return
    setSaveError(null)
    if (!activeTab.path) {
      const selected = await open({
        multiple: false,
        directory: false,
        title: 'Save Markdown File',
        filters: [{
          name: 'Markdown',
          extensions: ['md', 'markdown']
        }]
      })
      
      if (selected && activeTabId) {
        try {
          await saveFile(selected as string, activeTab.content)
          dispatch({ type: 'UPDATE_TAB_PATH', payload: { tabId: activeTabId, path: selected as string } })
        } catch (error) {
          const msg = String(error)
          if (msg.includes('permission') || msg.includes('access denied') || msg.includes('EACCES')) {
            setSaveError(`Permission denied: Cannot save to "${selected}". Check file permissions.`)
          } else {
            setSaveError(`Failed to save file: ${msg}`)
          }
          logger.error('Failed to save file', { error: msg })
        }
      }
    } else {
        try {
          await saveFile(activeTab.path, activeTab.content)
          if (activeTabId) {
            dispatch({ type: 'SET_TAB_DIRTY', payload: { tabId: activeTabId, isDirty: false } })
          }
        } catch (error) {
          const msg = String(error)
          if (msg.includes('permission') || msg.includes('access denied') || msg.includes('EACCES')) {
            setSaveError(`Permission denied: Cannot save "${activeTab.path}". Check file permissions.`)
          } else if (msg.includes('no such file') || msg.includes('ENOENT')) {
            setSaveError(`File not found: "${activeTab.path}" may have been moved or deleted.`)
          } else if (msg.includes('network') || msg.includes('ENETDOWN') || msg.includes('EHOSTUNREACH') || msg.includes('ETIMEDOUT') || msg.includes('unreachable')) {
            setSaveError(`Network error: Cannot save "${activeTab.path}". Check your network connection.`)
          } else {
            setSaveError(`Failed to save: ${msg}`)
          }
          logger.error('Failed to save file', { error: msg, path: activeTab.path })
        }
    }
  }, [dispatch, activeTab, activeTabId])
  
  // Handle save as
  const handleSaveAs = useCallback(async () => {
    if (!activeTab || !activeTabId) return
    const selected = await open({
      multiple: false,
      directory: false,
      title: 'Save Markdown File',
      filters: [{
        name: 'Markdown',
        extensions: ['md', 'markdown']
      }]
    })
    
    if (selected) {
      await saveFile(selected as string, activeTab.content)
      dispatch({ type: 'UPDATE_TAB_PATH', payload: { tabId: activeTabId, path: selected as string } })
    }
  }, [dispatch, activeTab, activeTabId])
  
  // Handle zoom in
  const handleZoomIn = useCallback(() => {
    const newLevel = Math.min(state.ui.zoomLevel + ZOOM_STEP, MAX_ZOOM)
    dispatch({ type: 'SET_ZOOM_LEVEL', payload: newLevel })
  }, [dispatch, state.ui.zoomLevel])
  
  // Handle zoom out
  const handleZoomOut = useCallback(() => {
    const newLevel = Math.max(state.ui.zoomLevel - ZOOM_STEP, MIN_ZOOM)
    dispatch({ type: 'SET_ZOOM_LEVEL', payload: newLevel })
  }, [dispatch, state.ui.zoomLevel])
  
  // Handle full screen
  const handleFullScreen = useCallback(async () => {
    try {
      const { getCurrentWindow } = await import('@tauri-apps/api/window')
      const win = getCurrentWindow()
      const isFullscreen = await win.isFullscreen()
      await win.setFullscreen(!isFullscreen)
    } catch (error) {
      logger.error('Failed to toggle fullscreen', { error: String(error) })
    }
  }, [])
  
  // Tab navigation helpers
  // useTransition for non-urgent tab switching (performance optimization)
  const [, startTabTransition] = useTransition()

  const switchToNextTab = useCallback(() => {
    const tabs = state.tabs.tabs
    if (tabs.length < 2) return
    const idx = tabs.findIndex(t => t.id === state.tabs.activeTabId)
    const nextIdx = (idx + 1) % tabs.length
    const start = performance.now()
    startTabTransition(() => {
      dispatch({ type: 'SWITCH_TAB', payload: tabs[nextIdx].id })
      logger.debug('Tab switch performance', { ms: performance.now() - start })
    })
  }, [state.tabs, dispatch])

  const switchToPrevTab = useCallback(() => {
    const tabs = state.tabs.tabs
    if (tabs.length < 2) return
    const idx = tabs.findIndex(t => t.id === state.tabs.activeTabId)
    const prevIdx = (idx - 1 + tabs.length) % tabs.length
    const start = performance.now()
    startTabTransition(() => {
      dispatch({ type: 'SWITCH_TAB', payload: tabs[prevIdx].id })
      logger.debug('Tab switch performance', { ms: performance.now() - start })
    })
  }, [state.tabs, dispatch])

  const switchToTabByIndex = useCallback((index: number) => {
    const tabs = state.tabs.tabs
    if (index === 0) {
      // Cmd+0 = last tab
      if (tabs.length > 0) dispatch({ type: 'SWITCH_TAB', payload: tabs[tabs.length - 1].id })
    } else {
      const tab = tabs[index - 1]
      if (tab) dispatch({ type: 'SWITCH_TAB', payload: tab.id })
    }
  }, [state.tabs, dispatch])

  const closeActiveTab = useCallback(() => {
    if (!activeTab) return
    handleCloseTab(activeTab)
  }, [activeTab, handleCloseTab])

  const reopenClosedTab = useCallback(async () => {
    if (state.tabs.recentlyClosed.length === 0) return
    dispatch({ type: 'REOPEN_CLOSED_TAB' })
  }, [state.tabs.recentlyClosed, dispatch])

  // Setup keyboard shortcuts
  useKeyboardShortcuts([
    // File operations (global - work everywhere)
    { key: 'n', ctrlKey: true, action: handleNewFile, description: 'New File', global: true },
    { key: 'o', ctrlKey: true, action: handleOpenFile, description: 'Open File', global: true },
    { key: 'o', ctrlKey: true, shiftKey: true, action: () => openFolder(), description: 'Open Folder', global: true },
    { key: 's', ctrlKey: true, action: handleSaveFile, description: 'Save', global: true },
    { key: 's', ctrlKey: true, shiftKey: true, action: handleSaveAs, description: 'Save As', global: true },
    
    // Tab operations (global)
    { key: 'Tab', ctrlKey: true, action: switchToNextTab, description: 'Next Tab', global: true },
    { key: 'Tab', ctrlKey: true, shiftKey: true, action: switchToPrevTab, description: 'Previous Tab', global: true },
    { key: 'w', ctrlKey: true, action: closeActiveTab, description: 'Close Tab', global: true },
    { key: 'w', ctrlKey: true, shiftKey: true, action: () => dispatch({ type: 'CLOSE_ALL_TABS' }), description: 'Close All Tabs', global: true },
    { key: 't', ctrlKey: true, shiftKey: true, action: reopenClosedTab, description: 'Reopen Closed Tab', global: true },
    // Cmd/Ctrl+1-9 for specific tabs
    { key: '1', ctrlKey: true, action: () => switchToTabByIndex(1), description: 'Tab 1', global: true },
    { key: '2', ctrlKey: true, action: () => switchToTabByIndex(2), description: 'Tab 2', global: true },
    { key: '3', ctrlKey: true, action: () => switchToTabByIndex(3), description: 'Tab 3', global: true },
    { key: '4', ctrlKey: true, action: () => switchToTabByIndex(4), description: 'Tab 4', global: true },
    { key: '5', ctrlKey: true, action: () => switchToTabByIndex(5), description: 'Tab 5', global: true },
    { key: '6', ctrlKey: true, action: () => switchToTabByIndex(6), description: 'Tab 6', global: true },
    { key: '7', ctrlKey: true, action: () => switchToTabByIndex(7), description: 'Tab 7', global: true },
    { key: '8', ctrlKey: true, action: () => switchToTabByIndex(8), description: 'Tab 8', global: true },
    { key: '9', ctrlKey: true, action: () => switchToTabByIndex(9), description: 'Tab 9', global: true },
    { key: '0', ctrlKey: true, action: () => switchToTabByIndex(0), description: 'Last Tab', global: true },
    // Tab reordering with Ctrl+Shift+PageUp/Down
    { key: 'PageUp', ctrlKey: true, shiftKey: true, action: () => {
      const tabs = state.tabs.tabs
      const idx = tabs.findIndex(t => t.id === state.tabs.activeTabId)
      if (idx > 0) dispatch({ type: 'REORDER_TABS', payload: { fromIndex: idx, toIndex: idx - 1 } })
    }, description: 'Move Tab Left', global: true },
    { key: 'PageDown', ctrlKey: true, shiftKey: true, action: () => {
      const tabs = state.tabs.tabs
      const idx = tabs.findIndex(t => t.id === state.tabs.activeTabId)
      if (idx < tabs.length - 1) dispatch({ type: 'REORDER_TABS', payload: { fromIndex: idx, toIndex: idx + 1 } })
    }, description: 'Move Tab Right', global: true },
    // Alt+Left/Right for tab history navigation (previous/next tab in order)
    { key: 'ArrowLeft', altKey: true, action: switchToPrevTab, description: 'Previous Tab', global: true },
    { key: 'ArrowRight', altKey: true, action: switchToNextTab, description: 'Next Tab', global: true },
    
    // Export operations (global)
    { key: 'p', ctrlKey: true, shiftKey: true, action: exportPdf, description: 'Export as PDF', global: true },
    { key: 'e', ctrlKey: true, shiftKey: true, action: exportHtml, description: 'Export as HTML', global: true },

    // Edit operations (global - work everywhere)
    { key: 'z', ctrlKey: true, action: () => undo(), description: 'Undo', global: true },
    { key: 'z', ctrlKey: true, shiftKey: true, action: () => redo(), description: 'Redo', global: true },
    { key: 'x', ctrlKey: true, action: () => cut(), description: 'Cut', global: true },
    { key: 'c', ctrlKey: true, action: () => copy(), description: 'Copy', global: true },
    { key: 'v', ctrlKey: true, action: () => paste(), description: 'Paste', global: true },
    { key: 'a', ctrlKey: true, action: () => selectAll(), description: 'Select All', global: true },
    { key: 'f', ctrlKey: true, action: () => openSearch(), description: 'Find', global: true },
    { key: 'h', ctrlKey: true, action: () => openReplace(), description: 'Replace', global: true },
    
    // View operations (global - work everywhere)
    { key: 'b', ctrlKey: true, action: toggleSidebar, description: 'Toggle Sidebar', global: true },
    { key: 'p', ctrlKey: true, action: togglePreview, description: 'Toggle Preview', global: true },
    { key: '=', ctrlKey: true, action: handleZoomIn, description: 'Zoom In', global: true },
    { key: '-', ctrlKey: true, action: handleZoomOut, description: 'Zoom Out', global: true },
    // Search panel shortcut
    {
      key: 'f',
      ctrlKey: true,
      shiftKey: true,
      action: () => {
        // Ensure sidebar is visible, then open search panel
        if (sidebarCollapsed) toggleSidebar()
        window.dispatchEvent(new CustomEvent('sidebar:open-search'))
      },
      description: 'Open Search Panel',
      global: true,
    },
    
    // Full screen (platform-specific)
    { key: 'F11', action: handleFullScreen, description: 'Full Screen', preventDefault: true, global: true },
    ...(isMacOS() ? [
      { key: 'f', ctrlKey: true, metaKey: true, action: handleFullScreen, description: 'Full Screen', global: true }
    ] : []),
  ])

// Load persisted state on mount
  useEffect(() => {
    const loadState = async () => {
      const persisted = await loadPersistedState()
      if (persisted) {
        // Restore UI state
        dispatch({ type: 'SET_SIDEBAR_COLLAPSED', payload: persisted.sidebarCollapsed })
        dispatch({ type: 'SET_EDITOR_COLLAPSED', payload: persisted.editorCollapsed })
        dispatch({ type: 'SET_PREVIEW_COLLAPSED', payload: persisted.previewCollapsed })
        
        // Restore zoom level if available
        if (persisted.zoomLevel) {
          dispatch({ type: 'SET_ZOOM_LEVEL', payload: persisted.zoomLevel })
        }
        
        // Restore folder if it exists
        if (persisted.lastFolderPath) {
          try {
            const { invoke } = await import('@tauri-apps/api/core')
            // Check if folder still exists
            await invoke('read_directory', { path: persisted.lastFolderPath })
            dispatch({ type: 'SET_FOLDER_PATH', payload: persisted.lastFolderPath })
          } catch (error) {
            logger.debug('Last folder no longer exists', { error: String(error) })
          }
        }

        // Try to restore tabs from dedicated tab storage first
        const restoredTabs = await restoreTabsFromStorage()
        if (restoredTabs && restoredTabs.tabs.length > 0) {
          dispatch({ type: 'RESTORE_TABS', payload: restoredTabs })
        } else {
          // Fall back to migration from old single-file state
          const tabsState = migrateToTabState(persisted as any)
          if (tabsState.tabs.length > 0) {
            dispatch({ type: 'RESTORE_TABS', payload: tabsState })
          }
        }
      }
    }
    loadState()
  }, [])

  // Listen to native menu events
  useEffect(() => {
    const unlisteners: (() => void)[] = []
    
    const setupMenuListeners = async () => {
      console.log('[App] Setting up menu event listeners...')
      try {
        const unlistenOpen = await listen('menu-open', () => {
          handleOpenFile()
        })
        unlisteners.push(unlistenOpen)
      
      const unlistenOpenFolder = await listen('menu-open-folder', () => {
        openFolder()
      })
      unlisteners.push(unlistenOpenFolder)
      
      const unlistenSave = await listen('menu-save', () => {
        handleSaveFile()
      })
      unlisteners.push(unlistenSave)
      
      const unlistenSaveAs = await listen('menu-save-as', async () => {
        handleSaveAs()
      })
      unlisteners.push(unlistenSaveAs)
      
      const unlistenToggleSidebar = await listen('menu-toggle-sidebar', () => {
        toggleSidebar()
      })
      unlisteners.push(unlistenToggleSidebar)
      
      const unlistenCloseFolder = await listen('menu-close-folder', () => {
        closeFolder()
      })
      unlisteners.push(unlistenCloseFolder)
      
const unlistenQuit = await listen('menu-quit', async () => {
        const { getCurrentWindow } = await import('@tauri-apps/api/window')
        await getCurrentWindow().close()
      })
      unlisteners.push(unlistenQuit)

      // Tab menu listeners
      const unlistenCloseTab = await listen('menu-close-tab', () => {
        if (activeTab) handleCloseTab(activeTab)
      })
      unlisteners.push(unlistenCloseTab)

      const unlistenCloseAllTabs = await listen('menu-close-all-tabs', () => {
        dispatch({ type: 'CLOSE_ALL_TABS' })
      })
      unlisteners.push(unlistenCloseAllTabs)

      const unlistenReopenTab = await listen('menu-reopen-closed-tab', () => {
        reopenClosedTab()
      })
      unlisteners.push(unlistenReopenTab)

      // Export menu listeners
      const unlistenExportPdf = await listen('menu-export-pdf', () => {
        console.log('[App] Received menu-export-pdf event')
        exportPdf()
      })
      unlisteners.push(unlistenExportPdf)

      const unlistenExportHtml = await listen('menu-export-html', () => {
        console.log('[App] Received menu-export-html event')
        exportHtml()
      })
      unlisteners.push(unlistenExportHtml)

      console.log('[App] All menu event listeners registered successfully')
    } catch (error) {
      console.error('[App] Failed to set up menu listeners:', error)
    }
  }
  
  setupMenuListeners()
    
    return () => {
      unlisteners.forEach(unlisten => unlisten())
    }
  }, [closeFolder, toggleSidebar, exportPdf, exportHtml, handleOpenFile, openFolder, handleSaveFile, handleSaveAs, activeTab, handleCloseTab, dispatch, reopenClosedTab])

// Save UI state when it changes (debounced)
  useEffect(() => {
    const saveState = async () => {
      await savePersistedState({
        lastFolderPath: state.folder.path,
        sidebarCollapsed: state.ui.sidebarCollapsed,
        editorCollapsed: state.ui.editorCollapsed,
        previewCollapsed: state.ui.previewCollapsed,
        zoomLevel: state.ui.zoomLevel
      })
    }
    const timer = setTimeout(saveState, 500)
    return () => clearTimeout(timer)
  }, [state.folder.path, state.ui.sidebarCollapsed, state.ui.editorCollapsed, state.ui.previewCollapsed, state.ui.zoomLevel])

  // Save tab state when tabs change (debounced)
  useEffect(() => {
    const timer = setTimeout(() => saveTabState(state.tabs), 500)
    return () => clearTimeout(timer)
  }, [state.tabs])

  // Start autosave timer on mount
  useEffect(() => {
    const stopAutosave = startTabAutosave(() => state.tabs)
    return stopAutosave
  }, [])

  // External file change detection: poll active tab's file for changes
  const [externalChangeWarning, setExternalChangeWarning] = useState<string | null>(null)
  useEffect(() => {
    if (!activeTab?.path || activeTab.isDirty) return

    const checkFileExists = async () => {
      try {
        const { invoke } = await import('@tauri-apps/api/core')
        // Try to read file metadata to check if it still exists
        const content = await invoke<string>('read_file', { path: activeTab.path })
        // File exists - check if content changed externally
        if (content !== activeTab.content && !activeTab.isDirty) {
          setExternalChangeWarning(
            `"${activeTab.path?.split('/').pop()}" was modified externally. Reload to see changes.`
          )
        }
      } catch (error) {
        const msg = String(error)
        if (msg.includes('no such file') || msg.includes('ENOENT') || msg.includes('not found')) {
          setExternalChangeWarning(
            `"${activeTab.path?.split('/').pop()}" was deleted or moved externally.`
          )
        }
      }
    }

    // Check every 30 seconds
    const interval = setInterval(checkFileExists, 30_000)
    return () => clearInterval(interval)
  }, [activeTab?.path, activeTab?.isDirty])

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    
    const files = Array.from(e.dataTransfer.files)
    const markdownFiles = files.filter(file => 
      file.name.endsWith('.md') || file.name.endsWith('.markdown')
    )
    
    if (markdownFiles.length > 0) {
      const file = markdownFiles[0]
      try {
        const content = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = (e) => resolve(e.target?.result as string)
          reader.onerror = reject
          reader.readAsText(file)
        })
        dispatch({ type: 'OPEN_TAB', payload: { path: file.name, content } })
      } catch (error) {
        logger.error('Failed to read dropped file', { error: String(error) })
      }
    }
  }

  const handleMarkdownChange = (value: string) => {
    if (activeTabId) {
      dispatch({ type: 'UPDATE_TAB_CONTENT', payload: { tabId: activeTabId, content: value } })
    }
  }

  return (
    <div 
      className={`h-screen flex flex-col ${theme === 'dark' ? 'dark' : ''}`}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Custom Title Bar */}
      <TitleBar 
        onToggleTheme={toggleTheme}
        theme={theme}
        onToggleSidebar={toggleSidebar}
        onToggleEditor={toggleEditor}
        onTogglePreview={togglePreview}
        sidebarCollapsed={sidebarCollapsed}
        editorCollapsed={editorCollapsed}
        previewCollapsed={previewCollapsed}
      />

      {/* Tab Bar */}
      <TabBar onCloseTab={handleCloseTab} />

      {/* Tab limit warning */}
      {showTabLimitWarning && (
        <div className="px-3 py-1 bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800 text-xs text-yellow-700 dark:text-yellow-400 flex items-center justify-between">
          <span>You have many tabs open ({tabCount}). Consider closing unused ones.</span>
          <button
            className="ml-2 text-yellow-600 dark:text-yellow-400 hover:underline"
            onClick={() => dispatch({ type: 'CLOSE_ALL_TABS' })}
          >
            Close all
          </button>
        </div>
      )}

      {/* Save error banner */}
      {saveError && (
        <div className="px-3 py-1 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-400 flex items-center justify-between">
          <span>{saveError}</span>
          <button
            className="ml-2 text-red-600 dark:text-red-400 hover:underline"
            onClick={() => setSaveError(null)}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* External file change warning */}
      {externalChangeWarning && (
        <div className="px-3 py-1 bg-orange-50 dark:bg-orange-900/20 border-b border-orange-200 dark:border-orange-800 text-xs text-orange-700 dark:text-orange-400 flex items-center justify-between">
          <span>{externalChangeWarning}</span>
          <div className="flex gap-2 ml-2">
            {activeTab?.path && (
              <button
                className="text-orange-600 dark:text-orange-400 hover:underline"
                onClick={async () => {
                  if (!activeTab?.path || !activeTabId) return
                  try {
                    const { invoke } = await import('@tauri-apps/api/core')
                    const content = await invoke<string>('read_file', { path: activeTab.path })
                    dispatch({ type: 'UPDATE_TAB_CONTENT', payload: { tabId: activeTabId, content } })
                    dispatch({ type: 'SET_TAB_DIRTY', payload: { tabId: activeTabId, isDirty: false } })
                  } catch { /* file deleted, keep tab open */ }
                  setExternalChangeWarning(null)
                }}
              >
                Reload
              </button>
            )}
            <button
              className="text-orange-600 dark:text-orange-400 hover:underline"
              onClick={() => setExternalChangeWarning(null)}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
      
      {/* Large file loading indicator */}
      {isLoadingLargeFile && (
        <div className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800 text-xs text-blue-700 dark:text-blue-400 flex items-center gap-2">
          <span className="animate-spin">⟳</span>
          <span>Loading file...</span>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <CollapsiblePane
          collapsed={sidebarCollapsed}
          collapsedWidth="0px"
          className="h-full border-r border-gray-200 dark:border-gray-700"
        >
          <ErrorBoundary boundaryName="Sidebar">
            <Sidebar />
          </ErrorBoundary>
        </CollapsiblePane>
        
        <ErrorBoundary boundaryName="MainContent">
          {/* Empty state when no tabs are open */}
          {state.tabs.tabs.length === 0 && (
            <div className="flex-1 flex items-center justify-center text-gray-400 dark:text-gray-600">
              <div className="text-center">
                <p className="text-sm mb-2">No files open</p>
                <p className="text-xs">Open a file with <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs">⌘O</kbd> or click a file in the sidebar</p>
              </div>
            </div>
          )}

          {/* Editor Pane */}
          {state.tabs.tabs.length > 0 && (
          <CollapsiblePane
            collapsed={editorCollapsed}
            collapsedWidth="0px"
            className={`h-full ${!editorCollapsed && !previewCollapsed ? 'w-1/2' : 'flex-1'} border-r border-gray-200 dark:border-gray-700`}
          >
            <EditorPane 
              markdown={activeContent}
              onChange={handleMarkdownChange}
              className="h-full"
            />
          </CollapsiblePane>
          )}
          
          {/* Preview Pane */}
          {state.tabs.tabs.length > 0 && (
          <CollapsiblePane
            collapsed={previewCollapsed}
            collapsedWidth="0px"
            className={`h-full ${!editorCollapsed && !previewCollapsed ? 'w-1/2' : 'flex-1'}`}
          >
            <PreviewPane 
              markdown={activeContent}
              className="h-full"
            />
          </CollapsiblePane>
          )}
        </ErrorBoundary>
      </div>
      
      {/* Status Bar */}
      <StatusBar />

      {/* Dirty Tab Dialog */}
      {dirtyTab && (
        <DirtyTabDialog
          tab={dirtyTab}
          onSave={async () => {
            if (dirtyTab.path) {
              await saveFile(dirtyTab.path, dirtyTab.content)
            }
            dispatch({ type: 'CLOSE_TAB', payload: dirtyTab.id })
            setDirtyTabToClose(null)
          }}
          onDiscard={() => {
            dispatch({ type: 'CLOSE_TAB', payload: dirtyTab.id })
            setDirtyTabToClose(null)
          }}
          onCancel={() => setDirtyTabToClose(null)}
        />
      )}
    </div>
  )
}

function App() {
  return (
    <ErrorBoundary boundaryName="Global">
      <AppProvider>
        <EditorProvider>
          <AppContent />
        </EditorProvider>
      </AppProvider>
    </ErrorBoundary>
  )
}

export default App