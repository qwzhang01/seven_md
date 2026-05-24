import React, { createContext, useContext, useReducer } from 'react'
import { AppState, TabState, TabsState } from '../types'

// ── Action types ──────────────────────────────────────────────────────────────

type Action =
  | { type: 'OPEN_TAB'; payload: { path: string | null; content: string } }
  | { type: 'CLOSE_TAB'; payload: string }
  | { type: 'SWITCH_TAB'; payload: string }
  | { type: 'CLOSE_ALL_TABS' }
  | { type: 'SET_TAB_DIRTY'; payload: { tabId: string; isDirty: boolean } }
  | { type: 'UPDATE_TAB_PATH'; payload: { tabId: string; path: string } }
  | { type: 'UPDATE_TAB_CONTENT'; payload: { tabId: string; content: string } }
  | { type: 'SET_FOLDER_PATH'; payload: string | null }
  | { type: 'SET_FOLDER_TREE'; payload: any }
  | { type: 'SET_SIDEBAR_COLLAPSED'; payload: boolean }
  | { type: 'SET_EDITOR_COLLAPSED'; payload: boolean }
  | { type: 'SET_PREVIEW_COLLAPSED'; payload: boolean }
  | { type: 'SET_EXPANDED_DIRS'; payload: Set<string> }

// ── Initial state ─────────────────────────────────────────────────────────────

const initialState: AppState = {
  folder: {
    path: null,
    tree: null,
    expandedDirs: new Set(),
  },
  tabs: {
    tabs: [],
    activeTabId: null,
    recentlyClosed: [],
  },
  ui: {
    sidebarCollapsed: false,
    editorCollapsed: false,
    previewCollapsed: false,
    theme: 'light',
    zoomLevel: 14,
  },
  editor: {
    cursorPosition: { line: 1, column: 1 },
    documentStats: { lines: 0, words: 0, characters: 0 },
    fileEncoding: 'UTF-8',
    lineEnding: 'LF',
  },
}

// ── Tab ID generator ──────────────────────────────────────────────────────────

let tabIdCounter = 0
function generateTabId(): string {
  return `tab-${++tabIdCounter}-${Date.now()}`
}

// ── Reducer ───────────────────────────────────────────────────────────────────

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'OPEN_TAB': {
      const { path, content } = action.payload
      // If file already open, switch to it
      if (path) {
        const existing = state.tabs.tabs.find((t) => t.path === path)
        if (existing) {
          return { ...state, tabs: { ...state.tabs, activeTabId: existing.id } }
        }
      }
      const newTab: TabState = {
        id: generateTabId(),
        path,
        content,
        isDirty: false,
        cursorPosition: { line: 1, column: 1 },
        scrollPosition: { line: 0 },
        lastAccessed: Date.now(),
      }
      return {
        ...state,
        tabs: {
          ...state.tabs,
          tabs: [...state.tabs.tabs, newTab],
          activeTabId: newTab.id,
        },
      }
    }

    case 'CLOSE_TAB': {
      const tabId = action.payload
      const tab = state.tabs.tabs.find((t) => t.id === tabId)
      if (!tab) return state
      const newTabs = state.tabs.tabs.filter((t) => t.id !== tabId)
      const closedIndex = state.tabs.tabs.findIndex((t) => t.id === tabId)
      let newActiveTabId = state.tabs.activeTabId
      if (state.tabs.activeTabId === tabId) {
        newActiveTabId = newTabs.length > 0
          ? newTabs[Math.min(closedIndex, newTabs.length - 1)].id
          : null
      }
      const newRecentlyClosed = [tab, ...state.tabs.recentlyClosed].slice(0, 10)
      return {
        ...state,
        tabs: {
          tabs: newTabs,
          activeTabId: newActiveTabId,
          recentlyClosed: newRecentlyClosed,
        },
      }
    }

    case 'SWITCH_TAB': {
      const tabId = action.payload
      if (!state.tabs.tabs.some((t) => t.id === tabId)) return state
      return { ...state, tabs: { ...state.tabs, activeTabId: tabId } }
    }

    case 'CLOSE_ALL_TABS': {
      return {
        ...state,
        tabs: {
          tabs: [],
          activeTabId: null,
          recentlyClosed: state.tabs.recentlyClosed,
        },
      }
    }

    case 'SET_TAB_DIRTY': {
      const { tabId, isDirty } = action.payload
      return {
        ...state,
        tabs: {
          ...state.tabs,
          tabs: state.tabs.tabs.map((t) =>
            t.id === tabId ? { ...t, isDirty } : t
          ),
        },
      }
    }

    case 'UPDATE_TAB_PATH': {
      const { tabId, path } = action.payload
      return {
        ...state,
        tabs: {
          ...state.tabs,
          tabs: state.tabs.tabs.map((t) =>
            t.id === tabId ? { ...t, path, isDirty: false } : t
          ),
        },
      }
    }

    case 'UPDATE_TAB_CONTENT': {
      const { tabId, content } = action.payload
      return {
        ...state,
        tabs: {
          ...state.tabs,
          tabs: state.tabs.tabs.map((t) =>
            t.id === tabId ? { ...t, content, isDirty: true } : t
          ),
        },
      }
    }

    case 'SET_FOLDER_PATH': {
      return {
        ...state,
        folder: { ...state.folder, path: action.payload },
      }
    }

    case 'SET_FOLDER_TREE': {
      return {
        ...state,
        folder: { ...state.folder, tree: action.payload },
      }
    }

    case 'SET_SIDEBAR_COLLAPSED': {
      return {
        ...state,
        ui: { ...state.ui, sidebarCollapsed: action.payload },
      }
    }

    case 'SET_EDITOR_COLLAPSED': {
      return {
        ...state,
        ui: { ...state.ui, editorCollapsed: action.payload },
      }
    }

    case 'SET_PREVIEW_COLLAPSED': {
      return {
        ...state,
        ui: { ...state.ui, previewCollapsed: action.payload },
      }
    }

    case 'SET_EXPANDED_DIRS': {
      return {
        ...state,
        folder: { ...state.folder, expandedDirs: action.payload },
      }
    }

    default:
      return state
  }
}

// ── Context ───────────────────────────────────────────────────────────────────

interface AppContextValue {
  state: AppState
  dispatch: React.Dispatch<Action>
}

export const AppContext = createContext<AppContextValue>({
  state: initialState,
  dispatch: () => {},
})

// ── Provider ──────────────────────────────────────────────────────────────────

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState)
  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  )
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useAppState(): AppContextValue {
  return useContext(AppContext)
}
