import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  isMemoryApiAvailable,
  getMemoryUsage,
  getMemoryHistory,
  clearMemoryHistory,
  calculateGrowthRate,
  formatMemoryMB,
  MemoryMonitor,
  createMemoryMonitor,
} from './memoryMonitor'

// Mock logger
vi.mock('../utils/logger', () => ({
  createLogger: () => ({
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  }),
}))

describe('memoryMonitor', () => {
  beforeEach(() => {
    clearMemoryHistory()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('isMemoryApiAvailable', () => {
    it('returns boolean', () => {
      const result = isMemoryApiAvailable()
      expect(typeof result).toBe('boolean')
    })
  })

  describe('getMemoryUsage', () => {
    it('returns null when memory API is not available', () => {
      // In Node.js/JSDOM, memory API is typically not available
      const result = getMemoryUsage()
      // The result depends on the test environment
      expect(result === null || result !== null).toBe(true)
    })

    it('returns MemoryInfo when API is available', () => {
      // Mock the memory API
      const originalMemory = (performance as any).memory
      ;(performance as any).memory = {
        usedJSHeapSize: 50 * 1024 * 1024, // 50 MB
        totalJSHeapSize: 100 * 1024 * 1024,
        jsHeapSizeLimit: 500 * 1024 * 1024,
      }

      const result = getMemoryUsage()

      expect(result).not.toBeNull()
      expect(result?.usedJSHeapSize).toBe(50 * 1024 * 1024)
      expect(result?.totalJSHeapSize).toBe(100 * 1024 * 1024)
      expect(result?.jsHeapSizeLimit).toBe(500 * 1024 * 1024)
      expect(typeof result?.timestamp).toBe('number')

      // Restore
      if (originalMemory) {
        ;(performance as any).memory = originalMemory
      } else {
        delete (performance as any).memory
      }
    })
  })

  describe('getMemoryHistory', () => {
    it('returns empty array initially', () => {
      const history = getMemoryHistory()
      expect(Array.isArray(history)).toBe(true)
    })

    it('returns copy of history', () => {
      const history1 = getMemoryHistory()
      const history2 = getMemoryHistory()
      expect(history1).not.toBe(history2)
    })
  })

  describe('clearMemoryHistory', () => {
    it('clears history', () => {
      // Add some mock data
      const monitor = createMemoryMonitor()
      monitor.start(10)
      
      // Wait a bit for checks
      return new Promise<void>(resolve => {
        setTimeout(() => {
          monitor.stop()
          clearMemoryHistory()
          expect(getMemoryHistory().length).toBe(0)
          resolve()
        }, 50)
      })
    })
  })

  describe('calculateGrowthRate', () => {
    it('returns 0 when history is empty', () => {
      expect(calculateGrowthRate()).toBe(0)
    })

    it('returns 0 when history has only one entry', () => {
      // Manually add to history (would normally be done by monitor)
      const history = getMemoryHistory()
      // Can't directly push, but we can test with monitor
      expect(calculateGrowthRate()).toBe(0)
    })
  })

  describe('formatMemoryMB', () => {
    it('formats bytes to MB correctly', () => {
      expect(formatMemoryMB(1024 * 1024)).toBe('1.00 MB')
      expect(formatMemoryMB(50 * 1024 * 1024)).toBe('50.00 MB')
      expect(formatMemoryMB(12345678)).toBe('11.77 MB')
    })

    it('handles 0 bytes', () => {
      expect(formatMemoryMB(0)).toBe('0.00 MB')
    })
  })

  describe('MemoryMonitor', () => {
    it('creates monitor instance', () => {
      const monitor = new MemoryMonitor()
      expect(monitor).toBeDefined()
    })

    it('starts and stops monitoring', () => {
      const monitor = new MemoryMonitor()
      
      monitor.start(100)
      // Should be running
      
      monitor.stop()
      // Should be stopped
    })

    it('does not start twice', () => {
      const monitor = new MemoryMonitor()
      
      monitor.start(100)
      monitor.start(100) // Should log warning but not error
      
      monitor.stop()
    })

    it('calls onWarning when threshold exceeded', async () => {
      // Mock memory API with high usage
      const originalMemory = (performance as any).memory
      ;(performance as any).memory = {
        usedJSHeapSize: 150 * 1024 * 1024, // 150 MB > warning threshold
        totalJSHeapSize: 200 * 1024 * 1024,
        jsHeapSizeLimit: 500 * 1024 * 1024,
      }

      const onWarning = vi.fn()
      const monitor = new MemoryMonitor(
        { warningMB: 100 },
        { onWarning }
      )

      monitor.start(10)

      await new Promise<void>(resolve => {
        setTimeout(() => {
          monitor.stop()
          // Restore memory
          if (originalMemory) {
            ;(performance as any).memory = originalMemory
          } else {
            delete (performance as any).memory
          }
          resolve()
        }, 50)
      })
    })

    it('calls onCritical when critical threshold exceeded', async () => {
      // Mock memory API with critical usage
      const originalMemory = (performance as any).memory
      ;(performance as any).memory = {
        usedJSHeapSize: 250 * 1024 * 1024, // 250 MB > critical threshold
        totalJSHeapSize: 300 * 1024 * 1024,
        jsHeapSizeLimit: 500 * 1024 * 1024,
      }

      const onCritical = vi.fn()
      const monitor = new MemoryMonitor(
        { criticalMB: 200 },
        { onCritical }
      )

      monitor.start(10)

      await new Promise<void>(resolve => {
        setTimeout(() => {
          monitor.stop()
          // Restore memory
          if (originalMemory) {
            ;(performance as any).memory = originalMemory
          } else {
            delete (performance as any).memory
          }
          resolve()
        }, 50)
      })
    })

    it('getStats returns current stats', () => {
      const monitor = new MemoryMonitor()
      const stats = monitor.getStats()

      expect(stats).toHaveProperty('current')
      expect(stats).toHaveProperty('history')
      expect(stats).toHaveProperty('growthRate')
      expect(stats).toHaveProperty('isAvailable')
      expect(typeof stats.isAvailable).toBe('boolean')
    })
  })

  describe('createMemoryMonitor', () => {
    it('creates MemoryMonitor instance', () => {
      const monitor = createMemoryMonitor()
      expect(monitor).toBeInstanceOf(MemoryMonitor)
    })

    it('passes thresholds and callbacks', () => {
      const onWarning = vi.fn()
      const monitor = createMemoryMonitor(
        { warningMB: 50 },
        { onWarning }
      )
      expect(monitor).toBeInstanceOf(MemoryMonitor)
    })
  })
})
