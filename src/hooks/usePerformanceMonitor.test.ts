import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'

// Mock logger
vi.mock('../utils/logger', () => ({
  createLogger: () => ({
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  }),
}))

// Mock performance.now
const originalPerformanceNow = performance.now
let mockTime = 0

beforeEach(() => {
  mockTime = 0
  performance.now = vi.fn(() => mockTime)
})

afterEach(() => {
  performance.now = originalPerformanceNow
  vi.clearAllMocks()
})

describe('usePerformanceMonitor', () => {
  it('initializes metrics correctly', async () => {
    const { usePerformanceMonitor, getAllPerformanceMetrics, clearAllPerformanceMetrics } = 
      await import('./usePerformanceMonitor')
    
    clearAllPerformanceMetrics()
    
    const { result } = renderHook(() => usePerformanceMonitor('TestComponent'))
    
    expect(result.current.metrics.componentName).toBe('TestComponent')
    expect(typeof result.current.getMetrics).toBe('function')
  })

  it('stores metrics in global store', async () => {
    const { usePerformanceMonitor, getAllPerformanceMetrics, clearAllPerformanceMetrics } = 
      await import('./usePerformanceMonitor')
    
    clearAllPerformanceMetrics()
    renderHook(() => usePerformanceMonitor('StoredComponent'))
    
    const metrics = getAllPerformanceMetrics()
    expect(metrics.some(m => m.componentName === 'StoredComponent')).toBe(true)
  })

  it('returns getMetrics function', async () => {
    const { usePerformanceMonitor, clearAllPerformanceMetrics } = 
      await import('./usePerformanceMonitor')
    
    clearAllPerformanceMetrics()
    const { result } = renderHook(() => usePerformanceMonitor('TestComponent'))
    
    expect(typeof result.current.getMetrics).toBe('function')
    expect(result.current.getMetrics().componentName).toBe('TestComponent')
  })
})

describe('usePerformanceTiming', () => {
  it('provides timing functions', async () => {
    const { usePerformanceTiming } = await import('./usePerformanceMonitor')
    
    const { result } = renderHook(() => usePerformanceTiming())
    
    expect(typeof result.current.measureSync).toBe('function')
    expect(typeof result.current.measureAsync).toBe('function')
  })

  it('measures sync function and returns result', async () => {
    const { usePerformanceTiming } = await import('./usePerformanceMonitor')
    
    const { result } = renderHook(() => usePerformanceTiming())
    
    const returnValue = result.current.measureSync('test-operation', () => 'result')
    expect(returnValue).toBe('result')
  })

  it('measures async function and returns result', async () => {
    const { usePerformanceTiming } = await import('./usePerformanceMonitor')
    
    const { result } = renderHook(() => usePerformanceTiming())
    
    const returnValue = await result.current.measureAsync('test-async', async () => 'async-result')
    expect(returnValue).toBe('async-result')
  })
})

describe('useMemoryMonitor', () => {
  it('does not throw when disabled', async () => {
    const { useMemoryMonitor } = await import('./usePerformanceMonitor')
    
    expect(() => {
      renderHook(() => useMemoryMonitor(false))
    }).not.toThrow()
  })
})

describe('useMountTiming', () => {
  it('does not throw on mount', async () => {
    const { useMountTiming } = await import('./usePerformanceMonitor')
    
    expect(() => {
      renderHook(() => useMountTiming('MountTestComponent'))
    }).not.toThrow()
  })
})

describe('global metrics functions', () => {
  it('getAllPerformanceMetrics returns array', async () => {
    const { getAllPerformanceMetrics, clearAllPerformanceMetrics } = 
      await import('./usePerformanceMonitor')
    
    clearAllPerformanceMetrics()
    const metrics = getAllPerformanceMetrics()
    expect(Array.isArray(metrics)).toBe(true)
  })

  it('clearAllPerformanceMetrics clears all metrics', async () => {
    const { usePerformanceMonitor, getAllPerformanceMetrics, clearAllPerformanceMetrics } = 
      await import('./usePerformanceMonitor')
    
    clearAllPerformanceMetrics()
    renderHook(() => usePerformanceMonitor('ClearTest'))
    
    expect(getAllPerformanceMetrics().length).toBeGreaterThan(0)
    
    clearAllPerformanceMetrics()
    
    expect(getAllPerformanceMetrics().length).toBe(0)
  })
})
