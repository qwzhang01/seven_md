import { useCallback, useRef, useEffect } from 'react'
import { ErrorBoundary } from '../ErrorBoundary'
import { Gutter, EditorPaneV2, FindReplaceBar, PreviewPaneV2 } from './'

const MIN_EDITOR_WIDTH = 200
const MAX_EDITOR_WIDTH_RATIO = 0.85

interface EditorPreviewAreaProps {
  tabsLength: number
  activeContent: string
  viewMode: 'split' | 'editor-only' | 'preview-only'
  editorWidth: number | null
  setEditorWidth: (width: number | null) => void
  isMobile: boolean
  onMarkdownChange: (value: string) => void
}

export function EditorPreviewArea({
  tabsLength,
  activeContent,
  viewMode,
  editorWidth,
  setEditorWidth,
  isMobile,
  onMarkdownChange,
}: EditorPreviewAreaProps) {
  const showEditor = viewMode !== 'preview-only'
  const showPreview = viewMode !== 'editor-only'
  const showGutter = viewMode === 'split'

  const editorWidthRef = useRef(editorWidth)
  editorWidthRef.current = editorWidth

  const handleGutterResize = useCallback((dx: number) => {
    const mainEl = document.getElementById('md-mate-editor-preview')
    if (!mainEl) return
    const total = mainEl.offsetWidth
    const currentEditorW = editorWidthRef.current ?? total / 2
    const maxW = Math.min(total - MIN_EDITOR_WIDTH, total * MAX_EDITOR_WIDTH_RATIO)
    const newW = Math.max(MIN_EDITOR_WIDTH, Math.min(maxW, currentEditorW + dx))
    setEditorWidth(newW)
  }, [setEditorWidth])

  // Reset editor width on significant resize
  useEffect(() => {
    const handleResize = () => {
      if (editorWidth !== null) {
        const mainEl = document.getElementById('md-mate-editor-preview')
        if (mainEl && editorWidth > mainEl.offsetWidth * 0.8) {
          setEditorWidth(null)
        }
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [editorWidth, setEditorWidth])

  return (
    <div
      id="md-mate-editor-preview"
      data-component="editor-preview"
      className="flex-1 flex overflow-hidden relative"
    >
      {/* Editor Pane */}
      {tabsLength > 0 && (
        <div
          data-component="editor-pane"
          className="relative flex-col flex overflow-hidden"
          style={{
            flex: showEditor
              ? (isMobile ? '1 1 50%' : (showGutter && editorWidth ? `0 0 ${editorWidth}px` : 1))
              : '0 0 0px',
            minHeight: isMobile && showEditor ? '50%' : 'auto',
            opacity: showEditor ? 1 : 0,
            pointerEvents: showEditor ? 'auto' : 'none',
          }}
        >
          <ErrorBoundary boundaryName="Editor">
            <EditorPaneV2
              content={activeContent}
              onChange={onMarkdownChange}
              className="flex-1"
            />
          </ErrorBoundary>
          <FindReplaceBar />
        </div>
      )}

      {/* Desktop Gutter */}
      {!isMobile && showGutter && tabsLength > 0 && (
        <Gutter onResize={handleGutterResize} onReset={() => setEditorWidth(null)} />
      )}

      {/* Mobile Horizontal Divider */}
      {isMobile && showGutter && tabsLength > 0 && (
        <div
          data-component="mobile-gutter"
          className="h-2 flex-shrink-0 flex items-center justify-center bg-[var(--bg-secondary)] cursor-row-resize"
          style={{ borderTop: '1px solid var(--border-primary)', borderBottom: '1px solid var(--border-primary)' }}
        >
          <div className="w-10 h-1 rounded-full" style={{ background: 'var(--text-tertiary)' }} />
        </div>
      )}

      {/* Preview Pane */}
      {tabsLength > 0 && (
        <div
          data-component="preview-pane"
          style={{
            flex: showPreview
              ? (isMobile ? '1 1 50%' : 1)
              : '0 0 0px',
            minHeight: isMobile && showPreview ? '50%' : 0,
            overflow: 'hidden',
            minWidth: showPreview ? MIN_EDITOR_WIDTH : 0,
            opacity: showPreview ? 1 : 0,
            pointerEvents: showPreview ? 'auto' : 'none',
          }}
        >
          <ErrorBoundary boundaryName="Preview">
            <PreviewPaneV2 content={activeContent} className="h-full" />
          </ErrorBoundary>
        </div>
      )}

      {/* Empty state */}
      {tabsLength === 0 && (
        <div className="flex-1 flex items-center justify-center" style={{ color: 'var(--text-secondary)' }}>
          <div className="text-center">
            <div className="text-4xl mb-4 opacity-20">📝</div>
            <p className="text-sm mb-2">没有打开的文件</p>
            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
              使用 <kbd className="px-1 py-0.5 rounded text-xs" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)' }}>
                {navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'}+O
              </kbd> 打开文件
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
