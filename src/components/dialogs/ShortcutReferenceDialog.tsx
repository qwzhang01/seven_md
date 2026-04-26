import { useEffect, useRef } from 'react'
import { X, Keyboard } from 'lucide-react'
import { useCommandStore, CATEGORY_LABELS } from '../../stores'
import type { CommandCategory } from '../../stores/useCommandStore'

interface ShortcutReferenceDialogProps {
  onClose: () => void
}

const CATEGORY_ORDER: CommandCategory[] = ['file', 'edit', 'view', 'insert', 'format', 'theme', 'ai', 'help']

export function ShortcutReferenceDialog({ onClose }: ShortcutReferenceDialogProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const { commands } = useCommandStore()

  // ESC / overlay 关闭
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  // 按分类分组，只显示有 shortcut 的命令
  const grouped: Record<string, { title: string; shortcut: string }[]> = {}
  for (const cmd of commands.values()) {
    if (!cmd.shortcut) continue
    const cat = cmd.category
    if (!grouped[cat]) grouped[cat] = []
    grouped[cat].push({ title: cmd.title, shortcut: cmd.shortcut })
  }

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)' }}
      onClick={(e) => { if (e.target === overlayRef.current) onClose() }}
    >
      <div
        className="rounded-lg shadow-2xl flex flex-col"
        style={{
          background: 'var(--bg-primary)',
          border: '1px solid var(--border-primary)',
          width: 560,
          maxHeight: '80vh',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-3 flex-shrink-0"
          style={{ borderBottom: '1px solid var(--border-primary)' }}
        >
          <div className="flex items-center gap-2">
            <Keyboard size={16} style={{ color: 'var(--accent)' }} />
            <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>快捷键参考</span>
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
        <div className="flex-1 overflow-y-auto px-5 py-3">
          {CATEGORY_ORDER.map((cat) => {
            const items = grouped[cat]
            if (!items || items.length === 0) return null
            return (
              <div key={cat} className="mb-4 last:mb-0">
                <div className="text-xs font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
                  {CATEGORY_LABELS[cat]}
                </div>
                <table className="w-full text-xs" style={{ borderCollapse: 'collapse' }}>
                  <tbody>
                    {items.map((item, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid var(--border-secondary, var(--border-primary))' }}>
                        <td className="py-1.5 pr-4" style={{ color: 'var(--text-primary)' }}>{item.title}</td>
                        <td className="py-1.5 text-right" style={{ color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                          <kbd
                            className="px-1.5 py-0.5 rounded text-[11px]"
                            style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)', fontFamily: 'var(--font-mono, monospace)' }}
                          >
                            {item.shortcut}
                          </kbd>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
