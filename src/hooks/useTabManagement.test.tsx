import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTabManagement } from './useTabManagement'
import { AppContext } from '../context/AppContext'
import React from 'react'
import { AppState } from '../types'

// Mock tauriCommands
vi.mock('../../tauriCommands', () => ({
  readFile: vi.fn().mockResolvedValue('# File Content'),
  saveFile: vi.fn().mockResolvedValue(undefined),
}))

// Mock logger
vi.mock('../../utils/logger', () => ({
  createLogger: () => ({
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  }),
}))

const makeTab = (overrides = {}) => ({
  id: 'tab-1',
  path: '/test.md',
  content: '# Hello',
  isDirty: false,
  cursorPosition: { line: 1, column: 1 },
  scrollPosition: { line: 0 },
  lastAccessed: Date.now(),
  ...overrides,
})

const makeState = (tabsOverride = {}): AppState => ({
  folder: { path: null, files: [], isLoading: false, error: null },
  editor: {
    cursorPosition: { line: 1, column: 1 },
    documentStats: { lines: 0, words: 0, characters: 0 },
    fileEncoding: 'UTF-8',
    lineEnding: 'LF',
  },
  ui: {
    sidebarCollapsed: false,
    editorCollapsed: false,
    previewCollapsed: false,
    theme: 'light',
    zoomLevel: 14,
    searchPanelOpen: false,
  },
  tabs: {
    tabs: [],
    activeTabId: null,
    recentlyClosed: [],
    ...tabsOverride,
  },
})

function createWrapper(initialState: AppState) {
  const dispatch = vi.fn()
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <AppContext.Provider value={{ state: initialState, dispatch }}>
      {children}
    </AppContext.Provider>
  )
  return { Wrapper, dispatch }
}

describe('useTabManagement', () => {
  describe('basic state', () => {
    it('returns empty tabs by default', () => {
      const state = makeState()
      const { Wrapper } = createWrapper(state)
      const { result } = renderHook(() => useTabManagement(), { wrapper: Wrapper })
      expect(result.current.tabs).toHaveLength(0)
      expect(result.current.activeTab).toBeNull()
      expect(result.current.canReopenClosed).toBe(false)
    })

    it('returns active tab when set', () => {
      const tab = makeTab()
      const state = makeState({ tabs: [tab], activeTabId: 'tab-1' })
      const { Wrapper } = createWrapper(state)
      const { result } = renderHook(() => useTabManagement(), { wrapper: Wrapper })
      expect(result.current.activeTab?.id).toBe('tab-1')
      expect(result.current.activeTabId).toBe('tab-1')
    })

    it('reports canReopenClosed correctly', () => {
      const closedTab = makeTab({ id: 'closed-1' })
      const state = makeState({ recentlyClosed: [closedTab] })
      const { Wrapper } = createWrapper(state)
      const { result } = renderHook(() => useTabManagement(), { wrapper: Wrapper })
      expect(result.current.canReopenClosed).toBe(true)
    })

    it('reports isAtMaxTabs when 50 tabs open', () => {
      const tabs = Array.from({ length: 50 }, (_, i) => makeTab({ id: `tab-${i}`, path: `/file${i}.md` }))
      const state = makeState({ tabs, activeTabId: 'tab-0' })
      const { Wrapper } = createWrapper(state)
      const { result } = renderHook(() => useTabManagement(), { wrapper: Wrapper })
      expect(result.current.isAtMaxTabs).toBe(true)
    })
  })

  describe('openTab', () => {
    it('dispatches OPEN_TAB for new file', async () => {
      const state = makeState()
      const { Wrapper, dispatch } = createWrapper(state)
      const { result } = renderHook(() => useTabManagement(), { wrapper: Wrapper })
      await act(async () => {
        await result.current.openTab('/new.md', '# New')
      })
      expect(dispatch).toHaveBeenCalledWith({
        type: 'OPEN_TAB',
        payload: { path: '/new.md', content: '# New' },
      })
    })

    it('dispatches SWITCH_TAB if file already open', async () => {
      const tab = makeTab({ id: 'tab-1', path: '/test.md' })
      const state = makeState({ tabs: [tab], activeTabId: 'tab-1' })
      const { Wrapper, dispatch } = createWrapper(state)
      const { result } = renderHook(() => useTabManagement(), { wrapper: Wrapper })
      await act(async () => {
        await result.current.openTab('/test.md')
      })
      expect(dispatch).toHaveBeenCalledWith({ type: 'SWITCH_TAB', payload: 'tab-1' })
    })

    it('does not dispatch when at max tabs', async () => {
      const tabs = Array.from({ length: 50 }, (_, i) => makeTab({ id: `tab-${i}`, path: `/file${i}.md` }))
      const state = makeState({ tabs, activeTabId: 'tab-0' })
      const { Wrapper, dispatch } = createWrapper(state)
      const { result } = renderHook(() => useTabManagement(), { wrapper: Wrapper })
      await act(async () => {
        await result.current.openTab('/new.md', '# New')
      })
      expect(dispatch).not.toHaveBeenCalled()
    })
  })

  describe('closeTab', () => {
    it('dispatches CLOSE_TAB', () => {
      const tab = makeTab()
      const state = makeState({ tabs: [tab], activeTabId: 'tab-1' })
      const { Wrapper, dispatch } = createWrapper(state)
      const { result } = renderHook(() => useTabManagement(), { wrapper: Wrapper })
      act(() => {
        result.current.closeTab('tab-1')
      })
      expect(dispatch).toHaveBeenCalledWith({ type: 'CLOSE_TAB', payload: 'tab-1' })
    })
  })

  describe('switchTab', () => {
    it('dispatches SWITCH_TAB', () => {
      const tabs = [makeTab({ id: 'tab-1' }), makeTab({ id: 'tab-2', path: '/b.md' })]
      const state = makeState({ tabs, activeTabId: 'tab-1' })
      const { Wrapper, dispatch } = createWrapper(state)
      const { result } = renderHook(() => useTabManagement(), { wrapper: Wrapper })
      act(() => {
        result.current.switchTab('tab-2')
      })
      expect(dispatch).toHaveBeenCalledWith({ type: 'SWITCH_TAB', payload: 'tab-2' })
    })
  })

  describe('closeAllTabs', () => {
    it('dispatches CLOSE_ALL_TABS', () => {
      const state = makeState()
      const { Wrapper, dispatch } = createWrapper(state)
      const { result } = renderHook(() => useTabManagement(), { wrapper: Wrapper })
      act(() => {
        result.current.closeAllTabs()
      })
      expect(dispatch).toHaveBeenCalledWith({ type: 'CLOSE_ALL_TABS' })
    })
  })

  describe('getTabName', () => {
    it('returns file name for tabs with path', () => {
      const tab = makeTab({ path: '/folder/document.md' })
      const state = makeState({ tabs: [tab], activeTabId: 'tab-1' })
      const { Wrapper } = createWrapper(state)
      const { result } = renderHook(() => useTabManagement(), { wrapper: Wrapper })
      expect(result.current.getTabName(tab)).toBe('document.md')
    })

    it('returns Untitled for tabs without path', () => {
      const tab = makeTab({ path: null })
      const state = makeState({ tabs: [tab], activeTabId: 'tab-1' })
      const { Wrapper } = createWrapper(state)
      const { result } = renderHook(() => useTabManagement(), { wrapper: Wrapper })
      expect(result.current.getTabName(tab)).toBe('Untitled')
    })
  })

  describe('isFileOpen', () => {
    it('returns true when file is open', () => {
      const tab = makeTab({ path: '/test.md' })
      const state = makeState({ tabs: [tab], activeTabId: 'tab-1' })
      const { Wrapper } = createWrapper(state)
      const { result } = renderHook(() => useTabManagement(), { wrapper: Wrapper })
      expect(result.current.isFileOpen('/test.md')).toBe(true)
    })

    it('returns false when file is not open', () => {
      const state = makeState()
      const { Wrapper } = createWrapper(state)
      const { result } = renderHook(() => useTabManagement(), { wrapper: Wrapper })
      expect(result.current.isFileOpen('/not-open.md')).toBe(false)
    })
  })

  describe('getDirtyTabs', () => {
    it('returns only dirty tabs', () => {
      const tabs = [
        makeTab({ id: 'tab-1', isDirty: true }),
        makeTab({ id: 'tab-2', path: '/b.md', isDirty: false }),
        makeTab({ id: 'tab-3', path: '/c.md', isDirty: true }),
      ]
      const state = makeState({ tabs, activeTabId: 'tab-1' })
      const { Wrapper } = createWrapper(state)
      const { result } = renderHook(() => useTabManagement(), { wrapper: Wrapper })
      const dirty = result.current.getDirtyTabs()
      expect(dirty).toHaveLength(2)
      expect(dirty.map(t => t.id)).toEqual(['tab-1', 'tab-3'])
    })
  })
})
