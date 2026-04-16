import { renderHook, act } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import { useFileSearch } from './useFileSearch'

// Mock Tauri invoke
vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(),
}))

import { invoke } from '@tauri-apps/api/core'
const mockInvoke = vi.mocked(invoke)

const mockResponse = {
  fileResults: [{ path: '/folder/readme.md', relativePath: 'readme.md', name: 'readme.md' }],
  textResults: [],
  truncated: false,
}

describe('useFileSearch', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    mockInvoke.mockResolvedValue(mockResponse)
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.clearAllMocks()
  })

  it('returns initial empty state', () => {
    const { result } = renderHook(() => useFileSearch('/folder'))
    expect(result.current.query).toBe('')
    expect(result.current.fileResults).toEqual([])
    expect(result.current.textResults).toEqual([])
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('debounces search by 300ms', async () => {
    const { result } = renderHook(() => useFileSearch('/folder'))

    act(() => {
      result.current.setQuery('read')
    })

    // Should not have called invoke yet (timer not fired)
    expect(mockInvoke).not.toHaveBeenCalled()

    // Advance timers and flush promises
    await act(async () => {
      vi.advanceTimersByTime(300)
      await Promise.resolve()
    })

    expect(mockInvoke).toHaveBeenCalledWith('search_in_files', {
      folderPath: '/folder',
      query: 'read',
      searchType: 'filename',
    })
  })

  it('sets loading state during search', async () => {
    let resolveSearch!: (v: unknown) => void
    mockInvoke.mockReturnValue(new Promise((res) => { resolveSearch = res }))

    const { result } = renderHook(() => useFileSearch('/folder'))

    act(() => {
      result.current.setQuery('test')
    })

    await act(async () => {
      vi.advanceTimersByTime(300)
      await Promise.resolve()
    })

    expect(result.current.isLoading).toBe(true)

    await act(async () => {
      resolveSearch(mockResponse)
      await Promise.resolve()
    })

    expect(result.current.isLoading).toBe(false)
  })

  it('maps results correctly', async () => {
    const { result } = renderHook(() => useFileSearch('/folder'))

    act(() => {
      result.current.setQuery('readme')
    })

    await act(async () => {
      vi.advanceTimersByTime(300)
      await Promise.resolve()
    })

    expect(result.current.fileResults).toEqual(mockResponse.fileResults)
  })

  it('handles error from invoke', async () => {
    mockInvoke.mockRejectedValue(new Error('Search failed'))

    const { result } = renderHook(() => useFileSearch('/folder'))

    act(() => {
      result.current.setQuery('test')
    })

    await act(async () => {
      vi.advanceTimersByTime(300)
      await Promise.resolve()
    })

    expect(result.current.error).toContain('Search failed')
    expect(result.current.fileResults).toEqual([])
  })

  it('does not search when folderPath is null', async () => {
    const { result } = renderHook(() => useFileSearch(null))

    act(() => {
      result.current.setQuery('test')
    })

    await act(async () => {
      vi.advanceTimersByTime(300)
      await Promise.resolve()
    })

    expect(mockInvoke).not.toHaveBeenCalled()
  })

  it('clears results when query is empty', async () => {
    mockInvoke.mockResolvedValue(mockResponse)
    const { result } = renderHook(() => useFileSearch('/folder'))

    // First search
    act(() => { result.current.setQuery('test') })
    await act(async () => {
      vi.advanceTimersByTime(300)
      await Promise.resolve()
    })
    expect(result.current.fileResults.length).toBeGreaterThan(0)

    // Clear query
    act(() => { result.current.setQuery('') })
    await act(async () => {
      vi.advanceTimersByTime(300)
      await Promise.resolve()
    })

    expect(result.current.fileResults).toEqual([])
  })
})
