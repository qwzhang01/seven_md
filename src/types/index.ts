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

// ─── Agent Presets ──────────────────────────────────────────────────

export interface AgentPreset {
  id: string
  label: string
  /** 简短说明（用于 tooltip 或副标题） */
  description?: string
  /** Lucide 图标名（与 ICON_MAP 对应） */
  icon?: string
  /** 发送给 Agent 的 user prompt */
  prompt: string
  /** 是否需要先选中文本 */
  requiresSelection: boolean
  /** 分类（命令面板分组用） */
  category?: 'editor' | 'workspace'
}

export interface AgentRunPresetDetail {
  presetId: string
}

// ─── Notification ───────────────────────────────────────────────────

export type NotificationType = 'info' | 'success' | 'warning' | 'error'

export interface Notification {
  id: string
  type: NotificationType
  message: string
  action?: () => void
  actionLabel?: string
  createdAt: number
  autoClose: boolean
  duration: number // ms
  isPaused?: boolean // hover 暂停标记
}

// ─── Command ────────────────────────────────────────────────────────

export type CommandCategory = 'file' | 'edit' | 'view' | 'insert' | 'format' | 'theme' | 'ai' | 'help'

export interface Command {
  id: string
  title: string
  category: CommandCategory
  icon?: string
  shortcut?: string
  when?: () => boolean
  execute: () => void | Promise<void>
}

// ─── Theme ──────────────────────────────────────────────────────────

export type ThemeId = 'dark' | 'light' | 'monokai' | 'solarized' | 'nord' | 'dracula' | 'github'

// ─── UI Dialog ──────────────────────────────────────────────────────

export type DialogType = 'shortcut-reference' | 'about' | 'welcome' | null

// ─── Agent Store ────────────────────────────────────────────────────

export interface AgentStoreMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

export interface ToolCallRecord {
  id: string
  name: string
  args: Record<string, unknown>
  status: 'running' | 'completed' | 'error'
  result: unknown | null
}

export interface PendingConfirmation {
  id: string
  toolName: string
  args: Record<string, unknown>
  preview?: string
  sessionId: string
  createdAt: number
}