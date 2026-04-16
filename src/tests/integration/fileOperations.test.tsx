import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useState } from 'react'

// Mock Tauri APIs
const mockInvoke = vi.fn()

vi.mock('@tauri-apps/api/core', () => ({
  invoke: (cmd: string, args?: any) => mockInvoke(cmd, args),
}))

vi.mock('@tauri-apps/api/event', () => ({
  listen: () => Promise.resolve(() => {}),
}))

// Test component that simulates file operations
function FileOperationsTestComponent() {
  const [content, setContent] = useState<string>('')
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleReadFile = async () => {
    try {
      const result = await mockInvoke('read_file', { path: '/test/file.md' })
      setContent(result)
      setError(null)
    } catch (e: any) {
      setError(e.message)
    }
  }

  const handleSaveFile = async () => {
    try {
      await mockInvoke('save_file', { path: '/test/file.md', content })
      setSaved(true)
      setError(null)
    } catch (e: any) {
      setError(e.message)
    }
  }

  return (
    <div>
      <button onClick={handleReadFile} data-testid="read-btn">Read File</button>
      <button onClick={handleSaveFile} data-testid="save-btn">Save File</button>
      <textarea 
        value={content} 
        onChange={(e) => setContent(e.target.value)}
        data-testid="content-input"
      />
      {saved && <span data-testid="saved-indicator">Saved!</span>}
      {error && <span data-testid="error-message">{error}</span>}
    </div>
  )
}

describe('File Operations Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('read_file operation', () => {
    it('reads file content successfully', async () => {
      const mockContent = '# Hello World\n\nThis is a test file.'
      mockInvoke.mockResolvedValueOnce(mockContent)

      render(<FileOperationsTestComponent />)

      fireEvent.click(screen.getByTestId('read-btn'))

      await waitFor(() => {
        expect(mockInvoke).toHaveBeenCalledWith('read_file', { path: '/test/file.md' })
      })

      await waitFor(() => {
        expect(screen.getByTestId('content-input')).toHaveValue(mockContent)
      })
    })

    it('handles read errors gracefully', async () => {
      mockInvoke.mockRejectedValueOnce(new Error('File not found'))

      render(<FileOperationsTestComponent />)

      fireEvent.click(screen.getByTestId('read-btn'))

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toHaveTextContent('File not found')
      })
    })
  })

  describe('save_file operation', () => {
    it('saves file content successfully', async () => {
      mockInvoke.mockResolvedValueOnce(undefined)

      render(<FileOperationsTestComponent />)

      fireEvent.change(screen.getByTestId('content-input'), {
        target: { value: '# New Content' },
      })

      fireEvent.click(screen.getByTestId('save-btn'))

      await waitFor(() => {
        expect(mockInvoke).toHaveBeenCalledWith('save_file', {
          path: '/test/file.md',
          content: '# New Content',
        })
      })

      await waitFor(() => {
        expect(screen.getByTestId('saved-indicator')).toBeInTheDocument()
      })
    })

    it('handles save errors gracefully', async () => {
      mockInvoke.mockRejectedValueOnce(new Error('Permission denied'))

      render(<FileOperationsTestComponent />)

      fireEvent.change(screen.getByTestId('content-input'), {
        target: { value: 'test' },
      })
      fireEvent.click(screen.getByTestId('save-btn'))

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toHaveTextContent('Permission denied')
      })
    })
  })

  describe('file operation flow', () => {
    it('supports read-modify-save workflow', async () => {
      const originalContent = '# Original'
      const modifiedContent = '# Modified'
      
      mockInvoke
        .mockResolvedValueOnce(originalContent)
        .mockResolvedValueOnce(undefined)

      render(<FileOperationsTestComponent />)

      fireEvent.click(screen.getByTestId('read-btn'))
      await waitFor(() => {
        expect(screen.getByTestId('content-input')).toHaveValue(originalContent)
      })

      fireEvent.change(screen.getByTestId('content-input'), {
        target: { value: modifiedContent },
      })

      fireEvent.click(screen.getByTestId('save-btn'))
      await waitFor(() => {
        expect(mockInvoke).toHaveBeenCalledWith('save_file', {
          path: '/test/file.md',
          content: modifiedContent,
        })
      })

      await waitFor(() => {
        expect(screen.getByTestId('saved-indicator')).toBeInTheDocument()
      })
    })
  })
})
