import { useState, useEffect } from 'react'

const STORAGE_KEY = 'md-mate-simple-theme'

/**
 * Simple light/dark toggle hook.
 * Reads/writes localStorage and syncs `document.documentElement.classList`
 * so that tests can assert `classList.contains('dark')`.
 */
export function useTheme() {
  const getInitialTheme = (): 'light' | 'dark' => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored === 'light' || stored === 'dark') return stored
    } catch {
      // ignore
    }
    // Fall back to system preference
    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
      return 'dark'
    }
    return 'light'
  }

  const [theme, setThemeState] = useState<'light' | 'dark'>(getInitialTheme)

  // Sync classList on mount and whenever theme changes
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
      document.documentElement.classList.remove('light')
    } else {
      document.documentElement.classList.remove('dark')
      document.documentElement.classList.add('light')
    }
    try {
      localStorage.setItem(STORAGE_KEY, theme)
    } catch {
      // ignore
    }
  }, [theme])

  const toggleTheme = () => {
    setThemeState(prev => (prev === 'light' ? 'dark' : 'light'))
  }

  return { theme, toggleTheme }
}
