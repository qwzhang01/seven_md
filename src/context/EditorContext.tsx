import { createContext, useContext, useRef, ReactNode, useCallback } from 'react'
import { EditorView } from '@codemirror/view'
import { undo, redo } from '@codemirror/commands'

interface EditorContextType {
  // Get the current editor view
  getEditorView: () => EditorView | null
  // Set the editor view reference
  setEditorView: (view: EditorView | null) => void
  // Editor operations
  undo: () => boolean
  redo: () => boolean
  selectAll: () => void
  // Clipboard operations
  cut: () => boolean
  copy: () => boolean
  paste: () => Promise<boolean>
  // Search operations
  openSearch: () => void
  openReplace: () => void
}

const EditorContext = createContext<EditorContextType | undefined>(undefined)

export function EditorProvider({ children }: { children: ReactNode }) {
  const viewRef = useRef<EditorView | null>(null)

  const getEditorView = useCallback(() => viewRef.current, [])

  const setEditorView = useCallback((view: EditorView | null) => {
    viewRef.current = view
  }, [])

  const handleUndo = useCallback((): boolean => {
    if (!viewRef.current) return false
    return undo(viewRef.current)
  }, [])

  const handleRedo = useCallback((): boolean => {
    if (!viewRef.current) return false
    return redo(viewRef.current)
  }, [])

  const handleSelectAll = useCallback(() => {
    if (!viewRef.current) return
    const view = viewRef.current
    const doc = view.state.doc
    view.dispatch({
      selection: { anchor: 0, head: doc.length }
    })
  }, [])

  const handleCut = useCallback((): boolean => {
    if (!viewRef.current) return false
    const view = viewRef.current
    
    // Focus the editor
    view.focus()
    
    // Use browser's native cut command
    return document.execCommand('cut')
  }, [])

  const handleCopy = useCallback((): boolean => {
    if (!viewRef.current) return false
    const view = viewRef.current
    
    // Focus the editor
    view.focus()
    
    // Use browser's native copy command
    return document.execCommand('copy')
  }, [])

  const handlePaste = useCallback(async (): Promise<boolean> => {
    if (!viewRef.current) return false
    const view = viewRef.current
    
    try {
      // Focus the editor
      view.focus()
      
      // Read from clipboard
      const text = await navigator.clipboard.readText()
      
      // Insert text at current selection
      const transaction = view.state.replaceSelection(text)
      view.dispatch(transaction)
      
      return true
    } catch (error) {
      console.error('Failed to paste:', error)
      return false
    }
  }, [])

  const handleOpenSearch = useCallback(() => {
    if (!viewRef.current) return
    const view = viewRef.current
    // Dispatch custom event that search extension will handle
    view.dom.dispatchEvent(new CustomEvent('open-search', { bubbles: true }))
  }, [])

  const handleOpenReplace = useCallback(() => {
    if (!viewRef.current) return
    const view = viewRef.current
    // Dispatch custom event that search extension will handle
    view.dom.dispatchEvent(new CustomEvent('open-replace', { bubbles: true }))
  }, [])

  return (
    <EditorContext.Provider 
      value={{ 
        getEditorView, 
        setEditorView,
        undo: handleUndo, 
        redo: handleRedo,
        selectAll: handleSelectAll,
        cut: handleCut,
        copy: handleCopy,
        paste: handlePaste,
        openSearch: handleOpenSearch,
        openReplace: handleOpenReplace
      }}
    >
      {children}
    </EditorContext.Provider>
  )
}

export function useEditor() {
  const context = useContext(EditorContext)
  if (context === undefined) {
    throw new Error('useEditor must be used within EditorProvider')
  }
  return context
}
