import { useState, useCallback } from 'react'
import { Lightbulb } from 'lucide-react'
import { useAIStore, useNotificationStore } from '../../stores'
import { aiExplain, isAIConfigured } from '../../services/aiService'

export function ExplainMode() {
  const { explainResult, selectedText, setExplainResult, setLoading, setError } = useAIStore()
  const { addNotification } = useNotificationStore()
  const [localLoading, setLocalLoading] = useState(false)

  const handleExplain = useCallback(async () => {
    if (!selectedText) {
      addNotification({ type: 'info', message: '请先在编辑器中选中文本', autoClose: true, duration: 3000 })
      return
    }
    if (!isAIConfigured()) {
      addNotification({ type: 'error', message: '请先在 AI 聊天模式中配置 API Key', autoClose: true, duration: 4000 })
      return
    }

    setLocalLoading(true)
    setLoading(true)
    setExplainResult(null)
    try {
      const result = await aiExplain(selectedText)
      setExplainResult(result)
    } catch (err) {
      const msg = err instanceof Error ? err.message : '解释失败'
      setError(msg)
      addNotification({ type: 'error', message: `AI 解释: ${msg}`, autoClose: true, duration: 5000 })
    } finally {
      setLocalLoading(false)
      setLoading(false)
    }
  }, [selectedText, setExplainResult, setLoading, setError, addNotification])

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

          <button
            className="w-full py-1.5 text-sm rounded transition-colors flex items-center justify-center gap-1.5"
            style={{
              background: 'var(--accent)',
              color: '#fff',
              border: 'none',
              cursor: localLoading ? 'default' : 'pointer',
              opacity: localLoading ? 0.6 : 1,
            }}
            onClick={handleExplain}
            disabled={localLoading}
          >
            <Lightbulb size={14} />
            {localLoading ? 'AI 解释中...' : '解释'}
          </button>

          <div className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>AI 解释:</div>
          <div
            className="flex-1 text-sm p-3 rounded-lg overflow-y-auto leading-relaxed"
            style={{
              background: 'var(--bg-input, var(--bg-primary))',
              border: '1px solid var(--border-primary)',
              color: explainResult ? 'var(--text-primary)' : 'var(--text-secondary)',
            }}
          >
            {localLoading && !explainResult ? (
              <span className="animate-pulse">思考中...</span>
            ) : (
              explainResult || '点击上方"解释"按钮，AI 将解释所选内容...'
            )}
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
