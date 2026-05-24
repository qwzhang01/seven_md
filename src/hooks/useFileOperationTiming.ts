import { useCallback } from 'react'
import { createLogger } from '../utils/logger'

const logger = createLogger('useFileOperationTiming')

// ── Types ─────────────────────────────────────────────────────────────────────

export interface TimingResult {
  operation: string
  duration: number
  success: boolean
  error?: string
  timestamp: number
}

export type ThresholdMap = Record<string, number> & { default?: number }

// ── Global timing store ───────────────────────────────────────────────────────

const timingResults: TimingResult[] = []

export function getAllTimingResults(): TimingResult[] {
  return [...timingResults]
}

export function clearTimingResults(): void {
  timingResults.length = 0
}

export function getAverageTiming(operation: string): number {
  const ops = timingResults.filter((r) => r.operation === operation)
  if (ops.length === 0) return 0
  return ops.reduce((sum, r) => sum + r.duration, 0) / ops.length
}

export function getSlowOperations(thresholds: ThresholdMap): TimingResult[] {
  return timingResults.filter((r) => {
    const threshold = thresholds[r.operation] ?? thresholds.default ?? Infinity
    return r.duration > threshold
  })
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useFileOperationTiming(
  thresholds: ThresholdMap = {},
  onSlowOperation?: (result: TimingResult) => void
) {
  const recordResult = useCallback(
    (result: TimingResult) => {
      timingResults.push(result)
      const threshold = thresholds[result.operation] ?? thresholds.default ?? Infinity
      if (result.duration > threshold) {
        logger.warn('Slow operation detected', {
          operation: result.operation,
          duration: result.duration,
          threshold,
        })
        onSlowOperation?.(result)
      }
    },
    [thresholds, onSlowOperation]
  )

  // ── measureSync ─────────────────────────────────────────────────────────────

  const measureSync = useCallback(
    <T>(operation: string, fn: () => T): T => {
      const start = performance.now()
      try {
        const value = fn()
        const duration = performance.now() - start
        recordResult({ operation, duration, success: true, timestamp: Date.now() })
        return value
      } catch (error) {
        const duration = performance.now() - start
        const message = error instanceof Error ? error.message : String(error)
        recordResult({ operation, duration, success: false, error: message, timestamp: Date.now() })
        throw error
      }
    },
    [recordResult]
  )

  // ── measureAsync ────────────────────────────────────────────────────────────

  const measureAsync = useCallback(
    async <T>(operation: string, fn: () => Promise<T>): Promise<T> => {
      const start = performance.now()
      try {
        const value = await fn()
        const duration = performance.now() - start
        recordResult({ operation, duration, success: true, timestamp: Date.now() })
        return value
      } catch (error) {
        const duration = performance.now() - start
        const message = error instanceof Error ? error.message : String(error)
        recordResult({ operation, duration, success: false, error: message, timestamp: Date.now() })
        throw error
      }
    },
    [recordResult]
  )

  // ── createTimedOperation ────────────────────────────────────────────────────

  const createTimedOperation = useCallback(
    <TArgs extends unknown[], TReturn>(
      operation: string,
      fn: (...args: TArgs) => Promise<TReturn>
    ) => {
      return (...args: TArgs): Promise<TReturn> => {
        return measureAsync(operation, () => fn(...args))
      }
    },
    [measureAsync]
  )

  // ── getStats ────────────────────────────────────────────────────────────────

  const getStats = useCallback(() => {
    const results = getAllTimingResults()
    const totalOperations = results.length
    const successfulOperations = results.filter((r) => r.success).length
    const failedOperations = results.filter((r) => !r.success).length

    // Group by operation name and compute averages
    const operationGroups: Record<string, number[]> = {}
    results.forEach((r) => {
      if (!operationGroups[r.operation]) {
        operationGroups[r.operation] = []
      }
      operationGroups[r.operation].push(r.duration)
    })

    const averageTimings: Record<string, number> = {}
    Object.entries(operationGroups).forEach(([op, durations]) => {
      averageTimings[op] = durations.reduce((sum, d) => sum + d, 0) / durations.length
    })

    return {
      totalOperations,
      successfulOperations,
      failedOperations,
      averageTimings,
    }
  }, [])

  return {
    measureSync,
    measureAsync,
    createTimedOperation,
    getStats,
  }
}
