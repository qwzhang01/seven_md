import { memo, useCallback, useEffect, useRef } from 'react'
import { ExternalLink } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeHighlight from 'rehype-highlight'
import rehypeKatex from 'rehype-katex'
import { useEditorStore, useUIStore } from '../../stores'

interface PreviewPaneV2Props {
  content: string
  className?: string
}

export const PreviewPaneV2 = memo(function PreviewPaneV2({ content, className = '' }: PreviewPaneV2Props) {
  const previewRef = useRef<HTMLDivElement>(null)
  const isExternalScroll = useRef(false)

  // 滚动同步：订阅 scrollRatio
  const scrollRatio = useEditorStore((s) => s.scrollRatio)
  const scrollSyncEnabled = useEditorStore((s) => s.scrollSyncEnabled)
  const viewMode = useUIStore((s) => s.viewMode)

  useEffect(() => {
    if (!scrollSyncEnabled || viewMode !== 'split' || !previewRef.current) return
    const el = previewRef.current
    const scrollHeight = el.scrollHeight
    const clientHeight = el.clientHeight
    if (scrollHeight <= clientHeight) return

    isExternalScroll.current = true
    el.scrollTop = scrollRatio * (scrollHeight - clientHeight)
    // 重置 flag 在下一帧
    requestAnimationFrame(() => {
      isExternalScroll.current = false
    })
  }, [scrollRatio, scrollSyncEnabled, viewMode])

  const handleOpenExternal = useCallback(() => {
    // Open preview in a new window
    const win = window.open('', '_blank')
    if (!win) return
    const previewEl = document.getElementById('md-preview-content')
    win.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>预览 - MD Mate</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; padding: 24px 40px; max-width: 900px; }
          pre { background: #f6f8fa; padding: 16px; border-radius: 6px; overflow-x: auto; }
          code { font-family: 'SF Mono', Menlo, monospace; font-size: 13px; }
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #d0d7de; padding: 8px 12px; }
          th { background: #f6f8fa; }
          blockquote { border-left: 4px solid #d0d7de; margin: 0; padding: 8px 16px; color: #656d76; }
          img { max-width: 100%; }
          hr { border: none; border-top: 2px solid #d0d7de; }
        </style>
      </head>
      <body>${previewEl?.innerHTML ?? ''}</body>
      </html>
    `)
    win.document.close()
  }, [])

  return (
    <div
      className={`flex flex-col h-full overflow-hidden ${className}`}
      style={{ background: 'var(--bg-primary)' }}
    >
      {/* Preview header */}
      <div
        className="flex items-center justify-between px-3 flex-shrink-0"
        style={{
          height: '30px',
          background: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border-primary)',
        }}
      >
        <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>预览</span>
        <button
          className="flex items-center justify-center w-6 h-6 rounded transition-colors"
          style={{ color: 'var(--text-secondary)', background: 'transparent', border: 'none', cursor: 'pointer' }}
          onClick={handleOpenExternal}
          title="在新窗口打开"
          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        >
          <ExternalLink size={13} />
        </button>
      </div>

      {/* Preview content */}
      <div
        ref={previewRef}
        id="md-preview-content"
        className="flex-1 overflow-y-auto px-5 py-4 markdown-preview"
        style={{
          color: 'var(--text-primary)',
          fontSize: '14px',
          lineHeight: '1.7',
          fontFamily: 'var(--font-primary)',
        }}
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkMath]}
          rehypePlugins={[rehypeHighlight, rehypeKatex]}
          components={{
            h1: ({ children }) => <h1 style={{ color: 'var(--markdown-h1)', borderBottom: '1px solid var(--border-primary)', paddingBottom: '0.3em', marginBottom: '0.8em', fontSize: '2em', fontWeight: 700 }}>{children}</h1>,
            h2: ({ children }) => <h2 style={{ color: 'var(--markdown-h2)', borderBottom: '1px solid var(--border-primary)', paddingBottom: '0.3em', marginBottom: '0.6em', fontSize: '1.5em', fontWeight: 600 }}>{children}</h2>,
            h3: ({ children }) => <h3 style={{ color: 'var(--markdown-h3)', fontSize: '1.25em', fontWeight: 600, marginBottom: '0.5em' }}>{children}</h3>,
            h4: ({ children }) => <h4 style={{ color: 'var(--markdown-h4)', fontSize: '1em', fontWeight: 600 }}>{children}</h4>,
            a: ({ href, children }) => <a href={href} style={{ color: 'var(--markdown-link)', textDecoration: 'none' }} onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'} onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}>{children}</a>,
            code: ({ className, children }) => {
              const isBlock = className?.startsWith('language-')
              if (isBlock) return <code className={className}>{children}</code>
              return <code style={{ color: 'var(--markdown-code)', background: 'var(--bg-tertiary)', padding: '2px 5px', borderRadius: '3px', fontFamily: 'var(--font-mono, monospace)', fontSize: '0.9em' }}>{children}</code>
            },
            pre: ({ children }) => <pre style={{ background: 'var(--bg-tertiary)', padding: '12px 16px', borderRadius: '6px', overflowX: 'auto', marginBottom: '1em' }}>{children}</pre>,
            blockquote: ({ children }) => <blockquote style={{ borderLeft: `4px solid var(--markdown-quote)`, padding: '6px 16px', margin: '1em 0', color: 'var(--text-secondary)', background: 'var(--bg-secondary)', borderRadius: '0 4px 4px 0' }}>{children}</blockquote>,
            table: ({ children }) => <table style={{ borderCollapse: 'collapse', width: '100%', marginBottom: '1em' }}>{children}</table>,
            th: ({ children }) => <th style={{ border: '1px solid var(--border-primary)', padding: '8px 12px', textAlign: 'left', background: 'var(--bg-tertiary)', fontWeight: 600 }}>{children}</th>,
            td: ({ children }) => <td style={{ border: '1px solid var(--border-primary)', padding: '8px 12px' }}>{children}</td>,
            hr: () => <hr style={{ border: 'none', borderTop: '2px solid var(--markdown-hr)', margin: '1.5em 0' }} />,
            strong: ({ children }) => <strong style={{ color: 'var(--markdown-bold)', fontWeight: 600 }}>{children}</strong>,
            em: ({ children }) => <em style={{ color: 'var(--markdown-italic)' }}>{children}</em>,
            img: ({ src, alt }) => <img src={src} alt={alt} style={{ maxWidth: '100%', borderRadius: '6px' }} />,
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  )
})
