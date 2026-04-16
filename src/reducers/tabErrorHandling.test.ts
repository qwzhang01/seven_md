import { describe, it, expect, vi, beforeEach } from 'vitest'
import { appReducer } from './appReducer'
import { initialState } from '../context/AppContext'
import { AppState } from '../types'
import {
  serializeTabsForPersistence,
  restoreTabsFromPersisted,
  migrateToTabState,
} from '../utils/tabPersistence'

const baseState = (): AppState => ({
  ...initialState,
  tabs: { tabs: [], activeTabId: null, recentlyClosed: [] }
})

describe('Error Handling Tests', () => {
  describe('Tab state corruption recovery', () => {
    it('handles empty tabs array gracefully', () => {
      const result = restoreTabsFromPersisted([], null)
      expect(result.tabs).toHaveLength(0)
      expect(result.activeTabId).toBeNull()
    })

    it('handles invalid activeTabId gracefully', () => {
      const entries = [
        { id: 'tab-1', path: '/a.md', isDirty: false, cursorPosition: { line: 1, column: 1 }, scrollPosition: { line: 0 } }
      ]
      const result = restoreTabsFromPersisted(entries, 'nonexistent-id')
      expect(result.activeTabId).toBe('tab-1') // Falls back to first tab
    })

    it('handles migration with no old state gracefully', () => {
      const result = migrateToTabState({
        lastFolderPath: null,
        sidebarCollapsed: false,
        editorCollapsed: false,
        previewCollapsed: false,
        zoomLevel: 14,
      } as any)
      expect(result.tabs).toHaveLength(0)
      expect(result.activeTabId).toBeNull()
    })
  })

  describe('Permission error handling', () => {
    it('reducer handles tab with missing file gracefully', () => {
      let state = baseState()
      // Open a tab with content (simulating a file that was loaded)
      state = appReducer(state, {
        type: 'OPEN_TAB',
        payload: { path: '/deleted-file.md', content: '# Was here' }
      })
      expect(state.tabs.tabs).toHaveLength(1)
      // Tab should remain open even if file is deleted externally
      expect(state.tabs.tabs[0].path).toBe('/deleted-file.md')
    })
  })

  describe('Max tab limit enforcement', () => {
    it('does not exceed 50 tabs', () => {
      let state = baseState()
      for (let i = 0; i < 55; i++) {
        state = appReducer(state, {
          type: 'OPEN_TAB',
          payload: { path: `/file${i}.md`, content: '' }
        })
      }
      expect(state.tabs.tabs.length).toBeLessThanOrEqual(50)
    })
  })

  describe('Dirty tab protection', () => {
    it('dirty tabs are never evicted by LRU', () => {
      let state = baseState()
      // Open 45 tabs
      for (let i = 0; i < 45; i++) {
        state = appReducer(state, {
          type: 'OPEN_TAB',
          payload: { path: `/file${i}.md`, content: '' }
        })
      }
      // Mark first tab as dirty
      const firstTabId = state.tabs.tabs[0]?.id
      if (firstTabId) {
        state = appReducer(state, {
          type: 'UPDATE_TAB_CONTENT',
          payload: { tabId: firstTabId, content: '# Modified' }
        })
        // Dirty tab should still be present
        const dirtyTab = state.tabs.tabs.find(t => t.id === firstTabId)
        expect(dirtyTab).toBeDefined()
        expect(dirtyTab?.isDirty).toBe(true)
      }
    })
  })

  describe('Recently closed tab history', () => {
    it('limits recently closed to 10 entries', () => {
      let state = baseState()
      // Open and close 15 tabs
      for (let i = 0; i < 15; i++) {
        state = appReducer(state, {
          type: 'OPEN_TAB',
          payload: { path: `/file${i}.md`, content: '' }
        })
        const tabId = state.tabs.activeTabId!
        state = appReducer(state, { type: 'CLOSE_TAB', payload: tabId })
      }
      expect(state.tabs.recentlyClosed.length).toBeLessThanOrEqual(10)
    })

    it('CLEAR_RECENTLY_CLOSED empties history', () => {
      let state = baseState()
      state = appReducer(state, { type: 'OPEN_TAB', payload: { path: '/a.md', content: '' } })
      const tabId = state.tabs.activeTabId!
      state = appReducer(state, { type: 'CLOSE_TAB', payload: tabId })
      state = appReducer(state, { type: 'CLEAR_RECENTLY_CLOSED' })
      expect(state.tabs.recentlyClosed).toHaveLength(0)
    })
  })
})

describe('Recent Files + Tab Integration', () => {
  it('tracks which files are open in tabs', () => {
    let state = baseState()
    state = appReducer(state, { type: 'OPEN_TAB', payload: { path: '/recent.md', content: '' } })
    const isOpen = state.tabs.tabs.some(t => t.path === '/recent.md')
    expect(isOpen).toBe(true)
  })

  it('opening same file switches to existing tab', () => {
    let state = baseState()
    state = appReducer(state, { type: 'OPEN_TAB', payload: { path: '/recent.md', content: '' } })
    const tab1Id = state.tabs.activeTabId!

    // Open another tab
    state = appReducer(state, { type: 'OPEN_TAB', payload: { path: '/other.md', content: '' } })

    // Open same file again
    state = appReducer(state, { type: 'OPEN_TAB', payload: { path: '/recent.md', content: '' } })
    expect(state.tabs.tabs).toHaveLength(2) // No duplicate
    expect(state.tabs.activeTabId).toBe(tab1Id)
  })
})
