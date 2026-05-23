import { useEffect, useRef, useCallback } from 'react'
import { X, MessageCircle, Wand2, Languages, Lightbulb, Bot } from 'lucide-react'
import { useAIStore } from '../../stores'
import { useUIStore } from '../../stores'
import { ChatMode } from './ChatMode'
import { RewriteMode } from './RewriteMode'
import { TranslateMode } from './TranslateMode'
import { ExplainMode } from './ExplainMode'
import { AgentMode } from './AgentMode'

const TABS = [
  { id: 'chat' as const, label: '对话', icon: <MessageCircle size={14} /> },
  { id: 'rewrite' as const, label: '改写', icon: <Wand2 size={14} /> },
  { id: 'translate' as const, label: '翻译', icon: <Languages size={14} /> },
  { id: 'explain' as const, label: '解释', icon: <Lightbulb size={14} /> },
  { id: 'agent' as const, label: 'Agent', icon: <Bot size={14} /> },
]

const DEFAULT_WIDTH = 360

export function AIPanel() {
  const { isOpen, mode, setOpen, setMode } = useAIStore()
  const { aiPanelWidth, setAIPanelWidth } = useUIStore()

  const isResizing = useRef(false)
  const startX = useRef(0)
  const startWidth = useRef(0)

  // 拖拽调整宽度
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    isResizing.current = true
    startX.current = e.clientX
    startWidth.current = aiPanelWidth
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
    document.documentElement.setAttribute('data-resizing', '')

    const handleMouseMove = (ev: MouseEvent) => {
      if (!isResizing.current) return
      // 向左拖动增大宽度（与左侧边栏相反）
      const dx = startX.current - ev.clientX
      setAIPanelWidth(startWidth.current + dx)
    }

    const handleMouseUp = () => {
      isResizing.current = false
      document.documentElement.removeAttribute('data-resizing')
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [aiPanelWidth, setAIPanelWidth])

  // 双击重置宽度
  const handleDoubleClick = useCallback(() => {
    setAIPanelWidth(DEFAULT_WIDTH)
  }, [setAIPanelWidth])

  useEffect(() => {
    if (!isOpen) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [isOpen, setOpen])

  if (!isOpen) return null

  return (
    <div
      className="fixed right-0 flex flex-col z-[1000]"
      style={{
        top: 'var(--titlebar-height, 38px)',
        width: `${aiPanelWidth}px`,
        height: 'calc(100% - var(--titlebar-height, 38px))',
        background: 'var(--bg-ai-panel, var(--bg-secondary))',
        borderLeft: '1px solid var(--border-primary)',
        boxShadow: 'var(--shadow-md)',
        animation: 'aiSlideIn 0.2s ease',
      }}
    >
      {/* 左侧 Resize 手柄 */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 cursor-col-resize transition-all"
        style={{
          zIndex: 10,
          background: 'transparent',
        }}
        onMouseDown={handleMouseDown}
        onDoubleClick={handleDoubleClick}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'var(--accent)'
          e.currentTarget.style.width = '3px'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent'
          e.currentTarget.style.width = '4px'
        }}
      />

      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-2 flex-shrink-0"
        style={{ borderBottom: '1px solid var(--border-primary)' }}
      >
        <div className="flex items-center gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
            className="flex items-center gap-1 px-3 py-1.5 text-xs transition-colors"
            style={{
              color: mode === tab.id ? 'var(--text-primary)' : 'var(--text-secondary)',
              borderBottom: `2px solid ${mode === tab.id ? 'var(--accent)' : 'transparent'}`,
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              paddingBottom: mode === tab.id ? '6px' : '8px',
              borderBottomWidth: mode === tab.id ? '2px' : '0',
              borderBottomStyle: 'solid' as const,
              borderBottomColor: mode === tab.id ? 'var(--accent)' : 'transparent',
            }}
              onClick={() => setMode(tab.id)}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
        <button
          className="flex items-center justify-center w-6 h-6 rounded transition-colors"
          style={{ color: 'var(--text-secondary)', background: 'transparent', border: 'none', cursor: 'pointer' }}
          onClick={() => setOpen(false)}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          aria-label="关闭 AI 面板"
        >
          <X size={14} />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {mode === 'chat' && <ChatMode />}
        {mode === 'rewrite' && <RewriteMode />}
        {mode === 'translate' && <TranslateMode />}
        {mode === 'explain' && <ExplainMode />}
        {mode === 'agent' && <AgentMode />}
      </div>

      <style>{`
        @keyframes aiSlideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  )
}
