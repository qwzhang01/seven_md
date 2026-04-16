import { createLogger } from '../utils/logger'

const logger = createLogger('MemoryMonitor')

/**
 * Memory usage information
 */
export interface MemoryInfo {
  usedJSHeapSize: number
  totalJSHeapSize: number
  jsHeapSizeLimit: number
  timestamp: number
}

/**
 * Memory threshold configuration
 */
export interface MemoryThresholds {
  warningMB?: number // Warning threshold in MB
  criticalMB?: number // Critical threshold in MB
  growthRateMBPerMin?: number // Growth rate warning
}

const DEFAULT_THRESHOLDS: MemoryThresholds = {
  warningMB: 100,
  criticalMB: 200,
  growthRateMBPerMin: 10,
}

/**
 * Memory history store
 */
const memoryHistory: MemoryInfo[] = []
const MAX_HISTORY_LENGTH = 60 // Keep 60 samples (1 minute at 1 second intervals)

/**
 * Check if memory API is available
 */
export function isMemoryApiAvailable(): boolean {
  return typeof (performance as any).memory !== 'undefined'
}

/**
 * Get current memory usage
 */
export function getMemoryUsage(): MemoryInfo | null {
  if (!isMemoryApiAvailable()) {
    return null
  }

  const memory = (performance as any).memory
  return {
    usedJSHeapSize: memory.usedJSHeapSize,
    totalJSHeapSize: memory.totalJSHeapSize,
    jsHeapSizeLimit: memory.jsHeapSizeLimit,
    timestamp: Date.now(),
  }
}

/**
 * Get memory history
 */
export function getMemoryHistory(): MemoryInfo[] {
  return [...memoryHistory]
}

/**
 * Clear memory history
 */
export function clearMemoryHistory(): void {
  memoryHistory.length = 0
}

/**
 * Calculate memory growth rate (MB per minute)
 */
export function calculateGrowthRate(): number {
  if (memoryHistory.length < 2) return 0

  const oldest = memoryHistory[0]
  const newest = memoryHistory[memoryHistory.length - 1]
  const timeDiffMinutes = (newest.timestamp - oldest.timestamp) / 60000

  if (timeDiffMinutes === 0) return 0

  const usedDiffMB =
    (newest.usedJSHeapSize - oldest.usedJSHeapSize) / (1024 * 1024)
  return usedDiffMB / timeDiffMinutes
}

/**
 * Format bytes to MB
 */
export function formatMemoryMB(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

/**
 * Memory monitor class for tracking memory over time
 */
export class MemoryMonitor {
  private intervalId: number | null = null
  private thresholds: MemoryThresholds
  private onWarning?: (info: MemoryInfo, message: string) => void
  private onCritical?: (info: MemoryInfo, message: string) => void
  private onGrowthWarning?: (rate: number) => void

  constructor(
    thresholds: MemoryThresholds = DEFAULT_THRESHOLDS,
    callbacks?: {
      onWarning?: (info: MemoryInfo, message: string) => void
      onCritical?: (info: MemoryInfo, message: string) => void
      onGrowthWarning?: (rate: number) => void
    }
  ) {
    this.thresholds = { ...DEFAULT_THRESHOLDS, ...thresholds }
    this.onWarning = callbacks?.onWarning
    this.onCritical = callbacks?.onCritical
    this.onGrowthWarning = callbacks?.onGrowthWarning
  }

  /**
   * Start monitoring
   */
  start(intervalMs: number = 1000): void {
    if (!isMemoryApiAvailable()) {
      logger.debug('Memory API not available, monitoring disabled')
      return
    }

    if (this.intervalId !== null) {
      logger.warn('Memory monitor already running')
      return
    }

    logger.info('Starting memory monitor', { interval: `${intervalMs}ms` })

    this.intervalId = window.setInterval(() => {
      this.check()
    }, intervalMs)

    // Initial check
    this.check()
  }

  /**
   * Stop monitoring
   */
  stop(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId)
      this.intervalId = null
      logger.info('Memory monitor stopped')
    }
  }

  /**
   * Check memory usage
   */
  private check(): void {
    const info = getMemoryUsage()
    if (!info) return

    // Add to history
    memoryHistory.push(info)
    if (memoryHistory.length > MAX_HISTORY_LENGTH) {
      memoryHistory.shift()
    }

    // Check thresholds
    const usedMB = info.usedJSHeapSize / (1024 * 1024)
    const criticalMB = this.thresholds.criticalMB ?? 200
    const warningMB = this.thresholds.warningMB ?? 100

    if (usedMB > criticalMB) {
      const message = `Critical memory usage: ${formatMemoryMB(info.usedJSHeapSize)}`
      logger.error(message)
      this.onCritical?.(info, message)
    } else if (usedMB > warningMB) {
      const message = `High memory usage: ${formatMemoryMB(info.usedJSHeapSize)}`
      logger.warn(message)
      this.onWarning?.(info, message)
    }

    // Check growth rate
    const growthRate = calculateGrowthRate()
    const growthThreshold = this.thresholds.growthRateMBPerMin ?? 10

    if (growthRate > growthThreshold) {
      logger.warn('High memory growth rate detected', {
        rate: `${growthRate.toFixed(2)} MB/min`,
      })
      this.onGrowthWarning?.(growthRate)
    }
  }

  /**
   * Get current memory stats
   */
  getStats(): {
    current: MemoryInfo | null
    history: MemoryInfo[]
    growthRate: number
    isAvailable: boolean
  } {
    return {
      current: getMemoryUsage(),
      history: getMemoryHistory(),
      growthRate: calculateGrowthRate(),
      isAvailable: isMemoryApiAvailable(),
    }
  }
}

/**
 * Create a memory monitor instance
 */
export function createMemoryMonitor(
  thresholds?: MemoryThresholds,
  callbacks?: {
    onWarning?: (info: MemoryInfo, message: string) => void
    onCritical?: (info: MemoryInfo, message: string) => void
    onGrowthWarning?: (rate: number) => void
  }
): MemoryMonitor {
  return new MemoryMonitor(thresholds, callbacks)
}
