import { describe, it, expect, vi, beforeEach } from 'vitest'
import { appReducer } from './appReducer'
import { initialState } from '../context/AppContext'
import { AppState } from '../types'

const makeTab = (overrides = {}) => ({
  id: `tab-${Math.random().toString(36).slice(2)}`,
  path: null as string | null,
  content: '',
  isDirty: false,
  cursorPosition: { line: 1, column: 1 },
  scrollPosition: { line: 0 },
  lastAccessed: Date.now(),
  ...overrides,
})

const baseState = (): AppState => ({
  ...initialState,
  tabs: { tabs: [], activeTabId: null, recentlyClosed: [] }
})

describe('Tab Lifecycle Integration', () => {
  describe('Open → Switch → Close', () => {
    it('full lifecycle: open two tabs, switch, close', () => {
      let state = baseState()

      // Open first tab
      state = appReducer(state, { type: 'OPEN_TAB', payload: { path: '/a.md', content: '# A' } })
      expect(state.tabs.tabs).toHaveLength(1)
      const tab1Id = state.tabs.activeTabId!

      // Open second tab
      state = appReducer(state, { type: 'OPEN_TAB', payload: { path: '/b.md', content: '# B' } })
      expect(state.tabs.tabs).toHaveLength(2)
      const tab2Id = state.tabs.activeTabId!
      expect(tab2Id).not.toBe(tab1Id)

      // Switch back to first tab
      state = appReducer(state, { type: 'SWITCH_TAB', payload: tab1Id })
      expect(state.tabs.activeTabId).toBe(tab1Id)

      // Close first tab - should activate second
      state = appReducer(state, { type: 'CLOSE_TAB', payload: tab1Id })
      expect(state.tabs.tabs).toHaveLength(1)
      expect(state.tabs.activeTabId).toBe(tab2Id)
      expect(state.tabs.recentlyClosed).toHaveLength(1)
    })

    it('reopens closed tab', () => {
      let state = baseState()
      state = appReducer(state, { type: 'OPEN_TAB', payload: { path: '/a.md', content: '# A' } })
      const tabId = state.tabs.activeTabId!
      state = appReducer(state, { type: 'CLOSE_TAB', payload: tabId })
      expect(state.tabs.tabs).toHaveLength(0)

      state = appReducer(state, { type: 'REOPEN_CLOSED_TAB' })
      expect(state.tabs.tabs).toHaveLength(1)
      expect(state.tabs.tabs[0].path).toBe('/a.md')
    })
  })

  describe('Dirty tab handling', () => {
    it('marks tab dirty on content change', () => {
      let state = baseState()
      state = appReducer(state, { type: 'OPEN_TAB', payload: { path: '/a.md', content: '# A' } })
      const tabId = state.tabs.activeTabId!

      state = appReducer(state, {
        type: 'UPDATE_TAB_CONTENT',
        payload: { tabId, content: '# A Modified' }
      })
      expect(state.tabs.tabs[0].isDirty).toBe(true)
    })

    it('clears dirty flag after save', () => {
      let state = baseState()
      state = appReducer(state, { type: 'OPEN_TAB', payload: { path: '/a.md', content: '# A' } })
      const tabId = state.tabs.activeTabId!
      state = appReducer(state, { type: 'UPDATE_TAB_CONTENT', payload: { tabId, content: '# Modified' } })
      state = appReducer(state, { type: 'SET_TAB_DIRTY', payload: { tabId, isDirty: false } })
      expect(state.tabs.tabs[0].isDirty).toBe(false)
    })
  })

  describe('Tab reordering', () => {
    it('reorders tabs via drag-and-drop', () => {
      let state = baseState()
      state = appReducer(state, { type: 'OPEN_TAB', payload: { path: '/a.md', content: '' } })
      state = appReducer(state, { type: 'OPEN_TAB', payload: { path: '/b.md', content: '' } })
      state = appReducer(state, { type: 'OPEN_TAB', payload: { path: '/c.md', content: '' } })

      const originalOrder = state.tabs.tabs.map(t => t.path)
      state = appReducer(state, { type: 'REORDER_TABS', payload: { fromIndex: 0, toIndex: 2 } })
      const newOrder = state.tabs.tabs.map(t => t.path)

      expect(newOrder[0]).toBe(originalOrder[1])
      expect(newOrder[1]).toBe(originalOrder[2])
      expect(newOrder[2]).toBe(originalOrder[0])
    })
  })

  describe('Close operations', () => {
    it('close all tabs', () => {
      let state = baseState()
      state = appReducer(state, { type: 'OPEN_TAB', payload: { path: '/a.md', content: '' } })
      state = appReducer(state, { type: 'OPEN_TAB', payload: { path: '/b.md', content: '' } })
      state = appReducer(state, { type: 'CLOSE_ALL_TABS' })
      expect(state.tabs.tabs).toHaveLength(0)
      expect(state.tabs.activeTabId).toBeNull()
    })

    it('close other tabs', () => {
      let state = baseState()
      state = appReducer(state, { type: 'OPEN_TAB', payload: { path: '/a.md', content: '' } })
      state = appReducer(state, { type: 'OPEN_TAB', payload: { path: '/b.md', content: '' } })
      state = appReducer(state, { type: 'OPEN_TAB', payload: { path: '/c.md', content: '' } })
      const keepId = state.tabs.tabs[1].id

      state = appReducer(state, { type: 'CLOSE_OTHER_TABS', payload: keepId })
      expect(state.tabs.tabs).toHaveLength(1)
      expect(state.tabs.tabs[0].id).toBe(keepId)
    })

    it('close tabs to the right', () => {
      let state = baseState()
      state = appReducer(state, { type: 'OPEN_TAB', payload: { path: '/a.md', content: '' } })
      state = appReducer(state, { type: 'OPEN_TAB', payload: { path: '/b.md', content: '' } })
      state = appReducer(state, { type: 'OPEN_TAB', payload: { path: '/c.md', content: '' } })
      const pivotId = state.tabs.tabs[0].id

      state = appReducer(state, { type: 'CLOSE_TABS_TO_RIGHT', payload: pivotId })
      expect(state.tabs.tabs).toHaveLength(1)
      expect(state.tabs.tabs[0].id).toBe(pivotId)
    })
  })

  describe('Tab persistence', () => {
    it('restores tabs from persisted state', () => {
      const persistedTabs = [
        makeTab({ id: 'tab-1', path: '/a.md', content: '# A', isDirty: true }),
        makeTab({ id: 'tab-2', path: '/b.md', content: '', isDirty: false }),
      ]
      let state = baseState()
      state = appReducer(state, {
        type: 'RESTORE_TABS',
        payload: { tabs: persistedTabs, activeTabId: 'tab-1', recentlyClosed: [] }
      })
      expect(state.tabs.tabs).toHaveLength(2)
      expect(state.tabs.activeTabId).toBe('tab-1')
    })
  })

  describe('Status bar updates', () => {
    it('updates cursor position on tab switch', () => {
      let state = baseState()
      state = appReducer(state, { type: 'OPEN_TAB', payload: { path: '/a.md', content: '' } })
      const tabId = state.tabs.activeTabId!

      state = appReducer(state, {
        type: 'UPDATE_TAB_CURSOR',
        payload: { tabId, line: 5, column: 10 }
      })
      const tab = state.tabs.tabs.find(t => t.id === tabId)
      expect(tab?.cursorPosition).toEqual({ line: 5, column: 10 })
    })
  })
})
