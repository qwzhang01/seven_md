import { Modal } from './Modal'

interface DirtyTabModalProps {
  open: boolean
  fileName: string
  onSave: () => void
  onDiscard: () => void
  onCancel: () => void
}

export function DirtyTabModal({ open, fileName, onSave, onDiscard, onCancel }: DirtyTabModalProps) {
  return (
    <Modal open={open} title="未保存的更改" onClose={onCancel}>
      <p>
        文件 <strong>"{fileName}"</strong> 有未保存的更改。是否要保存？
      </p>
      <div className="flex justify-end gap-2 mt-5">
        <button
          className="px-4 py-1.5 text-sm rounded border transition-colors"
          style={{ color: 'var(--text-primary)', borderColor: 'var(--border-primary)', background: 'transparent' }}
          onClick={onDiscard}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          不保存
        </button>
        <button
          className="px-4 py-1.5 text-sm rounded border transition-colors"
          style={{ color: 'var(--text-secondary)', borderColor: 'var(--border-primary)', background: 'transparent' }}
          onClick={onCancel}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          取消
        </button>
        <button
          className="px-4 py-1.5 text-sm rounded border transition-colors"
          style={{ background: 'var(--accent)', color: '#ffffff', borderColor: 'var(--accent)' }}
          onClick={onSave}
        >
          保存
        </button>
      </div>
    </Modal>
  )
}
