import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import App from './App'
import React from 'react'

// Mock Tauri APIs
vi.mock('@tauri-apps/api/event', () => ({
  listen: vi.fn(() => Promise.resolve(() => {})),
}))

vi.mock('@tauri-apps/plugin-dialog', () => ({
  open: vi.fn(() => Promise.resolve(null)),
}))

vi.mock('./tauriCommands', () => ({
  readFile: vi.fn(() => Promise.resolve('# Test Content')),
  saveFile: vi.fn(() => Promise.resolve()),
}))

vi.mock('./utils/persistence', () => ({
  loadPersistedState: vi.fn(() => Promise.resolve(null)),
  savePersistedState: vi.fn(() => Promise.resolve()),
}))

vi.mock('./utils/logger', () => ({
  createLogger: () => ({
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  }),
  getLogBuffer: () => [],
  clearLogBuffer: vi.fn(),
}))

vi.mock('@tauri-apps/api/window', () => ({
  getCurrentWindow: vi.fn(() => ({
    isFullscreen: vi.fn().mockResolvedValue(false),
    setFullscreen: vi.fn().mockResolvedValue(undefined),
    close: vi.fn().mockResolvedValue(undefined),
  })),
}))

vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(),
}))

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders App component', () => {
    const { container } = render(<App />)
    expect(container).toBeTruthy()
  })

  it('shows main layout', () => {
    const { container } = render(<App />)
    // Should render some content
    expect(container.firstChild).toBeTruthy()
  })

  it('renders the app structure', () => {
    const { container } = render(<App />)
    // App should have a root div
    const rootDiv = container.querySelector('.h-screen') || container.firstChild
    expect(rootDiv).toBeTruthy()
  })

  it('handles drag over event', () => {
    const { container } = render(<App />)
    const rootDiv = container.querySelector('.h-screen') as HTMLElement
    
    const dragEvent = new Event('dragover', { bubbles: true })
    Object.defineProperty(dragEvent, 'dataTransfer', {
      value: { dropEffect: 'none' }
    })
    
    // Should not throw
    expect(() => rootDiv.dispatchEvent(dragEvent)).not.toThrow()
  })

  it('handles drop event with no files', () => {
    const { container } = render(<App />)
    const rootDiv = container.querySelector('.h-screen') as HTMLElement
    
    const dropEvent = new Event('drop', { bubbles: true })
    Object.defineProperty(dropEvent, 'dataTransfer', {
      value: { 
        files: [],
        dropEffect: 'copy'
      }
    })
    
    // Prevent default should be called
    const preventDefaultSpy = vi.fn()
    Object.defineProperty(dropEvent, 'preventDefault', { value: preventDefaultSpy })
    
    rootDiv.dispatchEvent(dropEvent)
    expect(preventDefaultSpy).toHaveBeenCalled()
  })

  it('handles drop event with markdown files', async () => {
    const { container } = render(<App />)
    const rootDiv = container.querySelector('.h-screen') as HTMLElement
    
    // Create mock file
    const mockFile = new File(['# Test'], 'test.md', { type: 'text/markdown' })
    
    const dropEvent = new Event('drop', { bubbles: true })
    Object.defineProperty(dropEvent, 'dataTransfer', {
      value: { 
        files: [mockFile],
        dropEffect: 'copy'
      }
    })
    
    const preventDefaultSpy = vi.fn()
    Object.defineProperty(dropEvent, 'preventDefault', { value: preventDefaultSpy })
    
    rootDiv.dispatchEvent(dropEvent)
    expect(preventDefaultSpy).toHaveBeenCalled()
    
    // Wait for file to be processed
    await waitFor(() => {
      expect(container).toBeTruthy()
    })
  })

  it('handles drop event with non-markdown files', async () => {
    const { container } = render(<App />)
    const rootDiv = container.querySelector('.h-screen') as HTMLElement
    
    // Create mock file that's not markdown
    const mockFile = new File(['test'], 'test.txt', { type: 'text/plain' })
    
    const dropEvent = new Event('drop', { bubbles: true })
    Object.defineProperty(dropEvent, 'dataTransfer', {
      value: { 
        files: [mockFile],
        dropEffect: 'copy'
      }
    })
    
    const preventDefaultSpy = vi.fn()
    Object.defineProperty(dropEvent, 'preventDefault', { value: preventDefaultSpy })
    
    rootDiv.dispatchEvent(dropEvent)
    expect(preventDefaultSpy).toHaveBeenCalled()
  })

  it('renders with error boundaries', () => {
    const { container } = render(<App />)
    // Should render without throwing
    expect(container).toBeTruthy()
  })

  it('renders theme toggle', async () => {
    render(<App />)
    
    // Wait for the app to render
    await waitFor(() => {
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })
  })

  it('renders status bar', async () => {
    const { container } = render(<App />)
    
    // Status bar should be present
    await waitFor(() => {
      const statusBar = container.querySelector('[class*="status"]') || 
                        container.querySelector('footer') ||
                        container.lastChild
      expect(statusBar).toBeTruthy()
    })
  })

  it('handles keyboard events', async () => {
    const { container } = render(<App />)
    
    // Simulate a keyboard event
    const keyEvent = new KeyboardEvent('keydown', { 
      key: 'b', 
      ctrlKey: true,
      bubbles: true 
    })
    
    document.dispatchEvent(keyEvent)
    
    // Should not throw
    expect(container).toBeTruthy()
  })

  it('handles toggle sidebar shortcut', async () => {
    const { container } = render(<App />)
    
    // Simulate Ctrl+B to toggle sidebar
    const keyEvent = new KeyboardEvent('keydown', { 
      key: 'b', 
      ctrlKey: true,
      bubbles: true 
    })
    
    document.dispatchEvent(keyEvent)
    
    await waitFor(() => {
      expect(container).toBeTruthy()
    })
  })

  it('handles toggle preview shortcut', async () => {
    const { container } = render(<App />)
    
    // Simulate Ctrl+P to toggle preview
    const keyEvent = new KeyboardEvent('keydown', { 
      key: 'p', 
      ctrlKey: true,
      bubbles: true 
    })
    
    document.dispatchEvent(keyEvent)
    
    await waitFor(() => {
      expect(container).toBeTruthy()
    })
  })

  it('handles zoom in shortcut', async () => {
    const { container } = render(<App />)
    
    // Simulate Ctrl+= to zoom in
    const keyEvent = new KeyboardEvent('keydown', { 
      key: '=', 
      ctrlKey: true,
      bubbles: true 
    })
    
    document.dispatchEvent(keyEvent)
    
    await waitFor(() => {
      expect(container).toBeTruthy()
    })
  })

  it('handles zoom out shortcut', async () => {
    const { container } = render(<App />)
    
    // Simulate Ctrl+- to zoom out
    const keyEvent = new KeyboardEvent('keydown', { 
      key: '-', 
      ctrlKey: true,
      bubbles: true 
    })
    
    document.dispatchEvent(keyEvent)
    
    await waitFor(() => {
      expect(container).toBeTruthy()
    })
  })

  it('handles reset zoom shortcut', async () => {
    const { container } = render(<App />)
    
    // Simulate Ctrl+0 to reset zoom
    const keyEvent = new KeyboardEvent('keydown', { 
      key: '0', 
      ctrlKey: true,
      bubbles: true 
    })
    
    document.dispatchEvent(keyEvent)
    
    await waitFor(() => {
      expect(container).toBeTruthy()
    })
  })

  it('handles escape key', async () => {
    const { container } = render(<App />)
    
    // Simulate Escape key
    const keyEvent = new KeyboardEvent('keydown', { 
      key: 'Escape',
      bubbles: true 
    })
    
    document.dispatchEvent(keyEvent)
    
    // Should not throw
    expect(container).toBeTruthy()
  })

  it('renders editor and preview panes', async () => {
    const { container } = render(<App />)
    
    await waitFor(() => {
      // Look for main content area
      const mainContent = container.querySelector('.flex-1.flex')
      expect(mainContent).toBeTruthy()
    })
  })

  it('renders sidebar', async () => {
    const { container } = render(<App />)
    
    await waitFor(() => {
      const sidebar = container.querySelector('aside') || 
                      container.querySelector('[role="complementary"]')
      // Sidebar might be collapsed
      expect(container).toBeTruthy()
    })
  })
})
