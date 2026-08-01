/**
 * File tree node structure
 */
export interface FileTreeNode {
  name: string
  path: string
  type: 'file' | 'directory'
  extension?: string
  children?: FileTreeNode[]
  isLoaded?: boolean
}

/**
 * Individual tab state
 */
export interface TabState {
  id: string                          // Unique UUID
  path: string | null                 // File path (null for unsaved files)
  content: string                     // Document content
  isDirty: boolean                    // Unsaved changes flag
  cursorPosition: CursorPosition      // Editor cursor position
  scrollPosition: { line: number }    // Editor scroll position
  lastAccessed: number                // Timestamp for LRU eviction
}

/**
 * Tabs collection state
 */
export interface TabsState {
  tabs: TabState[]                    // All open tabs
  activeTabId: string | null          // Currently active tab ID
  recentlyClosed: TabState[]          // Last 10 closed tabs for reopen
}

/**
 * Cursor position
 */
export interface CursorPosition {
  line: number
  column: number
}

/**
 * Persisted tab entry (for storage)
 */
export interface PersistedTabEntry {
  id: string
  path: string | null
  content?: string        // Only persisted if isDirty=true
  isDirty: boolean
  cursorPosition: CursorPosition
  scrollPosition: { line: number }
}

/**
 * Result item for filename search
 */
export interface SearchResult {
  path: string
  relativePath: string
  name: string
}

/**
 * Result item for full-text search
 */
export interface TextSearchResult {
  path: string
  relativePath: string
  name: string
  lineNumber: number
  snippet: string
}

/**
 * Combined search response from Tauri backend
 */
export interface SearchResponse {
  fileResults: SearchResult[]
  textResults: TextSearchResult[]
  truncated: boolean
}

/**
 * Search mode
 */
export type SearchType = 'filename' | 'fulltext'

/**
 * Persisted state (for storage)
 */
export interface PersistedState {
  lastFolderPath: string | null
  sidebarCollapsed: boolean
  editorCollapsed: boolean
  previewCollapsed: boolean
  zoomLevel: number
  tabs?: PersistedTabEntry[]          // Persisted tab list
  activeTabId?: string | null         // Persisted active tab
  recentlyClosedPaths?: string[]      // Paths of recently closed tabs
}
