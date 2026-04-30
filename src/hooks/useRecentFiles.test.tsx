import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useRecentFiles } from './useRecentFiles'

describe('useRecentFiles', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('should initialize with empty recent files', () => {
    const { result } = renderHook(() => useRecentFiles())

    expect(result.current.recentFiles).toEqual([])
  })

  it('should add a recent file', () => {
    const { result } = renderHook(() => useRecentFiles())

    act(() => {
      result.current.addRecentFile('/path/to/file.md', 'file')
    })

    expect(result.current.recentFiles).toHaveLength(1)
    expect(result.current.recentFiles[0]).toMatchObject({
      path: '/path/to/file.md',
      name: 'file.md',
      type: 'file',
    })
  })

  it('should add a recent folder', () => {
    const { result } = renderHook(() => useRecentFiles())

    act(() => {
      result.current.addRecentFile('/path/to/folder', 'folder')
    })

    expect(result.current.recentFiles).toHaveLength(1)
    expect(result.current.recentFiles[0]).toMatchObject({
      path: '/path/to/folder',
      name: 'folder',
      type: 'folder',
    })
  })

  it('should add most recent file at the beginning', () => {
    const { result } = renderHook(() => useRecentFiles())

    act(() => {
      result.current.addRecentFile('/path/to/file1.md', 'file')
      result.current.addRecentFile('/path/to/file2.md', 'file')
    })

    expect(result.current.recentFiles).toHaveLength(2)
    expect(result.current.recentFiles[0].path).toBe('/path/to/file2.md')
    expect(result.current.recentFiles[1].path).toBe('/path/to/file1.md')
  })

  it('should move existing file to the beginning when re-added', () => {
    const { result } = renderHook(() => useRecentFiles())

    act(() => {
      result.current.addRecentFile('/path/to/file1.md', 'file')
      result.current.addRecentFile('/path/to/file2.md', 'file')
      result.current.addRecentFile('/path/to/file1.md', 'file')
    })

    expect(result.current.recentFiles).toHaveLength(2)
    expect(result.current.recentFiles[0].path).toBe('/path/to/file1.md')
    expect(result.current.recentFiles[1].path).toBe('/path/to/file2.md')
  })

  it('should limit recent files to 10 items', () => {
    const { result } = renderHook(() => useRecentFiles())

    act(() => {
      for (let i = 0; i < 15; i++) {
        result.current.addRecentFile(`/path/to/file${i}.md`, 'file')
      }
    })

    expect(result.current.recentFiles).toHaveLength(10)
    // Most recent should be file14
    expect(result.current.recentFiles[0].name).toBe('file14.md')
    // Oldest should be file5 (files 0-4 should be removed)
    expect(result.current.recentFiles[9].name).toBe('file5.md')
  })

  it('should remove a recent file', () => {
    const { result } = renderHook(() => useRecentFiles())

    act(() => {
      result.current.addRecentFile('/path/to/file1.md', 'file')
      result.current.addRecentFile('/path/to/file2.md', 'file')
    })

    expect(result.current.recentFiles).toHaveLength(2)

    act(() => {
      result.current.removeRecentFile('/path/to/file1.md')
    })

    expect(result.current.recentFiles).toHaveLength(1)
    expect(result.current.recentFiles[0].path).toBe('/path/to/file2.md')
  })

  it('should clear all recent files', () => {
    const { result } = renderHook(() => useRecentFiles())

    act(() => {
      result.current.addRecentFile('/path/to/file1.md', 'file')
      result.current.addRecentFile('/path/to/file2.md', 'file')
    })

    expect(result.current.recentFiles).toHaveLength(2)

    act(() => {
      result.current.clearRecentFiles()
    })

    expect(result.current.recentFiles).toHaveLength(0)
  })

  it('should remove localStorage key when list becomes empty via removeRecentFile', async () => {
    const { result } = renderHook(() => useRecentFiles())

    act(() => {
      result.current.addRecentFile('/path/to/file.md', 'file')
    })

    await waitFor(() => {
      expect(localStorage.getItem('recent-documents')).toBeTruthy()
    })

    act(() => {
      result.current.removeRecentFile('/path/to/file.md')
    })

    await waitFor(() => {
      expect(localStorage.getItem('recent-documents')).toBeNull()
    })
  })

  it('should remove localStorage key when clearRecentFiles is called', async () => {
    const { result } = renderHook(() => useRecentFiles())

    act(() => {
      result.current.addRecentFile('/path/to/file1.md', 'file')
      result.current.addRecentFile('/path/to/file2.md', 'file')
    })

    await waitFor(() => {
      expect(localStorage.getItem('recent-documents')).toBeTruthy()
    })

    act(() => {
      result.current.clearRecentFiles()
    })

    expect(localStorage.getItem('recent-documents')).toBeNull()
  })

  it('should persist recent files to localStorage', async () => {
    const { result } = renderHook(() => useRecentFiles())

    act(() => {
      result.current.addRecentFile('/path/to/file.md', 'file')
    })

    // Wait for useEffect to run
    await waitFor(() => {
      const stored = localStorage.getItem('recent-documents')
      expect(stored).toBeTruthy()
    })

    const stored = localStorage.getItem('recent-documents')
    const parsed = JSON.parse(stored!)
    expect(parsed).toHaveLength(1)
    expect(parsed[0].path).toBe('/path/to/file.md')
  })

  it('should load recent files from localStorage on mount', async () => {
    const mockData = [
      {
        path: '/path/to/file.md',
        name: 'file.md',
        lastOpened: Date.now(),
        type: 'file',
      },
    ]

    localStorage.setItem('recent-documents', JSON.stringify(mockData))

    const { result } = renderHook(() => useRecentFiles())

    await waitFor(() => {
      expect(result.current.recentFiles).toHaveLength(1)
      expect(result.current.recentFiles[0].path).toBe('/path/to/file.md')
    })
  })

  it('should handle invalid localStorage data', () => {
    localStorage.setItem('recent-documents', 'invalid-json')

    const consoleError = vi.spyOn(console, 'error')
    consoleError.mockImplementation(() => {})

    const { result } = renderHook(() => useRecentFiles())

    expect(result.current.recentFiles).toEqual([])

    consoleError.mockRestore()
  })
})
