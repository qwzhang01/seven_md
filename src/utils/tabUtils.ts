import { TabState } from '../types'

/**
 * Generate a unique tab ID using crypto.randomUUID or fallback
 */
export function generateTabId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  // Fallback for environments without crypto.randomUUID
  return `tab-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

/**
 * Create a new tab with default values
 */
export function createNewTab(path: string | null, content: string = ''): TabState {
  return {
    id: generateTabId(),
    path,
    content,
    isDirty: false,
    cursorPosition: { line: 1, column: 1 },
    scrollPosition: { line: 0 },
    lastAccessed: Date.now()
  }
}

/**
 * Get display name for a tab
 */
export function getTabDisplayName(tab: TabState, untitledIndex?: number): string {
  if (tab.path) {
    return tab.path.split('/').pop() || tab.path.split('\\').pop() || tab.path
  }
  return untitledIndex !== undefined && untitledIndex > 0
    ? `Untitled-${untitledIndex}`
    : 'Untitled'
}
