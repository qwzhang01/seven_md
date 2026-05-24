import { useState, useRef, useEffect, useCallback } from 'react'
import { Send, Bot, User, RefreshCw, AlertCircle } from 'lucide-react'
import { useAIStore, useNotificationStore } from '../../stores'
import { aiChat, isAIConfigured } from '../../services/aiService'

export function ChatMode() {
  const { messages, isLoading, error, addMessage, setLoading, setError } = useAIStore()
  const { addNotification } = useNotificationStore()
  const [input, setInput] = useState('')
  const [inputHeight, setInputHeight] = useState(80)
  const messagesRef = useRef<HTMLDivElement>(null)
  const isResizingInput = useRef(false)
  const startY = useRef(0)
  const startHeight = useRef(0)

  const handleInputResizeMouseDown = useCallback((e: React.MouseEvent) => {
    isResizingInput.current = true
    startY.current = e.clientY
    startHeight.current = inputHeight
    document.body.style.cursor = 'row-resize'
    document.body.style.userSelect = 'none'

    const handleMouseMove = (ev: MouseEvent) => {
      if (!isResizingInput.current) return
      const dy = startY.current - ev.clientY
      setInputHeight(Math.max(60, Math.min(300, startHeight.current + dy)))
    }

    const handleMouseUp = () => {
      isResizingInput.current = false
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [inputHeight])

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

    try {
      if (!isAIConfigured()) {
        throw new Error('请先配置 AI API Key。点击下方设置按钮进行配置。')
      }

      // 只发送最近 20 条消息避免 token 过多
      const recentMessages = messages.slice(-20).map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }))
      const reply = await aiChat([...recentMessages, { role: 'user' as const, content: text }])
      addMessage('assistant', reply)
    } catch (err) {
      const msg = err instanceof Error ? err.message : '未知错误'
      setError(msg)
      addNotification({ type: 'error', message: `AI 助手: ${msg}`, autoClose: true, duration: 5000 })
    } finally {
      setLoading(false)
    }
  }, [input, isLoading, messages, addMessage, setLoading, setError, addNotification])

  const handleRetry = useCallback(() => {
    const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user')
    if (lastUserMsg) {
      setError(null)
      setInput(lastUserMsg.content)
    }
  }, [messages, setError])

  const configured = isAIConfigured()

  return (
    <div className="flex flex-col h-full overflow-hidden relative">
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
你好！我是 Seven Markdown AI 助手，可以帮助你编写、改写、翻译或解释 Markdown 内容。
              {!configured && (
                <span style={{ color: 'var(--accent)' }}> 请先点击下方 ⚙️ 按钮配置 API Key。</span>
              )}
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
      <div className="flex-shrink-0 flex flex-col" style={{ borderTop: '1px solid var(--border-primary)' }}>
        {/* 拖拽手柄 */}
        <div
          className="flex-shrink-0 flex items-center justify-center h-3 cursor-row-resize"
          style={{ background: 'transparent' }}
          onMouseDown={handleInputResizeMouseDown}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          <div
            className="w-8 h-0.5 rounded-full transition-colors"
            style={{ background: 'var(--border-primary)' }}
          />
        </div>
        <div className="px-3 pb-3 flex gap-2">
          <textarea
            className="flex-1 text-sm resize-none outline-none rounded-lg px-3 py-2"
            style={{
              background: 'var(--bg-input, var(--bg-primary))',
              border: '1px solid var(--border-primary)',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-primary)',
              height: inputHeight,
            } as any}
            placeholder={configured ? '输入消息...' : '请先配置 API Key...'}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
            }}
          />
          <div className="flex flex-col gap-1 self-end">
            <button
              className="w-9 h-9 flex items-center justify-center rounded-lg transition-colors flex-shrink-0"
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


    </div>
  )
}
