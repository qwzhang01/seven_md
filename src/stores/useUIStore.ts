import { create } from 'zustand'

export type DialogType = 'shortcut-reference' | 'about' | 'welcome' | null

interface UIState {
  sidebarVisible: boolean
  sidebarWidth: number
  activeSidebarPanel: 'explorer' | 'search' | 'outline' | 'snippets'
  viewMode: 'split' | 'editor-only' | 'preview-only'
  commandPaletteOpen: boolean
  aiPanelOpen: boolean
  findReplaceOpen: boolean
  findReplaceMode: 'find' | 'replace'
  zoomLevel: number
  dialogType: DialogType
  editorFocused: boolean // 编辑器是否获得焦点

  // Actions
  toggleSidebar: () => void
  setSidebarVisible: (visible: boolean) => void
  setSidebarWidth: (width: number) => void
  setActiveSidebarPanel: (panel: UIState['activeSidebarPanel']) => void
  setViewMode: (mode: UIState['viewMode']) => void
  setCommandPaletteOpen: (open: boolean) => void
  toggleCommandPalette: () => void
  setAIPanelOpen: (open: boolean) => void
  setFindReplaceOpen: (open: boolean) => void
  setFindReplaceMode: (mode: UIState['findReplaceMode']) => void
  setZoomLevel: (level: number) => void
  zoomIn: () => void
  zoomOut: () => void
  setDialogType: (type: DialogType) => void
  setEditorFocused: (focused: boolean) => void
}

const MIN_ZOOM = 10
const MAX_ZOOM = 32
const ZOOM_STEP = 2
const MIN_SIDEBAR_WIDTH = 180
const MAX_SIDEBAR_WIDTH = 500

export const useUIStore = create<UIState>()((set) => ({
  sidebarVisible: true,
  sidebarWidth: 260,
  activeSidebarPanel: 'explorer',
  viewMode: 'split',
  commandPaletteOpen: false,
  aiPanelOpen: false,
  findReplaceOpen: false,
  findReplaceMode: 'find',
  zoomLevel: 14,
  dialogType: null,
  editorFocused: false,

  toggleSidebar: () => set((s) => ({ sidebarVisible: !s.sidebarVisible })),
  setSidebarVisible: (visible) => set({ sidebarVisible: visible }),
  setSidebarWidth: (width) =>
    set({ sidebarWidth: Math.max(MIN_SIDEBAR_WIDTH, Math.min(MAX_SIDEBAR_WIDTH, width)) }),
  setActiveSidebarPanel: (panel) =>
    set((s) => ({
      activeSidebarPanel: panel,
      // If clicking the same panel, toggle sidebar visibility
      sidebarVisible: s.activeSidebarPanel === panel ? !s.sidebarVisible : true,
    })),
  setViewMode: (mode) => set({ viewMode: mode }),
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
  toggleCommandPalette: () => set((s) => ({ commandPaletteOpen: !s.commandPaletteOpen })),
  setAIPanelOpen: (open) => set({ aiPanelOpen: open }),
  setFindReplaceOpen: (open) => set({ findReplaceOpen: open }),
  setFindReplaceMode: (mode) => set({ findReplaceMode: mode, findReplaceOpen: true }),
  setZoomLevel: (level) => set({ zoomLevel: Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, level)) }),
  zoomIn: () => set((s) => ({ zoomLevel: Math.min(s.zoomLevel + ZOOM_STEP, MAX_ZOOM) })),
  zoomOut: () => set((s) => ({ zoomLevel: Math.max(s.zoomLevel - ZOOM_STEP, MIN_ZOOM) })),
  setDialogType: (type) => set({ dialogType: type }),
  setEditorFocused: (focused) => set({ editorFocused: focused }),
}))
