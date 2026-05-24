/**
 * AgentModelSelector — 模型选择器
 *
 * 当前 AI 配置仅支持单一 provider + model；该选择器提供：
 * - 常用模型快捷下拉
 * - 当前 active model 的展示
 * - 未配置时提示
 *
 * 切换 active model 后，新建会话将使用新模型；进行中会话不受影响。
 */

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Cpu } from 'lucide-react'
import { useAgentStore } from '../../stores/useAgentStore'
import { isAIConfigured, getAIConfig } from '../../services/ai/config'

const COMMON_MODELS = [
  'gpt-4o',
  'gpt-4o-mini',
  'gpt-4-turbo',
  'claude-3-5-sonnet-20241022',
  'claude-sonnet-4',
  'claude-opus-4',
  'claude-haiku-4',
  'deepseek-chat',
  'deepseek-reasoner',
]

export function AgentModelSelector() {
  const activeModelId = useAgentStore((s) => s.activeModelId)
  const setActiveModel = useAgentStore((s) => s.setActiveModel)
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)

  // 默认包含当前配置中的模型
  const configured = getAIConfig().model
  const models = Array.from(new Set([configured, ...COMMON_MODELS])).filter(Boolean)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  if (!isAIConfigured()) {
    return (
      <div
        className="text-[10px] px-1.5 py-0.5 rounded"
        style={{ color: 'var(--text-tertiary)', border: '1px solid var(--border-primary)' }}
      >
        请先配置 AI 服务
      </div>
    )
  }

  return (
    <div ref={wrapRef} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px]"
        style={{
          background: 'var(--bg-tertiary)',
          color: 'var(--text-secondary)',
          border: '1px solid var(--border-primary)',
          cursor: 'pointer',
        }}
        title="选择模型"
      >
        <Cpu size={10} />
        <span className="max-w-[120px] truncate">{activeModelId}</span>
        <ChevronDown size={10} />
      </button>
      {open && (
        <div
          className="absolute right-0 mt-1 z-10 rounded shadow-lg"
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-primary)',
            minWidth: '180px',
          }}
        >
          {models.map((m) => (
            <button
              key={m}
              onClick={() => {
                setActiveModel(m)
                setOpen(false)
              }}
              className="block w-full text-left px-2 py-1 text-[11px]"
              style={{
                background: m === activeModelId ? 'var(--bg-tertiary)' : 'transparent',
                color: 'var(--text-primary)',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              {m}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
