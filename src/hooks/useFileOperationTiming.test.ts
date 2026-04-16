import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import {
  useFileOperationTiming,
  getAllTimingResults,
  clearTimingResults,
  getAverageTiming,
  getSlowOperations,
} from './useFileOperationTiming'

// Mock logger
vi.mock('../utils/logger', () => ({
  createLogger: () => ({
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  }),
}))

describe('useFileOperationTiming', () => {
  beforeEach(() => {
    clearTimingResults()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('measureSync', () => {
    it('measures sync operation timing', () => {
      const { result } = renderHook(() => useFileOperationTiming())

      const value = result.current.measureSync('testOp', () => 'result')

      expect(value).toBe('result')
      expect(getAllTimingResults().length).toBe(1)
      expect(getAllTimingResults()[0].operation).toBe('testOp')
      expect(getAllTimingResults()[0].success).toBe(true)
    })

    it('captures errors in sync operations', () => {
      const { result } = renderHook(() => useFileOperationTiming())

      expect(() => {
        result.current.measureSync('failingOp', () => {
          throw new Error('Test error')
        })
      }).toThrow('Test error')

      const results = getAllTimingResults()
      expect(results.length).toBe(1)
      expect(results[0].success).toBe(false)
      expect(results[0].error).toBe('Test error')
    })
  })

  describe('measureAsync', () => {
    it('measures async operation timing', async () => {
      const { result } = renderHook(() => useFileOperationTiming())

      const value = await result.current.measureAsync('asyncOp', async () => {
        await new Promise(resolve => setTimeout(resolve, 10))
        return 'async-result'
      })

      expect(value).toBe('async-result')
      expect(getAllTimingResults().length).toBe(1)
      expect(getAllTimingResults()[0].success).toBe(true)
    })

    it('captures errors in async operations', async () => {
      const { result } = renderHook(() => useFileOperationTiming())

      await expect(async () => {
        await result.current.measureAsync('failingAsync', async () => {
          throw new Error('Async error')
        })
      }).rejects.toThrow('Async error')

      const results = getAllTimingResults()
      expect(results.length).toBe(1)
      expect(results[0].success).toBe(false)
    })
  })

  describe('slow operation detection', () => {
    it('detects slow operations', async () => {
      const onSlowOperation = vi.fn()
      const { result } = renderHook(() =>
        useFileOperationTiming({ default: 5 }, onSlowOperation)
      )

      await result.current.measureAsync('slowOp', async () => {
        await new Promise(resolve => setTimeout(resolve, 20))
      })

      expect(onSlowOperation).toHaveBeenCalled()
      const slowOps = getSlowOperations({ default: 5 })
      expect(slowOps.length).toBe(1)
    })

    it('does not flag fast operations as slow', () => {
      const onSlowOperation = vi.fn()
      const { result } = renderHook(() =>
        useFileOperationTiming({ default: 1000 }, onSlowOperation)
      )

      result.current.measureSync('fastOp', () => 'result')

      expect(onSlowOperation).not.toHaveBeenCalled()
    })
  })

  describe('createTimedOperation', () => {
    it('wraps async function with timing', async () => {
      const { result } = renderHook(() => useFileOperationTiming())

      const originalFn = async (x: number) => x * 2
      const timedFn = result.current.createTimedOperation('multiply', originalFn)

      const value = await timedFn(5)

      expect(value).toBe(10)
      expect(getAllTimingResults().length).toBe(1)
      expect(getAllTimingResults()[0].operation).toBe('multiply')
    })
  })

  describe('getStats', () => {
    it('returns operation statistics', async () => {
      const { result } = renderHook(() => useFileOperationTiming())

      await result.current.measureAsync('readFile', async () => 'content')
      await result.current.measureAsync('readFile', async () => 'content2')

      const stats = result.current.getStats()

      expect(stats.totalOperations).toBe(2)
      expect(stats.successfulOperations).toBe(2)
      expect(stats.failedOperations).toBe(0)
      expect(stats.averageTimings.readFile).toBeGreaterThan(0)
    })
  })
})

describe('global timing functions', () => {
  beforeEach(() => {
    clearTimingResults()
  })

  it('getAllTimingResults returns copy of results', () => {
    const { result } = renderHook(() => useFileOperationTiming())

    result.current.measureSync('test', () => 'result')
    const results1 = getAllTimingResults()
    const results2 = getAllTimingResults()

    expect(results1).not.toBe(results2) // Different array references
    expect(results1).toEqual(results2) // Same content
  })

  it('clearTimingResults clears all results', () => {
    const { result } = renderHook(() => useFileOperationTiming())

    result.current.measureSync('test', () => 'result')
    expect(getAllTimingResults().length).toBe(1)

    clearTimingResults()
    expect(getAllTimingResults().length).toBe(0)
  })

  it('getAverageTiming returns 0 for no operations', () => {
    expect(getAverageTiming('nonexistent')).toBe(0)
  })

  it('getAverageTiming calculates correct average', () => {
    const { result } = renderHook(() => useFileOperationTiming())

    // Multiple operations will have different timings
    result.current.measureSync('test', () => {})
    result.current.measureSync('test', () => {})

    const avg = getAverageTiming('test')
    expect(avg).toBeGreaterThanOrEqual(0)
  })

  it('getSlowOperations filters by threshold', () => {
    const { result } = renderHook(() =>
      useFileOperationTiming({ default: 0 }) // Everything is slow
    )

    result.current.measureSync('fast', () => {})
    result.current.measureSync('slow', () => {})

    const slowOps = getSlowOperations({ default: 0 })
    expect(slowOps.length).toBe(2)
  })
})
