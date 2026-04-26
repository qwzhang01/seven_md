import { useEffect, useRef, useState } from 'react'
import { X, Info } from 'lucide-react'

interface AboutDialogProps {
  onClose: () => void
}

const APP_VERSION = '1.0.0'
const APP_NAME = 'Seven Markdown'
const APP_SLOGAN = 'Write Markdown Like Code'

// ME Logo SVG with blue-purple gradient
const MELogoSvg = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="meGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#4F46E5" />
        <stop offset="100%" stopColor="#7C3AED" />
      </linearGradient>
    </defs>
    <rect width="48" height="48" rx="12" fill="url(#meGradient)" />
    <text x="24" y="32" textAnchor="middle" fill="white" fontSize="20" fontWeight="bold" fontFamily="system-ui, -apple-system, sans-serif">ME</text>
  </svg>
)

export function AboutDialog({ onClose }: AboutDialogProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const [isAnimating, setIsAnimating] = useState(false)

  // 打开时触发动画并自动聚焦
  useEffect(() => {
    // 延迟一小帧触发动画
    requestAnimationFrame(() => {
      setIsAnimating(true)
    })
    // 自动聚焦到关闭按钮
    closeButtonRef.current?.focus()
  }, [])

  // 键盘事件处理：Escape、Enter、Tab 焦点陷阱
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      // Escape 关闭对话框
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
        return
      }

      // Enter 确认主操作（关闭）
      if (e.key === 'Enter') {
        // 只有当焦点不在按钮上时才触发关闭
        const activeEl = document.activeElement
        if (activeEl?.tagName !== 'BUTTON') {
          e.preventDefault()
          onClose()
        }
        return
      }

      // Tab 焦点陷阱
      if (e.key === 'Tab') {
        const focusableElements = dialogRef.current?.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        if (!focusableElements || focusableElements.length === 0) return

        const firstEl = focusableElements[0]
        const lastEl = focusableElements[focusableElements.length - 1]

        if (e.shiftKey) {
          // Shift+Tab：焦点在第一个元素时循环到最后
          if (document.activeElement === firstEl) {
            e.preventDefault()
            lastEl.focus()
          }
        } else {
          // Tab：焦点在最后一个元素时循环到第一个
          if (document.activeElement === lastEl) {
            e.preventDefault()
            firstEl.focus()
          }
        }
      }
    }

    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

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
          isAnimating ? 'scale-100 opacity-100' : 'scale-90 opacity-0'
        }`}
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
            <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>关于 {APP_NAME}</span>
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
        <div className="px-5 py-6 text-center">
          {/* App icon */}
          <div className="mb-3 flex justify-center">
            <MELogoSvg />
          </div>

          {/* App name */}
          <h2 className="text-lg font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{APP_NAME}</h2>

          {/* Slogan */}
          <p className="text-xs mb-4" style={{ color: 'var(--accent)' }}>{APP_SLOGAN}</p>

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
            MIT License © 2024-2026 {APP_NAME} Contributors
          </p>
        </div>
      </div>
    </div>
  )
}
