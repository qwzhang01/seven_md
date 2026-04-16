import { invoke } from '@tauri-apps/api/core'
import { TabState, TabsState, PersistedTabEntry, PersistedState } from '../types'
import { createNewTab } from './tabUtils'
import { createLogger } from './logger'

const logger = createLogger('TabPersistence')

const TAB_STORE_KEY = 'tabs'
const AUTOSAVE_INTERVAL_MS = 5 * 60 * 1000 // 5 minutes

// ─── Serialization ───────────────────────────────────────────────────────────

/**
 * Serialize tabs state for persistence.
 * Only persists content for dirty tabs (clean tabs reload from disk).
 */
export function serializeTabsForPersistence(tabsState: TabsState): PersistedTabEntry[] {
  return tabsState.tabs.map(tab => ({
    id: tab.id,
    path: tab.path,
    content: tab.isDirty ? tab.content : undefined, // Only persist dirty content
    isDirty: tab.isDirty,
    cursorPosition: tab.cursorPosition,
    scrollPosition: tab.scrollPosition
  }))
}

// ─── Save ─────────────────────────────────────────────────────────────────────

/**
 * Save tab state to persistent storage.
 * Integrates with the existing PersistedState structure.
 */
export async function saveTabState(tabsState: TabsState): Promise<void> {
  try {
    const storePath = await invoke<string>('get_store_path')
    const tabsPath = `${storePath}/${TAB_STORE_KEY}.json`

    const payload = {
      tabs: serializeTabsForPersistence(tabsState),
      activeTabId: tabsState.activeTabId,
      recentlyClosedPaths: tabsState.recentlyClosed
        .filter(t => t.path)
        .map(t => t.path as string)
        .slice(0, 10)
    }

    await invoke('save_file', {
      path: tabsPath,
      content: JSON.stringify(payload, null, 2)
    })
    logger.debug('Tab state saved', { tabCount: tabsState.tabs.length })
  } catch (error) {
    logger.error('Failed to save tab state', { error: String(error) })
  }
}

// ─── Load ─────────────────────────────────────────────────────────────────────

interface PersistedTabPayload {
  tabs: PersistedTabEntry[]
  activeTabId: string | null
  recentlyClosedPaths?: string[]
}

/**
 * Load tab state from persistent storage.
 * Returns null if no state found or on error.
 * Handles corrupted data gracefully with fallback.
 */
export async function loadTabState(): Promise<PersistedTabPayload | null> {
  try {
    const storePath = await invoke<string>('get_store_path')
    const tabsPath = `${storePath}/${TAB_STORE_KEY}.json`

    const content = await invoke<string>('read_file', { path: tabsPath })
    
    let parsed: unknown
    try {
      parsed = JSON.parse(content)
    } catch {
      logger.warn('Corrupted tab state: invalid JSON, using fallback')
      return null
    }

    // Validate structure
    if (!parsed || typeof parsed !== 'object') {
      logger.warn('Corrupted tab state: not an object, using fallback')
      return null
    }

    const payload = parsed as PersistedTabPayload

    if (!Array.isArray(payload.tabs)) {
      logger.warn('Corrupted tab state: tabs is not an array, using fallback')
      return null
    }

    // Filter out any malformed tab entries
    const validTabs = payload.tabs.filter(entry => {
      if (!entry || typeof entry !== 'object') return false
      if (typeof entry.id !== 'string') return false
      return true
    })

    if (validTabs.length !== payload.tabs.length) {
      logger.warn('Corrupted tab state: some entries were invalid, filtered out', {
        original: payload.tabs.length,
        valid: validTabs.length
      })
    }

    return { ...payload, tabs: validTabs }
  } catch (error) {
    logger.debug('No tab state found or failed to load', { error: String(error) })
    return null
  }
}

/**
 * Restore tabs from persisted payload, loading clean tab content from disk.
 */
export async function restoreTabsFromStorage(): Promise<TabsState | null> {
  const payload = await loadTabState()
  if (!payload || payload.tabs.length === 0) return null

  // Load content for clean tabs from disk
  const tabs: TabState[] = await Promise.all(
    payload.tabs.map(async (entry) => {
      let content = entry.content ?? ''

      // For clean tabs with a path, reload from disk
      if (!entry.isDirty && entry.path && !content) {
        try {
          content = await invoke<string>('read_file', { path: entry.path })
        } catch {
          logger.debug('Could not reload tab file from disk', { path: entry.path })
          // Keep tab open with empty content and mark as missing
          content = ''
        }
      }

      return {
        id: entry.id,
        path: entry.path,
        content,
        isDirty: entry.isDirty,
        cursorPosition: entry.cursorPosition ?? { line: 1, column: 1 },
        scrollPosition: entry.scrollPosition ?? { line: 0 },
        lastAccessed: Date.now()
      }
    })
  )

  const validActiveId = payload.activeTabId && tabs.find(t => t.id === payload.activeTabId)
    ? payload.activeTabId
    : tabs[0]?.id ?? null

  return { tabs, activeTabId: validActiveId, recentlyClosed: [] }
}

// ─── Migration ────────────────────────────────────────────────────────────────

/**
 * Migrate old single-file persisted state to tab-based state.
 * Called on first launch after upgrade from single-file architecture.
 */
export function migrateToTabState(
  persisted: PersistedState & { file?: { path: string | null; content: string; isDirty: boolean } }
): TabsState {
  // If there's an old single-file state, convert it to a single tab
  if (persisted.file && (persisted.file.path || persisted.file.content)) {
    const tab = createNewTab(persisted.file.path, persisted.file.content)
    const migratedTab: TabState = {
      ...tab,
      isDirty: persisted.file.isDirty
    }
    logger.debug('Migrated single-file state to tab', { path: persisted.file.path })
    return {
      tabs: [migratedTab],
      activeTabId: migratedTab.id,
      recentlyClosed: []
    }
  }

  // If there are already persisted tabs, restore them
  if (persisted.tabs && persisted.tabs.length > 0) {
    return restoreTabsFromPersisted(persisted.tabs, persisted.activeTabId ?? null)
  }

  return { tabs: [], activeTabId: null, recentlyClosed: [] }
}

/**
 * Restore tabs from persisted entries (synchronous version for migration).
 */
export function restoreTabsFromPersisted(
  entries: PersistedTabEntry[],
  activeTabId: string | null
): TabsState {
  const tabs: TabState[] = entries.map(entry => ({
    id: entry.id,
    path: entry.path,
    content: entry.content ?? '',
    isDirty: entry.isDirty,
    cursorPosition: entry.cursorPosition ?? { line: 1, column: 1 },
    scrollPosition: entry.scrollPosition ?? { line: 0 },
    lastAccessed: Date.now()
  }))

  const validActiveId = activeTabId && tabs.find(t => t.id === activeTabId)
    ? activeTabId
    : tabs[0]?.id ?? null

  return { tabs, activeTabId: validActiveId, recentlyClosed: [] }
}

// ─── Auto-save ────────────────────────────────────────────────────────────────

let autosaveTimer: ReturnType<typeof setInterval> | null = null

/**
 * Start autosave timer - saves tab state every 5 minutes.
 */
export function startTabAutosave(getTabsState: () => TabsState): () => void {
  if (autosaveTimer) clearInterval(autosaveTimer)

  autosaveTimer = setInterval(async () => {
    const state = getTabsState()
    await saveTabState(state)
    logger.debug('Tab state autosaved')
  }, AUTOSAVE_INTERVAL_MS)

  return () => {
    if (autosaveTimer) {
      clearInterval(autosaveTimer)
      autosaveTimer = null
    }
  }
}

// ─── Clear ────────────────────────────────────────────────────────────────────

/**
 * Clear all persisted tab state.
 */
export async function clearTabState(): Promise<void> {
  try {
    const storePath = await invoke<string>('get_store_path')
    const tabsPath = `${storePath}/${TAB_STORE_KEY}.json`
    await invoke('save_file', { path: tabsPath, content: '{"tabs":[],"activeTabId":null}' })
    logger.debug('Tab state cleared')
  } catch (error) {
    logger.error('Failed to clear tab state', { error: String(error) })
  }
}
