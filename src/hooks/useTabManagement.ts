import { useCallback } from 'react'
import { useAppState } from '../context/AppContext'
import type { TabState } from '../types'

const MAX_TABS = 50

export function useTabManagement() {
  const { state, dispatch } = useAppState()

  const { tabs, activeTabId, recentlyClosed } = state.tabs

  const activeTab = tabs.find((t) => t.id === activeTabId) ?? null

  const canReopenClosed = recentlyClosed.length > 0

  const isAtMaxTabs = tabs.length >= MAX_TABS

  // ── openTab ─────────────────────────────────────────────────────────────────

  const openTab = useCallback(
    async (path: string | null, content?: string) => {
      if (isAtMaxTabs && path) {
        // Check if already open — if so, switch
        const existing = tabs.find((t) => t.path === path)
        if (!existing) return // At max, can't open new
      }

      if (path) {
        const existing = tabs.find((t) => t.path === path)
        if (existing) {
          dispatch({ type: 'SWITCH_TAB', payload: existing.id })
          return
        }
      }

      dispatch({
        type: 'OPEN_TAB',
        payload: { path: path ?? null, content: content ?? '' },
      })
    },
    [tabs, isAtMaxTabs, dispatch]
  )

  // ── closeTab ────────────────────────────────────────────────────────────────

  const closeTab = useCallback(
    (tabId: string) => {
      dispatch({ type: 'CLOSE_TAB', payload: tabId })
    },
    [dispatch]
  )

  // ── switchTab ───────────────────────────────────────────────────────────────

  const switchTab = useCallback(
    (tabId: string) => {
      dispatch({ type: 'SWITCH_TAB', payload: tabId })
    },
    [dispatch]
  )

  // ── closeAllTabs ─────────────────────────────────────────────────────────────

  const closeAllTabs = useCallback(() => {
    dispatch({ type: 'CLOSE_ALL_TABS' })
  }, [dispatch])

  // ── getTabName ───────────────────────────────────────────────────────────────

  const getTabName = useCallback((tab: TabState): string => {
    if (!tab.path) return 'Untitled'
    return tab.path.split('/').pop() || 'Untitled'
  }, [])

  // ── isFileOpen ───────────────────────────────────────────────────────────────

  const isFileOpen = useCallback(
    (path: string): boolean => {
      return tabs.some((t) => t.path === path)
    },
    [tabs]
  )

  // ── getDirtyTabs ─────────────────────────────────────────────────────────────

  const getDirtyTabs = useCallback((): TabState[] => {
    return tabs.filter((t) => t.isDirty)
  }, [tabs])

  return {
    tabs,
    activeTab,
    activeTabId,
    canReopenClosed,
    isAtMaxTabs,
    openTab,
    closeTab,
    switchTab,
    closeAllTabs,
    getTabName,
    isFileOpen,
    getDirtyTabs,
  }
}
