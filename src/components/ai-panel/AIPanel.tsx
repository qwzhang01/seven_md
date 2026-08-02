import { useEffect, useRef, useCallback, useState } from 'react'
import { X, Bot, Settings } from 'lucide-react'
import { useAIStore } from '../../stores'
import { useUIStore } from '../../stores'
import { useNotificationStore } from '../../stores'
import { isAIConfigured, getAIConfig, setAIConfig } from '../../services/ai'
import { AgentMode } from './AgentMode'

const DEFAULT_WIDTH = 360

export function AIPanel() {
  const { isOpen, setOpen } = useAIStore()
  const { aiPanelWidth, setAIPanelWidth, sidebarWidth } = useUIStore()
  const [showSettings, setShowSettings] = useState(false)
  const [settingsForm, setSettingsForm] = useState(() => getAIConfig())
  const { addNotification } = useNotificationStore()
  const configured = isAIConfigured()

  const handleSaveSettings = useCallback(() => {
    setAIConfig(settingsForm)
    setShowSettings(false)
    addNotification({ type: 'success', message: 'AI 配置已保存', autoClose: true, duration: 2000 })
  }, [settingsForm, addNotification])

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
      // 最大宽度 = 编辑区域（窗口宽度减去侧边栏宽度）的 3/4
      const editorAreaWidth = window.innerWidth - sidebarWidth
      const dynamicMax = Math.floor(editorAreaWidth * 0.75)
      const clampedWidth = Math.max(280, Math.min(dynamicMax, startWidth.current + dx))
      setAIPanelWidth(clampedWidth)
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
  }, [aiPanelWidth, setAIPanelWidth, sidebarWidth])

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
      className="flex-shrink-0 flex flex-col h-full relative"
      style={{
        width: `${aiPanelWidth}px`,
        background: 'var(--bg-ai-panel, var(--bg-secondary))',
        borderLeft: '1px solid var(--border-primary)',
        transition: 'width 0.15s ease',
      }}
    >
      {/* 左侧 Resize 手柄 */}
      <div
        className="absolute left-0 top-0 bottom-0 cursor-col-resize transition-all"
        style={{
          zIndex: 10,
          width: '4px',
          background: 'transparent',
          transform: 'translateX(-50%)',
        }}
        onMouseDown={handleMouseDown}
        onDoubleClick={handleDoubleClick}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'var(--accent)'
          e.currentTarget.style.width = '6px'
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
        <div className="flex items-center gap-1 px-3 py-1.5 text-xs" style={{ color: 'var(--text-primary)' }}>
          <Bot size={14} />
          <span>Agent</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            className="flex items-center justify-center w-6 h-6 rounded transition-colors"
            style={{ color: configured ? 'var(--text-secondary)' : 'var(--accent)', background: 'transparent', border: 'none', cursor: 'pointer' }}
            onClick={() => setShowSettings((v) => !v)}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            aria-label="AI 设置"
            title="AI 设置"
          >
            <Settings size={14} />
          </button>

        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-hidden flex flex-col relative">
        <AgentMode />

        {/* Settings Panel Overlay - global, covers all tabs */}
        {showSettings && (
          <div className="absolute inset-0 z-10 flex flex-col" style={{ background: 'var(--bg-secondary)' }}>
            <div className="flex items-center justify-between px-3 py-2" style={{ borderBottom: '1px solid var(--border-primary)' }}>
              <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>AI 设置</span>
              <button
                className="flex items-center justify-center w-6 h-6 rounded"
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
                onClick={() => setShowSettings(false)}
              >
                <X size={14} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>API Key</label>
                <input
                  type="password"
                  className="w-full text-sm rounded-lg px-3 py-2 outline-none"
                  style={{ background: 'var(--bg-input, var(--bg-primary))', border: '1px solid var(--border-primary)', color: 'var(--text-primary)' }}
                  placeholder="sk-..."
                  value={settingsForm.apiKey}
                  onChange={(e) => setSettingsForm((f) => ({ ...f, apiKey: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>API Endpoint</label>
                <input
                  type="text"
                  className="w-full text-sm rounded-lg px-3 py-2 outline-none"
                  style={{ background: 'var(--bg-input, var(--bg-primary))', border: '1px solid var(--border-primary)', color: 'var(--text-primary)' }}
                  placeholder="https://api.openai.com/v1"
                  value={settingsForm.endpoint}
                  onChange={(e) => setSettingsForm((f) => ({ ...f, endpoint: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>模型</label>
                <input
                  type="text"
                  className="w-full text-sm rounded-lg px-3 py-2 outline-none"
                  style={{ background: 'var(--bg-input, var(--bg-primary))', border: '1px solid var(--border-primary)', color: 'var(--text-primary)' }}
                  placeholder="gpt-3.5-turbo"
                  value={settingsForm.model}
                  onChange={(e) => setSettingsForm((f) => ({ ...f, model: e.target.value }))}
                />
              </div>
            </div>
            <div className="p-4 flex gap-2" style={{ borderTop: '1px solid var(--border-primary)' }}>
              <button
                className="flex-1 text-sm py-2 rounded-lg transition-colors"
                style={{ background: 'var(--bg-hover)', color: 'var(--text-primary)', border: '1px solid var(--border-primary)', cursor: 'pointer' }}
                onClick={() => setShowSettings(false)}
              >
                取消
              </button>
              <button
                className="flex-1 text-sm py-2 rounded-lg transition-colors"
                style={{ background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer' }}
                onClick={handleSaveSettings}
              >
                保存
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  )
}
