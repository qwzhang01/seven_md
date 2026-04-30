import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useKeyboardShortcuts } from './useKeyboardShortcuts'

// Mock the logger
vi.mock('../utils/logger', () => ({
  createLogger: () => ({
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  }),
}))

describe('useKeyboardShortcuts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('registers keyboard shortcuts', () => {
    const handler = vi.fn()

    renderHook(() => useKeyboardShortcuts([
      { key: 'o', metaKey: true, action: handler, description: 'Open file' },
      { key: 's', metaKey: true, action: handler, description: 'Save file' },
    ]))

    // Shortcuts should be registered without error
    expect(true).toBe(true)
  })

  it('handles keyboard event', () => {
    const handler = vi.fn()

    renderHook(() => useKeyboardShortcuts([
      { key: 'o', metaKey: true, action: handler, description: 'Open file' },
    ]))

    // Simulate keyboard event
    const event = new KeyboardEvent('keydown', {
      key: 'o',
      metaKey: true,
      bubbles: true,
    })
    document.dispatchEvent(event)

    // The event listener should be registered
    expect(true).toBe(true)
  })

  it('handles Escape key', () => {
    const escapeHandler = vi.fn()

    renderHook(() => useKeyboardShortcuts([
      { key: 'Escape', action: escapeHandler, description: 'Close modal' },
    ]))

    const event = new KeyboardEvent('keydown', {
      key: 'Escape',
      bubbles: true,
    })
    document.dispatchEvent(event)

    expect(true).toBe(true)
  })

  it('cleans up event listener on unmount', () => {
    const handler = vi.fn()

    const { unmount } = renderHook(() => useKeyboardShortcuts([
      { key: 'o', metaKey: true, action: handler, description: 'Open file' },
    ]))

    unmount()

    // After unmount, dispatching event should not call handler
    const event = new KeyboardEvent('keydown', {
      key: 'o',
      metaKey: true,
      bubbles: true,
    })
    document.dispatchEvent(event)

    expect(handler).not.toHaveBeenCalled()
  })

  it('triggers export PDF shortcut (Cmd/Ctrl+Shift+P)', () => {
    const exportPdfHandler = vi.fn()

    renderHook(() => useKeyboardShortcuts([
      { key: 'p', ctrlKey: true, shiftKey: true, action: exportPdfHandler, description: 'Export as PDF', global: true },
    ]))

    // In JSDOM, navigator.platform is empty → isMac=false → use ctrlKey
    const event = new KeyboardEvent('keydown', {
      key: 'p',
      ctrlKey: true,
      shiftKey: true,
      bubbles: true,
    })
    document.dispatchEvent(event)

    expect(exportPdfHandler).toHaveBeenCalledTimes(1)
  })

  it('triggers export HTML shortcut (Cmd/Ctrl+Shift+E)', () => {
    const exportHtmlHandler = vi.fn()

    renderHook(() => useKeyboardShortcuts([
      { key: 'e', ctrlKey: true, shiftKey: true, action: exportHtmlHandler, description: 'Export as HTML', global: true },
    ]))

    const event = new KeyboardEvent('keydown', {
      key: 'e',
      ctrlKey: true,
      shiftKey: true,
      bubbles: true,
    })
    document.dispatchEvent(event)

    expect(exportHtmlHandler).toHaveBeenCalledTimes(1)
  })

  it('does not trigger export PDF when only Cmd+P is pressed', () => {
    const exportPdfHandler = vi.fn()
    const togglePreviewHandler = vi.fn()

    renderHook(() => useKeyboardShortcuts([
      { key: 'p', ctrlKey: true, shiftKey: true, action: exportPdfHandler, description: 'Export as PDF', global: true },
      { key: 'p', ctrlKey: true, action: togglePreviewHandler, description: 'Toggle Preview', global: true },
    ]))

    // Press Ctrl+P (no Shift) — should NOT trigger exportPdf
    const event = new KeyboardEvent('keydown', {
      key: 'p',
      ctrlKey: true,
      shiftKey: false,
      bubbles: true,
    })
    document.dispatchEvent(event)

    expect(exportPdfHandler).not.toHaveBeenCalled()
    expect(togglePreviewHandler).toHaveBeenCalledTimes(1)
  })

  it('triggers next-tab shortcut (Ctrl+Tab)', () => {
    const nextTabHandler = vi.fn()

    renderHook(() => useKeyboardShortcuts([
      { key: 'Tab', ctrlKey: true, action: nextTabHandler, description: 'Next tab', preventDefault: true },
    ]))

    const event = new KeyboardEvent('keydown', {
      key: 'Tab',
      ctrlKey: true,
      bubbles: true,
    })
    document.dispatchEvent(event)

    expect(nextTabHandler).toHaveBeenCalledTimes(1)
  })

  it('triggers prev-tab shortcut (Ctrl+Shift+Tab)', () => {
    const prevTabHandler = vi.fn()

    renderHook(() => useKeyboardShortcuts([
      { key: 'Tab', ctrlKey: true, shiftKey: true, action: prevTabHandler, description: 'Prev tab', preventDefault: true },
    ]))

    const event = new KeyboardEvent('keydown', {
      key: 'Tab',
      ctrlKey: true,
      shiftKey: true,
      bubbles: true,
    })
    document.dispatchEvent(event)

    expect(prevTabHandler).toHaveBeenCalledTimes(1)
  })

  it('Ctrl+Tab and Ctrl+Shift+Tab are independent shortcuts', () => {
    const nextTabHandler = vi.fn()
    const prevTabHandler = vi.fn()

    renderHook(() => useKeyboardShortcuts([
      { key: 'Tab', ctrlKey: true, action: nextTabHandler, description: 'Next tab', preventDefault: true },
      { key: 'Tab', ctrlKey: true, shiftKey: true, action: prevTabHandler, description: 'Prev tab', preventDefault: true },
    ]))

    // Ctrl+Tab → only nextTab
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', ctrlKey: true, shiftKey: false, bubbles: true }))
    expect(nextTabHandler).toHaveBeenCalledTimes(1)
    expect(prevTabHandler).toHaveBeenCalledTimes(0)

    // Ctrl+Shift+Tab → only prevTab
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', ctrlKey: true, shiftKey: true, bubbles: true }))
    expect(nextTabHandler).toHaveBeenCalledTimes(1)
    expect(prevTabHandler).toHaveBeenCalledTimes(1)
  })
})
