import { describe, it, expect, vi } from 'vitest'
import { appReducer } from './appReducer'
import { initialState } from '../context/AppContext'
import { AppState } from '../types'

const baseState = (): AppState => ({
  ...initialState,
  tabs: { tabs: [], activeTabId: null, recentlyClosed: [] }
})

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

describe('Keyboard Shortcuts - Tab Operations', () => {
  describe('Tab navigation shortcuts', () => {
    it('Ctrl+Tab: switches to next tab', () => {
      let state = baseState()
      state = appReducer(state, { type: 'OPEN_TAB', payload: { path: '/a.md', content: '' } })
      state = appReducer(state, { type: 'OPEN_TAB', payload: { path: '/b.md', content: '' } })
      const tab1Id = state.tabs.tabs[0].id
      const tab2Id = state.tabs.tabs[1].id

      // Simulate switching to next tab
      state = appReducer(state, { type: 'SWITCH_TAB', payload: tab1Id })
      expect(state.tabs.activeTabId).toBe(tab1Id)

      state = appReducer(state, { type: 'SWITCH_TAB', payload: tab2Id })
      expect(state.tabs.activeTabId).toBe(tab2Id)
    })

    it('Ctrl+W: closes active tab', () => {
      let state = baseState()
      state = appReducer(state, { type: 'OPEN_TAB', payload: { path: '/a.md', content: '' } })
      const tabId = state.tabs.activeTabId!

      state = appReducer(state, { type: 'CLOSE_TAB', payload: tabId })
      expect(state.tabs.tabs).toHaveLength(0)
    })

    it('Ctrl+Shift+T: reopens closed tab', () => {
      let state = baseState()
      state = appReducer(state, { type: 'OPEN_TAB', payload: { path: '/a.md', content: '' } })
      const tabId = state.tabs.activeTabId!
      state = appReducer(state, { type: 'CLOSE_TAB', payload: tabId })
      state = appReducer(state, { type: 'REOPEN_CLOSED_TAB' })
      expect(state.tabs.tabs).toHaveLength(1)
    })

    it('Ctrl+1-9: switches to tab by index', () => {
      let state = baseState()
      for (let i = 1; i <= 3; i++) {
        state = appReducer(state, { type: 'OPEN_TAB', payload: { path: `/file${i}.md`, content: '' } })
      }
      const tab1Id = state.tabs.tabs[0].id
      state = appReducer(state, { type: 'SWITCH_TAB', payload: tab1Id })
      expect(state.tabs.activeTabId).toBe(tab1Id)
    })

    it('Ctrl+Shift+PageUp: moves tab left', () => {
      let state = baseState()
      state = appReducer(state, { type: 'OPEN_TAB', payload: { path: '/a.md', content: '' } })
      state = appReducer(state, { type: 'OPEN_TAB', payload: { path: '/b.md', content: '' } })
      const originalOrder = state.tabs.tabs.map(t => t.path)

      state = appReducer(state, { type: 'REORDER_TABS', payload: { fromIndex: 1, toIndex: 0 } })
      expect(state.tabs.tabs[0].path).toBe(originalOrder[1])
    })
  })

  describe('File shortcuts with tabs', () => {
    it('Ctrl+N: creates new tab', () => {
      let state = baseState()
      state = appReducer(state, { type: 'OPEN_TAB', payload: { path: null, content: '' } })
      expect(state.tabs.tabs).toHaveLength(1)
      expect(state.tabs.tabs[0].path).toBeNull()
    })

    it('Ctrl+Shift+W: closes all tabs', () => {
      let state = baseState()
      state = appReducer(state, { type: 'OPEN_TAB', payload: { path: '/a.md', content: '' } })
      state = appReducer(state, { type: 'OPEN_TAB', payload: { path: '/b.md', content: '' } })
      state = appReducer(state, { type: 'CLOSE_ALL_TABS' })
      expect(state.tabs.tabs).toHaveLength(0)
    })
  })
})

describe('File Tree Integration', () => {
  it('opening file from tree creates new tab', () => {
    let state = baseState()
    state = appReducer(state, { type: 'OPEN_TAB', payload: { path: '/folder/file.md', content: '# File' } })
    expect(state.tabs.tabs).toHaveLength(1)
    expect(state.tabs.tabs[0].path).toBe('/folder/file.md')
  })

  it('opening same file from tree switches to existing tab', () => {
    let state = baseState()
    state = appReducer(state, { type: 'OPEN_TAB', payload: { path: '/folder/file.md', content: '# File' } })
    const tab1Id = state.tabs.activeTabId!

    // Open another tab
    state = appReducer(state, { type: 'OPEN_TAB', payload: { path: '/other.md', content: '' } })

    // Try to open same file again - reducer should switch to existing
    state = appReducer(state, { type: 'OPEN_TAB', payload: { path: '/folder/file.md', content: '# File' } })
    expect(state.tabs.tabs).toHaveLength(2) // No new tab
    expect(state.tabs.activeTabId).toBe(tab1Id)
  })
})

describe('Menu Integration', () => {
  it('CLEAR_RECENTLY_CLOSED clears tab history', () => {
    let state = baseState()
    state = appReducer(state, { type: 'OPEN_TAB', payload: { path: '/a.md', content: '' } })
    const tabId = state.tabs.activeTabId!
    state = appReducer(state, { type: 'CLOSE_TAB', payload: tabId })
    expect(state.tabs.recentlyClosed).toHaveLength(1)

    state = appReducer(state, { type: 'CLEAR_RECENTLY_CLOSED' })
    expect(state.tabs.recentlyClosed).toHaveLength(0)
  })
})

describe('Recent Files Integration', () => {
  it('tab state tracks open files correctly', () => {
    let state = baseState()
    state = appReducer(state, { type: 'OPEN_TAB', payload: { path: '/recent.md', content: '' } })
    const isOpen = state.tabs.tabs.some(t => t.path === '/recent.md')
    expect(isOpen).toBe(true)
  })

  it('closing tab removes file from open tabs', () => {
    let state = baseState()
    state = appReducer(state, { type: 'OPEN_TAB', payload: { path: '/recent.md', content: '' } })
    const tabId = state.tabs.activeTabId!
    state = appReducer(state, { type: 'CLOSE_TAB', payload: tabId })
    const isOpen = state.tabs.tabs.some(t => t.path === '/recent.md')
    expect(isOpen).toBe(false)
  })
})
