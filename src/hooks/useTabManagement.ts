import { useCallback } from 'react'
import { useAppState } from '../context/AppContext'
import { TabState } from '../types'
import { readFile, saveFile } from '../tauriCommands'
import { createLogger } from '../utils/logger'

const logger = createLogger('useTabManagement')

const MAX_TABS = 50

/**
 * Core hook for managing tabs - open, close, switch, reorder, etc.
 */
export function useTabManagement() {
  const { state, dispatch } = useAppState()

  const tabs = state.tabs.tabs
  const activeTabId = state.tabs.activeTabId
  const activeTab = tabs.find(t => t.id === activeTabId) ?? null
  const recentlyClosed = state.tabs.recentlyClosed

  /**
   * Open a file in a new tab, or switch to existing tab if already open.
   */
  const openTab = useCallback(async (filePath: string | null, content?: string) => {
    // Check for duplicate
    if (filePath !== null) {
      const existing = tabs.find(t => t.path === filePath)
      if (existing) {
        dispatch({ type: 'SWITCH_TAB', payload: existing.id })
        return existing.id
      }
    }

    // Enforce max tab limit
    if (tabs.length >= MAX_TABS) {
      logger.warn('Maximum tab limit reached', { limit: MAX_TABS })
      return null
    }

    // Load content from disk if not provided
    let tabContent = content ?? ''
    if (filePath && content === undefined) {
      try {
        tabContent = await readFile(filePath)
      } catch (error) {
        logger.error('Failed to read file for new tab', { error: String(error), path: filePath })
        tabContent = ''
      }
    }

    dispatch({ type: 'OPEN_TAB', payload: { path: filePath, content: tabContent } })
    return null // New tab ID is assigned by reducer
  }, [tabs, dispatch])

  /**
   * Close a tab. If dirty, caller should show confirmation dialog first.
   */
  const closeTab = useCallback((tabId: string) => {
    dispatch({ type: 'CLOSE_TAB', payload: tabId })
  }, [dispatch])

  /**
   * Switch to a tab by ID.
   */
  const switchTab = useCallback((tabId: string) => {
    dispatch({ type: 'SWITCH_TAB', payload: tabId })
  }, [dispatch])

  /**
   * Close all tabs. Caller should handle dirty tabs first.
   */
  const closeAllTabs = useCallback(() => {
    dispatch({ type: 'CLOSE_ALL_TABS' })
  }, [dispatch])

  /**
   * Close all tabs except the specified one.
   */
  const closeOtherTabs = useCallback((tabId: string) => {
    dispatch({ type: 'CLOSE_OTHER_TABS', payload: tabId })
  }, [dispatch])

  /**
   * Close all tabs to the right of the specified tab.
   */
  const closeTabsToRight = useCallback((tabId: string) => {
    dispatch({ type: 'CLOSE_TABS_TO_RIGHT', payload: tabId })
  }, [dispatch])

  /**
   * Reopen the last closed tab.
   */
  const reopenLastClosedTab = useCallback(async () => {
    if (recentlyClosed.length === 0) return
    const tabToReopen = recentlyClosed[0]
    
    // If tab had a path and no content (clean tab), reload from disk
    if (tabToReopen.path && !tabToReopen.content && !tabToReopen.isDirty) {
      try {
        const content = await readFile(tabToReopen.path)
        dispatch({ type: 'OPEN_TAB', payload: { path: tabToReopen.path, content } })
        return
      } catch (error) {
        logger.debug('Could not reload closed tab file', { path: tabToReopen.path })
      }
    }
    
    dispatch({ type: 'REOPEN_CLOSED_TAB' })
  }, [recentlyClosed, dispatch])

  /**
   * Create a new untitled tab with sequential naming.
   */
  const createUntitledTab = useCallback(() => {
    dispatch({ type: 'OPEN_TAB', payload: { path: null, content: '' } })
  }, [dispatch])

  /**
   * Get the display name for a tab (file name or Untitled-N).
   */
  const getTabName = useCallback((tab: TabState): string => {
    if (tab.path) {
      return tab.path.split('/').pop() || tab.path.split('\\').pop() || tab.path
    }
    // Count untitled tabs to determine index
    const untitledTabs = tabs.filter(t => !t.path)
    const idx = untitledTabs.findIndex(t => t.id === tab.id)
    return idx === 0 ? 'Untitled' : `Untitled-${idx}`
  }, [tabs])

  /**
   * Save the active tab's content to disk.
   */
  const saveActiveTab = useCallback(async (): Promise<boolean> => {
    if (!activeTab || !activeTabId) return false
    if (!activeTab.path) return false
    try {
      await saveFile(activeTab.path, activeTab.content)
      dispatch({ type: 'SET_TAB_DIRTY', payload: { tabId: activeTabId, isDirty: false } })
      return true
    } catch (error) {
      logger.error('Failed to save tab', { error: String(error), path: activeTab.path })
      return false
    }
  }, [activeTab, activeTabId, dispatch])

  /**
   * Get all dirty tabs.
   */
  const getDirtyTabs = useCallback((): TabState[] => {
    return tabs.filter(t => t.isDirty)
  }, [tabs])

  /**
   * Check if a file path is already open in any tab.
   */
  const isFileOpen = useCallback((filePath: string): boolean => {
    return tabs.some(t => t.path === filePath)
  }, [tabs])

  /**
   * Get the tab for a given file path.
   */
  const getTabByPath = useCallback((filePath: string): TabState | undefined => {
    return tabs.find(t => t.path === filePath)
  }, [tabs])

  return {
    tabs,
    activeTab,
    activeTabId,
    recentlyClosed,
    openTab,
    closeTab,
    switchTab,
    closeAllTabs,
    closeOtherTabs,
    closeTabsToRight,
    reopenLastClosedTab,
    createUntitledTab,
    getTabName,
    saveActiveTab,
    getDirtyTabs,
    isFileOpen,
    getTabByPath,
    canReopenClosed: recentlyClosed.length > 0,
    tabCount: tabs.length,
    isAtMaxTabs: tabs.length >= MAX_TABS
  }
}
