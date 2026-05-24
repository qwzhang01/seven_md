/**
 * AgentSessionDrawer — Agent 会话抽屉
 * 列出全部会话，支持新建/切换/删除
 */

import { Plus, Trash2, MessageCircle, X } from 'lucide-react'
import { useAgentStore } from '../../stores/useAgentStore'

interface AgentSessionDrawerProps {
  open: boolean
  onClose: () => void
}

export function AgentSessionDrawer({ open, onClose }: AgentSessionDrawerProps) {
  const sessions = useAgentStore((s) => s.sessions)
  const activeSessionId = useAgentStore((s) => s.activeSessionId)
  const createSession = useAgentStore((s) => s.createSession)
  const setActiveSession = useAgentStore((s) => s.setActiveSession)
  const deleteSession = useAgentStore((s) => s.deleteSession)

  if (!open) return null

  const list = Object.values(sessions).sort((a, b) => b.createdAt - a.createdAt)

  return (
    <div
      className="absolute inset-0 z-20 flex flex-col"
      style={{ background: 'var(--bg-primary)' }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-2"
        style={{ borderBottom: '1px solid var(--border-primary)' }}
      >
        <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
          Agent 会话
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              createSession()
            }}
            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px]"
            style={{
              background: 'var(--accent)',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
            }}
            title="新建会话"
          >
            <Plus size={10} />
            新建
          </button>
          <button
            onClick={onClose}
            className="inline-flex items-center justify-center w-5 h-5 rounded"
            style={{
              background: 'transparent',
              color: 'var(--text-secondary)',
              border: 'none',
              cursor: 'pointer',
            }}
            title="关闭"
          >
            <X size={12} />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {list.map((s) => (
          <div
            key={s.id}
            className="flex items-center gap-2 px-3 py-2 cursor-pointer"
            style={{
              background: s.id === activeSessionId ? 'var(--bg-tertiary)' : 'transparent',
              borderBottom: '1px solid var(--border-primary)',
            }}
            onClick={() => {
              setActiveSession(s.id)
              onClose()
            }}
          >
            <MessageCircle size={12} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
            <div className="flex-1 min-w-0">
              <div className="text-xs truncate" style={{ color: 'var(--text-primary)' }}>
                {s.title}
              </div>
              <div className="text-[10px] truncate" style={{ color: 'var(--text-tertiary)' }}>
                {s.modelId} · {s.messages.length} 条消息
                {s.isRunning && <span style={{ color: 'var(--accent)' }}> · 运行中</span>}
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation()
                if (confirm(`确定删除会话「${s.title}」？`)) {
                  deleteSession(s.id)
                }
              }}
              className="inline-flex items-center justify-center w-5 h-5 rounded"
              style={{
                background: 'transparent',
                color: 'var(--text-tertiary)',
                border: 'none',
                cursor: 'pointer',
              }}
              title="删除"
            >
              <Trash2 size={10} />
            </button>
          </div>
        ))}
        {list.length === 0 && (
          <div
            className="px-3 py-6 text-center text-xs"
            style={{ color: 'var(--text-tertiary)' }}
          >
            暂无会话
          </div>
        )}
      </div>
    </div>
  )
}
