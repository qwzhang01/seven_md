import { useState, useCallback } from 'react'
import { Check } from 'lucide-react'
import { useAIStore, useNotificationStore } from '../../stores'
import { aiRewrite, isAIConfigured } from '../../services/aiService'
import type { RewriteStyle } from '../../stores'

const STYLES = [
  { id: 'professional' as const, label: '专业' },
  { id: 'casual' as const, label: '随意' },
  { id: 'concise' as const, label: '简洁' },
  { id: 'expansive' as const, label: '扩展' },
]

export function RewriteMode() {
  const { rewriteStyle, rewriteResult, selectedText, setRewriteStyle, setRewriteResult, setLoading, setError } = useAIStore()
  const { addNotification } = useNotificationStore()
  const [localLoading, setLocalLoading] = useState(false)

  const handleRewrite = useCallback(async (style: RewriteStyle) => {
    setRewriteStyle(style)
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
    setRewriteResult(null)
    try {
      const result = await aiRewrite(selectedText, style)
      setRewriteResult(result)
    } catch (err) {
      const msg = err instanceof Error ? err.message : '改写失败'
      setError(msg)
      addNotification({ type: 'error', message: `AI 改写: ${msg}`, autoClose: true, duration: 5000 })
    } finally {
      setLocalLoading(false)
      setLoading(false)
    }
  }, [selectedText, setRewriteStyle, setRewriteResult, setLoading, setError, addNotification])

  const handleApply = useCallback(() => {
    if (!rewriteResult) return
    // 通过 custom event 替换编辑器选中文本
    window.dispatchEvent(new CustomEvent('editor:replace-selection', { detail: rewriteResult }))
    addNotification({ type: 'success', message: '改写结果已应用', autoClose: true, duration: 2000 })
    setRewriteResult(null)
  }, [rewriteResult, setRewriteResult, addNotification])

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
            onClick={() => handleRewrite(s.id)}
            disabled={localLoading}
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
        {localLoading ? (
          <span className="animate-pulse">AI 改写中...</span>
        ) : (
          rewriteResult || selectedText || '选中文本将显示在此处...'
        )}
      </div>

      <button
        className="w-full py-1.5 text-sm rounded transition-colors flex items-center justify-center gap-1.5"
        style={{
          background: rewriteResult ? 'var(--accent)' : 'var(--bg-tertiary)',
          color: rewriteResult ? '#fff' : 'var(--text-tertiary, var(--text-secondary))',
          border: 'none',
          cursor: rewriteResult ? 'pointer' : 'default',
        }}
        onClick={handleApply}
        disabled={!rewriteResult}
      >
        <Check size={14} />
        应用改写
      </button>
    </div>
  )
}
