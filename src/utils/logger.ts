import log from 'loglevel'

/**
 * Log levels supported by the logger
 */
export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'silent'

/**
 * Logger configuration options
 */
export interface LoggerConfig {
  level: LogLevel
  persistToDisk?: boolean
  enableColors?: boolean
  timestamp?: boolean
  context?: string
}

/**
 * Log entry structure for persistence
 */
export interface LogEntry {
  timestamp: string
  level: string
  message: string
  data?: unknown
  context?: string
}

// Store for log entries (for persistence)
const logBuffer: LogEntry[] = []
const MAX_BUFFER_SIZE = 1000

// Track if logger is initialized
let isInitialized = false

/**
 * Format timestamp for log entries
 */
function formatTimestamp(): string {
  return new Date().toISOString()
}

/**
 * Get log level based on environment
 */
function getDefaultLevel(): LogLevel {
  if (import.meta.env.DEV) {
    return 'debug'
  }
  return 'info'
}

/**
 * Apply colors to console output (development only)
 */
function applyColors(level: string): string {
  if (!import.meta.env.DEV) return level
  
  const colors: Record<string, string> = {
    TRACE: '\x1b[90m',  // Gray
    DEBUG: '\x1b[36m',  // Cyan
    INFO: '\x1b[32m',   // Green
    WARN: '\x1b[33m',   // Yellow
    ERROR: '\x1b[31m',  // Red
  }
  
  const reset = '\x1b[0m'
  return `${colors[level] || ''}${level}${reset}`
}

/**
 * Add log entry to buffer
 */
function addToBuffer(entry: LogEntry): void {
  logBuffer.push(entry)
  
  // Prevent buffer from growing too large
  if (logBuffer.length > MAX_BUFFER_SIZE) {
    logBuffer.shift()
  }
}

/**
 * Check if a log level should be logged
 */
function shouldLog(level: string, currentLevel: number): boolean {
  const levelMap: Record<string, number> = {
    trace: 0,
    debug: 1,
    info: 2,
    warn: 3,
    error: 4,
    silent: 5,
  }
  
  return levelMap[level.toLowerCase()] >= currentLevel
}

/**
 * Create a wrapper function for log methods
 */
function createLogWrapper(
  originalMethod: (...args: unknown[]) => void,
  level: string,
  context?: string
): (...args: unknown[]) => void {
  return (...args: unknown[]) => {
    // Check if this level should be logged
    if (!shouldLog(level, log.getLevel())) {
      return
    }
    
    const timestamp = formatTimestamp()
    const levelName = level.toUpperCase()
    
    // Create log entry
    const entry: LogEntry = {
      timestamp,
      level: levelName,
      message: String(args[0]),
      data: args.length > 1 ? args.slice(1) : undefined,
      context,
    }
    
    // Add to buffer for persistence
    addToBuffer(entry)
    
    // Apply colors in development
    const formattedLevel = applyColors(levelName)
    
    // Add timestamp prefix in development
    if (import.meta.env.DEV) {
      const prefix = context 
        ? `[${timestamp}] ${formattedLevel} [${context}]:`
        : `[${timestamp}] ${formattedLevel}:`
      originalMethod(prefix, ...args)
    } else {
      originalMethod(...args)
    }
  }
}

/**
 * Initialize the logger with configuration
 */
export function initLogger(config?: Partial<LoggerConfig>): void {
  const level = config?.level || getDefaultLevel()
  
  // Set level
  log.setLevel(level as log.LogLevelDesc)
  
  // In development, also enable trace level
  if (import.meta.env.DEV) {
    log.setLevel('trace')
  }
  
  if (!isInitialized) {
    log.info('Logger initialized', { level, env: import.meta.env.DEV ? 'development' : 'production' })
    isInitialized = true
  }
}

/**
 * Create a child logger with a specific context
 */
export function createLogger(context: string): log.Logger {
  const childLogger = log.getLogger(context)
  childLogger.setLevel(log.getLevel())
  
  // Wrap methods to add context
  const originalTrace = childLogger.trace.bind(childLogger)
  const originalDebug = childLogger.debug.bind(childLogger)
  const originalInfo = childLogger.info.bind(childLogger)
  const originalWarn = childLogger.warn.bind(childLogger)
  const originalError = childLogger.error.bind(childLogger)
  
  childLogger.trace = createLogWrapper(originalTrace, 'trace', context)
  childLogger.debug = createLogWrapper(originalDebug, 'debug', context)
  childLogger.info = createLogWrapper(originalInfo, 'info', context)
  childLogger.warn = createLogWrapper(originalWarn, 'warn', context)
  childLogger.error = createLogWrapper(originalError, 'error', context)
  
  return childLogger
}

/**
 * Get all buffered log entries
 */
export function getLogBuffer(): LogEntry[] {
  return [...logBuffer]
}

/**
 * Clear the log buffer
 */
export function clearLogBuffer(): void {
  logBuffer.length = 0
}

/**
 * Get log buffer as JSON string
 */
export function exportLogs(): string {
  return JSON.stringify(logBuffer, null, 2)
}

/**
 * Download logs as a file
 */
export function downloadLogs(): void {
  const logs = exportLogs()
  const blob = new Blob([logs], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  
  const a = document.createElement('a')
  a.href = url
  a.download = `logs-${new Date().toISOString().replace(/[:.]/g, '-')}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * Set log level at runtime
 */
export function setLogLevel(level: LogLevel): void {
  log.setLevel(level as log.LogLevelDesc)
  log.info(`Log level changed to: ${level}`)
}

/**
 * Get current log level
 */
export function getLogLevel(): LogLevel {
  const level = log.getLevel()
  
  switch (level) {
    case log.levels.TRACE: return 'trace'
    case log.levels.DEBUG: return 'debug'
    case log.levels.INFO: return 'info'
    case log.levels.WARN: return 'warn'
    case log.levels.ERROR: return 'error'
    case log.levels.SILENT: return 'silent'
    default: return 'info'
  }
}

// Export default logger instance
export default log

// Auto-initialize on import
initLogger()
