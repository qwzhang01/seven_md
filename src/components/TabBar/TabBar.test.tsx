import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TabBar } from './index'
import { AppContext } from '../../context/AppContext'
import React from 'react'
import { AppState } from '../../types'

// Mock useTabManagement
vi.mock('../../hooks/useTabManagement', () => ({
  useTabManagement: vi.fn(),
}))

import { useTabManagement } from '../../hooks/useTabManagement'

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

const mockTabManagement = (overrides = {}) => ({
  tabs: [],
  activeTabId: null,
  activeTab: null,
  recentlyClosed: [],
  canReopenClosed: false,
  tabCount: 0,
  isAtMaxTabs: false,
  switchTab: vi.fn(),
  closeTab: vi.fn(),
  closeAllTabs: vi.fn(),
  closeOtherTabs: vi.fn(),
  closeTabsToRight: vi.fn(),
  reopenLastClosedTab: vi.fn(),
  createUntitledTab: vi.fn(),
  getTabName: (tab: any) => tab.path?.split('/').pop() ?? 'Untitled',
  saveActiveTab: vi.fn(),
  getDirtyTabs: vi.fn().mockReturnValue([]),
  isFileOpen: vi.fn().mockReturnValue(false),
  getTabByPath: vi.fn(),
  openTab: vi.fn(),
  ...overrides,
})

const makeState = (): AppState => ({
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
  tabs: { tabs: [], activeTabId: null, recentlyClosed: [] },
})

function renderTabBar(props = {}, tabsOverride = {}) {
  const dispatch = vi.fn()
  const state = makeState()
  ;(useTabManagement as any).mockReturnValue(mockTabManagement(tabsOverride))
  return render(
    <AppContext.Provider value={{ state, dispatch }}>
      <TabBar {...props} />
    </AppContext.Provider>
  )
}

describe('TabBar', () => {
  describe('rendering', () => {
    it('renders null when 0 or 1 tabs (hidden)', () => {
      // TabBar hides itself when <= 1 tab
      const { container } = renderTabBar({}, { tabs: [], activeTabId: null })
      expect(container.firstChild).toBeNull()
    })

    it('renders tab bar with 2+ tabs', () => {
      const tabs = [
        makeTab({ id: 'tab-1', path: '/a.md' }),
        makeTab({ id: 'tab-2', path: '/b.md' }),
      ]
      renderTabBar({}, { tabs, activeTabId: 'tab-1' })
      expect(screen.getByRole('tablist')).toBeInTheDocument()
    })

    it('renders tab names', () => {
      const tabs = [
        makeTab({ id: 'tab-1', path: '/a.md' }),
        makeTab({ id: 'tab-2', path: '/b.md' }),
      ]
      renderTabBar({}, { tabs, activeTabId: 'tab-1' })
      expect(screen.getByText('a.md')).toBeInTheDocument()
      expect(screen.getByText('b.md')).toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('has tablist role with 2+ tabs', () => {
      const tabs = [
        makeTab({ id: 'tab-1', path: '/a.md' }),
        makeTab({ id: 'tab-2', path: '/b.md' }),
      ]
      renderTabBar({}, { tabs, activeTabId: 'tab-1' })
      expect(screen.getByRole('tablist')).toBeInTheDocument()
    })

    it('tabs have correct ARIA attributes', () => {
      const tabs = [
        makeTab({ id: 'tab-1', path: '/a.md' }),
        makeTab({ id: 'tab-2', path: '/b.md' }),
      ]
      renderTabBar({}, { tabs, activeTabId: 'tab-1' })
      const tabEls = screen.getAllByRole('tab')
      expect(tabEls).toHaveLength(2)
      // Active tab should have aria-selected=true
      const activeTab = tabEls.find(el => el.getAttribute('aria-selected') === 'true')
      expect(activeTab).toBeTruthy()
    })

    it('close buttons have accessible labels', () => {
      const tabs = [
        makeTab({ id: 'tab-1', path: '/a.md' }),
        makeTab({ id: 'tab-2', path: '/b.md' }),
      ]
      renderTabBar({}, { tabs, activeTabId: 'tab-1' })
      const closeBtns = screen.getAllByRole('button', { name: /close/i })
      expect(closeBtns.length).toBeGreaterThan(0)
    })
  })

  describe('interactions', () => {
    it('calls switchTab when tab is clicked', () => {
      const switchTab = vi.fn()
      const tabs = [
        makeTab({ id: 'tab-1', path: '/a.md' }),
        makeTab({ id: 'tab-2', path: '/b.md' }),
      ]
      renderTabBar({}, { tabs, activeTabId: 'tab-1', switchTab })
      fireEvent.click(screen.getByText('b.md'))
      expect(switchTab).toHaveBeenCalledWith('tab-2')
    })

    it('calls onCloseTab when close button clicked', () => {
      const onCloseTab = vi.fn()
      const tabs = [
        makeTab({ id: 'tab-1', path: '/a.md' }),
        makeTab({ id: 'tab-2', path: '/b.md' }),
      ]
      renderTabBar({ onCloseTab }, { tabs, activeTabId: 'tab-1' })
      const closeBtns = screen.getAllByRole('button', { name: /close/i })
      fireEvent.click(closeBtns[0])
      expect(onCloseTab).toHaveBeenCalled()
    })
  })
})
