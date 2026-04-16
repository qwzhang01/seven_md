import { createContext, useContext, useReducer, ReactNode } from 'react'
import { AppState, FolderState, TabsState, UIState, EditorState } from '../types'
import { appReducer } from '../reducers/appReducer'

// Initial states
const initialFolderState: FolderState = {
  path: null,
  tree: null,
  expandedDirs: new Set<string>()
}

const initialTabsState: TabsState = {
  tabs: [],
  activeTabId: null,
  recentlyClosed: []
}

const initialUIState: UIState = {
  sidebarCollapsed: false,
  editorCollapsed: false,
  previewCollapsed: false,
  theme: 'light',
  zoomLevel: 14 // Default font size in pixels
}

const initialEditorState: EditorState = {
  cursorPosition: { line: 1, column: 1 },
  documentStats: { characters: 0, words: 0, lines: 0 },
  fileEncoding: 'UTF-8',
  lineEnding: 'LF'
}

export const initialState: AppState = {
  folder: initialFolderState,
  tabs: initialTabsState,
  ui: initialUIState,
  editor: initialEditorState
}

// Action types
export type AppAction = 
  | { type: 'SET_FOLDER_PATH'; payload: string | null }
  | { type: 'SET_FOLDER_TREE'; payload: AppState['folder']['tree'] }
  | { type: 'TOGGLE_DIR_EXPANDED'; payload: string }
  // Tab actions
  | { type: 'OPEN_TAB'; payload: { path: string | null; content: string } }
  | { type: 'CLOSE_TAB'; payload: string }  // tabId
  | { type: 'SWITCH_TAB'; payload: string } // tabId
  | { type: 'REORDER_TABS'; payload: { fromIndex: number; toIndex: number } }
  | { type: 'UPDATE_TAB_CONTENT'; payload: { tabId: string; content: string } }
  | { type: 'UPDATE_TAB_PATH'; payload: { tabId: string; path: string } }
  | { type: 'SET_TAB_DIRTY'; payload: { tabId: string; isDirty: boolean } }
  | { type: 'UPDATE_TAB_CURSOR'; payload: { tabId: string; line: number; column: number } }
  | { type: 'UPDATE_TAB_SCROLL'; payload: { tabId: string; line: number } }
  | { type: 'REOPEN_CLOSED_TAB' }
  | { type: 'CLEAR_RECENTLY_CLOSED' }
  | { type: 'CLOSE_ALL_TABS' }
  | { type: 'CLOSE_OTHER_TABS'; payload: string } // tabId to keep
  | { type: 'CLOSE_TABS_TO_RIGHT'; payload: string } // tabId
  | { type: 'RESTORE_TABS'; payload: TabsState }
  // Legacy file actions (kept for migration compatibility)
  | { type: 'SET_FILE_PATH'; payload: string | null }
  | { type: 'SET_FILE_CONTENT'; payload: string }
  | { type: 'SET_FILE_DIRTY'; payload: boolean }
  // UI actions
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'TOGGLE_EDITOR' }
  | { type: 'TOGGLE_PREVIEW' }
  | { type: 'SET_THEME'; payload: 'light' | 'dark' }
  | { type: 'SET_SIDEBAR_COLLAPSED'; payload: boolean }
  | { type: 'SET_EDITOR_COLLAPSED'; payload: boolean }
  | { type: 'SET_PREVIEW_COLLAPSED'; payload: boolean }
  | { type: 'SET_ZOOM_LEVEL'; payload: number }
  | { type: 'RESTORE_STATE'; payload: Partial<AppState> }
  | { type: 'UPDATE_CURSOR_POSITION'; payload: { line: number; column: number } }
  | { type: 'UPDATE_DOCUMENT_STATS'; payload: { characters: number; words: number; lines: number } }

// Context type
interface AppContextType {
  state: AppState
  dispatch: React.Dispatch<AppAction>
}

// Create context
export const AppContext = createContext<AppContextType | undefined>(undefined)

// Provider component
export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState)

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  )
}

// Custom hook to use context
export function useAppState() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useAppState must be used within AppProvider')
  }
  return context
}
