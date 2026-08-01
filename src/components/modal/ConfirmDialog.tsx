import { Modal } from './Modal'

interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
  danger?: boolean
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = '确定',
  cancelLabel = '取消',
  onConfirm,
  onCancel,
  danger = false,
}: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      title={title}
      onClose={onCancel}
      footer={
        <>
          <button
            className="px-4 py-1.5 text-sm rounded border transition-colors"
            style={{
              color: 'var(--text-primary)',
              borderColor: 'var(--border-primary)',
              background: 'transparent',
            }}
            onClick={onCancel}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            {cancelLabel}
          </button>
          <button
            className="px-4 py-1.5 text-sm rounded border transition-colors"
            style={{
              background: danger ? 'var(--error-color, #f14c4c)' : 'var(--accent)',
              color: '#ffffff',
              borderColor: danger ? 'var(--error-color, #f14c4c)' : 'var(--accent)',
            }}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </>
      }
    >
      <p>{message}</p>
    </Modal>
  )
}
