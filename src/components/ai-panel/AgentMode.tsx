/**
 * AgentMode — Agent 模式主组件
 * 消息列表 + 输入区域 + 工具调用日志 + Patch 预览
 */

import { useState, useRef, useEffect, useCallback } from 'react'
import { Send, Square, Bot, User, Loader2 } from 'lucide-react'
import { useAgentStore } from '../../stores/useAgentStore'
import { AgentToolCallLog } from './AgentToolCallLog'
import { DiffPreview } from './DiffPreview'
import { PatchActions } from './PatchActions'

export function AgentMode() {
  const {
    isRunning,
    messages,
    toolCalls,
    pendingPatches,
    error,
    startAgent,
    cancelAgent,
    clearHistory,
  } = useAgentStore()

  const [input, setInput] = useState('')
  const messagesRef = useRef<HTMLDivElement>(null)

  // 自动滚动到底部
  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight
    }
  }, [messages, toolCalls])

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
    <div className="flex flex-col h-full">
      {/* 消息列表 */}
      <div ref={messagesRef} className="flex-1 overflow-y-auto px-3 py-2 space-y-3">
        {messages.length === 0 && !isRunning && (
          <div
            className="flex flex-col items-center justify-center h-full text-center"
            style={{ color: 'var(--text-tertiary)' }}
          >
            <Bot size={32} className="mb-2 opacity-50" />
            <p className="text-sm">Markdown Writing Agent</p>
            <p className="text-xs mt-1">输入指令让 Agent 帮你编辑文档</p>
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

      {/* 清除历史 */}
      {messages.length > 0 && !isRunning && (
        <div className="px-3 pb-2">
          <button
            className="w-full text-[10px] py-1 rounded transition-colors"
            style={{
              background: 'transparent',
              color: 'var(--text-tertiary)',
              border: '1px solid var(--border-primary)',
              cursor: 'pointer',
            }}
            onClick={clearHistory}
          >
            清除对话
          </button>
        </div>
      )}
    </div>
  )
}
