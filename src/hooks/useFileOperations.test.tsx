import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import React from 'react'
import { useFileOperations } from './useFileOperations'
import { AppProvider } from '../context/AppContext'

// Mock Tauri dialog
vi.mock('@tauri-apps/plugin-dialog', () => ({
  open: vi.fn(),
  save: vi.fn(),
}))

// Mock tauriCommands
vi.mock('../tauriCommands', () => ({
  readFile: vi.fn(),
  saveFile: vi.fn(),
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

import { open, save } from '@tauri-apps/plugin-dialog'
import { readFile, saveFile } from '../tauriCommands'

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AppProvider>{children}</AppProvider>
)

describe('useFileOperations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('openFile', () => {
    it('opens a file and updates state', async () => {
      vi.mocked(open).mockResolvedValue('/test/file.md')
      vi.mocked(readFile).mockResolvedValue('# Test Content')

      const { result } = renderHook(() => useFileOperations(), { wrapper })

      let filePath: string | null = null
      await act(async () => {
        filePath = await result.current.openFile()
      })

      expect(open).toHaveBeenCalledWith({
        multiple: false,
        filters: [{ name: 'Markdown', extensions: ['md', 'markdown'] }]
      })
      expect(readFile).toHaveBeenCalledWith('/test/file.md')
      expect(filePath).toBe('/test/file.md')
    })

    it('returns null when no file selected', async () => {
      vi.mocked(open).mockResolvedValue(null)

      const { result } = renderHook(() => useFileOperations(), { wrapper })

      let filePath: string | null = null
      await act(async () => {
        filePath = await result.current.openFile()
      })

      expect(filePath).toBeNull()
      expect(readFile).not.toHaveBeenCalled()
    })

    it('returns null when selected is not a string', async () => {
      vi.mocked(open).mockResolvedValue({} as any)

      const { result } = renderHook(() => useFileOperations(), { wrapper })

      let filePath: string | null = null
      await act(async () => {
        filePath = await result.current.openFile()
      })

      expect(filePath).toBeNull()
    })

    it('throws error when open fails', async () => {
      const error = new Error('Open failed')
      vi.mocked(open).mockRejectedValue(error)

      const { result } = renderHook(() => useFileOperations(), { wrapper })

      await expect(async () => {
        await act(async () => {
          await result.current.openFile()
        })
      }).rejects.toThrow('Open failed')
    })

    it('throws error when readFile fails', async () => {
      vi.mocked(open).mockResolvedValue('/test/file.md')
      vi.mocked(readFile).mockRejectedValue(new Error('Read failed'))

      const { result } = renderHook(() => useFileOperations(), { wrapper })

      await expect(async () => {
        await act(async () => {
          await result.current.openFile()
        })
      }).rejects.toThrow('Read failed')
    })
  })

  describe('saveCurrentFile', () => {
    it('saves file when path exists', async () => {
      vi.mocked(saveFile).mockResolvedValue(undefined)

      const { result } = renderHook(() => useFileOperations(), { wrapper })

      // First open a file to set the path
      vi.mocked(open).mockResolvedValue('/test/file.md')
      vi.mocked(readFile).mockResolvedValue('# Test Content')
      
      await act(async () => {
        await result.current.openFile()
      })

      let saved: boolean | undefined
      await act(async () => {
        saved = await result.current.saveCurrentFile()
      })

      expect(saveFile).toHaveBeenCalled()
      expect(saved).toBe(true)
    })

    it('calls saveFileAs when no path exists', async () => {
      vi.mocked(save).mockResolvedValue('/new/file.md')
      vi.mocked(saveFile).mockResolvedValue(undefined)

      const { result } = renderHook(() => useFileOperations(), { wrapper })

      let saved: boolean | undefined
      await act(async () => {
        saved = await result.current.saveCurrentFile()
      })

      expect(save).toHaveBeenCalled()
    })

    it('throws error when save fails', async () => {
      vi.mocked(open).mockResolvedValue('/test/file.md')
      vi.mocked(readFile).mockResolvedValue('# Content')
      vi.mocked(saveFile).mockRejectedValue(new Error('Save failed'))

      const { result } = renderHook(() => useFileOperations(), { wrapper })

      await act(async () => {
        await result.current.openFile()
      })

      await expect(async () => {
        await act(async () => {
          await result.current.saveCurrentFile()
        })
      }).rejects.toThrow('Save failed')
    })
  })

  describe('saveFileAs', () => {
    it('saves file with new path', async () => {
      vi.mocked(save).mockResolvedValue('/new/path.md')
      vi.mocked(saveFile).mockResolvedValue(undefined)

      const { result } = renderHook(() => useFileOperations(), { wrapper })

      let saved: boolean | undefined
      await act(async () => {
        saved = await result.current.saveFileAs()
      })

      expect(save).toHaveBeenCalledWith({
        filters: [{ name: 'Markdown', extensions: ['md', 'markdown'] }]
      })
      expect(saveFile).toHaveBeenCalled()
      expect(saved).toBe(true)
    })

    it('returns false when no path selected', async () => {
      vi.mocked(save).mockResolvedValue(null)

      const { result } = renderHook(() => useFileOperations(), { wrapper })

      let saved: boolean | undefined
      await act(async () => {
        saved = await result.current.saveFileAs()
      })

      expect(saved).toBe(false)
    })

    it('returns false when path is not a string', async () => {
      vi.mocked(save).mockResolvedValue({} as any)

      const { result } = renderHook(() => useFileOperations(), { wrapper })

      let saved: boolean | undefined
      await act(async () => {
        saved = await result.current.saveFileAs()
      })

      expect(saved).toBe(false)
    })

    it('throws error when saveFileAs fails', async () => {
      vi.mocked(save).mockRejectedValue(new Error('Save as failed'))

      const { result } = renderHook(() => useFileOperations(), { wrapper })

      await expect(async () => {
        await act(async () => {
          await result.current.saveFileAs()
        })
      }).rejects.toThrow('Save as failed')
    })
  })

  describe('newFile', () => {
    it('creates a new file and clears state', async () => {
      const { result } = renderHook(() => useFileOperations(), { wrapper })

      // First open a file
      vi.mocked(open).mockResolvedValue('/test/file.md')
      vi.mocked(readFile).mockResolvedValue('# Test Content')
      
      await act(async () => {
        await result.current.openFile()
      })

      // Then create new file
      act(() => {
        result.current.newFile()
      })

      expect(result.current.currentFilePath).toBeNull()
      expect(result.current.isDirty).toBe(false)
    })
  })

  describe('state values', () => {
    it('returns isSaving state', () => {
      const { result } = renderHook(() => useFileOperations(), { wrapper })
      expect(result.current.isSaving).toBe(false)
    })

    it('returns hasUnsavedChanges as isDirty', () => {
      const { result } = renderHook(() => useFileOperations(), { wrapper })
      expect(result.current.hasUnsavedChanges).toBe(result.current.isDirty)
    })
  })
})
