/**
 * AgentToolCallLog — 工具调用日志组件
 */

import { useState } from 'react'
import { Loader2, Check, AlertCircle, ChevronDown, ChevronRight } from 'lucide-react'
import type { ToolCallRecord } from '../../stores/useAgentStore'

interface Props {
  toolCalls: ToolCallRecord[]
}

export function AgentToolCallLog({ toolCalls }: Props) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  const toggle = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div
      className="rounded text-[10px] overflow-hidden"
      style={{ border: '1px solid var(--border-primary)' }}
    >
      <div
        className="px-2 py-1 font-medium"
        style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
      >
        工具调用 ({toolCalls.length})
      </div>
      <div className="divide-y" style={{ borderColor: 'var(--border-primary)' }}>
        {toolCalls.map((tc) => (
          <div key={tc.id}>
            <button
              className="w-full flex items-center gap-1.5 px-2 py-1.5 text-left"
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-primary)' }}
              onClick={() => toggle(tc.id)}
            >
              {/* Status icon */}
              {tc.status === 'running' && <Loader2 size={10} className="animate-spin" style={{ color: 'var(--accent)' }} />}
              {tc.status === 'completed' && <Check size={10} style={{ color: 'var(--text-success, #16a34a)' }} />}
              {tc.status === 'error' && <AlertCircle size={10} style={{ color: 'var(--text-error, #dc2626)' }} />}

              {/* Tool name */}
              <span className="flex-1 font-mono truncate">{tc.name}</span>

              {/* Expand chevron */}
              {expandedIds.has(tc.id) ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
            </button>

            {/* Expanded details */}
            {expandedIds.has(tc.id) && (
              <div className="px-2 pb-2 space-y-1">
                <div>
                  <span style={{ color: 'var(--text-tertiary)' }}>参数:</span>
                  <pre
                    className="mt-0.5 p-1.5 rounded overflow-x-auto font-mono"
                    style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)', fontSize: '9px' }}
                  >
                    {JSON.stringify(tc.args, null, 2)}
                  </pre>
                </div>
                {tc.result !== null && (
                  <div>
                    <span style={{ color: 'var(--text-tertiary)' }}>结果:</span>
                    <pre
                      className="mt-0.5 p-1.5 rounded overflow-x-auto font-mono"
                      style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)', fontSize: '9px', maxHeight: '120px' }}
                    >
                      {typeof tc.result === 'string' ? tc.result : JSON.stringify(tc.result, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
