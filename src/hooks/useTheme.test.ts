import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTheme } from './useTheme'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value }),
    removeItem: vi.fn((key: string) => { delete store[key] }),
    clear: vi.fn(() => { store = {} }),
  }
})()

Object.defineProperty(window, 'localStorage', { value: localStorageMock })

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  value: vi.fn((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

describe('useTheme', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.clear()
    // Reset document classes
    document.documentElement.classList.remove('light', 'dark')
  })

  it('returns default theme', () => {
    const { result } = renderHook(() => useTheme())
    expect(result.current.theme).toBeTruthy()
  })

  it('toggles theme', () => {
    const { result } = renderHook(() => useTheme())
    
    const initialTheme = result.current.theme
    
    act(() => {
      result.current.toggleTheme()
    })
    
    expect(result.current.theme).toBe(initialTheme === 'light' ? 'dark' : 'light')
  })

  it('toggles from light to dark', () => {
    localStorageMock.getItem.mockReturnValue('light')
    
    const { result } = renderHook(() => useTheme())
    
    act(() => {
      result.current.toggleTheme()
    })
    
    expect(result.current.theme).toBe('dark')
  })

  it('toggles from dark to light', () => {
    localStorageMock.getItem.mockReturnValue('dark')
    
    const { result } = renderHook(() => useTheme())
    
    act(() => {
      result.current.toggleTheme()
    })
    
    expect(result.current.theme).toBe('light')
  })

  it('persists theme to localStorage', () => {
    localStorageMock.getItem.mockReturnValue('light')
    
    const { result } = renderHook(() => useTheme())
    
    act(() => {
      result.current.toggleTheme()
    })
    
    // localStorage.setItem should be called
    expect(localStorageMock.setItem).toHaveBeenCalled()
  })

  it('loads theme from localStorage', () => {
    localStorageMock.getItem.mockReturnValue('dark')
    
    const { result } = renderHook(() => useTheme())
    
    expect(result.current.theme).toBe('dark')
  })
})
