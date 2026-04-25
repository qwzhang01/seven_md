import { useAIStore } from '../../stores'

const DIRECTIONS = [
  { id: 'zh-en' as const, label: '中文 → 英文' },
  { id: 'en-zh' as const, label: '英文 → 中文' },
  { id: 'zh-ja' as const, label: '中文 → 日文' },
]

export function TranslateMode() {
  const { translateDirection, translateResult, selectedText, setTranslateDirection } = useAIStore()

  return (
    <div className="p-3 flex flex-col gap-3 h-full">
      <div className="flex gap-1.5 flex-wrap">
        {DIRECTIONS.map((d) => (
          <button
            key={d.id}
            className="px-3 py-1 text-xs rounded border transition-colors"
            style={{
              background: translateDirection === d.id ? 'var(--accent)' : 'transparent',
              color: translateDirection === d.id ? '#fff' : 'var(--text-secondary)',
              borderColor: translateDirection === d.id ? 'var(--accent)' : 'var(--border-primary)',
            }}
            onClick={() => setTranslateDirection(d.id)}
          >
            {d.label}
          </button>
        ))}
      </div>

      <div
        className="flex-1 text-sm rounded-lg p-3 overflow-y-auto"
        style={{
          background: 'var(--bg-input, var(--bg-primary))',
          border: '1px solid var(--border-primary)',
          color: translateResult ? 'var(--text-primary)' : 'var(--text-secondary)',
        }}
      >
        {translateResult || selectedText || '选中文本将显示在此处...'}
      </div>

      <button
        className="w-full py-1.5 text-sm rounded transition-colors"
        style={{ background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer' }}
      >
        应用翻译
      </button>
    </div>
  )
}
