import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useFolder, useSidebarState, usePaneState, useFileTree } from './useAppState'
import { AppProvider } from '../context/AppContext'
import React from 'react'

// Mock Tauri dialog
vi.mock('@tauri-apps/plugin-dialog', () => ({
  open: vi.fn(),
}))

// Mock Tauri invoke
vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(),
}))

// Mock logger
vi.mock('../utils/logger', () => ({
  createLogger: () => ({
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  }),
}))

import { open } from '@tauri-apps/plugin-dialog'
import { invoke } from '@tauri-apps/api/core'

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AppProvider>{children}</AppProvider>
)

describe('useAppState hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('useFolder', () => {
    it('returns folder path and tree', () => {
      const { result } = renderHook(() => useFolder(), { wrapper })
      
      expect(result.current.folderPath).toBeNull()
      expect(result.current.folderTree).toBeNull()
      expect(result.current.openFolder).toBeDefined()
      expect(result.current.closeFolder).toBeDefined()
    })

    it('opens folder and returns path', async () => {
      vi.mocked(open).mockResolvedValue('/test/folder')
      
      const { result } = renderHook(() => useFolder(), { wrapper })
      
      let path: string | null = null
      await act(async () => {
        path = await result.current.openFolder()
      })
      
      expect(open).toHaveBeenCalledWith({
        directory: true,
        multiple: false,
        title: 'Open Folder'
      })
      expect(path).toBe('/test/folder')
    })

    it('returns null when no folder selected', async () => {
      vi.mocked(open).mockResolvedValue(null)
      
      const { result } = renderHook(() => useFolder(), { wrapper })
      
      let path: string | null = null
      await act(async () => {
        path = await result.current.openFolder()
      })
      
      expect(path).toBeNull()
    })

    it('returns null when open fails', async () => {
      vi.mocked(open).mockRejectedValue(new Error('Dialog error'))
      
      const { result } = renderHook(() => useFolder(), { wrapper })
      
      let path: string | null = null
      await act(async () => {
        path = await result.current.openFolder()
      })
      
      expect(path).toBeNull()
    })

    it('closes folder', async () => {
      vi.mocked(open).mockResolvedValue('/test/folder')
      
      const { result } = renderHook(() => useFolder(), { wrapper })
      
      await act(async () => {
        await result.current.openFolder()
      })
      
      act(() => {
        result.current.closeFolder()
      })
      
      expect(result.current.folderPath).toBeNull()
    })
  })

  describe('useSidebarState', () => {
    it('returns sidebar collapsed state', () => {
      const { result } = renderHook(() => useSidebarState(), { wrapper })
      
      expect(typeof result.current.collapsed).toBe('boolean')
      expect(result.current.toggle).toBeDefined()
      expect(result.current.setCollapsed).toBeDefined()
    })

    it('toggles sidebar', () => {
      const { result } = renderHook(() => useSidebarState(), { wrapper })
      
      const initialState = result.current.collapsed
      
      act(() => {
        result.current.toggle()
      })
      
      expect(result.current.collapsed).toBe(!initialState)
    })

    it('sets collapsed state', () => {
      const { result } = renderHook(() => useSidebarState(), { wrapper })
      
      act(() => {
        result.current.setCollapsed(true)
      })
      
      expect(result.current.collapsed).toBe(true)
      
      act(() => {
        result.current.setCollapsed(false)
      })
      
      expect(result.current.collapsed).toBe(false)
    })
  })

  describe('usePaneState', () => {
    it('returns pane collapsed states', () => {
      const { result } = renderHook(() => usePaneState(), { wrapper })
      
      expect(typeof result.current.editorCollapsed).toBe('boolean')
      expect(typeof result.current.previewCollapsed).toBe('boolean')
      expect(result.current.toggleEditor).toBeDefined()
      expect(result.current.togglePreview).toBeDefined()
      expect(result.current.setEditorCollapsed).toBeDefined()
      expect(result.current.setPreviewCollapsed).toBeDefined()
    })

    it('toggles editor', () => {
      const { result } = renderHook(() => usePaneState(), { wrapper })
      
      const initialState = result.current.editorCollapsed
      
      act(() => {
        result.current.toggleEditor()
      })
      
      expect(result.current.editorCollapsed).toBe(!initialState)
    })

    it('toggles preview', () => {
      const { result } = renderHook(() => usePaneState(), { wrapper })
      
      const initialState = result.current.previewCollapsed
      
      act(() => {
        result.current.togglePreview()
      })
      
      expect(result.current.previewCollapsed).toBe(!initialState)
    })

    it('sets editor collapsed state', () => {
      const { result } = renderHook(() => usePaneState(), { wrapper })
      
      act(() => {
        result.current.setEditorCollapsed(true)
      })
      
      expect(result.current.editorCollapsed).toBe(true)
    })

    it('sets preview collapsed state', () => {
      const { result } = renderHook(() => usePaneState(), { wrapper })
      
      act(() => {
        result.current.setPreviewCollapsed(true)
      })
      
      expect(result.current.previewCollapsed).toBe(true)
    })
  })

  describe('useFileTree', () => {
    it('returns tree state', () => {
      const { result } = renderHook(() => useFileTree(), { wrapper })
      
      expect(result.current.tree).toBeNull()
      expect(result.current.expandedDirs).toBeInstanceOf(Set)
      expect(result.current.loadDirectory).toBeDefined()
      expect(result.current.toggleDirectory).toBeDefined()
      expect(result.current.isExpanded).toBeDefined()
    })

    it('loads directory contents', async () => {
      const mockNodes = [
        { name: 'file.md', path: '/test/file.md', type: 'file' as const, extension: '.md' }
      ]
      vi.mocked(invoke).mockResolvedValue(mockNodes)
      
      const { result } = renderHook(() => useFileTree(), { wrapper })
      
      let nodes: typeof mockNodes = []
      await act(async () => {
        nodes = await result.current.loadDirectory('/test')
      })
      
      expect(invoke).toHaveBeenCalledWith('read_directory', { path: '/test' })
      expect(nodes).toEqual(mockNodes)
    })

    it('returns empty array on load error', async () => {
      vi.mocked(invoke).mockRejectedValue(new Error('Load error'))
      
      const { result } = renderHook(() => useFileTree(), { wrapper })
      
      let nodes = []
      await act(async () => {
        nodes = await result.current.loadDirectory('/test')
      })
      
      expect(nodes).toEqual([])
    })

    it('toggles directory expansion', () => {
      const { result } = renderHook(() => useFileTree(), { wrapper })
      
      expect(result.current.isExpanded('/test')).toBe(false)
      
      act(() => {
        result.current.toggleDirectory('/test')
      })
      
      expect(result.current.isExpanded('/test')).toBe(true)
      
      act(() => {
        result.current.toggleDirectory('/test')
      })
      
      expect(result.current.isExpanded('/test')).toBe(false)
    })
  })
})

// ─── useFileTree mutation helpers ────────────────────────────────────────────

// Mock tauriCommands for mutation helpers
vi.mock('../tauriCommands', () => ({
  createFile: vi.fn().mockResolvedValue(undefined),
  createDirectory: vi.fn().mockResolvedValue(undefined),
  renamePath: vi.fn().mockResolvedValue(undefined),
  deletePath: vi.fn().mockResolvedValue(undefined),
  readFile: vi.fn().mockResolvedValue(''),
}))

import {
  createFile as tauriCreateFile,
  createDirectory as tauriCreateDirectory,
  renamePath as tauriRenamePath,
  deletePath as tauriDeletePath,
} from '../tauriCommands'

describe('useFileTree mutation helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(invoke as ReturnType<typeof vi.fn>).mockResolvedValue([])
  })

  it('createFile calls tauriCreateFile with correct path', async () => {
    const { result } = renderHook(() => useFileTree(), { wrapper })
    await act(async () => {
      await result.current.createFile('/folder', 'new.md')
    })
    expect(tauriCreateFile).toHaveBeenCalledWith('/folder/new.md')
  })

  it('createDirectory calls tauriCreateDirectory with correct path', async () => {
    const { result } = renderHook(() => useFileTree(), { wrapper })
    await act(async () => {
      await result.current.createDirectory('/folder', 'subdir')
    })
    expect(tauriCreateDirectory).toHaveBeenCalledWith('/folder/subdir')
  })

  it('renamePath calls tauriRenamePath with old and new paths', async () => {
    const { result } = renderHook(() => useFileTree(), { wrapper })
    await act(async () => {
      await result.current.renamePath('/folder/old.md', '/folder/new.md')
    })
    expect(tauriRenamePath).toHaveBeenCalledWith('/folder/old.md', '/folder/new.md')
  })

  it('deletePath calls tauriDeletePath with path', async () => {
    const { result } = renderHook(() => useFileTree(), { wrapper })
    await act(async () => {
      await result.current.deletePath('/folder/file.md')
    })
    expect(tauriDeletePath).toHaveBeenCalledWith('/folder/file.md')
  })
})

