import i18n from 'i18next'

/**
 * Format a date according to the current locale
 * @param date - The date to format
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted date string
 */
export function formatDate(
  date: Date | string | number,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }
): string {
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date
  const locale = i18n.language || 'en'
  
  try {
    return new Intl.DateTimeFormat(locale, options).format(dateObj)
  } catch (error) {
    console.error('Error formatting date:', error)
    return dateObj.toLocaleDateString()
  }
}

/**
 * Format a time according to the current locale
 * @param date - The date/time to format
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted time string
 */
export function formatTime(
  date: Date | string | number,
  options: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
  }
): string {
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date
  const locale = i18n.language || 'en'
  
  try {
    return new Intl.DateTimeFormat(locale, options).format(dateObj)
  } catch (error) {
    console.error('Error formatting time:', error)
    return dateObj.toLocaleTimeString()
  }
}

/**
 * Format a date and time according to the current locale
 * @param date - The date/time to format
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted date and time string
 */
export function formatDateTime(
  date: Date | string | number,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }
): string {
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date
  const locale = i18n.language || 'en'
  
  try {
    return new Intl.DateTimeFormat(locale, options).format(dateObj)
  } catch (error) {
    console.error('Error formatting date/time:', error)
    return dateObj.toLocaleString()
  }
}

/**
 * Format a relative time (e.g., "2 hours ago", "in 3 days")
 * @param date - The date to format relative to now
 * @returns Formatted relative time string
 */
export function formatRelativeTime(date: Date | string | number): string {
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date
  const locale = i18n.language || 'en'
  const now = new Date()
  const diffMs = now.getTime() - dateObj.getTime()
  const diffSec = Math.round(diffMs / 1000)
  const diffMin = Math.round(diffSec / 60)
  const diffHour = Math.round(diffMin / 60)
  const diffDay = Math.round(diffHour / 24)
  
  try {
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })
    
    if (Math.abs(diffSec) < 60) {
      return rtf.format(-diffSec, 'second')
    } else if (Math.abs(diffMin) < 60) {
      return rtf.format(-diffMin, 'minute')
    } else if (Math.abs(diffHour) < 24) {
      return rtf.format(-diffHour, 'hour')
    } else if (Math.abs(diffDay) < 7) {
      return rtf.format(-diffDay, 'day')
    } else {
      // For dates more than a week away, use absolute date
      return formatDate(dateObj)
    }
  } catch (error) {
    console.error('Error formatting relative time:', error)
    return formatDate(dateObj)
  }
}

/**
 * Format a number according to the current locale
 * @param value - The number to format
 * @param options - Intl.NumberFormatOptions
 * @returns Formatted number string
 */
export function formatNumber(
  value: number,
  options: Intl.NumberFormatOptions = {}
): string {
  const locale = i18n.language || 'en'
  
  try {
    return new Intl.NumberFormat(locale, options).format(value)
  } catch (error) {
    console.error('Error formatting number:', error)
    return value.toString()
  }
}

/**
 * Format a percentage according to the current locale
 * @param value - The value to format as percentage (0-1 range)
 * @param options - Intl.NumberFormatOptions
 * @returns Formatted percentage string
 */
export function formatPercent(
  value: number,
  options: Intl.NumberFormatOptions = {
    style: 'percent',
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }
): string {
  return formatNumber(value, options)
}

/**
 * Format a currency value according to the current locale
 * @param value - The value to format
 * @param currency - The currency code (e.g., 'USD', 'CNY')
 * @param options - Intl.NumberFormatOptions
 * @returns Formatted currency string
 */
export function formatCurrency(
  value: number,
  currency: string = 'USD',
  options: Omit<Intl.NumberFormatOptions, 'style' | 'currency'> = {}
): string {
  return formatNumber(value, {
    style: 'currency',
    currency,
    ...options,
  })
}

/**
 * Format file size in bytes to human-readable format
 * @param bytes - The size in bytes
 * @returns Formatted file size string
 */
export function formatFileSize(bytes: number): string {
  const locale = i18n.language || 'en'
  
  if (bytes === 0) return '0 B'
  
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const k = 1024
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  const size = bytes / Math.pow(k, i)
  
  try {
    return new Intl.NumberFormat(locale, {
      maximumFractionDigits: 1,
    }).format(size) + ' ' + units[i]
  } catch (error) {
    console.error('Error formatting file size:', error)
    return size.toFixed(1) + ' ' + units[i]
  }
}
