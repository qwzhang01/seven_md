import { createLogger } from './logger'

const logger = createLogger('InputSanitizer')

/**
 * Sanitization options
 */
export interface SanitizeOptions {
  allowedTags?: string[]
  allowHtml?: boolean
  maxLength?: number
  trim?: boolean
  removeNullBytes?: boolean
}

const DEFAULT_OPTIONS: Required<SanitizeOptions> = {
  allowedTags: [],
  allowHtml: false,
  maxLength: 10000,
  trim: true,
  removeNullBytes: true,
}

/**
 * Sanitize user input string
 */
export function sanitizeString(
  input: string,
  options: SanitizeOptions = {}
): string {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  
  if (typeof input !== 'string') {
    logger.warn('sanitizeString received non-string input', { type: typeof input })
    return ''
  }

  let result = input

  // Remove null bytes
  if (opts.removeNullBytes) {
    result = result.replace(/\0/g, '')
  }

  // Trim whitespace
  if (opts.trim) {
    result = result.trim()
  }

  // Remove HTML tags if not allowed
  if (!opts.allowHtml) {
    result = stripHtmlTags(result)
  } else if (opts.allowedTags.length > 0) {
    result = filterHtmlTags(result, opts.allowedTags)
  }

  // Enforce max length
  if (result.length > opts.maxLength) {
    logger.debug('Input truncated to max length', { 
      originalLength: result.length, 
      maxLength: opts.maxLength 
    })
    result = result.slice(0, opts.maxLength)
  }

  return result
}

/**
 * Strip all HTML tags from string
 */
export function stripHtmlTags(input: string): string {
  return input
    .replace(/<[^>]*>/g, '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
}

/**
 * Filter HTML tags, keeping only allowed ones
 */
export function filterHtmlTags(input: string, allowedTags: string[]): string {
  const allowedPattern = allowedTags
    .map(tag => tag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|')
  
  const pattern = new RegExp(`<(/?(?!/?(${allowedPattern})\\b)[^>]*)>`, 'gi')
  return input.replace(pattern, '')
}

/**
 * Escape HTML entities for safe display
 */
export function escapeHtml(input: string): string {
  const htmlEntities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }

  return input.replace(/[&<>"']/g, char => htmlEntities[char] || char)
}

/**
 * Unescape HTML entities
 */
export function unescapeHtml(input: string): string {
  const htmlEntities: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
  }

  return input.replace(/&(amp|lt|gt|quot|#39);/g, entity => htmlEntities[entity] || entity)
}

/**
 * Sanitize object by sanitizing all string values
 */
export function sanitizeObject<T extends Record<string, unknown>>(
  obj: T,
  options: SanitizeOptions = {}
): T {
  const result: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      result[key] = sanitizeString(value, options)
    } else if (typeof value === 'object' && value !== null) {
      result[key] = sanitizeObject(value as Record<string, unknown>, options)
    } else {
      result[key] = value
    }
  }

  return result as T
}

/**
 * Remove potentially dangerous URL schemes
 */
export function sanitizeUrl(url: string): string {
  const trimmed = url.trim()
  
  // Only allow safe schemes
  const safeSchemes = ['http://', 'https://', 'mailto:', 'tel:', 'ftp://']
  const hasSafeScheme = safeSchemes.some(scheme => 
    trimmed.toLowerCase().startsWith(scheme)
  )

  // Allow relative URLs
  const isRelative = trimmed.startsWith('/') || trimmed.startsWith('./') || trimmed.startsWith('../')
  
  // Allow anchor links
  const isAnchor = trimmed.startsWith('#')

  if (!hasSafeScheme && !isRelative && !isAnchor && trimmed.includes(':')) {
    logger.warn('Potentially dangerous URL scheme blocked', { url: trimmed })
    return ''
  }

  return trimmed
}

/**
 * Sanitize filename for safe filesystem use
 */
export function sanitizeFilename(filename: string): string {
  let result = filename.trim()
  
  // Remove path separators
  result = result.replace(/[/\\]/g, '_')
  
  // Remove null bytes
  result = result.replace(/\0/g, '')
  
  // Remove control characters
  result = result.replace(/[\x00-\x1f\x7f]/g, '')
  
  // Replace invalid characters (Windows)
  result = result.replace(/[<>:"|?*]/g, '_')
  
  // Remove leading/trailing dots and spaces (Windows)
  result = result.replace(/^[.\s]+|[.\s]+$/g, '')
  
  // Limit length
  if (result.length > 255) {
    const ext = result.split('.').pop()
    const name = result.slice(0, -(ext?.length || 0) - 1)
    result = name.slice(0, 255 - (ext?.length || 0) - 1) + (ext ? `.${ext}` : '')
  }

  return result || 'unnamed'
}

/**
 * Validate and sanitize email
 */
export function sanitizeEmail(email: string): string {
  const trimmed = email.trim().toLowerCase()
  
  // Basic email pattern
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  
  if (!emailPattern.test(trimmed)) {
    logger.warn('Invalid email format', { email: trimmed })
    return ''
  }

  return trimmed
}

/**
 * Strip script tags and content
 */
export function stripScripts(input: string): string {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/javascript:/gi, '')
}

/**
 * Check if input contains potentially dangerous content
 */
export function hasDangerousContent(input: string): boolean {
  const dangerousPatterns = [
    /<script\b/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /data:/i,
    /vbscript:/i,
    /<iframe\b/i,
    /<object\b/i,
    /<embed\b/i,
    /<form\b/i,
  ]

  return dangerousPatterns.some(pattern => pattern.test(input))
}
