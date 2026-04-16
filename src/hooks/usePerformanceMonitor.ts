import { useEffect, useRef, useCallback } from 'react'
import { createLogger } from '../utils/logger'

const logger = createLogger('PerformanceMonitor')

/**
 * Performance metrics interface
 */
export interface PerformanceMetrics {
  componentName: string
  renderTime: number
  renderCount: number
  avgRenderTime: number
  maxRenderTime: number
  slowRenders: number
}

/**
 * Performance monitor options
 */
export interface PerformanceMonitorOptions {
  slowRenderThreshold?: number // ms, default 16ms (60fps)
  warnOnSlowRender?: boolean
  logRenders?: boolean
}

const DEFAULT_OPTIONS: Required<PerformanceMonitorOptions> = {
  slowRenderThreshold: 16,
  warnOnSlowRender: true,
  logRenders: false,
}

/**
 * Performance metrics store for development
 */
const metricsStore = new Map<string, PerformanceMetrics>()

/**
 * Get all performance metrics
 */
export function getAllPerformanceMetrics(): PerformanceMetrics[] {
  return Array.from(metricsStore.values())
}

/**
 * Clear all performance metrics
 */
export function clearAllPerformanceMetrics(): void {
  metricsStore.clear()
}

/**
 * Hook for monitoring component render performance
 */
export function usePerformanceMonitor(
  componentName: string,
  options: PerformanceMonitorOptions = {}
) {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  const renderStartTime = useRef<number>(0)
  const metricsRef = useRef<PerformanceMetrics>({
    componentName,
    renderTime: 0,
    renderCount: 0,
    avgRenderTime: 0,
    maxRenderTime: 0,
    slowRenders: 0,
  })

  // Track render start
  renderStartTime.current = performance.now()

  useEffect(() => {
    const renderEndTime = performance.now()
    const renderTime = renderEndTime - renderStartTime.current
    const metrics = metricsRef.current

    // Update metrics
    metrics.renderCount++
    metrics.renderTime = renderTime
    metrics.maxRenderTime = Math.max(metrics.maxRenderTime, renderTime)
    metrics.avgRenderTime = 
      (metrics.avgRenderTime * (metrics.renderCount - 1) + renderTime) / metrics.renderCount

    // Check for slow render
    if (renderTime > opts.slowRenderThreshold) {
      metrics.slowRenders++
      
      if (opts.warnOnSlowRender) {
        logger.warn(`Slow render detected`, {
          component: componentName,
          renderTime: `${renderTime.toFixed(2)}ms`,
          threshold: `${opts.slowRenderThreshold}ms`,
        })
      }
    }

    // Log render if enabled
    if (opts.logRenders) {
      logger.debug(`Render completed`, {
        component: componentName,
        renderTime: `${renderTime.toFixed(2)}ms`,
        renderCount: metrics.renderCount,
      })
    }

    // Store metrics
    metricsStore.set(componentName, metrics)
  })

  return {
    metrics: metricsRef.current,
    getMetrics: useCallback(() => metricsRef.current, []),
  }
}

/**
 * Hook for measuring function execution time
 */
export function usePerformanceTiming() {
  const measureSync = useCallback(<T,>(name: string, fn: () => T): T => {
    const start = performance.now()
    try {
      return fn()
    } finally {
      const duration = performance.now() - start
      logger.debug(`Timing: ${name}`, { duration: `${duration.toFixed(2)}ms` })
    }
  }, [])

  const measureAsync = useCallback(async <T,>(name: string, fn: () => Promise<T>): Promise<T> => {
    const start = performance.now()
    try {
      return await fn()
    } finally {
      const duration = performance.now() - start
      logger.debug(`Timing: ${name}`, { duration: `${duration.toFixed(2)}ms` })
    }
  }, [])

  return { measureSync, measureAsync }
}

/**
 * Hook for monitoring memory usage (development only)
 */
export function useMemoryMonitor(enabled = true) {
  useEffect(() => {
    if (!enabled || !import.meta.env.DEV) return

    const logMemory = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory
        logger.debug('Memory usage', {
          usedJSHeapSize: `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
          totalJSHeapSize: `${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
          jsHeapSizeLimit: `${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)}MB`,
        })
      }
    }

    // Log memory every 30 seconds
    const interval = setInterval(logMemory, 30000)
    logMemory() // Initial log

    return () => clearInterval(interval)
  }, [enabled])
}

/**
 * Measure component mount time
 */
export function useMountTiming(componentName: string) {
  const mountStartTime = useRef<number>(performance.now())

  useEffect(() => {
    const mountTime = performance.now() - mountStartTime.current
    logger.debug(`Component mounted`, {
      component: componentName,
      mountTime: `${mountTime.toFixed(2)}ms`,
    })
  }, [componentName])
}
