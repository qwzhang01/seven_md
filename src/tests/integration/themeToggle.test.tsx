import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import React, { useState } from 'react'

// Test component that simulates theme toggle
function ThemeToggleTestComponent() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [isSystemTheme, setIsSystemTheme] = useState(false)

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }

  const useSystemTheme = () => {
    setIsSystemTheme(true)
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    setTheme(isDark ? 'dark' : 'light')
  }

  return (
    <div className={theme === 'dark' ? 'dark-theme' : 'light-theme'}>
      <span data-testid="theme-indicator">{theme}</span>
      <span data-testid="system-theme-indicator">{isSystemTheme.toString()}</span>
      <button onClick={toggleTheme} data-testid="toggle-btn">Toggle Theme</button>
      <button onClick={useSystemTheme} data-testid="system-btn">Use System Theme</button>
    </div>
  )
}

describe('Theme Toggle Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    document.documentElement.className = ''
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('starts with light theme by default', () => {
    render(<ThemeToggleTestComponent />)
    
    expect(screen.getByTestId('theme-indicator')).toHaveTextContent('light')
  })

  it('toggles from light to dark', () => {
    render(<ThemeToggleTestComponent />)
    
    fireEvent.click(screen.getByTestId('toggle-btn'))
    
    expect(screen.getByTestId('theme-indicator')).toHaveTextContent('dark')
  })

  it('toggles from dark back to light', () => {
    render(<ThemeToggleTestComponent />)
    
    fireEvent.click(screen.getByTestId('toggle-btn'))
    expect(screen.getByTestId('theme-indicator')).toHaveTextContent('dark')
    
    fireEvent.click(screen.getByTestId('toggle-btn'))
    expect(screen.getByTestId('theme-indicator')).toHaveTextContent('light')
  })

  it('uses system theme when requested (dark)', () => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query === '(prefers-color-scheme: dark)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))

    render(<ThemeToggleTestComponent />)
    
    fireEvent.click(screen.getByTestId('system-btn'))
    
    expect(screen.getByTestId('theme-indicator')).toHaveTextContent('dark')
    expect(screen.getByTestId('system-theme-indicator')).toHaveTextContent('true')
  })

  it('uses system theme when preference is light', () => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query !== '(prefers-color-scheme: dark)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))

    render(<ThemeToggleTestComponent />)
    
    fireEvent.click(screen.getByTestId('system-btn'))
    
    expect(screen.getByTestId('theme-indicator')).toHaveTextContent('light')
  })
})
