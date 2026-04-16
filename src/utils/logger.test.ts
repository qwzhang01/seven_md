import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import log from 'loglevel'
import {
  initLogger,
  createLogger,
  getLogBuffer,
  clearLogBuffer,
  exportLogs,
  setLogLevel,
  getLogLevel,
  type LogLevel,
} from './logger'

describe('Logger', () => {
  // Store original console methods
  const originalConsole = {
    log: console.log,
    info: console.info,
    warn: console.warn,
    error: console.error,
    debug: console.debug,
    trace: console.trace,
  }

  beforeEach(() => {
    // Clear log buffer before each test
    clearLogBuffer()
    
    // Mock console methods
    console.log = vi.fn()
    console.info = vi.fn()
    console.warn = vi.fn()
    console.error = vi.fn()
    console.debug = vi.fn()
    console.trace = vi.fn()
  })

  afterEach(() => {
    // Restore console methods
    console.log = originalConsole.log
    console.info = originalConsole.info
    console.warn = originalConsole.warn
    console.error = originalConsole.error
    console.debug = originalConsole.debug
    console.trace = originalConsole.trace
  })

  describe('initLogger', () => {
    it('should initialize with default level (debug in dev)', () => {
      vi.stubEnv('DEV', true)
      initLogger()
      
      const level = getLogLevel()
      expect(level).toBe('trace')
    })

    it('should initialize with custom level', () => {
      vi.stubEnv('DEV', false)
      initLogger({ level: 'warn' })
      
      const level = getLogLevel()
      expect(level).toBe('warn')
    })

    it('should initialize with info level in production', () => {
      vi.stubEnv('DEV', false)
      initLogger()
      
      const level = getLogLevel()
      expect(level).toBe('info')
    })
  })

  describe('createLogger', () => {
    it('should create a child logger with context', () => {
      const childLogger = createLogger('TestContext')
      
      expect(childLogger).toBeDefined()
      expect(childLogger.info).toBeDefined()
      expect(childLogger.debug).toBeDefined()
      expect(childLogger.warn).toBeDefined()
      expect(childLogger.error).toBeDefined()
    })

    it('should have same level as parent logger', () => {
      initLogger({ level: 'warn' })
      const childLogger = createLogger('TestContext')
      
      expect(childLogger.getLevel()).toBe(log.levels.WARN)
    })
  })

  describe('Log methods', () => {
    it('should log info messages', () => {
      initLogger({ level: 'info' })
      const logger = createLogger('Test')
      
      logger.info('Test info message')
      
      const buffer = getLogBuffer()
      expect(buffer.length).toBeGreaterThan(0)
      expect(buffer[buffer.length - 1].level).toBe('INFO')
      expect(buffer[buffer.length - 1].message).toBe('Test info message')
    })

    it('should log warn messages', () => {
      initLogger({ level: 'warn' })
      const logger = createLogger('Test')
      
      logger.warn('Test warning message')
      
      const buffer = getLogBuffer()
      expect(buffer.length).toBeGreaterThan(0)
      expect(buffer[buffer.length - 1].level).toBe('WARN')
    })

    it('should log error messages', () => {
      initLogger({ level: 'error' })
      const logger = createLogger('Test')
      
      logger.error('Test error message')
      
      const buffer = getLogBuffer()
      expect(buffer.length).toBeGreaterThan(0)
      expect(buffer[buffer.length - 1].level).toBe('ERROR')
    })

    it('should log debug messages when level is debug', () => {
      initLogger({ level: 'debug' })
      const logger = createLogger('Test')
      
      logger.debug('Test debug message')
      
      const buffer = getLogBuffer()
      expect(buffer.length).toBeGreaterThan(0)
      expect(buffer[buffer.length - 1].level).toBe('DEBUG')
    })

    it('should not log debug messages when level is info', () => {
      vi.stubEnv('DEV', false)
      initLogger({ level: 'info' })
      const logger = createLogger('Test')
      clearLogBuffer()
      
      logger.debug('Test debug message')
      
      const buffer = getLogBuffer()
      // Should not add to buffer since level is info and debug is below it
      expect(buffer.every(entry => entry.level !== 'DEBUG')).toBe(true)
    })

    it('should log with additional data', () => {
      initLogger({ level: 'info' })
      const logger = createLogger('Test')
      
      const data = { userId: 123, action: 'login' }
      logger.info('User action', data)
      
      const buffer = getLogBuffer()
      const lastEntry = buffer[buffer.length - 1]
      expect(lastEntry.data).toEqual([data])
    })
  })

  describe('Log buffer', () => {
    it('should maintain log buffer', () => {
      initLogger({ level: 'debug' })
      const logger = createLogger('Test')
      
      logger.info('Message 1')
      logger.info('Message 2')
      logger.info('Message 3')
      
      const buffer = getLogBuffer()
      expect(buffer.length).toBeGreaterThanOrEqual(3)
    })

    it('should clear log buffer', () => {
      initLogger({ level: 'info' })
      const logger = createLogger('Test')
      
      logger.info('Message 1')
      logger.info('Message 2')
      
      clearLogBuffer()
      
      const buffer = getLogBuffer()
      expect(buffer.length).toBe(0)
    })

    it('should limit buffer size to MAX_BUFFER_SIZE', () => {
      initLogger({ level: 'info' })
      const logger = createLogger('Test')
      
      // Add more than 1000 entries
      for (let i = 0; i < 1100; i++) {
        logger.info(`Message ${i}`)
      }
      
      const buffer = getLogBuffer()
      expect(buffer.length).toBeLessThanOrEqual(1000)
    })
  })

  describe('exportLogs', () => {
    it('should export logs as JSON string', () => {
      initLogger({ level: 'info' })
      const logger = createLogger('Test')
      clearLogBuffer()
      
      logger.info('Test message')
      
      const exported = exportLogs()
      const parsed = JSON.parse(exported)
      
      expect(Array.isArray(parsed)).toBe(true)
      expect(parsed.length).toBeGreaterThan(0)
      expect(parsed[0]).toHaveProperty('timestamp')
      expect(parsed[0]).toHaveProperty('level')
      expect(parsed[0]).toHaveProperty('message')
    })
  })

  describe('setLogLevel', () => {
    it('should change log level at runtime', () => {
      initLogger({ level: 'info' })
      expect(getLogLevel()).toBe('info')
      
      setLogLevel('debug')
      expect(getLogLevel()).toBe('debug')
    })

    it('should support all log levels', () => {
      const levels: LogLevel[] = ['trace', 'debug', 'info', 'warn', 'error', 'silent']
      
      levels.forEach(level => {
        setLogLevel(level)
        expect(getLogLevel()).toBe(level)
      })
    })
  })

  describe('getLogLevel', () => {
    it('should return current log level', () => {
      initLogger({ level: 'warn' })
      
      const level = getLogLevel()
      expect(level).toBe('warn')
    })
  })

  describe('Log entry structure', () => {
    it('should create entries with timestamp in ISO format', () => {
      initLogger({ level: 'info' })
      const logger = createLogger('Test')
      clearLogBuffer()
      
      logger.info('Test message')
      
      const buffer = getLogBuffer()
      const timestamp = buffer[0].timestamp
      
      // Should be valid ISO string
      expect(() => new Date(timestamp)).not.toThrow()
      expect(new Date(timestamp).toISOString()).toBe(timestamp)
    })

    it('should include context in log entry', () => {
      initLogger({ level: 'info' })
      const logger = createLogger('MyContext')
      clearLogBuffer()
      
      logger.info('Test message')
      
      const buffer = getLogBuffer()
      expect(buffer[0].context).toBe('MyContext')
    })
  })

  describe('Performance', () => {
    it('should handle high-frequency logging', () => {
      initLogger({ level: 'info' })
      const logger = createLogger('Test')
      clearLogBuffer()
      
      const startTime = Date.now()
      
      for (let i = 0; i < 100; i++) {
        logger.info(`Message ${i}`)
      }
      
      const endTime = Date.now()
      const duration = endTime - startTime
      
      // Should complete 100 log operations in less than 100ms
      expect(duration).toBeLessThan(100)
    })
  })
})
