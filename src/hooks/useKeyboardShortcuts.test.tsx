import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useKeyboardShortcuts, formatShortcut, isMacOS, getModifierKey } from './useKeyboardShortcuts'
import { AppProvider } from '../context/AppContext'
import React from 'react'

// Mock logger
vi.mock('../utils/logger', () => ({
  createLogger: () => ({
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  }),
}))

// Mock Tauri dialog
vi.mock('@tauri-apps/plugin-dialog', () => ({
  open: vi.fn(),
  save: vi.fn(),
}))

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AppProvider>{children}</AppProvider>
)

describe('useKeyboardShortcuts', () => {
  let savedPlatform: string
  
  beforeEach(() => {
    vi.clearAllMocks()
    savedPlatform = navigator.platform
  })
  
  afterEach(() => {
    Object.defineProperty(navigator, 'platform', {
      value: savedPlatform,
      configurable: true,
    })
  })

  it('handles empty shortcuts array', () => {
    const { result } = renderHook(() => useKeyboardShortcuts([]), { wrapper })
    expect(result.current).toBeUndefined()
  })

  it('handles shortcuts with actions', () => {
    const mockAction = vi.fn()
    const shortcuts = [
      {
        key: 's',
        ctrlKey: true,
        action: mockAction,
        description: 'Save file'
      }
    ]
    
    const { result } = renderHook(() => useKeyboardShortcuts(shortcuts), { wrapper })
    expect(result.current).toBeUndefined()
  })

  it('triggers shortcut action on keydown', async () => {
    const mockAction = vi.fn()
    const shortcuts = [
      {
        key: 's',
        ctrlKey: true,
        action: mockAction,
        description: 'Save file'
      }
    ]
    
    renderHook(() => useKeyboardShortcuts(shortcuts), { wrapper })
    
    // Simulate keydown event
    const event = new KeyboardEvent('keydown', {
      key: 's',
      ctrlKey: true,
      bubbles: true
    })
    
    document.dispatchEvent(event)
    
    expect(mockAction).toHaveBeenCalled()
  })

  it('does not trigger when modifiers do not match', async () => {
    const mockAction = vi.fn()
    const shortcuts = [
      {
        key: 's',
        ctrlKey: true,
        action: mockAction,
        description: 'Save file'
      }
    ]
    
    renderHook(() => useKeyboardShortcuts(shortcuts), { wrapper })
    
    // Simulate keydown event without ctrl
    const event = new KeyboardEvent('keydown', {
      key: 's',
      ctrlKey: false,
      bubbles: true
    })
    
    document.dispatchEvent(event)
    
    expect(mockAction).not.toHaveBeenCalled()
  })

  it('handles shift key modifier', async () => {
    const mockAction = vi.fn()
    const shortcuts = [
      {
        key: 'S',
        shiftKey: true,
        action: mockAction,
        description: 'Save as'
      }
    ]
    
    renderHook(() => useKeyboardShortcuts(shortcuts), { wrapper })
    
    const event = new KeyboardEvent('keydown', {
      key: 'S',
      shiftKey: true,
      bubbles: true
    })
    
    document.dispatchEvent(event)
    
    expect(mockAction).toHaveBeenCalled()
  })

  it('handles alt key modifier', async () => {
    const mockAction = vi.fn()
    const shortcuts = [
      {
        key: 'f',
        altKey: true,
        action: mockAction,
        description: 'Find in files'
      }
    ]
    
    renderHook(() => useKeyboardShortcuts(shortcuts), { wrapper })
    
    const event = new KeyboardEvent('keydown', {
      key: 'f',
      altKey: true,
      bubbles: true
    })
    
    document.dispatchEvent(event)
    
    expect(mockAction).toHaveBeenCalled()
  })

  it('calls preventDefault by default', async () => {
    const mockAction = vi.fn()
    const shortcuts = [
      {
        key: 's',
        ctrlKey: true,
        action: mockAction,
        description: 'Save file'
      }
    ]
    
    renderHook(() => useKeyboardShortcuts(shortcuts), { wrapper })
    
    const event = new KeyboardEvent('keydown', {
      key: 's',
      ctrlKey: true,
      bubbles: true,
      cancelable: true
    })
    
    const preventDefaultSpy = vi.spyOn(event, 'preventDefault')
    document.dispatchEvent(event)
    
    expect(preventDefaultSpy).toHaveBeenCalled()
  })

  it('skips preventDefault when configured', async () => {
    const mockAction = vi.fn()
    const shortcuts = [
      {
        key: 's',
        ctrlKey: true,
        action: mockAction,
        description: 'Save file',
        preventDefault: false
      }
    ]
    
    renderHook(() => useKeyboardShortcuts(shortcuts), { wrapper })
    
    const event = new KeyboardEvent('keydown', {
      key: 's',
      ctrlKey: true,
      bubbles: true,
      cancelable: true
    })
    
    const preventDefaultSpy = vi.spyOn(event, 'preventDefault')
    document.dispatchEvent(event)
    
    expect(preventDefaultSpy).not.toHaveBeenCalled()
  })
})

describe('formatShortcut', () => {
  it('formats simple key on non-Mac', () => {
    Object.defineProperty(navigator, 'platform', {
      value: 'Win32',
      configurable: true,
    })
    
    expect(formatShortcut('A')).toBe('A')
  })

  it('formats Ctrl shortcut on non-Mac', () => {
    Object.defineProperty(navigator, 'platform', {
      value: 'Win32',
      configurable: true,
    })
    
    expect(formatShortcut('s', { ctrl: true })).toBe('Ctrl+S')
  })

  it('formats Shift shortcut on non-Mac', () => {
    Object.defineProperty(navigator, 'platform', {
      value: 'Win32',
      configurable: true,
    })
    
    expect(formatShortcut('Tab', { shift: true })).toBe('Shift+Tab')
  })

  it('formats Ctrl+Shift shortcut on non-Mac', () => {
    Object.defineProperty(navigator, 'platform', {
      value: 'Win32',
      configurable: true,
    })
    
    expect(formatShortcut('S', { ctrl: true, shift: true })).toBe('Ctrl+Shift+S')
  })

  it('formats shortcut on Mac', () => {
    Object.defineProperty(navigator, 'platform', {
      value: 'MacIntel',
      configurable: true,
    })
    
    expect(formatShortcut('s', { ctrl: true })).toBe('⌘S')
  })

  it('formats Alt shortcut on Mac', () => {
    Object.defineProperty(navigator, 'platform', {
      value: 'MacIntel',
      configurable: true,
    })
    
    expect(formatShortcut('f', { alt: true })).toBe('⌥F')
  })
})

describe('isMacOS', () => {
  it('returns true on Mac platform', () => {
    Object.defineProperty(navigator, 'platform', {
      value: 'MacIntel',
      configurable: true,
    })
    
    expect(isMacOS()).toBe(true)
  })

  it('returns false on non-Mac platform', () => {
    Object.defineProperty(navigator, 'platform', {
      value: 'Win32',
      configurable: true,
    })
    
    expect(isMacOS()).toBe(false)
  })
})

describe('getModifierKey', () => {
  it('returns ⌘ on Mac', () => {
    Object.defineProperty(navigator, 'platform', {
      value: 'MacIntel',
      configurable: true,
    })
    
    expect(getModifierKey()).toBe('⌘')
  })

  it('returns Ctrl on non-Mac', () => {
    Object.defineProperty(navigator, 'platform', {
      value: 'Win32',
      configurable: true,
    })
    
    expect(getModifierKey()).toBe('Ctrl')
  })
})
