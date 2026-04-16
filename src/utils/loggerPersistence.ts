import { invoke } from '@tauri-apps/api/core'
import { createLogger, getLogBuffer, clearLogBuffer, type LogEntry, type LogLevel } from './logger'

// Create a dedicated logger for persistence operations
const persistenceLogger = createLogger('LoggerPersistence')

/**
 * Persistence configuration
 */
export interface PersistenceConfig {
  enabled: boolean
  flushInterval: number // milliseconds
  bufferSize: number
}

const DEFAULT_CONFIG: PersistenceConfig = {
  enabled: true,
  flushInterval: 5000, // 5 seconds
  bufferSize: 50,
}

/**
 * Log persistence manager
 */
class LogPersistenceManager {
  private config: PersistenceConfig
  private flushTimer: ReturnType<typeof setInterval> | null = null
  private isInitialized = false
  
  constructor(config: Partial<PersistenceConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
  }
  
  /**
   * Initialize the persistence manager
   */
  async init(): Promise<void> {
    if (this.isInitialized) {
      return
    }
    
    this.isInitialized = true
    
    // Start periodic flush
    if (this.config.enabled) {
      this.startFlushTimer()
    }
    
    // Flush logs before page unload
    window.addEventListener('beforeunload', () => {
      this.flush()
    })
    
    // Handle visibility change (flush when tab becomes hidden)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.flush()
      }
    })
    
    persistenceLogger.info('Log persistence initialized')
  }
  
  /**
   * Start the periodic flush timer
   */
  private startFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer)
    }
    
    this.flushTimer = setInterval(() => {
      this.flush()
    }, this.config.flushInterval)
  }
  
  /**
   * Stop the flush timer
   */
  stopFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer)
      this.flushTimer = null
    }
  }
  
  /**
   * Flush buffered logs to persistent storage
   */
  async flush(): Promise<void> {
    const buffer = getLogBuffer()
    
    if (buffer.length === 0) {
      return
    }
    
    try {
      // Write logs to file via Tauri command
      for (const entry of buffer) {
        await invoke('write_log', {
          level: entry.level.toLowerCase(),
          message: entry.message,
          data: entry.data,
          context: entry.context,
        })
      }
      
      // Clear buffer after successful flush
      clearLogBuffer()
      
      persistenceLogger.debug('Flushed logs to persistent storage', { count: buffer.length })
    } catch (error) {
      persistenceLogger.error('Failed to flush logs', { error: String(error) })
    }
  }
  
  /**
   * Force flush all logs immediately
   */
  async forceFlush(): Promise<void> {
    await this.flush()
  }
  
  /**
   * Write a single log entry immediately (bypass buffer)
   */
  async writeImmediately(entry: LogEntry): Promise<void> {
    try {
      await invoke('write_log', {
        level: entry.level.toLowerCase(),
        message: entry.message,
        data: entry.data,
        context: entry.context,
      })
    } catch (error) {
      persistenceLogger.error('Failed to write log immediately', { error: String(error) })
    }
  }
  
  /**
   * Read logs from a specific date
   */
  async readLogs(date: string): Promise<LogEntry[]> {
    try {
      const logs = await invoke<LogEntry[]>('read_logs', { date })
      return logs
    } catch (error) {
      persistenceLogger.error('Failed to read logs', { error: String(error), date })
      return []
    }
  }
  
  /**
   * Get available log dates
   */
  async getAvailableDates(): Promise<string[]> {
    try {
      const dates = await invoke<string[]>('get_log_dates')
      return dates
    } catch (error) {
      persistenceLogger.error('Failed to get log dates', { error: String(error) })
      return []
    }
  }
  
  /**
   * Export logs to a file
   */
  async exportToFile(): Promise<string> {
    const buffer = getLogBuffer()
    const json = JSON.stringify(buffer, null, 2)
    return json
  }
  
  /**
   * Set configuration
   */
  setConfig(config: Partial<PersistenceConfig>): void {
    this.config = { ...this.config, ...config }
    
    if (this.config.enabled && !this.flushTimer) {
      this.startFlushTimer()
    } else if (!this.config.enabled && this.flushTimer) {
      this.stopFlushTimer()
    }
  }
  
  /**
   * Get current configuration
   */
  getConfig(): PersistenceConfig {
    return { ...this.config }
  }
  
  /**
   * Shutdown the persistence manager
   */
  async shutdown(): Promise<void> {
    this.stopFlushTimer()
    await this.flush()
    this.isInitialized = false
  }
}

// Global persistence manager instance
let persistenceManager: LogPersistenceManager | null = null

/**
 * Initialize log persistence
 */
export async function initLogPersistence(config?: Partial<PersistenceConfig>): Promise<void> {
  if (persistenceManager) {
    persistenceLogger.warn('Log persistence already initialized')
    return
  }
  
  persistenceManager = new LogPersistenceManager(config)
  await persistenceManager.init()
}

/**
 * Get the persistence manager
 */
export function getPersistenceManager(): LogPersistenceManager | null {
  return persistenceManager
}

/**
 * Flush logs to persistent storage
 */
export async function flushLogs(): Promise<void> {
  if (!persistenceManager) {
    persistenceLogger.warn('Log persistence not initialized')
    return
  }
  
  await persistenceManager.flush()
}

/**
 * Read logs from a specific date
 */
export async function readPersistedLogs(date: string): Promise<LogEntry[]> {
  if (!persistenceManager) {
    persistenceLogger.warn('Log persistence not initialized')
    return []
  }
  
  return persistenceManager.readLogs(date)
}

/**
 * Get available log dates
 */
export async function getLogDates(): Promise<string[]> {
  if (!persistenceManager) {
    persistenceLogger.warn('Log persistence not initialized')
    return []
  }
  
  return persistenceManager.getAvailableDates()
}

/**
 * Shutdown log persistence
 */
export async function shutdownLogPersistence(): Promise<void> {
  if (!persistenceManager) {
    return
  }
  
  await persistenceManager.shutdown()
  persistenceManager = null
}
