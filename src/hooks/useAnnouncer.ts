import { useCallback, useRef } from 'react'

/**
 * ARIA live region announcer for screen reader accessibility
 * Provides methods to announce messages for different states
 */
export function useAnnouncer() {
  const announcerRef = useRef<HTMLDivElement | null>(null)

  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (!announcerRef.current) {
      // Create announcer element if it doesn't exist
      const announcer = document.createElement('div')
      announcer.setAttribute('role', 'status')
      announcer.setAttribute('aria-live', priority)
      announcer.setAttribute('aria-atomic', 'true')
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
      announcerRef.current = announcer
    }

    // Clear previous message
    announcerRef.current.textContent = ''
    
    // Set new message after a brief delay to ensure screen readers pick it up
    setTimeout(() => {
      if (announcerRef.current) {
        announcerRef.current.textContent = message
      }
    }, 100)
  }, [])

  const announceLoading = useCallback((message: string = 'Loading, please wait...') => {
    announce(message, 'polite')
  }, [announce])

  const announceSuccess = useCallback((message: string) => {
    announce(message, 'polite')
  }, [announce])

  const announceError = useCallback((message: string) => {
    announce(message, 'assertive')
  }, [announce])

  const announceInfo = useCallback((message: string) => {
    announce(message, 'polite')
  }, [announce])

  return {
    announce,
    announceLoading,
    announceSuccess,
    announceError,
    announceInfo,
  }
}
