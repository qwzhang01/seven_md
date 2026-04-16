import { useCallback, useRef } from 'react'
import { createLogger } from '../utils/logger'

const logger = createLogger('FileOperationTiming')

/**
 * Performance timing result
 */
export interface TimingResult {
  operation: string
  duration: number
  success: boolean
  error?: string
  timestamp: number
}

/**
 * Performance threshold configuration
 */
export interface PerformanceThresholds {
  readFile?: number // ms
  writeFile?: number // ms
  readDirectory?: number // ms
  default?: number // ms
}

const DEFAULT_THRESHOLDS: PerformanceThresholds = {
  readFile: 100,
  writeFile: 100,
  readDirectory: 200,
  default: 100,
}

/**
 * Global timing store for aggregation
 */
const timingStore: TimingResult[] = []

/**
 * Get all timing results
 */
export function getAllTimingResults(): TimingResult[] {
  return [...timingStore]
}

/**
 * Clear all timing results
 */
export function clearTimingResults(): void {
  timingStore.length = 0
}

/**
 * Get average timing for an operation
 */
export function getAverageTiming(operation: string): number {
  const results = timingStore.filter(r => r.operation === operation && r.success)
  if (results.length === 0) return 0
  return results.reduce((sum, r) => sum + r.duration, 0) / results.length
}

/**
 * Get slow operations
 */
export function getSlowOperations(
  thresholds: PerformanceThresholds = DEFAULT_THRESHOLDS
): TimingResult[] {
  return timingStore.filter(r => {
    const threshold = thresholds[r.operation as keyof PerformanceThresholds] ?? thresholds.default ?? 100
    return r.duration > threshold
  })
}

/**
 * Hook for measuring file operation performance
 */
export function useFileOperationTiming(
  thresholds: PerformanceThresholds = DEFAULT_THRESHOLDS,
  onSlowOperation?: (result: TimingResult) => void
) {
  const thresholdsRef = useRef(thresholds)
  thresholdsRef.current = thresholds

  /**
   * Measure a sync operation
   */
  const measureSync = useCallback(
    <T>(operation: string, fn: () => T): T => {
      const startTime = performance.now()
      let result: TimingResult

      try {
        const value = fn()
        const duration = performance.now() - startTime

        result = {
          operation,
          duration,
          success: true,
          timestamp: Date.now(),
        }

        logger.debug(`${operation} completed`, { duration: `${duration.toFixed(2)}ms` })
        return value
      } catch (error: any) {
        const duration = performance.now() - startTime

        result = {
          operation,
          duration,
          success: false,
          error: error.message,
          timestamp: Date.now(),
        }

        logger.error(`${operation} failed`, { duration: `${duration.toFixed(2)}ms`, error: error.message })
        throw error
      } finally {
        timingStore.push(result)

        const threshold =
          thresholdsRef.current[operation as keyof PerformanceThresholds] ??
          thresholdsRef.current.default ??
          100

        if (result.duration > threshold && onSlowOperation) {
          onSlowOperation(result)
        }

        if (result.duration > threshold) {
          logger.warn(`Slow operation detected: ${operation}`, {
            duration: `${result.duration.toFixed(2)}ms`,
            threshold: `${threshold}ms`,
          })
        }
      }
    },
    [onSlowOperation]
  )

  /**
   * Measure an async operation
   */
  const measureAsync = useCallback(
    async <T>(operation: string, fn: () => Promise<T>): Promise<T> => {
      const startTime = performance.now()
      let result: TimingResult

      try {
        const value = await fn()
        const duration = performance.now() - startTime

        result = {
          operation,
          duration,
          success: true,
          timestamp: Date.now(),
        }

        logger.debug(`${operation} completed`, { duration: `${duration.toFixed(2)}ms` })
        return value
      } catch (error: any) {
        const duration = performance.now() - startTime

        result = {
          operation,
          duration,
          success: false,
          error: error.message,
          timestamp: Date.now(),
        }

        logger.error(`${operation} failed`, { duration: `${duration.toFixed(2)}ms`, error: error.message })
        throw error
      } finally {
        timingStore.push(result)

        const threshold =
          thresholdsRef.current[operation as keyof PerformanceThresholds] ??
          thresholdsRef.current.default ??
          100

        if (result.duration > threshold && onSlowOperation) {
          onSlowOperation(result)
        }

        if (result.duration > threshold) {
          logger.warn(`Slow operation detected: ${operation}`, {
            duration: `${result.duration.toFixed(2)}ms`,
            threshold: `${threshold}ms`,
          })
        }
      }
    },
    [onSlowOperation]
  )

  /**
   * Create a timed version of a file operation function
   */
  const createTimedOperation = useCallback(
    <TArgs extends any[], TReturn>(
      operation: string,
      fn: (...args: TArgs) => Promise<TReturn>
    ): ((...args: TArgs) => Promise<TReturn>) => {
      return async (...args: TArgs) => {
        return measureAsync(operation, () => fn(...args))
      }
    },
    [measureAsync]
  )

  return {
    measureSync,
    measureAsync,
    createTimedOperation,
    getStats: () => ({
      totalOperations: timingStore.length,
      successfulOperations: timingStore.filter(r => r.success).length,
      failedOperations: timingStore.filter(r => !r.success).length,
      averageTimings: {
        readFile: getAverageTiming('readFile'),
        writeFile: getAverageTiming('writeFile'),
        readDirectory: getAverageTiming('readDirectory'),
      },
      slowOperations: getSlowOperations(thresholdsRef.current),
    }),
  }
}
