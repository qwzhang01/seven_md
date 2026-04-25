import { useAIStore } from '../../stores'

export function ExplainMode() {
  const { explainResult, selectedText } = useAIStore()

  return (
    <div className="p-3 flex flex-col gap-3 h-full">
      {selectedText ? (
        <>
          <div className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>选中内容:</div>
          <div
            className="text-xs p-2 rounded font-mono"
            style={{
              background: 'var(--bg-tertiary)',
              color: 'var(--syntax-code, var(--text-primary))',
              maxHeight: 100,
              overflow: 'auto',
            }}
          >
            {selectedText}
          </div>
          <div className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>AI 解释:</div>
          <div
            className="flex-1 text-sm p-3 rounded-lg overflow-y-auto leading-relaxed"
            style={{
              background: 'var(--bg-input, var(--bg-primary))',
              border: '1px solid var(--border-primary)',
              color: explainResult ? 'var(--text-primary)' : 'var(--text-secondary)',
            }}
          >
            {explainResult || '点击"解释"按钮，AI 将解释所选内容...'}
          </div>
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center text-sm" style={{ color: 'var(--text-secondary)' }}>
          选中代码或文本，AI 将解释其含义。
        </div>
      )}
    </div>
  )
}
