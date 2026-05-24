/**
 * AgentMode — Agent 模式主组件
 *
 * 布局：
 *   ┌─────────────────────────────┐
 *   │ Header (model selector / sessions / clear) │
 *   ├─────────────────────────────┤
 *   │ PresetBar                                  │
 *   ├─────────────────────────────┤
 *   │ Compaction indicator (conditional)         │
 *   │ Messages + ToolCalls + ConfirmPanel + Diff │
 *   ├─────────────────────────────┤
 *   │ Error                                      │
 *   ├─────────────────────────────┤
 *   │ Input                                      │
 *   └─────────────────────────────┘
 *
 *   SessionDrawer 以遮罩层方式覆盖在面板上方。
 */

import { useState, useRef, useEffect, useCallback } from 'react'
import { Send, Square, Bot, User, Loader2, History, Trash2 } from 'lucide-react'
import { useAgentStore } from '../../stores/useAgentStore'
import { AgentToolCallLog } from './AgentToolCallLog'
import { DiffPreview } from './DiffPreview'
import { PatchActions } from './PatchActions'
import { AgentPresetBar } from './AgentPresetBar'
import { AgentModelSelector } from './AgentModelSelector'
import { AgentSessionDrawer } from './AgentSessionDrawer'
import { AgentConfirmPanel } from './AgentConfirmPanel'
import {
  AGENT_RUN_PRESET_EVENT,
  findPreset,
  type AgentRunPresetDetail,
} from '../../services/ai/agent/agentPresets'
import { useAIStore } from '../../stores/useAIStore'

export function AgentMode() {
  const {
    isRunning,
    messages,
    toolCalls,
    pendingPatches,
    compactionInProgress,
    error,
    startAgent,
    cancelAgent,
    clearHistory,
  } = useAgentStore()

  const setMode = useAIStore((s) => s.setMode)
  const selectedText = useAIStore((s) => s.selectedText)

  const [input, setInput] = useState('')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const messagesRef = useRef<HTMLDivElement>(null)

  // 自动滚动
  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight
    }
  }, [messages, toolCalls])

  // 监听 preset 事件
  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<AgentRunPresetDetail>).detail
      const preset = findPreset(detail.presetId)
      if (!preset) {
        console.warn(`[AgentMode] 未知 preset: ${detail.presetId}`)
        return
      }
      // 切换到 Agent Tab
      setMode('agent')

      if (preset.requiresSelection && (!selectedText || selectedText.trim().length === 0)) {
        alert('请先选中文本')
        return
      }
      // 启动 Agent
      startAgent(preset.prompt)
    }
    window.addEventListener(AGENT_RUN_PRESET_EVENT, handler as EventListener)
    return () => window.removeEventListener(AGENT_RUN_PRESET_EVENT, handler as EventListener)
  }, [startAgent, setMode, selectedText])

  const handleSend = useCallback(() => {
    const text = input.trim()
    if (!text || isRunning) return
    setInput('')
    startAgent(text)
  }, [input, isRunning, startAgent])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSend()
      }
    },
    [handleSend],
  )

  return (
    <div className="flex flex-col h-full relative">
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-1.5 gap-2"
        style={{ borderBottom: '1px solid var(--border-primary)' }}
      >
        <div className="flex items-center gap-1.5 text-[11px]" style={{ color: 'var(--text-secondary)' }}>
          <Bot size={12} />
          <span>Agent</span>
        </div>
        <div className="flex items-center gap-1.5">
          <AgentModelSelector />
          <button
            onClick={() => setDrawerOpen(true)}
            className="inline-flex items-center justify-center w-6 h-6 rounded"
            style={{
              background: 'transparent',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-primary)',
              cursor: 'pointer',
            }}
            title="会话列表"
          >
            <History size={12} />
          </button>
          {messages.length > 0 && !isRunning && (
            <button
              onClick={clearHistory}
              className="inline-flex items-center justify-center w-6 h-6 rounded"
              style={{
                background: 'transparent',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-primary)',
                cursor: 'pointer',
              }}
              title="清除对话"
            >
              <Trash2 size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Preset bar */}
      <AgentPresetBar />

      {/* Compaction indicator */}
      {compactionInProgress && (
        <div
          className="px-3 py-1 text-[10px] flex items-center gap-1"
          style={{
            background: 'var(--bg-info, #eff6ff)',
            color: 'var(--text-info, #1d4ed8)',
            borderBottom: '1px solid var(--border-primary)',
          }}
        >
          <Loader2 size={10} className="animate-spin" />
          正在压缩对话上下文…
        </div>
      )}

      {/* 消息列表 */}
      <div ref={messagesRef} className="flex-1 overflow-y-auto px-3 py-2 space-y-3">
        {messages.length === 0 && !isRunning && (
          <div
            className="flex flex-col items-center justify-center h-full text-center"
            style={{ color: 'var(--text-tertiary)' }}
          >
            <Bot size={32} className="mb-2 opacity-50" />
            <p className="text-sm">Markdown Writing Agent</p>
            <p className="text-xs mt-1">输入指令或选择上方预设让 Agent 帮你编辑</p>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div
                className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center"
                style={{ background: 'var(--accent)', color: 'white' }}
              >
                <Bot size={12} />
              </div>
            )}
            <div
              className="max-w-[85%] rounded-lg px-3 py-2 text-xs leading-relaxed"
              style={{
                background: msg.role === 'user' ? 'var(--accent)' : 'var(--bg-tertiary)',
                color: msg.role === 'user' ? 'white' : 'var(--text-primary)',
              }}
            >
              {msg.role === 'assistant' ? (
                <div className="whitespace-pre-wrap break-words">
                  {msg.content || (isRunning && <span className="animate-pulse">思考中...</span>)}
                </div>
              ) : (
                <div className="whitespace-pre-wrap break-words">{msg.content}</div>
              )}
            </div>
            {msg.role === 'user' && (
              <div
                className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center"
                style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
              >
                <User size={12} />
              </div>
            )}
          </div>
        ))}

        {/* Streaming indicator */}
        {isRunning && messages.length > 0 && messages[messages.length - 1]?.role === 'assistant' && messages[messages.length - 1]?.content && (
          <div className="flex items-center gap-1 px-2" style={{ color: 'var(--text-tertiary)' }}>
            <Loader2 size={10} className="animate-spin" />
            <span className="text-[10px]">生成中...</span>
          </div>
        )}

        {/* Tool Call Log */}
        {toolCalls.length > 0 && <AgentToolCallLog toolCalls={toolCalls} />}

        {/* Confirmation Panel */}
        <AgentConfirmPanel />

        {/* Diff Preview + Patch Actions */}
        {pendingPatches.length > 0 && (
          <div className="space-y-2">
            <DiffPreview patches={pendingPatches} />
            <PatchActions />
          </div>
        )}
      </div>

      {/* 错误信息 */}
      {error && (
        <div
          className="mx-3 mb-2 px-3 py-2 rounded text-xs flex items-center justify-between"
          style={{ background: 'var(--bg-error, #fef2f2)', color: 'var(--text-error, #dc2626)' }}
        >
          <span>{error}</span>
          <button
            className="ml-2 underline text-xs"
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'inherit' }}
            onClick={() => {
              const lastUser = [...messages].reverse().find((m) => m.role === 'user')
              if (lastUser) startAgent(lastUser.content)
            }}
          >
            重试
          </button>
        </div>
      )}

      {/* 输入区域 */}
      <div
        className="flex-shrink-0 px-3 py-2 flex items-end gap-2"
        style={{ borderTop: '1px solid var(--border-primary)' }}
      >
        <textarea
          className="flex-1 resize-none rounded px-2 py-1.5 text-xs"
          style={{
            background: 'var(--bg-tertiary)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-primary)',
            outline: 'none',
            minHeight: '32px',
            maxHeight: '96px',
          }}
          placeholder={isRunning ? 'Agent 运行中...' : '输入指令...'}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isRunning}
          rows={1}
        />
        {isRunning ? (
          <button
            className="flex items-center justify-center w-7 h-7 rounded transition-colors"
            style={{
              background: 'var(--bg-error, #fef2f2)',
              color: 'var(--text-error, #dc2626)',
              border: 'none',
              cursor: 'pointer',
            }}
            onClick={cancelAgent}
            title="取消"
          >
            <Square size={14} />
          </button>
        ) : (
          <button
            className="flex items-center justify-center w-7 h-7 rounded transition-colors"
            style={{
              background: input.trim() ? 'var(--accent)' : 'var(--bg-tertiary)',
              color: input.trim() ? 'white' : 'var(--text-tertiary)',
              border: 'none',
              cursor: input.trim() ? 'pointer' : 'default',
            }}
            onClick={handleSend}
            disabled={!input.trim()}
            title="发送"
          >
            <Send size={14} />
          </button>
        )}
      </div>

      {/* Session Drawer (绝对定位覆盖) */}
      <AgentSessionDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
  )
}
