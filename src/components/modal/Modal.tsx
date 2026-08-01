import { useEffect, useRef, type ReactNode } from 'react'

interface ModalProps {
  open: boolean
  title: string
  children: ReactNode
  footer?: ReactNode
  onClose?: () => void
  closable?: boolean  // 点击遮罩/ESC 是否关闭
}

export function Modal({ open, title, children, footer, onClose, closable = true }: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closable) onClose?.()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, closable, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[10002] flex items-center justify-center"
      style={{ background: 'var(--bg-modal-overlay, rgba(0,0,0,0.6))' }}
      onClick={(e) => { if (e.target === e.currentTarget && closable) onClose?.() }}
    >
      <div
        ref={dialogRef}
        className="rounded-lg p-5"
        style={{
          background: 'var(--bg-modal, var(--bg-secondary))',
          border: '1px solid var(--border-primary)',
          boxShadow: 'var(--shadow-lg)',
          minWidth: '400px',
          maxWidth: '600px',
          animation: 'modalIn 0.15s ease',
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header */}
        <h2
          id="modal-title"
          className="mb-4 font-semibold"
          style={{ color: 'var(--text-primary)', fontSize: 16 }}
        >
          {title}
        </h2>

        {/* Body */}
        <div
          className="mb-5 leading-relaxed text-sm"
          style={{ color: 'var(--text-primary)' }}
        >
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex justify-end gap-2">
            {footer}
          </div>
        )}
      </div>

      <style>{`
        @keyframes modalIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
