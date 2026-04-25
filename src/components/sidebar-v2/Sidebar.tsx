import { useRef, useCallback } from 'react'
import { useUIStore } from '../../stores'
import { ExplorerPanel } from './ExplorerPanel'
import { SearchPanel } from './SearchPanel'
import { OutlinePanel } from './OutlinePanel'
import { SnippetsPanel } from './SnippetsPanel'

const DEFAULT_WIDTH = 260

interface SidebarProps {
  content: string  // 当前编辑器内容（用于大纲/搜索）
}

export function Sidebar({ content }: SidebarProps) {
  const { sidebarVisible, sidebarWidth, activeSidebarPanel, setSidebarWidth } = useUIStore()
  const isResizing = useRef(false)
  const startX = useRef(0)
  const startWidth = useRef(0)

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    isResizing.current = true
    startX.current = e.clientX
    startWidth.current = sidebarWidth
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'

    const handleMouseMove = (ev: MouseEvent) => {
      if (!isResizing.current) return
      const dx = ev.clientX - startX.current
      setSidebarWidth(startWidth.current + dx)
    }

    const handleMouseUp = () => {
      isResizing.current = false
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [sidebarWidth, setSidebarWidth])

  const handleDoubleClick = useCallback(() => {
    setSidebarWidth(DEFAULT_WIDTH)
  }, [setSidebarWidth])

  if (!sidebarVisible) return null

  const renderPanel = () => {
    switch (activeSidebarPanel) {
      case 'explorer': return <ExplorerPanel />
      case 'search': return <SearchPanel content={content} />
      case 'outline': return <OutlinePanel content={content} />
      case 'snippets': return <SnippetsPanel />
      default: return <ExplorerPanel />
    }
  }

  return (
    <div
      className="relative flex-shrink-0 flex flex-col overflow-hidden"
      style={{
        width: sidebarWidth,
        background: 'var(--bg-sidebar, var(--bg-secondary))',
        borderRight: '1px solid var(--border-primary)',
        transition: 'none',
      }}
      role="complementary"
      aria-label="侧边栏"
    >
      {/* Panel content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {renderPanel()}
      </div>

      {/* Resize handle */}
      <div
        className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-[var(--accent)] transition-colors"
        style={{ zIndex: 10 }}
        onMouseDown={handleMouseDown}
        onDoubleClick={handleDoubleClick}
      />
    </div>
  )
}
