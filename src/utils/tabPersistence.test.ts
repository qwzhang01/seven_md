import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  serializeTabsForPersistence,
  migrateToTabState,
  restoreTabsFromPersisted,
} from './tabPersistence'
import { TabsState, TabState } from '../types'

const makeTab = (overrides = {}): TabState => ({
  id: 'tab-1',
  path: '/test.md',
  content: '# Hello',
  isDirty: false,
  cursorPosition: { line: 1, column: 1 },
  scrollPosition: { line: 0 },
  lastAccessed: Date.now(),
  ...overrides,
})

const makeTabsState = (overrides = {}): TabsState => ({
  tabs: [],
  activeTabId: null,
  recentlyClosed: [],
  ...overrides,
})

describe('serializeTabsForPersistence', () => {
  it('omits content for clean tabs', () => {
    const tab = makeTab({ isDirty: false, content: '# Clean' })
    const state = makeTabsState({ tabs: [tab], activeTabId: 'tab-1' })
    const entries = serializeTabsForPersistence(state)
    expect(entries[0].content).toBeUndefined()
  })

  it('includes content for dirty tabs', () => {
    const tab = makeTab({ isDirty: true, content: '# Dirty' })
    const state = makeTabsState({ tabs: [tab], activeTabId: 'tab-1' })
    const entries = serializeTabsForPersistence(state)
    expect(entries[0].content).toBe('# Dirty')
  })

  it('persists cursor and scroll positions', () => {
    const tab = makeTab({
      cursorPosition: { line: 5, column: 10 },
      scrollPosition: { line: 3 }
    })
    const state = makeTabsState({ tabs: [tab], activeTabId: 'tab-1' })
    const entries = serializeTabsForPersistence(state)
    expect(entries[0].cursorPosition).toEqual({ line: 5, column: 10 })
    expect(entries[0].scrollPosition).toEqual({ line: 3 })
  })

  it('handles empty tabs state', () => {
    const state = makeTabsState()
    const entries = serializeTabsForPersistence(state)
    expect(entries).toHaveLength(0)
  })
})

describe('restoreTabsFromPersisted', () => {
  it('restores tabs with correct active tab', () => {
    const entries = [
      { id: 'tab-1', path: '/a.md', isDirty: false, cursorPosition: { line: 1, column: 1 }, scrollPosition: { line: 0 } },
      { id: 'tab-2', path: '/b.md', isDirty: false, cursorPosition: { line: 1, column: 1 }, scrollPosition: { line: 0 } },
    ]
    const result = restoreTabsFromPersisted(entries, 'tab-2')
    expect(result.tabs).toHaveLength(2)
    expect(result.activeTabId).toBe('tab-2')
  })

  it('falls back to first tab if active ID not found', () => {
    const entries = [
      { id: 'tab-1', path: '/a.md', isDirty: false, cursorPosition: { line: 1, column: 1 }, scrollPosition: { line: 0 } },
    ]
    const result = restoreTabsFromPersisted(entries, 'nonexistent-id')
    expect(result.activeTabId).toBe('tab-1')
  })

  it('returns null active ID for empty entries', () => {
    const result = restoreTabsFromPersisted([], null)
    expect(result.activeTabId).toBeNull()
    expect(result.tabs).toHaveLength(0)
  })
})

describe('migrateToTabState', () => {
  it('migrates old single-file state to tab', () => {
    const oldState = {
      lastFolderPath: null,
      sidebarCollapsed: false,
      editorCollapsed: false,
      previewCollapsed: false,
      zoomLevel: 14,
      file: { path: '/old.md', content: '# Old', isDirty: false }
    }
    const result = migrateToTabState(oldState as any)
    expect(result.tabs).toHaveLength(1)
    expect(result.tabs[0].path).toBe('/old.md')
    expect(result.tabs[0].content).toBe('# Old')
  })

  it('returns empty state when no old file state', () => {
    const oldState = {
      lastFolderPath: null,
      sidebarCollapsed: false,
      editorCollapsed: false,
      previewCollapsed: false,
      zoomLevel: 14,
    }
    const result = migrateToTabState(oldState as any)
    expect(result.tabs).toHaveLength(0)
    expect(result.activeTabId).toBeNull()
  })

  it('uses existing tabs if already migrated', () => {
    const existingTabs = [
      { id: 'tab-1', path: '/a.md', isDirty: false, cursorPosition: { line: 1, column: 1 }, scrollPosition: { line: 0 } }
    ]
    const state = {
      lastFolderPath: null,
      sidebarCollapsed: false,
      editorCollapsed: false,
      previewCollapsed: false,
      zoomLevel: 14,
      tabs: existingTabs,
      activeTabId: 'tab-1'
    }
    const result = migrateToTabState(state as any)
    expect(result.tabs).toHaveLength(1)
    expect(result.activeTabId).toBe('tab-1')
  })
})
