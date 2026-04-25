import { useAIStore } from '../../stores'

const STYLES = [
  { id: 'professional' as const, label: '专业' },
  { id: 'casual' as const, label: '随意' },
  { id: 'concise' as const, label: '简洁' },
  { id: 'expansive' as const, label: '扩展' },
]

export function RewriteMode() {
  const { rewriteStyle, rewriteResult, selectedText, setRewriteStyle } = useAIStore()

  return (
    <div className="p-3 flex flex-col gap-3 h-full">
      <div className="flex gap-1.5">
        {STYLES.map((s) => (
          <button
            key={s.id}
            className="px-3 py-1 text-xs rounded border transition-colors"
            style={{
              background: rewriteStyle === s.id ? 'var(--accent)' : 'transparent',
              color: rewriteStyle === s.id ? '#fff' : 'var(--text-secondary)',
              borderColor: rewriteStyle === s.id ? 'var(--accent)' : 'var(--border-primary)',
            }}
            onClick={() => setRewriteStyle(s.id)}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div
        className="flex-1 text-sm rounded-lg p-3 overflow-y-auto"
        style={{
          background: 'var(--bg-input, var(--bg-primary))',
          border: '1px solid var(--border-primary)',
          color: rewriteResult ? 'var(--text-primary)' : 'var(--text-secondary)',
        }}
      >
        {rewriteResult || selectedText || '选中文本将显示在此处...'}
      </div>

      <button
        className="w-full py-1.5 text-sm rounded transition-colors"
        style={{ background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer' }}
      >
        应用改写
      </button>
    </div>
  )
}
