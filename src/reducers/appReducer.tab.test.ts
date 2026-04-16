import { describe, it, expect } from 'vitest'
import { appReducer } from './appReducer'
import { initialState } from '../context/AppContext'
import { AppState } from '../types'

const stateWithTabs = (overrides = {}): AppState => ({
  ...initialState,
  tabs: {
    tabs: [],
    activeTabId: null,
    recentlyClosed: [],
    ...overrides
  }
})

describe('Tab Reducer', () => {
  describe('OPEN_TAB', () => {
    it('creates a new tab', () => {
      const state = stateWithTabs()
      const result = appReducer(state, {
        type: 'OPEN_TAB',
        payload: { path: '/test.md', content: '# Hello' }
      })
      expect(result.tabs.tabs).toHaveLength(1)
      expect(result.tabs.tabs[0].path).toBe('/test.md')
      expect(result.tabs.tabs[0].content).toBe('# Hello')
      expect(result.tabs.activeTabId).toBe(result.tabs.tabs[0].id)
    })

    it('switches to existing tab if file already open', () => {
      const existingTab = {
        id: 'tab-1',
        path: '/test.md',
        content: '# Hello',
        isDirty: false,
        cursorPosition: { line: 1, column: 1 },
        scrollPosition: { line: 0 },
        lastAccessed: Date.now()
      }
      const state = stateWithTabs({ tabs: [existingTab], activeTabId: 'tab-1' })
      const result = appReducer(state, {
        type: 'OPEN_TAB',
        payload: { path: '/test.md', content: '# Hello' }
      })
      expect(result.tabs.tabs).toHaveLength(1) // No new tab created
      expect(result.tabs.activeTabId).toBe('tab-1')
    })

    it('does not exceed MAX_TABS limit', () => {
      const manyTabs = Array.from({ length: 50 }, (_, i) => ({
        id: `tab-${i}`,
        path: `/file${i}.md`,
        content: '',
        isDirty: false,
        cursorPosition: { line: 1, column: 1 },
        scrollPosition: { line: 0 },
        lastAccessed: Date.now()
      }))
      const state = stateWithTabs({ tabs: manyTabs, activeTabId: 'tab-0' })
      const result = appReducer(state, {
        type: 'OPEN_TAB',
        payload: { path: '/new.md', content: '' }
      })
      expect(result.tabs.tabs).toHaveLength(50) // No new tab added
    })
  })

  describe('CLOSE_TAB', () => {
    it('removes the tab', () => {
      const tab = {
        id: 'tab-1',
        path: '/test.md',
        content: '',
        isDirty: false,
        cursorPosition: { line: 1, column: 1 },
        scrollPosition: { line: 0 },
        lastAccessed: Date.now()
      }
      const state = stateWithTabs({ tabs: [tab], activeTabId: 'tab-1' })
      const result = appReducer(state, { type: 'CLOSE_TAB', payload: 'tab-1' })
      expect(result.tabs.tabs).toHaveLength(0)
      expect(result.tabs.activeTabId).toBeNull()
    })

    it('adds closed tab to recentlyClosed', () => {
      const tab = {
        id: 'tab-1',
        path: '/test.md',
        content: '# Hello',
        isDirty: false,
        cursorPosition: { line: 1, column: 1 },
        scrollPosition: { line: 0 },
        lastAccessed: Date.now()
      }
      const state = stateWithTabs({ tabs: [tab], activeTabId: 'tab-1' })
      const result = appReducer(state, { type: 'CLOSE_TAB', payload: 'tab-1' })
      expect(result.tabs.recentlyClosed).toHaveLength(1)
      expect(result.tabs.recentlyClosed[0].id).toBe('tab-1')
    })

    it('activates left neighbor when closing active tab', () => {
      const tabs = [
        { id: 'tab-1', path: '/a.md', content: '', isDirty: false, cursorPosition: { line: 1, column: 1 }, scrollPosition: { line: 0 }, lastAccessed: Date.now() },
        { id: 'tab-2', path: '/b.md', content: '', isDirty: false, cursorPosition: { line: 1, column: 1 }, scrollPosition: { line: 0 }, lastAccessed: Date.now() },
      ]
      const state = stateWithTabs({ tabs, activeTabId: 'tab-2' })
      const result = appReducer(state, { type: 'CLOSE_TAB', payload: 'tab-2' })
      expect(result.tabs.activeTabId).toBe('tab-1')
    })
  })

  describe('SWITCH_TAB', () => {
    it('changes the active tab', () => {
      const tabs = [
        { id: 'tab-1', path: '/a.md', content: '', isDirty: false, cursorPosition: { line: 1, column: 1 }, scrollPosition: { line: 0 }, lastAccessed: 1 },
        { id: 'tab-2', path: '/b.md', content: '', isDirty: false, cursorPosition: { line: 1, column: 1 }, scrollPosition: { line: 0 }, lastAccessed: 1 },
      ]
      const state = stateWithTabs({ tabs, activeTabId: 'tab-1' })
      const result = appReducer(state, { type: 'SWITCH_TAB', payload: 'tab-2' })
      expect(result.tabs.activeTabId).toBe('tab-2')
    })
  })

  describe('REORDER_TABS', () => {
    it('reorders tabs correctly', () => {
      const tabs = [
        { id: 'tab-1', path: '/a.md', content: '', isDirty: false, cursorPosition: { line: 1, column: 1 }, scrollPosition: { line: 0 }, lastAccessed: Date.now() },
        { id: 'tab-2', path: '/b.md', content: '', isDirty: false, cursorPosition: { line: 1, column: 1 }, scrollPosition: { line: 0 }, lastAccessed: Date.now() },
        { id: 'tab-3', path: '/c.md', content: '', isDirty: false, cursorPosition: { line: 1, column: 1 }, scrollPosition: { line: 0 }, lastAccessed: Date.now() },
      ]
      const state = stateWithTabs({ tabs, activeTabId: 'tab-1' })
      const result = appReducer(state, { type: 'REORDER_TABS', payload: { fromIndex: 0, toIndex: 2 } })
      expect(result.tabs.tabs[0].id).toBe('tab-2')
      expect(result.tabs.tabs[1].id).toBe('tab-3')
      expect(result.tabs.tabs[2].id).toBe('tab-1')
    })
  })

  describe('UPDATE_TAB_CONTENT', () => {
    it('marks tab as dirty when content changes', () => {
      const tab = {
        id: 'tab-1',
        path: '/test.md',
        content: 'original',
        isDirty: false,
        cursorPosition: { line: 1, column: 1 },
        scrollPosition: { line: 0 },
        lastAccessed: Date.now()
      }
      const state = stateWithTabs({ tabs: [tab], activeTabId: 'tab-1' })
      const result = appReducer(state, {
        type: 'UPDATE_TAB_CONTENT',
        payload: { tabId: 'tab-1', content: 'modified' }
      })
      expect(result.tabs.tabs[0].isDirty).toBe(true)
      expect(result.tabs.tabs[0].content).toBe('modified')
    })
  })

  describe('CLOSE_ALL_TABS', () => {
    it('removes all tabs', () => {
      const tabs = [
        { id: 'tab-1', path: '/a.md', content: '', isDirty: false, cursorPosition: { line: 1, column: 1 }, scrollPosition: { line: 0 }, lastAccessed: Date.now() },
        { id: 'tab-2', path: '/b.md', content: '', isDirty: false, cursorPosition: { line: 1, column: 1 }, scrollPosition: { line: 0 }, lastAccessed: Date.now() },
      ]
      const state = stateWithTabs({ tabs, activeTabId: 'tab-1' })
      const result = appReducer(state, { type: 'CLOSE_ALL_TABS' })
      expect(result.tabs.tabs).toHaveLength(0)
      expect(result.tabs.activeTabId).toBeNull()
    })
  })

  describe('REOPEN_CLOSED_TAB', () => {
    it('reopens the last closed tab', () => {
      const closedTab = {
        id: 'tab-closed',
        path: '/closed.md',
        content: '# Closed',
        isDirty: false,
        cursorPosition: { line: 1, column: 1 },
        scrollPosition: { line: 0 },
        lastAccessed: Date.now()
      }
      const state = stateWithTabs({ recentlyClosed: [closedTab] })
      const result = appReducer(state, { type: 'REOPEN_CLOSED_TAB' })
      expect(result.tabs.tabs).toHaveLength(1)
      expect(result.tabs.tabs[0].path).toBe('/closed.md')
      expect(result.tabs.recentlyClosed).toHaveLength(0)
    })
  })

  describe('UPDATE_TAB_PATH', () => {
    const makeTab = (id: string, path: string) => ({
      id,
      path,
      content: '# Content',
      isDirty: false,
      cursorPosition: { line: 1, column: 1 },
      scrollPosition: { line: 0 },
      lastAccessed: Date.now()
    })

    it('updates the path of the matching tab', () => {
      const tab = makeTab('tab-1', '/old/path.md')
      const state = stateWithTabs({ tabs: [tab], activeTabId: 'tab-1' })
      const result = appReducer(state, {
        type: 'UPDATE_TAB_PATH',
        payload: { tabId: 'tab-1', path: '/new/path.md' }
      })
      expect(result.tabs.tabs[0].path).toBe('/new/path.md')
    })

    it('clears isDirty after path update', () => {
      const tab = { ...makeTab('tab-1', '/old.md'), isDirty: true }
      const state = stateWithTabs({ tabs: [tab], activeTabId: 'tab-1' })
      const result = appReducer(state, {
        type: 'UPDATE_TAB_PATH',
        payload: { tabId: 'tab-1', path: '/new.md' }
      })
      expect(result.tabs.tabs[0].isDirty).toBe(false)
    })

    it('does not affect other tabs', () => {
      const tab1 = makeTab('tab-1', '/file1.md')
      const tab2 = makeTab('tab-2', '/file2.md')
      const state = stateWithTabs({ tabs: [tab1, tab2], activeTabId: 'tab-1' })
      const result = appReducer(state, {
        type: 'UPDATE_TAB_PATH',
        payload: { tabId: 'tab-1', path: '/renamed.md' }
      })
      expect(result.tabs.tabs[0].path).toBe('/renamed.md')
      expect(result.tabs.tabs[1].path).toBe('/file2.md')
    })

    it('returns unchanged state if tabId not found', () => {
      const tab = makeTab('tab-1', '/file.md')
      const state = stateWithTabs({ tabs: [tab], activeTabId: 'tab-1' })
      const result = appReducer(state, {
        type: 'UPDATE_TAB_PATH',
        payload: { tabId: 'nonexistent', path: '/new.md' }
      })
      expect(result.tabs.tabs[0].path).toBe('/file.md')
    })
  })
})

