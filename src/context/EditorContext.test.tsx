import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { EditorProvider, useEditor } from './EditorContext'
import { EditorView } from '@codemirror/view'
import React from 'react'

// Create a mock EditorView
const createMockEditorView = () => {
  const view = {
    state: {
      doc: { length: 100 },
      replaceSelection: vi.fn().mockReturnValue({}),
      selection: { anchor: 0, head: 100 },
      field: vi.fn().mockReturnValue(null),
      facet: vi.fn().mockReturnValue(null),
    },
    dispatch: vi.fn(),
    focus: vi.fn(),
    dom: {
      dispatchEvent: vi.fn()
    }
  } as unknown as EditorView
  return view
}

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <EditorProvider>{children}</EditorProvider>
)

describe('EditorContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset document.execCommand mock
    document.execCommand = vi.fn().mockReturnValue(true)
    // Reset clipboard API
    Object.assign(navigator, {
      clipboard: {
        readText: vi.fn().mockResolvedValue('clipboard text'),
        writeText: vi.fn().mockResolvedValue(undefined)
      }
    })
  })

  describe('useEditor hook', () => {
    it('throws error when used outside provider', () => {
      // Suppress console.error for this test
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      expect(() => {
        renderHook(() => useEditor())
      }).toThrow('useEditor must be used within EditorProvider')
      
      spy.mockRestore()
    })

    it('provides editor context values', () => {
      const { result } = renderHook(() => useEditor(), { wrapper })
      
      expect(result.current.getEditorView).toBeDefined()
      expect(result.current.setEditorView).toBeDefined()
      expect(result.current.undo).toBeDefined()
      expect(result.current.redo).toBeDefined()
      expect(result.current.selectAll).toBeDefined()
      expect(result.current.cut).toBeDefined()
      expect(result.current.copy).toBeDefined()
      expect(result.current.paste).toBeDefined()
      expect(result.current.openSearch).toBeDefined()
      expect(result.current.openReplace).toBeDefined()
    })
  })

  describe('getEditorView / setEditorView', () => {
    it('returns null initially', () => {
      const { result } = renderHook(() => useEditor(), { wrapper })
      expect(result.current.getEditorView()).toBeNull()
    })

    it('sets and gets editor view', () => {
      const { result } = renderHook(() => useEditor(), { wrapper })
      const mockView = createMockEditorView()
      
      act(() => {
        result.current.setEditorView(mockView)
      })
      
      expect(result.current.getEditorView()).toBe(mockView)
    })

    it('can set editor view to null', () => {
      const { result } = renderHook(() => useEditor(), { wrapper })
      const mockView = createMockEditorView()
      
      act(() => {
        result.current.setEditorView(mockView)
      })
      expect(result.current.getEditorView()).toBe(mockView)
      
      act(() => {
        result.current.setEditorView(null)
      })
      expect(result.current.getEditorView()).toBeNull()
    })
  })

  describe('undo', () => {
    it('returns false when no editor view', () => {
      const { result } = renderHook(() => useEditor(), { wrapper })
      expect(result.current.undo()).toBe(false)
    })

    it('calls undo when editor view exists', () => {
      const { result } = renderHook(() => useEditor(), { wrapper })
      const mockView = createMockEditorView()
      
      act(() => {
        result.current.setEditorView(mockView)
      })
      
      // The undo function will call the undo from @codemirror/commands
      // which we've mocked through the view
      result.current.undo()
    })
  })

  describe('redo', () => {
    it('returns false when no editor view', () => {
      const { result } = renderHook(() => useEditor(), { wrapper })
      expect(result.current.redo()).toBe(false)
    })

    it('calls redo when editor view exists', () => {
      const { result } = renderHook(() => useEditor(), { wrapper })
      const mockView = createMockEditorView()
      
      act(() => {
        result.current.setEditorView(mockView)
      })
      
      result.current.redo()
    })
  })

  describe('selectAll', () => {
    it('does nothing when no editor view', () => {
      const { result } = renderHook(() => useEditor(), { wrapper })
      // Should not throw
      expect(() => result.current.selectAll()).not.toThrow()
    })

    it('selects all content when editor view exists', () => {
      const { result } = renderHook(() => useEditor(), { wrapper })
      const mockView = createMockEditorView()
      
      act(() => {
        result.current.setEditorView(mockView)
      })
      
      act(() => {
        result.current.selectAll()
      })
      
      expect(mockView.dispatch).toHaveBeenCalled()
    })
  })

  describe('cut', () => {
    it('returns false when no editor view', () => {
      const { result } = renderHook(() => useEditor(), { wrapper })
      expect(result.current.cut()).toBe(false)
    })

    it('calls document.execCommand cut when editor view exists', () => {
      const { result } = renderHook(() => useEditor(), { wrapper })
      const mockView = createMockEditorView()
      
      act(() => {
        result.current.setEditorView(mockView)
      })
      
      const returnValue = result.current.cut()
      expect(mockView.focus).toHaveBeenCalled()
      expect(document.execCommand).toHaveBeenCalledWith('cut')
      expect(returnValue).toBe(true)
    })
  })

  describe('copy', () => {
    it('returns false when no editor view', () => {
      const { result } = renderHook(() => useEditor(), { wrapper })
      expect(result.current.copy()).toBe(false)
    })

    it('calls document.execCommand copy when editor view exists', () => {
      const { result } = renderHook(() => useEditor(), { wrapper })
      const mockView = createMockEditorView()
      
      act(() => {
        result.current.setEditorView(mockView)
      })
      
      const returnValue = result.current.copy()
      expect(mockView.focus).toHaveBeenCalled()
      expect(document.execCommand).toHaveBeenCalledWith('copy')
      expect(returnValue).toBe(true)
    })
  })

  describe('paste', () => {
    it('returns false when no editor view', async () => {
      const { result } = renderHook(() => useEditor(), { wrapper })
      const returnValue = await result.current.paste()
      expect(returnValue).toBe(false)
    })

    it('reads clipboard and inserts text when editor view exists', async () => {
      const { result } = renderHook(() => useEditor(), { wrapper })
      const mockView = createMockEditorView()
      
      act(() => {
        result.current.setEditorView(mockView)
      })
      
      const returnValue = await result.current.paste()
      
      expect(mockView.focus).toHaveBeenCalled()
      expect(navigator.clipboard.readText).toHaveBeenCalled()
      expect(mockView.state.replaceSelection).toHaveBeenCalledWith('clipboard text')
      expect(mockView.dispatch).toHaveBeenCalled()
      expect(returnValue).toBe(true)
    })

    it('returns false when clipboard read fails', async () => {
      vi.mocked(navigator.clipboard.readText).mockRejectedValue(new Error('Clipboard error'))
      
      const { result } = renderHook(() => useEditor(), { wrapper })
      const mockView = createMockEditorView()
      
      act(() => {
        result.current.setEditorView(mockView)
      })
      
      const returnValue = await result.current.paste()
      expect(returnValue).toBe(false)
    })
  })

  describe('openSearch', () => {
    it('does nothing when no editor view', () => {
      const { result } = renderHook(() => useEditor(), { wrapper })
      expect(() => result.current.openSearch()).not.toThrow()
    })

    it('dispatches open-search event when editor view exists', () => {
      const { result } = renderHook(() => useEditor(), { wrapper })
      const mockView = createMockEditorView()
      
      act(() => {
        result.current.setEditorView(mockView)
      })
      
      act(() => {
        result.current.openSearch()
      })
      
      expect(mockView.dom.dispatchEvent).toHaveBeenCalled()
    })
  })

  describe('openReplace', () => {
    it('does nothing when no editor view', () => {
      const { result } = renderHook(() => useEditor(), { wrapper })
      expect(() => result.current.openReplace()).not.toThrow()
    })

    it('dispatches open-replace event when editor view exists', () => {
      const { result } = renderHook(() => useEditor(), { wrapper })
      const mockView = createMockEditorView()
      
      act(() => {
        result.current.setEditorView(mockView)
      })
      
      act(() => {
        result.current.openReplace()
      })
      
      expect(mockView.dom.dispatchEvent).toHaveBeenCalled()
    })
  })
})
