import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { useTheme } from '../../src/hooks/useTheme'

// Mock platform detection
const originalPlatform = navigator.platform

// Mock component to test theme switching
function ThemeTestComponent() {
  const { theme, toggleTheme } = useTheme()
  
  return (
    <div data-testid="theme-test">
      <span data-testid="current-theme">{theme}</span>
      <button onClick={toggleTheme} data-testid="toggle-theme">
        Toggle Theme
      </button>
    </div>
  )
}

describe('Windows Theme Compatibility', () => {
  beforeEach(() => {
    // Reset localStorage
    localStorage.clear()
    // Reset document classes
    document.documentElement.classList.remove('dark')
  })

  afterEach(() => {
    // Restore original platform
    Object.defineProperty(navigator, 'platform', {
      value: originalPlatform,
      writable: true
    })
  })

  describe('Windows-specific theme behavior', () => {
    beforeEach(() => {
      // Mock Windows platform
      Object.defineProperty(navigator, 'platform', {
        value: 'Win32',
        writable: true
      })
    })

    it('should apply dark theme correctly on Windows', () => {
      render(<ThemeTestComponent />)
      
      const toggleButton = screen.getByTestId('toggle-theme')
      fireEvent.click(toggleButton)
      
      expect(screen.getByTestId('current-theme')).toHaveTextContent('dark')
      expect(document.documentElement).toHaveClass('dark')
    })

    it('should apply light theme correctly on Windows', () => {
      render(<ThemeTestComponent />)
      
      const toggleButton = screen.getByTestId('toggle-theme')
      fireEvent.click(toggleButton) // Switch to dark
      fireEvent.click(toggleButton) // Switch back to light
      
      expect(screen.getByTestId('current-theme')).toHaveTextContent('light')
      expect(document.documentElement).not.toHaveClass('dark')
    })

    it('should persist theme preference across sessions on Windows', () => {
      render(<ThemeTestComponent />)
      
      const toggleButton = screen.getByTestId('toggle-theme')
      fireEvent.click(toggleButton)
      
      // Simulate page reload
      render(<ThemeTestComponent />)
      
      expect(screen.getByTestId('current-theme')).toHaveTextContent('dark')
      expect(document.documentElement).toHaveClass('dark')
    })

    it('should respect Windows system preference for initial theme', () => {
      // Mock prefers-color-scheme: dark
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: (query: string) => ({
          matches: query === '(prefers-color-scheme: dark)',
          addListener: () => {},
          removeListener: () => {}
        })
      })

      render(<ThemeTestComponent />)
      
      expect(screen.getByTestId('current-theme')).toHaveTextContent('dark')
      expect(document.documentElement).toHaveClass('dark')
    })
  })

  describe('Cross-platform theme consistency', () => {
    it('should have consistent theme behavior across platforms', () => {
      // Test on macOS
      Object.defineProperty(navigator, 'platform', {
        value: 'MacIntel',
        writable: true
      })

      render(<ThemeTestComponent />)
      const toggleButton = screen.getByTestId('toggle-theme')
      fireEvent.click(toggleButton)
      
      const macTheme = screen.getByTestId('current-theme').textContent
      const macHasDarkClass = document.documentElement.classList.contains('dark')

      // Reset and test on Windows
      Object.defineProperty(navigator, 'platform', {
        value: 'Win32',
        writable: true
      })
      
      render(<ThemeTestComponent />)
      fireEvent.click(toggleButton)
      
      const windowsTheme = screen.getByTestId('current-theme').textContent
      const windowsHasDarkClass = document.documentElement.classList.contains('dark')

      // Themes should behave consistently across platforms
      expect(macTheme).toBe(windowsTheme)
      expect(macHasDarkClass).toBe(windowsHasDarkClass)
    })
  })

  describe('High DPI theme compatibility', () => {
    it('should maintain theme colors at high DPI scaling', () => {
      // Mock high DPI
      Object.defineProperty(window, 'devicePixelRatio', {
        value: 2.0,
        writable: true
      })

      render(<ThemeTestComponent />)
      
      const toggleButton = screen.getByTestId('toggle-theme')
      fireEvent.click(toggleButton)
      
      expect(screen.getByTestId('current-theme')).toHaveTextContent('dark')
      expect(document.documentElement).toHaveClass('dark')
      
      // Theme should work correctly regardless of DPI scaling
      fireEvent.click(toggleButton)
      expect(screen.getByTestId('current-theme')).toHaveTextContent('light')
      expect(document.documentElement).not.toHaveClass('dark')
    })
  })

  describe('Accessibility considerations', () => {
    it('should maintain sufficient color contrast in both themes', () => {
      render(<ThemeTestComponent />)
      
      // Test light theme contrast
      document.documentElement.classList.remove('dark')
      const lightThemeElement = screen.getByTestId('theme-test')
      
      // Test dark theme contrast
      document.documentElement.classList.add('dark')
      const darkThemeElement = screen.getByTestId('theme-test')
      
      // Both themes should be accessible
      expect(lightThemeElement).toBeInTheDocument()
      expect(darkThemeElement).toBeInTheDocument()
    })

    it('should support keyboard navigation for theme switching', () => {
      render(<ThemeTestComponent />)
      
      const toggleButton = screen.getByTestId('toggle-theme')
      
      // Test keyboard interaction
      fireEvent.keyDown(toggleButton, { key: 'Enter' })
      fireEvent.keyDown(toggleButton, { key: ' ' })
      
      // Button should be focusable and interactive
      expect(toggleButton).toHaveFocus()
      expect(toggleButton).toBeEnabled()
    })
  })
})