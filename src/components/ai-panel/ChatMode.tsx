import { useState, useRef, useEffect, useCallback } from 'react'
import { Send, Bot, User, RefreshCw, AlertCircle } from 'lucide-react'
import { useAIStore, useNotificationStore } from '../../stores'

export function ChatMode() {
  const { messages, isLoading, error, addMessage, setLoading, setError } = useAIStore()
  const { addNotification } = useNotificationStore()
  const [input, setInput] = useState('')
  const messagesRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<boolean>(false)

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = useCallback(async () => {
    const text = input.trim()
    if (!text || isLoading) return
    setInput('')
    setError(null)
    addMessage('user', text)
    setLoading(true)
    abortRef.current = false

    // Mock AI response with error simulation
    // In production, replace with actual API call
    try {
      await new Promise<void>((resolve, reject) => {
        const timer = setTimeout(() => {
          if (abortRef.current) {
            reject(new Error('请求已取消'))
            return
          }
          // Simulate occasional errors (10% chance)
          if (Math.random() < 0.1) {
            reject(new Error('AI 服务暂时不可用，请稍后重试'))
            return
          }
          resolve()
        }, 800)
        return () => clearTimeout(timer)
      })

      const replies = [
        '我可以帮你改进这段 Markdown 的格式和结构。',
        '这段文档描述清晰，可以考虑添加更多示例增强可读性。',
        '建议将长段落拆分，使用标题来组织内容。',
        '这段代码块可以添加语言标识来启用语法高亮。',
        '可以使用表格来组织数据，使信息更加清晰。',
      ]
      addMessage('assistant', replies[Math.floor(Math.random() * replies.length)])
    } catch (err) {
      const msg = err instanceof Error ? err.message : '未知错误'
      setError(msg)
      addNotification({ type: 'error', message: `AI 助手: ${msg}`, autoClose: true, duration: 5000 })
    } finally {
      setLoading(false)
    }
  }, [input, isLoading, addMessage, setLoading, setError, addNotification])

  const handleRetry = useCallback(() => {
    const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user')
    if (lastUserMsg) {
      setError(null)
      setInput(lastUserMsg.content)
    }
  }, [messages, setError])

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Messages */}
      <div ref={messagesRef} className="flex-1 overflow-y-auto p-3 space-y-4">
        {messages.length === 0 && (
          <div className="flex gap-2.5">
            <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: 'var(--accent)', color: '#fff', fontSize: 14 }}>
              <Bot size={14} />
            </div>
            <div className="text-sm rounded-lg px-3 py-2 max-w-[85%]"
              style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)', lineHeight: 1.6 }}>
              你好！我是 MD Mate AI 助手，可以帮助你编写、改写、翻译或解释 Markdown 内容。
            </div>
          </div>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                background: msg.role === 'user' ? 'var(--bg-active)' : 'var(--accent)',
                color: msg.role === 'user' ? 'var(--text-primary)' : '#fff',
              }}
            >
              {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
            </div>
            <div
              className="text-sm rounded-lg px-3 py-2 max-w-[85%]"
              style={{
                background: msg.role === 'user' ? 'var(--accent)' : 'var(--bg-tertiary)',
                color: msg.role === 'user' ? '#fff' : 'var(--text-primary)',
                lineHeight: 1.6,
              }}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-2.5">
            <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: 'var(--accent)', color: '#fff' }}>
              <Bot size={14} />
            </div>
            <div className="text-sm rounded-lg px-3 py-2" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
              <span className="animate-pulse">思考中...</span>
            </div>
          </div>
        )}

        {/* Error display with retry */}
        {error && (
          <div className="flex items-center gap-2 mx-3 p-2.5 rounded-lg text-sm" style={{ background: 'rgba(244,135,113,0.1)', border: '1px solid var(--error-color, var(--error))' }}>
            <AlertCircle size={14} style={{ color: 'var(--error-color, var(--error))', flexShrink: 0 }} />
            <span style={{ color: 'var(--error-color, var(--error))', flex: 1 }}>{error}</span>
            <button
              className="flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors"
              style={{ background: 'var(--bg-hover)', color: 'var(--text-primary)', border: 'none', cursor: 'pointer' }}
              onClick={handleRetry}
            >
              <RefreshCw size={12} />
              重试
            </button>
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="p-3 flex-shrink-0" style={{ borderTop: '1px solid var(--border-primary)' }}>
        <div className="flex gap-2">
          <textarea
            className="flex-1 text-sm resize-none outline-none rounded-lg px-3 py-2"
            style={{
              background: 'var(--bg-input, var(--bg-primary))',
              border: '1px solid var(--border-primary)',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-primary)',
              rows: 2,
              minHeight: 60,
            } as any}
            placeholder="输入消息..."
            rows={2}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
            }}
          />
          <button
            className="w-9 h-9 flex items-center justify-center rounded-lg transition-colors flex-shrink-0 self-end"
            style={{
              background: 'var(--accent)',
              color: '#fff',
              border: 'none',
              cursor: isLoading ? 'default' : 'pointer',
              opacity: isLoading ? 0.6 : 1,
            }}
            onClick={handleSend}
            disabled={isLoading}
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
