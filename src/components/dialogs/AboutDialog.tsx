import { useEffect, useRef } from 'react'
import { X, Info } from 'lucide-react'

interface AboutDialogProps {
  onClose: () => void
}

const APP_VERSION = '1.0.0'

export function AboutDialog({ onClose }: AboutDialogProps) {
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)' }}
      onClick={(e) => { if (e.target === overlayRef.current) onClose() }}
    >
      <div
        className="rounded-lg shadow-2xl"
        style={{
          background: 'var(--bg-primary)',
          border: '1px solid var(--border-primary)',
          width: 380,
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-3"
          style={{ borderBottom: '1px solid var(--border-primary)' }}
        >
          <div className="flex items-center gap-2">
            <Info size={16} style={{ color: 'var(--accent)' }} />
            <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>关于 Seven MD</span>
          </div>
          <button
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
        <div className="px-5 py-6 text-center">
          {/* App icon */}
          <div className="text-4xl mb-3">📝</div>

          {/* App name */}
          <h2 className="text-lg font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Seven MD</h2>

          {/* Version */}
          <p className="text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>版本 {APP_VERSION}</p>

          {/* Description */}
          <p className="text-xs mb-4 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            一款为 Markdown 爱好者打造的现代编辑器，
            专注于简洁高效的写作体验。
          </p>

          {/* Tech stack */}
          <div
            className="text-[11px] p-3 rounded-lg mb-4 leading-relaxed"
            style={{ background: 'var(--bg-tertiary)', color: 'var(--text-tertiary, var(--text-secondary))' }}
          >
            技术栈: Tauri v2 + React 19 + TypeScript + CodeMirror 6
          </div>

          {/* License */}
          <p className="text-[11px]" style={{ color: 'var(--text-tertiary, var(--text-secondary))' }}>
            MIT License © 2024-2026 Seven MD Contributors
          </p>
        </div>
      </div>
    </div>
  )
}
