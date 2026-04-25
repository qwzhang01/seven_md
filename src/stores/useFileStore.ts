import { create } from 'zustand'

interface FileTab {
  id: string
  path: string | null
  name: string
  content: string
  isDirty: boolean
  cursorLine: number
  cursorColumn: number
  scrollPosition: number
}

interface FileState {
  tabs: FileTab[]
  activeTabId: string | null
  recentlyClosed: FileTab[]

  // Actions
  openTab: (path: string | null, content: string, name?: string) => string
  closeTab: (tabId: string) => FileTab | null
  switchTab: (tabId: string) => void
  updateTabContent: (tabId: string, content: string) => void
  updateTabPath: (tabId: string, path: string) => void
  setTabDirty: (tabId: string, isDirty: boolean) => void
  updateTabCursor: (tabId: string, line: number, column: number) => void
  reorderTabs: (fromIndex: number, toIndex: number) => void
  reopenClosedTab: () => void
  closeAllTabs: () => void
  getActiveTab: () => FileTab | null
}

let tabIdCounter = 0
const generateTabId = () => `tab-${++tabIdCounter}-${Date.now()}`

export const useFileStore = create<FileState>()((set, get) => ({
  tabs: [],
  activeTabId: null,
  recentlyClosed: [],

  openTab: (path, content, name) => {
    const state = get()
    // Check if file is already open
    const existingTab = path
      ? state.tabs.find((t) => t.path === path)
      : null

    if (existingTab) {
      set({ activeTabId: existingTab.id })
      return existingTab.id
    }

    const id = generateTabId()
    const tabName = name || (path ? path.split('/').pop() || 'Untitled' : 'Untitled')

    const newTab: FileTab = {
      id,
      path,
      name: tabName,
      content,
      isDirty: false,
      cursorLine: 1,
      cursorColumn: 1,
      scrollPosition: 0,
    }

    set({
      tabs: [...state.tabs, newTab],
      activeTabId: id,
    })

    return id
  },

  closeTab: (tabId) => {
    const state = get()
    const tab = state.tabs.find((t) => t.id === tabId)
    if (!tab) return null

    const newTabs = state.tabs.filter((t) => t.id !== tabId)
    const closedIndex = state.tabs.findIndex((t) => t.id === tabId)

    // Determine next active tab
    let newActiveTabId = state.activeTabId
    if (state.activeTabId === tabId) {
      if (newTabs.length > 0) {
        newActiveTabId = newTabs[Math.min(closedIndex, newTabs.length - 1)].id
      } else {
        newActiveTabId = null
      }
    }

    // Add to recently closed (max 10)
    const newRecentlyClosed = [tab, ...state.recentlyClosed].slice(0, 10)

    set({
      tabs: newTabs,
      activeTabId: newActiveTabId,
      recentlyClosed: newRecentlyClosed,
    })

    return tab
  },

  switchTab: (tabId) => {
    const state = get()
    if (state.tabs.some((t) => t.id === tabId)) {
      set({ activeTabId: tabId })
    }
  },

  updateTabContent: (tabId, content) =>
    set((s) => ({
      tabs: s.tabs.map((t) =>
        t.id === tabId ? { ...t, content, isDirty: true } : t
      ),
    })),

  updateTabPath: (tabId, path) =>
    set((s) => ({
      tabs: s.tabs.map((t) =>
        t.id === tabId
          ? { ...t, path, name: path.split('/').pop() || t.name, isDirty: false }
          : t
      ),
    })),

  setTabDirty: (tabId, isDirty) =>
    set((s) => ({
      tabs: s.tabs.map((t) => (t.id === tabId ? { ...t, isDirty } : t)),
    })),

  updateTabCursor: (tabId, line, column) =>
    set((s) => ({
      tabs: s.tabs.map((t) =>
        t.id === tabId ? { ...t, cursorLine: line, cursorColumn: column } : t
      ),
    })),

  reorderTabs: (fromIndex, toIndex) =>
    set((s) => {
      const newTabs = [...s.tabs]
      const [moved] = newTabs.splice(fromIndex, 1)
      newTabs.splice(toIndex, 0, moved)
      return { tabs: newTabs }
    }),

  reopenClosedTab: () =>
    set((s) => {
      if (s.recentlyClosed.length === 0) return s
      const [tab, ...rest] = s.recentlyClosed
      const newId = generateTabId()
      return {
        tabs: [...s.tabs, { ...tab, id: newId }],
        activeTabId: newId,
        recentlyClosed: rest,
      }
    }),

  closeAllTabs: () => set({ tabs: [], activeTabId: null }),

  getActiveTab: () => {
    const state = get()
    return state.tabs.find((t) => t.id === state.activeTabId) ?? null
  },
}))
