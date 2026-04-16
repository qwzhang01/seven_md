import { useEffect, useRef, useCallback, useState } from 'react'
import { EditorState } from '@codemirror/state'
import { EditorView, lineNumbers, highlightActiveLine, highlightActiveLineGutter } from '@codemirror/view'
import { markdown, markdownLanguage } from '@codemirror/lang-markdown'
import { languages } from '@codemirror/language-data'
import { syntaxHighlighting, HighlightStyle } from '@codemirror/language'
import { useAppState } from '../../context/AppContext'
import { useEditor } from '../../context/EditorContext'
import { tags } from '@lezer/highlight'

// Dark theme highlight style
const darkHighlightStyle = HighlightStyle.define([
  { tag: tags.heading1, fontWeight: 'bold', fontSize: '1.6em', color: '#e2e8f0' },
  { tag: tags.heading2, fontWeight: 'bold', fontSize: '1.4em', color: '#e2e8f0' },
  { tag: tags.heading3, fontWeight: 'bold', fontSize: '1.2em', color: '#e2e8f0' },
  { tag: tags.heading4, fontWeight: 'bold', fontSize: '1.1em', color: '#e2e8f0' },
  { tag: tags.strong, fontWeight: 'bold' },
  { tag: tags.emphasis, fontStyle: 'italic' },
  { tag: tags.strikethrough, textDecoration: 'line-through' },
  { tag: tags.link, color: '#6cb6ff' },
  { tag: tags.url, color: '#6cb6ff' },
  { tag: tags.monospace, fontFamily: 'monospace', backgroundColor: 'rgba(255,255,255,0.1)' },
  { tag: tags.quote, color: '#8b949e' },
  { tag: tags.list, color: '#f0883e' },
  { tag: tags.meta, color: '#79c0ff' },
  { tag: tags.processingInstruction, color: '#79c0ff' },
])

// Light theme highlight style
const lightHighlightStyle = HighlightStyle.define([
  { tag: tags.heading1, fontWeight: 'bold', fontSize: '1.6em', color: '#1a1a1a' },
  { tag: tags.heading2, fontWeight: 'bold', fontSize: '1.4em', color: '#1a1a1a' },
  { tag: tags.heading3, fontWeight: 'bold', fontSize: '1.2em', color: '#1a1a1a' },
  { tag: tags.heading4, fontWeight: 'bold', fontSize: '1.1em', color: '#1a1a1a' },
  { tag: tags.strong, fontWeight: 'bold' },
  { tag: tags.emphasis, fontStyle: 'italic' },
  { tag: tags.strikethrough, textDecoration: 'line-through' },
  { tag: tags.link, color: '#0066cc' },
  { tag: tags.url, color: '#0066cc' },
  { tag: tags.monospace, fontFamily: 'monospace', backgroundColor: 'rgba(0,0,0,0.05)' },
  { tag: tags.quote, color: '#666' },
  { tag: tags.list, color: '#d73a49' },
  { tag: tags.meta, color: '#666' },
  { tag: tags.processingInstruction, color: '#666' },
])

// Debounce utility
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

interface CodeMirrorEditorProps {
  className?: string
}

export function CodeMirrorEditor({ className = '' }: CodeMirrorEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)
  const { state, dispatch } = useAppState()
  const { setEditorView } = useEditor()
  const isExternalUpdate = useRef(false)
  const zoomLevel = state.ui.zoomLevel

  // Read theme directly from DOM class to avoid AppContext sync issues
  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains('dark')
  )

  // Watch DOM for dark class changes
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'))
    })
    observer.observe(document.documentElement, { attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  // Derive active tab
  const activeTab = state.tabs.tabs.find(t => t.id === state.tabs.activeTabId) ?? null
  const activeContent = activeTab?.content ?? ''
  const activeTabId = state.tabs.activeTabId

  // Listen for search:navigate events to scroll to a specific line
  useEffect(() => {
    const handleNavigate = (e: Event) => {
      const { lineNumber } = (e as CustomEvent<{ lineNumber: number }>).detail
      if (!viewRef.current) return
      const view = viewRef.current
      const doc = view.state.doc
      if (lineNumber < 1 || lineNumber > doc.lines) return
      const line = doc.line(lineNumber)
      view.dispatch({
        selection: { anchor: line.from },
        effects: EditorView.scrollIntoView(line.from, { y: 'center' }),
      })
      view.focus()
    }
    window.addEventListener('search:navigate', handleNavigate)
    return () => window.removeEventListener('search:navigate', handleNavigate)
  }, [])

  // Calculate document statistics
  const calculateStats = useCallback((text: string) => {
    const lines = text.split('\n').length
    const characters = text.length
    const words = text.trim() ? text.trim().split(/\s+/).length : 0
    return { lines, characters, words }
  }, [])

  // Debounced stats update
  const debouncedStatsUpdate = useRef(
    debounce((text: string) => {
      const stats = calculateStats(text)
      dispatch({ type: 'UPDATE_DOCUMENT_STATS', payload: stats })
    }, 300)
  ).current

  useEffect(() => {
    if (!editorRef.current) return

    // Create editor state
    const startState = EditorState.create({
      doc: activeContent,
      extensions: [
        lineNumbers(),
        highlightActiveLine(),
        highlightActiveLineGutter(),
        markdown({ base: markdownLanguage, codeLanguages: languages }),
        syntaxHighlighting(isDark ? darkHighlightStyle : lightHighlightStyle),
        EditorView.updateListener.of((update) => {
          if (update.docChanged && !isExternalUpdate.current) {
            const newContent = update.state.doc.toString()
            if (activeTabId) {
              dispatch({ type: 'UPDATE_TAB_CONTENT', payload: { tabId: activeTabId, content: newContent } })
            }
            debouncedStatsUpdate(newContent)
          }
          
          // Update cursor position
          if (update.selectionSet) {
            const pos = update.state.selection.main.head
            const line = update.state.doc.lineAt(pos)
            const lineNum = line.number
            const col = pos - line.from + 1
            dispatch({
              type: 'UPDATE_CURSOR_POSITION',
              payload: { line: lineNum, column: col }
            })
            if (activeTabId) {
              dispatch({
                type: 'UPDATE_TAB_CURSOR',
                payload: { tabId: activeTabId, line: lineNum, column: col }
              })
            }
          }
        }),
        EditorView.lineWrapping,
        EditorView.theme({
          '&': { height: '100%' },
          '.cm-scroller': { overflow: 'auto' },
          '.cm-content': { 
            fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
            fontSize: `${zoomLevel}px`,
            padding: '8px 0'
          },
          '.cm-line': { padding: '0 16px' },
          '.cm-gutters': {
            backgroundColor: 'transparent',
            border: 'none',
            color: '#999'
          }
        }),
        EditorView.baseTheme({
          '&.cm-focused': { outline: 'none' },
          '.cm-activeLine': { 
            backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' 
          }
        })
      ]
    })

    // Create editor view
    const view = new EditorView({
      state: startState,
      parent: editorRef.current
    })

    viewRef.current = view
    setEditorView(view)

    // Initial stats
    const stats = calculateStats(activeContent)
    dispatch({ type: 'UPDATE_DOCUMENT_STATS', payload: stats })

    return () => {
      view.destroy()
      setEditorView(null)
    }
  }, [isDark, zoomLevel]) // Re-create when theme or zoom changes

  // Sync external content changes (e.g., tab switch)
  useEffect(() => {
    if (!viewRef.current) return
    
    const currentContent = viewRef.current.state.doc.toString()
    if (currentContent !== activeContent) {
      isExternalUpdate.current = true
      viewRef.current.dispatch({
        changes: {
          from: 0,
          to: currentContent.length,
          insert: activeContent
        }
      })
      isExternalUpdate.current = false
      
      // Update stats for external content
      const stats = calculateStats(activeContent)
      dispatch({ type: 'UPDATE_DOCUMENT_STATS', payload: stats })
    }
  }, [activeContent])

  return (
    <div 
      ref={editorRef} 
      className={`h-full w-full overflow-hidden ${className}`}
    />
  )
}
