import { createLogger } from './logger'

const logger = createLogger('PathValidator')

/**
 * Path validation result
 */
export interface ValidationResult {
  isValid: boolean
  sanitizedPath: string
  error?: string
}

/**
 * Validate and sanitize a file path
 * Prevents path traversal attacks and normalizes paths
 */
export function validatePath(inputPath: string): ValidationResult {
  if (!inputPath || typeof inputPath !== 'string') {
    return {
      isValid: false,
      sanitizedPath: '',
      error: 'Path must be a non-empty string',
    }
  }

  // Trim whitespace
  let sanitizedPath = inputPath.trim()

  // Check for null bytes (null byte injection)
  if (sanitizedPath.includes('\0')) {
    logger.warn('Path contains null bytes', { path: inputPath })
    return {
      isValid: false,
      sanitizedPath: '',
      error: 'Path contains invalid null bytes',
    }
  }

  // Check for path traversal attempts
  const traversalPatterns = ['../', '..\\', '/../', '\\..\\']
  for (const pattern of traversalPatterns) {
    if (sanitizedPath.includes(pattern)) {
      logger.warn('Path traversal attempt detected', { path: inputPath })
      return {
        isValid: false,
        sanitizedPath: '',
        error: 'Path traversal is not allowed',
      }
    }
  }

  // Remove dangerous characters (but keep path separators)
  const dangerousChars = ['<', '>', '|', ':', '*', '?', '"']
  for (const char of dangerousChars) {
    if (sanitizedPath.includes(char)) {
      logger.debug('Removing dangerous character from path', { char, path: inputPath })
      sanitizedPath = sanitizedPath.split(char).join('')
    }
  }

  // Normalize path separators
  sanitizedPath = sanitizedPath.replace(/\\/g, '/')

  // Remove duplicate slashes
  sanitizedPath = sanitizedPath.replace(/\/+/g, '/')

  // Remove leading/trailing slashes (relative paths)
  sanitizedPath = sanitizedPath.replace(/^\/+|\/+$/g, '')

  return {
    isValid: true,
    sanitizedPath,
  }
}

/**
 * Validate file extension against allowed extensions
 */
export function validateFileExtension(
  path: string,
  allowedExtensions: string[]
): ValidationResult {
  const extension = path.split('.').pop()?.toLowerCase()
  
  if (!extension) {
    return {
      isValid: false,
      sanitizedPath: path,
      error: 'File has no extension',
    }
  }

  const normalizedAllowed = allowedExtensions.map(ext => 
    ext.toLowerCase().replace(/^\./, '')
  )

  if (!normalizedAllowed.includes(extension)) {
    return {
      isValid: false,
      sanitizedPath: path,
      error: `File extension .${extension} is not allowed. Allowed: ${normalizedAllowed.join(', ')}`,
    }
  }

  return {
    isValid: true,
    sanitizedPath: path,
  }
}

/**
 * Check if a path is within an allowed directory
 */
export function isWithinAllowedDir(
  path: string,
  allowedDirs: string[]
): boolean {
  const normalizedPath = path.replace(/\\/g, '/').toLowerCase()
  
  return allowedDirs.some(dir => {
    const normalizedDir = dir.replace(/\\/g, '/').toLowerCase()
    return normalizedPath.startsWith(normalizedDir)
  })
}

/**
 * Validate a filename (not a full path)
 */
export function validateFilename(filename: string): ValidationResult {
  if (!filename || typeof filename !== 'string') {
    return {
      isValid: false,
      sanitizedPath: '',
      error: 'Filename must be a non-empty string',
    }
  }

  // Check for reserved names (Windows)
  const reservedNames = [
    'CON', 'PRN', 'AUX', 'NUL',
    'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9',
    'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9',
  ]

  const baseName = filename.split('.')[0].toUpperCase()
  if (reservedNames.includes(baseName)) {
    return {
      isValid: false,
      sanitizedPath: '',
      error: `"${filename}" is a reserved filename`,
    }
  }

  // Check for invalid characters
  const invalidChars = /[<>:"/\\|?*\x00-\x1f]/
  if (invalidChars.test(filename)) {
    return {
      isValid: false,
      sanitizedPath: '',
      error: 'Filename contains invalid characters',
    }
  }

  // Check length
  if (filename.length > 255) {
    return {
      isValid: false,
      sanitizedPath: '',
      error: 'Filename is too long (max 255 characters)',
    }
  }

  // Check for dots only
  if (/^\.+$/.test(filename)) {
    return {
      isValid: false,
      sanitizedPath: '',
      error: 'Filename cannot be only dots',
    }
  }

  return {
    isValid: true,
    sanitizedPath: filename,
  }
}

/**
 * Get the file extension from a path
 */
export function getFileExtension(path: string): string {
  const parts = path.split('.')
  return parts.length > 1 ? parts.pop()!.toLowerCase() : ''
}

/**
 * Check if a path looks suspicious (heuristics)
 */
export function isSuspiciousPath(path: string): boolean {
  const suspiciousPatterns = [
    /\.\./,                    // Path traversal
    /%2e%2e/i,                // URL encoded traversal
    /%252e/i,                 // Double URL encoded
    /\0/,                      // Null byte
    /\.\.\//,                  // Unix traversal
    /\.\.\\/,                  // Windows traversal
    /\/etc\/passwd/i,         // System files
    /\/etc\/shadow/i,
    /\/proc\//i,
    /\/sys\//i,
    /c:\\windows/i,           // Windows system
    /c:\\program files/i,
  ]

  return suspiciousPatterns.some(pattern => pattern.test(path))
}
