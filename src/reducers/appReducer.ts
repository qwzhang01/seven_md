import { AppAction } from '../context/AppContext'
import { AppState, TabState } from '../types'
import { createNewTab } from '../utils/tabUtils'

const MAX_RECENTLY_CLOSED = 10
const MAX_TABS = 50
const EVICTION_THRESHOLD = 40

/**
 * Find the next active tab after closing a tab
 */
function getNextActiveTabId(tabs: TabState[], closedTabId: string): string | null {
  const idx = tabs.findIndex(t => t.id === closedTabId)
  const remaining = tabs.filter(t => t.id !== closedTabId)
  if (remaining.length === 0) return null
  // Prefer left neighbor, fallback to right
  const nextIdx = Math.max(0, idx - 1)
  return remaining[Math.min(nextIdx, remaining.length - 1)].id
}

/**
 * Evict least recently used clean tabs when approaching limit
 */
function maybeEvictTabs(tabs: TabState[]): TabState[] {
  if (tabs.length < EVICTION_THRESHOLD) return tabs
  const cleanTabs = tabs.filter(t => !t.isDirty)
  const sortedByAccess = [...cleanTabs].sort((a, b) => a.lastAccessed - b.lastAccessed)
  const toEvictCount = tabs.length - EVICTION_THRESHOLD + 1
  const toEvictIds = new Set(sortedByAccess.slice(0, toEvictCount).map(t => t.id))
  return tabs.filter(t => !toEvictIds.has(t.id))
}

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_FOLDER_PATH':
      return {
        ...state,
        folder: {
          ...state.folder,
          path: action.payload,
          tree: action.payload === null ? null : state.folder.tree,
          expandedDirs: action.payload === null ? new Set() : state.folder.expandedDirs
        }
      }

    case 'SET_FOLDER_TREE':
      return {
        ...state,
        folder: {
          ...state.folder,
          tree: action.payload
        }
      }

    case 'TOGGLE_DIR_EXPANDED':
      const newExpandedDirs = new Set(state.folder.expandedDirs)
      if (newExpandedDirs.has(action.payload)) {
        newExpandedDirs.delete(action.payload)
      } else {
        newExpandedDirs.add(action.payload)
      }
      return {
        ...state,
        folder: {
          ...state.folder,
          expandedDirs: newExpandedDirs
        }
      }

    // ─── Tab Actions ────────────────────────────────────────────────────────

    case 'OPEN_TAB': {
      const { path, content } = action.payload
      // Check for duplicate: if path is non-null and already open, switch to it
      if (path !== null) {
        const existing = state.tabs.tabs.find(t => t.path === path)
        if (existing) {
          return {
            ...state,
            tabs: {
              ...state.tabs,
              activeTabId: existing.id,
              tabs: state.tabs.tabs.map(t =>
                t.id === existing.id ? { ...t, lastAccessed: Date.now() } : t
              )
            }
          }
        }
      }
      // Enforce max tab limit
      if (state.tabs.tabs.length >= MAX_TABS) {
        return state // Caller should show error
      }
      const newTab = createNewTab(path, content)
      const tabs = maybeEvictTabs([...state.tabs.tabs, newTab])
      return {
        ...state,
        tabs: {
          ...state.tabs,
          tabs,
          activeTabId: newTab.id
        }
      }
    }

    case 'CLOSE_TAB': {
      const tabId = action.payload
      const tab = state.tabs.tabs.find(t => t.id === tabId)
      if (!tab) return state
      const nextActiveId = state.tabs.activeTabId === tabId
        ? getNextActiveTabId(state.tabs.tabs, tabId)
        : state.tabs.activeTabId
      const recentlyClosed = [tab, ...state.tabs.recentlyClosed].slice(0, MAX_RECENTLY_CLOSED)
      return {
        ...state,
        tabs: {
          ...state.tabs,
          tabs: state.tabs.tabs.filter(t => t.id !== tabId),
          activeTabId: nextActiveId,
          recentlyClosed
        }
      }
    }

    case 'SWITCH_TAB': {
      const tabId = action.payload
      if (!state.tabs.tabs.find(t => t.id === tabId)) return state
      return {
        ...state,
        tabs: {
          ...state.tabs,
          activeTabId: tabId,
          tabs: state.tabs.tabs.map(t =>
            t.id === tabId ? { ...t, lastAccessed: Date.now() } : t
          )
        }
      }
    }

    case 'REORDER_TABS': {
      const { fromIndex, toIndex } = action.payload
      const tabs = [...state.tabs.tabs]
      const [moved] = tabs.splice(fromIndex, 1)
      tabs.splice(toIndex, 0, moved)
      return {
        ...state,
        tabs: { ...state.tabs, tabs }
      }
    }

    case 'UPDATE_TAB_CONTENT': {
      const { tabId, content } = action.payload
      return {
        ...state,
        tabs: {
          ...state.tabs,
          tabs: state.tabs.tabs.map(t =>
            t.id === tabId ? { ...t, content, isDirty: true } : t
          )
        }
      }
    }

    case 'UPDATE_TAB_PATH': {
      const { tabId, path } = action.payload
      return {
        ...state,
        tabs: {
          ...state.tabs,
          tabs: state.tabs.tabs.map(t =>
            t.id === tabId ? { ...t, path, isDirty: false } : t
          )
        }
      }
    }

    case 'SET_TAB_DIRTY': {
      const { tabId, isDirty } = action.payload
      return {
        ...state,
        tabs: {
          ...state.tabs,
          tabs: state.tabs.tabs.map(t =>
            t.id === tabId ? { ...t, isDirty } : t
          )
        }
      }
    }

    case 'UPDATE_TAB_CURSOR': {
      const { tabId, line, column } = action.payload
      return {
        ...state,
        tabs: {
          ...state.tabs,
          tabs: state.tabs.tabs.map(t =>
            t.id === tabId ? { ...t, cursorPosition: { line, column } } : t
          )
        }
      }
    }

    case 'UPDATE_TAB_SCROLL': {
      const { tabId, line } = action.payload
      return {
        ...state,
        tabs: {
          ...state.tabs,
          tabs: state.tabs.tabs.map(t =>
            t.id === tabId ? { ...t, scrollPosition: { line } } : t
          )
        }
      }
    }

    case 'REOPEN_CLOSED_TAB': {
      if (state.tabs.recentlyClosed.length === 0) return state
      const [tabToReopen, ...remainingClosed] = state.tabs.recentlyClosed
      const reopened: TabState = {
        ...tabToReopen,
        id: tabToReopen.id, // Keep original ID or generate new? Keep original for simplicity
        lastAccessed: Date.now()
      }
      return {
        ...state,
        tabs: {
          ...state.tabs,
          tabs: [...state.tabs.tabs, reopened],
          activeTabId: reopened.id,
          recentlyClosed: remainingClosed
        }
      }
    }

    case 'CLEAR_RECENTLY_CLOSED': {
      return {
        ...state,
        tabs: {
          ...state.tabs,
          recentlyClosed: []
        }
      }
    }

    case 'CLOSE_ALL_TABS': {
      const recentlyClosed = [...state.tabs.tabs, ...state.tabs.recentlyClosed].slice(0, MAX_RECENTLY_CLOSED)
      return {
        ...state,
        tabs: {
          tabs: [],
          activeTabId: null,
          recentlyClosed
        }
      }
    }

    case 'CLOSE_OTHER_TABS': {
      const keepId = action.payload
      const toClose = state.tabs.tabs.filter(t => t.id !== keepId)
      const recentlyClosed = [...toClose, ...state.tabs.recentlyClosed].slice(0, MAX_RECENTLY_CLOSED)
      return {
        ...state,
        tabs: {
          ...state.tabs,
          tabs: state.tabs.tabs.filter(t => t.id === keepId),
          activeTabId: keepId,
          recentlyClosed
        }
      }
    }

    case 'CLOSE_TABS_TO_RIGHT': {
      const tabId = action.payload
      const idx = state.tabs.tabs.findIndex(t => t.id === tabId)
      if (idx === -1) return state
      const toClose = state.tabs.tabs.slice(idx + 1)
      const recentlyClosed = [...toClose, ...state.tabs.recentlyClosed].slice(0, MAX_RECENTLY_CLOSED)
      return {
        ...state,
        tabs: {
          ...state.tabs,
          tabs: state.tabs.tabs.slice(0, idx + 1),
          recentlyClosed
        }
      }
    }

    case 'RESTORE_TABS': {
      return {
        ...state,
        tabs: action.payload
      }
    }

    // ─── Legacy File Actions (migration compatibility) ───────────────────────

    case 'SET_FILE_PATH':
    case 'SET_FILE_CONTENT':
    case 'SET_FILE_DIRTY':
      // These are no-ops in the new tab architecture
      // Migration logic handles conversion on startup
      return state

    // ─── UI Actions ─────────────────────────────────────────────────────────

    case 'TOGGLE_SIDEBAR':
      return {
        ...state,
        ui: {
          ...state.ui,
          sidebarCollapsed: !state.ui.sidebarCollapsed
        }
      }

    case 'TOGGLE_EDITOR':
      // Prevent collapsing both editor and preview
      if (!state.ui.editorCollapsed && state.ui.previewCollapsed) {
        return state
      }
      return {
        ...state,
        ui: {
          ...state.ui,
          editorCollapsed: !state.ui.editorCollapsed
        }
      }

    case 'TOGGLE_PREVIEW':
      // Prevent collapsing both editor and preview
      if (!state.ui.previewCollapsed && state.ui.editorCollapsed) {
        return state
      }
      return {
        ...state,
        ui: {
          ...state.ui,
          previewCollapsed: !state.ui.previewCollapsed
        }
      }

    case 'SET_THEME':
      return {
        ...state,
        ui: {
          ...state.ui,
          theme: action.payload
        }
      }

    case 'SET_SIDEBAR_COLLAPSED':
      return {
        ...state,
        ui: {
          ...state.ui,
          sidebarCollapsed: action.payload
        }
      }

    case 'SET_EDITOR_COLLAPSED':
      // Prevent collapsing both editor and preview
      if (action.payload && state.ui.previewCollapsed) {
        return state
      }
      return {
        ...state,
        ui: {
          ...state.ui,
          editorCollapsed: action.payload
        }
      }

    case 'SET_PREVIEW_COLLAPSED':
      // Prevent collapsing both editor and preview
      if (action.payload && state.ui.editorCollapsed) {
        return state
      }
      return {
        ...state,
        ui: {
          ...state.ui,
          previewCollapsed: action.payload
        }
      }

    case 'SET_ZOOM_LEVEL':
      return {
        ...state,
        ui: {
          ...state.ui,
          zoomLevel: action.payload
        }
      }

    case 'RESTORE_STATE':
      return {
        ...state,
        ...action.payload
      }

    case 'UPDATE_CURSOR_POSITION':
      return {
        ...state,
        editor: {
          ...state.editor,
          cursorPosition: {
            line: action.payload.line,
            column: action.payload.column
          }
        }
      }

    case 'UPDATE_DOCUMENT_STATS':
      return {
        ...state,
        editor: {
          ...state.editor,
          documentStats: {
            characters: action.payload.characters,
            words: action.payload.words,
            lines: action.payload.lines
          }
        }
      }

    default:
      return state
  }
}
