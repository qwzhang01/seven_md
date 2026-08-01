import { on } from '../../lib/eventBus'
import { memo, useCallback, useEffect, useRef, useState } from 'react'
import { Send } from 'lucide-react'
import { useWechatStore } from '../../wechat'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeHighlight from 'rehype-highlight'
import rehypeKatex from 'rehype-katex'
import { useEditorStore, useUIStore, useFileStore, useNotificationStore } from '../../stores'
import { useThemeStore } from '../../stores/useThemeStore'
import { MermaidBlock } from './MermaidBlock'
import { PreviewContextMenu } from './PreviewContextMenu'
import { classifyLink, resolveMarkdownLink } from '../../utils/linkNavigation'
import { openExternalUrl } from '../../tauriCommands'

interface PreviewPaneV2Props {
  content: string
  className?: string
}

export const PreviewPaneV2 = memo(function PreviewPaneV2({ content, className = '' }: PreviewPaneV2Props) {
  const previewRef = useRef<HTMLDivElement>(null)
  const isExternalScroll = useRef(false)

  // 右键菜单状态
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null)
  const [hasSelection, setHasSelection] = useState(false)

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    ;(e.nativeEvent as any).__contextMenuHandled = true
    const selection = window.getSelection()
    setHasSelection(!!(selection && selection.toString().trim().length > 0))
    setContextMenu({ x: e.clientX, y: e.clientY })
  }, [])

  // 滚动同步：订阅 scrollRatio
  const scrollRatio = useEditorStore((s) => s.scrollRatio)
  const scrollSyncEnabled = useEditorStore((s) => s.scrollSyncEnabled)
  const viewMode = useUIStore((s) => s.viewMode)
  const currentTheme = useThemeStore((s) => s.currentTheme)
  const mermaidTheme = currentTheme === 'dark' || currentTheme === 'monokai' || currentTheme === 'dracula' || currentTheme === 'nord' ? 'dark' : 'default'

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

  // 监听 preview:scroll-to-heading 事件，滚动到对应的标题
  useEffect(() => {
    return on('preview:scroll-to-heading', (headingText) => {
      if (!headingText || !previewRef.current) return

      const headings = previewRef.current.querySelectorAll('h1, h2, h3, h4, h5, h6')
      for (const el of headings) {
        const text = (el as HTMLElement).textContent?.trim()
        if (text === headingText) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' })
          return
        }
      }
    })
  }, [])

  const openWechat = useWechatStore((s) => s.open)

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
        <div className="relative group">
          <button
            className="flex items-center justify-center w-6 h-6 rounded transition-colors"
            style={{ color: 'var(--text-secondary)', background: 'transparent', border: 'none', cursor: 'pointer' }}
            onClick={openWechat}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <Send size={13} />
          </button>
          <div
            className="absolute right-0 top-full mt-1.5 px-2 py-1 text-xs rounded whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150"
            style={{
              background: 'var(--bg-tooltip, #1a1a1a)',
              color: 'var(--text-tooltip, #e5e5e5)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
              zIndex: 9999,
            }}
          >
            导出微信公众号
          </div>
        </div>
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
        onContextMenu={handleContextMenu}
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkMath]}
          rehypePlugins={[[rehypeHighlight, { plainText: ['mermaid'] }], rehypeKatex]}
          components={{
            h1: ({ children }) => <h1 style={{ color: 'var(--markdown-h1)', borderBottom: '1px solid var(--border-primary)', paddingBottom: '0.3em', marginBottom: '0.8em', fontSize: '2em', fontWeight: 700 }}>{children}</h1>,
            h2: ({ children }) => <h2 style={{ color: 'var(--markdown-h2)', borderBottom: '1px solid var(--border-primary)', paddingBottom: '0.3em', marginBottom: '0.6em', fontSize: '1.5em', fontWeight: 600 }}>{children}</h2>,
            h3: ({ children }) => <h3 style={{ color: 'var(--markdown-h3)', fontSize: '1.25em', fontWeight: 600, marginBottom: '0.5em' }}>{children}</h3>,
            h4: ({ children }) => <h4 style={{ color: 'var(--markdown-h4)', fontSize: '1em', fontWeight: 600 }}>{children}</h4>,
            a: ({ href, children }) => {
              const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
                e.preventDefault()
                if (!href) return

                const linkType = classifyLink(href)

                switch (linkType) {
                  case 'anchor': {
                    // 锚点链接: 在预览面板内滚动到对应标题
                    const targetId = href.substring(1)
                    const targetEl = previewRef.current?.querySelector(`[id="${CSS.escape(targetId)}"]`)
                      || previewRef.current?.querySelector(`[id="${targetId}"]`)
                    if (targetEl) {
                      targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' })
                    }
                    break
                  }
                  case 'external': {
                    // 外部链接: 使用 Rust 后端打开系统默认浏览器
                    openExternalUrl(href).catch((err) => {
                      console.error('打开外部链接失败:', err)
                      // 降级: 尝试 window.open
                      window.open(href, '_blank', 'noopener,noreferrer')
                    })
                    break
                  }
                  case 'internal-md': {
                    // 内部 .md 链接: 解析路径并在新标签页打开
                    const activeTab = useFileStore.getState().getActiveTab()
                    const currentFilePath = activeTab?.path || null
                    const resolvedPath = resolveMarkdownLink(href, currentFilePath)

                    if (!resolvedPath) {
                      useNotificationStore.getState().addNotification({
                        type: 'warning',
                        message: `无法解析链接路径: ${href}`,
                        autoClose: true,
                        duration: 3000,
                      })
                      return
                    }

                    useFileStore.getState().openFileByPath(resolvedPath).then((tabId) => {
                      if (!tabId) {
                        useNotificationStore.getState().addNotification({
                          type: 'warning',
                          message: `文件未找到: ${resolvedPath}`,
                          autoClose: true,
                          duration: 3000,
                        })
                      }
                    })
                    break
                  }
                  default:
                    // unknown 类型: 不做处理
                    break
                }
              }

              return (
                <a
                  href={href}
                  onClick={handleLinkClick}
                  style={{ color: 'var(--markdown-link)', textDecoration: 'none', cursor: 'pointer' }}
                  onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                  onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                >
                  {children}
                </a>
              )
            },
            code: ({ className, children }) => {
              const isBlock = className?.startsWith('language-')
              if (isBlock) return <code className={className}>{children}</code>
              return <code style={{ color: 'var(--markdown-code)', background: 'var(--bg-tertiary)', padding: '2px 5px', borderRadius: '3px', fontFamily: 'var(--font-mono, monospace)', fontSize: '0.9em' }}>{children}</code>
            },
            pre: ({ node, children, ...props }) => {
              // Use hast node to detect mermaid: pre > code.language-mermaid
              const codeNode = node?.children?.[0]
              const isMermaid =
                codeNode?.type === 'element' &&
                codeNode.tagName === 'code' &&
                Array.isArray(codeNode.properties?.className) &&
                (codeNode.properties.className as string[]).includes('language-mermaid')

              if (isMermaid) {
                // Extract raw text from hast code node
                const textNode = codeNode.children?.[0]
                const code = (textNode?.type === 'text' ? (textNode as { value: string }).value : '').replace(/\n$/, '')
                return <MermaidBlock code={code} theme={mermaidTheme} />
              }
              return <pre style={{ background: 'var(--bg-tertiary)', padding: '12px 16px', borderRadius: '6px', overflowX: 'auto', marginBottom: '1em' }} {...props}>{children}</pre>
            },
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

      {/* Preview context menu */}
      {contextMenu && (
        <PreviewContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          hasSelection={hasSelection}
        />
      )}
    </div>
  )
})
