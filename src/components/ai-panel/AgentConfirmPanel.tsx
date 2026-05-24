/**
 * AgentConfirmPanel — confirm 类工具的待确认队列
 *
 * 当 Agent 调用 'confirm' 权限的工具时，
 * 工具会暂停并把请求加入 useAgentStore.pendingConfirmations，
 * 用户在此面板点击"同意"或"拒绝"以解锁工具执行。
 */

import { ShieldAlert, Check, X } from 'lucide-react'
import { useAgentStore } from '../../stores/useAgentStore'

export function AgentConfirmPanel() {
  const pendingConfirmations = useAgentStore((s) => s.pendingConfirmations)
  const approveConfirmation = useAgentStore((s) => s.approveConfirmation)
  const rejectConfirmation = useAgentStore((s) => s.rejectConfirmation)

  if (pendingConfirmations.length === 0) return null

  return (
    <div className="space-y-2">
      {pendingConfirmations.map((entry) => (
        <div
          key={entry.id}
          className="rounded p-2 text-xs"
          style={{
            background: 'var(--bg-warning, #fffbeb)',
            border: '1px solid var(--border-warning, #fbbf24)',
          }}
        >
          <div className="flex items-center gap-1.5 mb-1.5" style={{ color: 'var(--text-warning, #92400e)' }}>
            <ShieldAlert size={12} />
            <span className="font-semibold">需要确认：{entry.toolName}</span>
          </div>

          {entry.preview && (
            <div
              className="mb-1.5 px-2 py-1 rounded text-[11px] whitespace-pre-wrap break-all"
              style={{
                background: 'var(--bg-tertiary)',
                color: 'var(--text-secondary)',
                maxHeight: '120px',
                overflow: 'auto',
              }}
            >
              {entry.preview}
            </div>
          )}

          <details className="mb-1.5">
            <summary
              className="cursor-pointer text-[10px]"
              style={{ color: 'var(--text-tertiary)' }}
            >
              查看参数
            </summary>
            <pre
              className="mt-1 px-2 py-1 rounded text-[10px] whitespace-pre-wrap break-all"
              style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
            >
{JSON.stringify(entry.args, null, 2)}
            </pre>
          </details>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => approveConfirmation(entry.id)}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px]"
              style={{
                background: 'var(--accent, #2563eb)',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <Check size={10} />
              同意
            </button>
            <button
              onClick={() => rejectConfirmation(entry.id)}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px]"
              style={{
                background: 'transparent',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-primary)',
                cursor: 'pointer',
              }}
            >
              <X size={10} />
              拒绝
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
