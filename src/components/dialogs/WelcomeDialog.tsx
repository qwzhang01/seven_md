import { useEffect, useRef, useState } from 'react'
import { X, FileText, FolderOpen, Plus, Sparkles } from 'lucide-react'

interface WelcomeDialogProps {
  onClose: () => void
}

const APP_NAME = 'Seven Markdown'
const APP_SLOGAN = 'Write Markdown Like Code'

// 最近文档存储键
const RECENT_DOCS_KEY = 'recent-documents'
const MAX_RECENT_DOCS = 5

interface RecentDoc {
  path: string
  name: string
  lastOpened: number
  type: 'file' | 'folder'
}

// 获取最近文档
function getRecentDocuments(): RecentDoc[] {
  try {
    const stored = localStorage.getItem(RECENT_DOCS_KEY)
    if (!stored) return []
    const docs = JSON.parse(stored) as RecentDoc[]
    return docs.slice(0, MAX_RECENT_DOCS)
  } catch {
    return []
  }
}

// ME Logo SVG with blue-purple gradient
const MELogoSvg = () => (
  <svg width="64" height="64" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="welcomeMeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#4F46E5" />
        <stop offset="100%" stopColor="#7C3AED" />
      </linearGradient>
    </defs>
    <rect width="48" height="48" rx="12" fill="url(#welcomeMeGradient)" />
    <text x="24" y="32" textAnchor="middle" fill="white" fontSize="20" fontWeight="bold" fontFamily="system-ui, -apple-system, sans-serif">ME</text>
  </svg>
)

export function WelcomeDialog({ onClose }: WelcomeDialogProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const [recentDocs, setRecentDocs] = useState<RecentDoc[]>([])

  // 获取最近文档
  useEffect(() => {
    setRecentDocs(getRecentDocuments())
  }, [])

  // 打开时触发动画并自动聚焦
  useEffect(() => {
    requestAnimationFrame(() => {
      setIsAnimating(true)
    })
    closeButtonRef.current?.focus()
  }, [])

  // 键盘事件处理
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
        return
      }
      if (e.key === 'Enter') {
        const activeEl = document.activeElement
        if (activeEl?.tagName !== 'BUTTON') {
          e.preventDefault()
          onClose()
        }
        return
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  // 快速操作：新建文件
  const handleNewFile = () => {
    window.dispatchEvent(new CustomEvent('app:new-file'))
    onClose()
  }

  // 快速操作：打开文件
  const handleOpenFile = () => {
    window.dispatchEvent(new CustomEvent('app:open-file'))
    onClose()
  }

  // 快速操作：打开文件夹
  const handleOpenFolder = () => {
    window.dispatchEvent(new CustomEvent('app:open-folder'))
    onClose()
  }

  // 打开最近文档
  const handleOpenRecent = (path: string, type: 'file' | 'folder') => {
    window.dispatchEvent(new CustomEvent('app:open-recent', { detail: { path, type } }))
    onClose()
  }

  // 格式化路径显示（取最后两级）
  const formatPath = (path: string): string => {
    const parts = path.replace(/\\/g, '/').split('/')
    if (parts.length <= 2) return path
    return '.../' + parts.slice(-2).join('/')
  }

  // 格式化时间
  const formatTime = (timestamp: number): string => {
    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return '刚刚'
    if (minutes < 60) return `${minutes} 分钟前`
    if (hours < 24) return `${hours} 小时前`
    if (days < 7) return `${days} 天前`
    return new Date(timestamp).toLocaleDateString('zh-CN')
  }

  return (
    <div
      ref={overlayRef}
      className={`fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-150 ease-out ${
        isAnimating ? 'opacity-100' : 'opacity-0'
      }`}
      style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)' }}
      onClick={(e) => { if (e.target === overlayRef.current) onClose() }}
    >
      <div
        ref={dialogRef}
        className={`rounded-lg shadow-2xl transition-transform duration-150 ease-out ${
          isAnimating ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        style={{
          background: 'var(--bg-primary)',
          border: '1px solid var(--border-primary)',
          width: 520,
          maxHeight: '85vh',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-3 flex-shrink-0"
          style={{ borderBottom: '1px solid var(--border-primary)' }}
        >
          <div className="flex items-center gap-2">
            <Sparkles size={16} style={{ color: 'var(--accent)' }} />
            <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              欢迎使用 {APP_NAME}
            </span>
          </div>
          <button
            ref={closeButtonRef}
            className="flex items-center justify-center w-6 h-6 rounded transition-colors"
            style={{ color: 'var(--text-secondary)', background: 'transparent', border: 'none', cursor: 'pointer' }}
            onClick={onClose}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <X size={14} />
          </button>
        </div>

        {/* Content */}
        <div className="px-5 py-5 overflow-y-auto" style={{ maxHeight: 'calc(85vh - 50px)' }}>
          {/* App Header */}
          <div className="flex items-center gap-4 mb-6">
            <MELogoSvg />
            <div>
              <h2 className="text-lg font-bold mb-0.5" style={{ color: 'var(--text-primary)' }}>{APP_NAME}</h2>
              <p className="text-xs" style={{ color: 'var(--accent)' }}>{APP_SLOGAN}</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mb-6">
            <h3 className="text-xs font-semibold mb-3" style={{ color: 'var(--text-secondary)' }}>
              快速操作
            </h3>
            <div className="grid grid-cols-3 gap-2">
              <button
                className="flex flex-col items-center gap-1.5 p-3 rounded-lg transition-colors"
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-primary)',
                  cursor: 'pointer'
                }}
                onClick={handleNewFile}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'var(--bg-secondary)'}
              >
                <Plus size={20} style={{ color: 'var(--accent)' }} />
                <span className="text-xs" style={{ color: 'var(--text-primary)' }}>新建文件</span>
              </button>
              <button
                className="flex flex-col items-center gap-1.5 p-3 rounded-lg transition-colors"
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-primary)',
                  cursor: 'pointer'
                }}
                onClick={handleOpenFile}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'var(--bg-secondary)'}
              >
                <FileText size={20} style={{ color: 'var(--accent)' }} />
                <span className="text-xs" style={{ color: 'var(--text-primary)' }}>打开文件</span>
              </button>
              <button
                className="flex flex-col items-center gap-1.5 p-3 rounded-lg transition-colors"
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-primary)',
                  cursor: 'pointer'
                }}
                onClick={handleOpenFolder}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'var(--bg-secondary)'}
              >
                <FolderOpen size={20} style={{ color: 'var(--accent)' }} />
                <span className="text-xs" style={{ color: 'var(--text-primary)' }}>打开文件夹</span>
              </button>
            </div>
          </div>

          {/* Recent Documents */}
          <div>
            <h3 className="text-xs font-semibold mb-3" style={{ color: 'var(--text-secondary)' }}>
              最近打开
            </h3>
            {recentDocs.length > 0 ? (
              <div
                className="rounded-lg overflow-hidden"
                style={{ border: '1px solid var(--border-primary)' }}
              >
                {recentDocs.map((doc, index) => (
                  <button
                    key={doc.path}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors"
                    style={{
                      background: 'var(--bg-secondary)',
                      borderBottom: index < recentDocs.length - 1 ? '1px solid var(--border-primary)' : 'none',
                      cursor: 'pointer'
                    }}
                    onClick={() => handleOpenRecent(doc.path, doc.type)}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'var(--bg-secondary)'}
                  >
                    {doc.type === 'folder'
                      ? <FolderOpen size={16} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
                      : <FileText size={16} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
                    }
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                        {doc.name}
                      </div>
                      <div className="text-[10px] truncate" style={{ color: 'var(--text-tertiary)' }}>
                        {formatPath(doc.path)}
                      </div>
                    </div>
                    <div className="text-[10px] flex-shrink-0" style={{ color: 'var(--text-tertiary)' }}>
                      {formatTime(doc.lastOpened)}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div
                className="py-8 text-center rounded-lg"
                style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }}
              >
                <FileText size={24} className="mx-auto mb-2 opacity-30" style={{ color: 'var(--text-secondary)' }} />
                <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>暂无最近文档</p>
              </div>
            )}
          </div>

          {/* Tips */}
          <div
            className="mt-5 p-3 rounded-lg text-[11px] leading-relaxed"
            style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
          >
            <strong>提示：</strong>按 <kbd className="px-1 py-0.5 rounded text-[10px]" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }}>Ctrl+P</kbd> 打开命令面板，查看所有可用命令。
          </div>
        </div>
      </div>
    </div>
  )
}
