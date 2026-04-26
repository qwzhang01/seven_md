import { useState, useCallback } from 'react'
import { Check } from 'lucide-react'
import { useAIStore, useNotificationStore } from '../../stores'
import { aiTranslate, isAIConfigured } from '../../services/aiService'
import type { TranslateDirection } from '../../stores'

const DIRECTIONS = [
  { id: 'zh-en' as const, label: '中文 → 英文' },
  { id: 'en-zh' as const, label: '英文 → 中文' },
  { id: 'zh-ja' as const, label: '中文 → 日文' },
]

export function TranslateMode() {
  const { translateDirection, translateResult, selectedText, setTranslateDirection, setTranslateResult, setLoading, setError } = useAIStore()
  const { addNotification } = useNotificationStore()
  const [localLoading, setLocalLoading] = useState(false)

  const handleTranslate = useCallback(async (direction: TranslateDirection) => {
    setTranslateDirection(direction)
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
    setTranslateResult(null)
    try {
      const result = await aiTranslate(selectedText, direction)
      setTranslateResult(result)
    } catch (err) {
      const msg = err instanceof Error ? err.message : '翻译失败'
      setError(msg)
      addNotification({ type: 'error', message: `AI 翻译: ${msg}`, autoClose: true, duration: 5000 })
    } finally {
      setLocalLoading(false)
      setLoading(false)
    }
  }, [selectedText, setTranslateDirection, setTranslateResult, setLoading, setError, addNotification])

  const handleApply = useCallback(() => {
    if (!translateResult) return
    window.dispatchEvent(new CustomEvent('editor:replace-selection', { detail: translateResult }))
    addNotification({ type: 'success', message: '翻译结果已应用', autoClose: true, duration: 2000 })
    setTranslateResult(null)
  }, [translateResult, setTranslateResult, addNotification])

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
            onClick={() => handleTranslate(d.id)}
            disabled={localLoading}
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
        {localLoading ? (
          <span className="animate-pulse">AI 翻译中...</span>
        ) : (
          translateResult || selectedText || '选中文本将显示在此处...'
        )}
      </div>

      <button
        className="w-full py-1.5 text-sm rounded transition-colors flex items-center justify-center gap-1.5"
        style={{
          background: translateResult ? 'var(--accent)' : 'var(--bg-tertiary)',
          color: translateResult ? '#fff' : 'var(--text-tertiary, var(--text-secondary))',
          border: 'none',
          cursor: translateResult ? 'pointer' : 'default',
        }}
        onClick={handleApply}
        disabled={!translateResult}
      >
        <Check size={14} />
        应用翻译
      </button>
    </div>
  )
}
