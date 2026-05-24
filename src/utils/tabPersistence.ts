import type { TabState, TabsState, PersistedTabEntry, PersistedState } from '../types'

// ── serializeTabsForPersistence ───────────────────────────────────────────────

/**
 * Converts the current tabs state into a list of persisted entries.
 * Content is only included for dirty (unsaved) tabs to save storage space.
 */
export function serializeTabsForPersistence(state: TabsState): PersistedTabEntry[] {
  return state.tabs.map((tab) => {
    const entry: PersistedTabEntry = {
      id: tab.id,
      path: tab.path,
      isDirty: tab.isDirty,
      cursorPosition: tab.cursorPosition,
      scrollPosition: tab.scrollPosition,
    }
    // Only persist content for dirty tabs
    if (tab.isDirty) {
      entry.content = tab.content
    }
    return entry
  })
}

// ── restoreTabsFromPersisted ──────────────────────────────────────────────────

/**
 * Restores a TabsState from persisted entries and an active tab ID.
 * Falls back to the first tab if the active ID is not found.
 */
export function restoreTabsFromPersisted(
  entries: PersistedTabEntry[],
  activeTabId: string | null
): TabsState {
  const tabs: TabState[] = entries.map((entry) => ({
    id: entry.id,
    path: entry.path,
    content: entry.content ?? '',
    isDirty: entry.isDirty,
    cursorPosition: entry.cursorPosition,
    scrollPosition: entry.scrollPosition,
    lastAccessed: Date.now(),
  }))

  // Determine active tab ID
  let resolvedActiveTabId: string | null = null
  if (tabs.length > 0) {
    const found = activeTabId && tabs.some((t) => t.id === activeTabId)
    resolvedActiveTabId = found ? activeTabId : tabs[0].id
  }

  return {
    tabs,
    activeTabId: resolvedActiveTabId,
    recentlyClosed: [],
  }
}

// ── migrateToTabState ─────────────────────────────────────────────────────────

/**
 * Migrates legacy single-file persisted state to the new tab-based state.
 * If the state already has tabs, returns them as-is.
 */
export function migrateToTabState(oldState: PersistedState): TabsState {
  // Already migrated — has tabs array
  if (oldState.tabs && oldState.tabs.length > 0) {
    return restoreTabsFromPersisted(oldState.tabs, oldState.activeTabId ?? null)
  }

  // Legacy single-file state
  const legacyState = oldState as any
  if (legacyState.file && legacyState.file.path) {
    const tab: TabState = {
      id: `migrated-${Date.now()}`,
      path: legacyState.file.path,
      content: legacyState.file.content ?? '',
      isDirty: legacyState.file.isDirty ?? false,
      cursorPosition: { line: 1, column: 1 },
      scrollPosition: { line: 0 },
      lastAccessed: Date.now(),
    }
    return {
      tabs: [tab],
      activeTabId: tab.id,
      recentlyClosed: [],
    }
  }

  // No file state — return empty
  return {
    tabs: [],
    activeTabId: null,
    recentlyClosed: [],
  }
}
