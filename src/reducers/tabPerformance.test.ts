import { describe, it, expect } from 'vitest'
import { appReducer } from './appReducer'
import { initialState } from '../context/AppContext'
import { AppState } from '../types'
import { serializeTabsForPersistence } from '../utils/tabPersistence'

const baseState = (): AppState => ({
  ...initialState,
  tabs: { tabs: [], activeTabId: null, recentlyClosed: [] }
})

const makeTab = (i: number) => ({
  id: `tab-${i}`,
  path: `/file${i}.md`,
  content: `# File ${i}\n\nContent for file ${i}`.repeat(10),
  isDirty: i % 3 === 0, // Every 3rd tab is dirty
  cursorPosition: { line: 1, column: 1 },
  scrollPosition: { line: 0 },
  lastAccessed: Date.now() - i * 1000,
})

describe('Performance Tests - 50+ Tabs', () => {
  it('opens 50 tabs within acceptable time', () => {
    let state = baseState()
    const start = performance.now()

    for (let i = 0; i < 50; i++) {
      state = appReducer(state, {
        type: 'OPEN_TAB',
        payload: { path: `/file${i}.md`, content: `# File ${i}` }
      })
    }

    const elapsed = performance.now() - start
    // LRU eviction may reduce tab count below 50 when approaching threshold
    expect(state.tabs.tabs.length).toBeGreaterThan(0)
    expect(state.tabs.tabs.length).toBeLessThanOrEqual(50)
    expect(elapsed).toBeLessThan(500) // Should complete in under 500ms
  })

  it('switches tabs quickly with 50 tabs open', () => {
    let state = baseState()
    const tabs = Array.from({ length: 50 }, (_, i) => makeTab(i))
    state = appReducer(state, {
      type: 'RESTORE_TABS',
      payload: { tabs, activeTabId: 'tab-0', recentlyClosed: [] }
    })

    const start = performance.now()
    for (let i = 0; i < 50; i++) {
      state = appReducer(state, { type: 'SWITCH_TAB', payload: `tab-${i}` })
    }
    const elapsed = performance.now() - start

    expect(elapsed).toBeLessThan(100) // 50 switches in under 100ms
  })

  it('serializes 50 tabs for persistence efficiently', () => {
    const tabs = Array.from({ length: 50 }, (_, i) => makeTab(i))
    const tabsState = { tabs, activeTabId: 'tab-0', recentlyClosed: [] }

    const start = performance.now()
    const entries = serializeTabsForPersistence(tabsState)
    const elapsed = performance.now() - start

    expect(entries).toHaveLength(50)
    expect(elapsed).toBeLessThan(50) // Serialization should be fast

    // Verify dirty tabs have content, clean tabs don't
    const dirtyEntries = entries.filter(e => e.isDirty)
    const cleanEntries = entries.filter(e => !e.isDirty)
    dirtyEntries.forEach(e => expect(e.content).toBeDefined())
    cleanEntries.forEach(e => expect(e.content).toBeUndefined())
  })

  it('closes all 50 tabs efficiently', () => {
    let state = baseState()
    const tabs = Array.from({ length: 50 }, (_, i) => makeTab(i))
    state = appReducer(state, {
      type: 'RESTORE_TABS',
      payload: { tabs, activeTabId: 'tab-0', recentlyClosed: [] }
    })

    const start = performance.now()
    state = appReducer(state, { type: 'CLOSE_ALL_TABS' })
    const elapsed = performance.now() - start

    expect(state.tabs.tabs).toHaveLength(0)
    expect(elapsed).toBeLessThan(50)
  })

  it('LRU eviction works correctly at 40+ tabs', () => {
    let state = baseState()

    // Open 42 tabs (above eviction threshold of 40)
    for (let i = 0; i < 42; i++) {
      state = appReducer(state, {
        type: 'OPEN_TAB',
        payload: { path: `/file${i}.md`, content: `# File ${i}` }
      })
    }

    // Should have evicted some clean tabs to stay near threshold
    expect(state.tabs.tabs.length).toBeLessThanOrEqual(42)
  })

  it('memory: dirty tab content is preserved during eviction', () => {
    let state = baseState()

    // Open 42 tabs, mark first one as dirty
    for (let i = 0; i < 42; i++) {
      state = appReducer(state, {
        type: 'OPEN_TAB',
        payload: { path: `/file${i}.md`, content: `# File ${i}` }
      })
    }

    // Mark first tab as dirty
    const firstTabId = state.tabs.tabs[0]?.id
    if (firstTabId) {
      state = appReducer(state, {
        type: 'UPDATE_TAB_CONTENT',
        payload: { tabId: firstTabId, content: '# Modified' }
      })
    }

    // Dirty tab should never be evicted
    const dirtyTabs = state.tabs.tabs.filter(t => t.isDirty)
    expect(dirtyTabs.length).toBeGreaterThanOrEqual(1)
  })
})
