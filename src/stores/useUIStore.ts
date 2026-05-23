import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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
  editorWidth: number | null // 编辑器像素宽度（null = flex:1 自动 50/50）
  aiPanelWidth: number // AI 面板宽度
  isFullscreen: boolean // 全屏状态（运行时状态，不持久化）

  // Actions
  toggleSidebar: () => void
  setSidebarVisible: (visible: boolean) => void
  setSidebarWidth: (width: number) => void
  setAIPanelWidth: (width: number) => void
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
  setEditorWidth: (width: number | null) => void
  setIsFullscreen: (fullscreen: boolean) => void
}

const MIN_ZOOM = 10
const MAX_ZOOM = 32
const ZOOM_STEP = 2
const MIN_SIDEBAR_WIDTH = 180
const MAX_SIDEBAR_WIDTH = 500
const MIN_AI_PANEL_WIDTH = 280
const MAX_AI_PANEL_WIDTH = 600
const DEFAULT_AI_PANEL_WIDTH = 360

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
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
      editorWidth: null,
      aiPanelWidth: DEFAULT_AI_PANEL_WIDTH,
      isFullscreen: false,

      toggleSidebar: () => set((s) => ({ sidebarVisible: !s.sidebarVisible })),
      setSidebarVisible: (visible) => set({ sidebarVisible: visible }),
      setSidebarWidth: (width) =>
        set({ sidebarWidth: Math.max(MIN_SIDEBAR_WIDTH, Math.min(MAX_SIDEBAR_WIDTH, width)) }),
      setAIPanelWidth: (width) =>
        set({ aiPanelWidth: Math.max(MIN_AI_PANEL_WIDTH, Math.min(MAX_AI_PANEL_WIDTH, width)) }),
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
      setEditorWidth: (width) => set({ editorWidth: width }),
      setIsFullscreen: (fullscreen) => set({ isFullscreen: fullscreen }),
    }),
    {
      name: 'md-mate-ui',
      partialize: (state) => ({
        sidebarVisible: state.sidebarVisible,
        sidebarWidth: state.sidebarWidth,
        activeSidebarPanel: state.activeSidebarPanel,
        viewMode: state.viewMode,
        zoomLevel: state.zoomLevel,
        editorWidth: state.editorWidth,
        aiPanelWidth: state.aiPanelWidth,
      }),
    }
  )
)
