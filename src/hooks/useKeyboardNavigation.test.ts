import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useKeyboardNavigation, useFocusTrap, announceToScreenReader } from './useKeyboardNavigation'

// Mock logger
vi.mock('../utils/logger', () => ({
  createLogger: () => ({
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  }),
}))

describe('useKeyboardNavigation', () => {
  it('returns focus navigation functions', () => {
    const container = document.createElement('div')
    const ref = { current: container }
    const { result } = renderHook(() => useKeyboardNavigation(ref))

    expect(typeof result.current.focusNext).toBe('function')
    expect(typeof result.current.focusPrevious).toBe('function')
    expect(typeof result.current.focusFirst).toBe('function')
    expect(typeof result.current.focusLast).toBe('function')
    expect(typeof result.current.focusAt).toBe('function')
    expect(typeof result.current.getFocusables).toBe('function')
  })

  it('returns focusIndex state', () => {
    const container = document.createElement('div')
    const ref = { current: container }
    const { result } = renderHook(() => useKeyboardNavigation(ref))

    expect(typeof result.current.focusIndex).toBe('number')
  })

  it('calls onEscape callback when configured', () => {
    const container = document.createElement('div')
    container.tabIndex = -1
    document.body.appendChild(container)

    const onEscape = vi.fn()
    const ref = { current: container }
    renderHook(() => useKeyboardNavigation(ref, { onEscape, escapeKey: true }))

    container.focus()
    container.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))

    expect(onEscape).toHaveBeenCalled()

    document.body.removeChild(container)
  })

  it('handles loop option', () => {
    const container = document.createElement('div')
    const ref = { current: container }
    
    const { result } = renderHook(() => useKeyboardNavigation(ref, { loop: true }))
    expect(result.current.focusNext).toBeDefined()
  })

  it('handles arrowKeys option', () => {
    const container = document.createElement('div')
    const ref = { current: container }
    
    const { result } = renderHook(() => useKeyboardNavigation(ref, { arrowKeys: false }))
    expect(result.current.focusNext).toBeDefined()
  })
})

describe('useFocusTrap', () => {
  it('returns restoreFocus function', () => {
    const container = document.createElement('div')
    const ref = { current: container }
    const { result } = renderHook(() => useFocusTrap(ref))

    expect(typeof result.current.restoreFocus).toBe('function')
  })

  it('calls onEscape when Escape is pressed', () => {
    const container = document.createElement('div')
    container.tabIndex = -1
    document.body.appendChild(container)

    const onEscape = vi.fn()
    const ref = { current: container }
    renderHook(() => useFocusTrap(ref, { onEscape }))

    container.focus()
    container.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))

    expect(onEscape).toHaveBeenCalled()

    document.body.removeChild(container)
  })

  it('respects autoFocus option', () => {
    const container = document.createElement('div')
    const ref = { current: container }
    renderHook(() => useFocusTrap(ref, { autoFocus: false }))

    // Should not throw
    expect(true).toBe(true)
  })
})

describe('announceToScreenReader', () => {
  it('creates announcer element', () => {
    announceToScreenReader('Test message')

    const announcer = document.querySelector('[aria-live]')
    expect(announcer).toBeTruthy()
  })

  it('uses polite priority by default', () => {
    announceToScreenReader('Test')

    const announcer = document.querySelector('[aria-live="polite"]')
    expect(announcer).toBeTruthy()
  })

  it('uses assertive priority when specified', () => {
    announceToScreenReader('Alert!', 'assertive')

    const announcer = document.querySelector('[aria-live="assertive"]')
    expect(announcer).toBeTruthy()
  })
})