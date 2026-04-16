/**
 * Focus management utilities for accessibility
 * Provides functions to manage focus order, trap focus, and restore focus
 */

/**
 * Get all focusable elements within a container
 */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const elements = container.querySelectorAll<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  )
  
  return Array.from(elements).filter(el => {
    return !el.hasAttribute('disabled') && 
           el.offsetParent !== null && 
           el.getAttribute('aria-hidden') !== 'true'
  })
}

/**
 * Trap focus within a container (for modals, dialogs, etc.)
 */
export function trapFocus(container: HTMLElement): () => void {
  const focusableElements = getFocusableElements(container)
  const firstElement = focusableElements[0]
  const lastElement = focusableElements[focusableElements.length - 1]

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key !== 'Tab') return

    if (e.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        e.preventDefault()
        lastElement?.focus()
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        e.preventDefault()
        firstElement?.focus()
      }
    }
  }

  container.addEventListener('keydown', handleKeyDown)
  
  // Focus first element
  firstElement?.focus()

  // Return cleanup function
  return () => {
    container.removeEventListener('keydown', handleKeyDown)
  }
}

/**
 * Store and restore focus (for modals, dialogs, etc.)
 */
export class FocusManager {
  private previouslyFocusedElement: HTMLElement | null = null

  /**
   * Store the currently focused element
   */
  storeFocus(): void {
    this.previouslyFocusedElement = document.activeElement as HTMLElement
  }

  /**
   * Restore focus to the previously stored element
   */
  restoreFocus(): void {
    if (this.previouslyFocusedElement && this.previouslyFocusedElement.focus) {
      this.previouslyFocusedElement.focus()
    }
  }

  /**
   * Get the previously stored element
   */
  getStoredElement(): HTMLElement | null {
    return this.previouslyFocusedElement
  }
}

/**
 * Focus a specific element with proper scrolling
 */
export function focusElement(element: HTMLElement): void {
  element.focus()
  element.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
}

/**
 * Move focus to the next focusable element
 */
export function focusNext(container: HTMLElement): void {
  const focusable = getFocusableElements(container)
  const currentIndex = focusable.findIndex(el => el === document.activeElement)
  
  if (currentIndex < focusable.length - 1) {
    focusable[currentIndex + 1]?.focus()
  }
}

/**
 * Move focus to the previous focusable element
 */
export function focusPrevious(container: HTMLElement): void {
  const focusable = getFocusableElements(container)
  const currentIndex = focusable.findIndex(el => el === document.activeElement)
  
  if (currentIndex > 0) {
    focusable[currentIndex - 1]?.focus()
  }
}
