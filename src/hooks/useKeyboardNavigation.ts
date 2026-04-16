import { useEffect, useRef, useCallback, useState } from 'react'
import { createLogger } from '../utils/logger'

const logger = createLogger('KeyboardNavigation')

/**
 * Focusable element selector
 */
const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

/**
 * Get all focusable elements within a container
 */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
    .filter(el => {
      // Check if element is visible
      const style = window.getComputedStyle(el)
      return style.display !== 'none' && 
             style.visibility !== 'hidden' && 
             el.offsetParent !== null
    })
}

/**
 * Keyboard navigation options
 */
export interface KeyboardNavigationOptions {
  /** Enable arrow key navigation */
  arrowKeys?: boolean
  /** Enable Tab key navigation */
  tabKey?: boolean
  /** Enable Enter/Space activation */
  activationKeys?: boolean
  /** Enable Escape to close */
  escapeKey?: boolean
  /** Loop navigation at boundaries */
  loop?: boolean
  /** Callback when escape is pressed */
  onEscape?: () => void
  /** Callback when an item is activated */
  onActivate?: (element: HTMLElement) => void
  /** Callback when focus changes */
  onFocusChange?: (element: HTMLElement, index: number) => void
}

/**
 * Hook for managing keyboard navigation within a container
 */
export function useKeyboardNavigation(
  containerRef: React.RefObject<HTMLElement>,
  options: KeyboardNavigationOptions = {}
) {
  const {
    arrowKeys = true,
    tabKey = true,
    activationKeys = true,
    escapeKey = true,
    loop = true,
    onEscape,
    onActivate,
    onFocusChange,
  } = options

  const focusIndexRef = useRef(0)
  const [focusIndex, setFocusIndex] = useState(0)

  /**
   * Get current focusable elements
   */
  const getFocusables = useCallback(() => {
    if (!containerRef.current) return []
    return getFocusableElements(containerRef.current)
  }, [containerRef])

  /**
   * Focus element at index
   */
  const focusAt = useCallback((index: number) => {
    const focusables = getFocusables()
    if (focusables.length === 0) return

    let nextIndex = index
    if (loop) {
      nextIndex = ((index % focusables.length) + focusables.length) % focusables.length
    } else {
      nextIndex = Math.max(0, Math.min(index, focusables.length - 1))
    }

    focusables[nextIndex]?.focus()
    focusIndexRef.current = nextIndex
    setFocusIndex(nextIndex)
    onFocusChange?.(focusables[nextIndex], nextIndex)
    logger.debug('Focus moved to index', { index: nextIndex })
  }, [getFocusables, loop, onFocusChange])

  /**
   * Focus next element
   */
  const focusNext = useCallback(() => {
    focusAt(focusIndexRef.current + 1)
  }, [focusAt])

  /**
   * Focus previous element
   */
  const focusPrevious = useCallback(() => {
    focusAt(focusIndexRef.current - 1)
  }, [focusAt])

  /**
   * Focus first element
   */
  const focusFirst = useCallback(() => {
    focusAt(0)
  }, [focusAt])

  /**
   * Focus last element
   */
  const focusLast = useCallback(() => {
    const focusables = getFocusables()
    focusAt(focusables.length - 1)
  }, [focusAt, getFocusables])

  /**
   * Activate current element
   */
  const activateCurrent = useCallback(() => {
    const focusables = getFocusables()
    const current = focusables[focusIndexRef.current]
    if (current) {
      onActivate?.(current)
      // Simulate click for buttons
      if (current.tagName === 'BUTTON' || current.getAttribute('role') === 'button') {
        current.click()
      }
      logger.debug('Element activated', { element: current.tagName })
    }
  }, [getFocusables, onActivate])

  /**
   * Handle keyboard events
   */
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle if container or child is focused
      if (!container.contains(document.activeElement)) return

      switch (e.key) {
        case 'ArrowDown':
        case 'ArrowRight':
          if (arrowKeys) {
            e.preventDefault()
            focusNext()
          }
          break

        case 'ArrowUp':
        case 'ArrowLeft':
          if (arrowKeys) {
            e.preventDefault()
            focusPrevious()
          }
          break

        case 'Tab':
          if (!tabKey) break
          if (e.shiftKey) {
            e.preventDefault()
            focusPrevious()
          } else {
            e.preventDefault()
            focusNext()
          }
          break

        case 'Enter':
        case ' ':
          if (activationKeys) {
            e.preventDefault()
            activateCurrent()
          }
          break

        case 'Escape':
          if (escapeKey) {
            e.preventDefault()
            onEscape?.()
            logger.debug('Escape pressed')
          }
          break

        case 'Home':
          e.preventDefault()
          focusFirst()
          break

        case 'End':
          e.preventDefault()
          focusLast()
          break
      }
    }

    container.addEventListener('keydown', handleKeyDown)
    return () => container.removeEventListener('keydown', handleKeyDown)
  }, [
    containerRef,
    arrowKeys,
    tabKey,
    activationKeys,
    escapeKey,
    focusNext,
    focusPrevious,
    focusFirst,
    focusLast,
    activateCurrent,
    onEscape,
  ])

  return {
    focusIndex,
    focusAt,
    focusNext,
    focusPrevious,
    focusFirst,
    focusLast,
    activateCurrent,
    getFocusables,
  }
}

/**
 * Focus trap options
 */
export interface FocusTrapOptions {
  /** Initial focus element selector */
  initialFocus?: string
  /** Callback when escape is pressed */
  onEscape?: () => void
  /** Auto-focus on mount */
  autoFocus?: boolean
}

/**
 * Hook for trapping focus within a container (for modals)
 */
export function useFocusTrap(
  containerRef: React.RefObject<HTMLElement>,
  options: FocusTrapOptions = {}
) {
  const { initialFocus, onEscape, autoFocus = true } = options
  const previousFocusRef = useRef<HTMLElement | null>(null)

  /**
   * Store previous focus and focus container on mount
   */
  useEffect(() => {
    if (!containerRef.current) return

    // Store previous focus
    previousFocusRef.current = document.activeElement as HTMLElement

    // Focus container or initial element
    if (autoFocus) {
      const initial = initialFocus 
        ? containerRef.current.querySelector<HTMLElement>(initialFocus)
        : containerRef.current.querySelector<HTMLElement>(FOCUSABLE_SELECTOR)
      
      initial?.focus()
    }

    return () => {
      // Restore previous focus
      previousFocusRef.current?.focus()
    }
  }, [containerRef, initialFocus, autoFocus])

  /**
   * Handle keyboard events
   */
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onEscape) {
        e.preventDefault()
        onEscape()
        return
      }

      if (e.key === 'Tab') {
        const focusables = getFocusableElements(container)
        if (focusables.length === 0) {
          e.preventDefault()
          return
        }

        const firstFocusable = focusables[0]
        const lastFocusable = focusables[focusables.length - 1]

        if (e.shiftKey && document.activeElement === firstFocusable) {
          e.preventDefault()
          lastFocusable.focus()
        } else if (!e.shiftKey && document.activeElement === lastFocusable) {
          e.preventDefault()
          firstFocusable.focus()
        }
      }
    }

    container.addEventListener('keydown', handleKeyDown)
    return () => container.removeEventListener('keydown', handleKeyDown)
  }, [containerRef, onEscape])

  return {
    restoreFocus: () => previousFocusRef.current?.focus(),
  }
}

/**
 * Announce message to screen readers
 */
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite') {
  const announcer = document.createElement('div')
  announcer.setAttribute('aria-live', priority)
  announcer.setAttribute('aria-atomic', 'true')
  announcer.setAttribute('aria-relevant', 'text')
  announcer.className = 'sr-only'
  announcer.style.cssText = `
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  `

  document.body.appendChild(announcer)

  // Set message after a small delay to ensure it's announced
  setTimeout(() => {
    announcer.textContent = message
  }, 100)

  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcer)
  }, 1000)

  logger.debug('Announced to screen reader', { message, priority })
}
