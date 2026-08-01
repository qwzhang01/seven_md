import { useUIStore } from '../../stores'
import { FolderOpen, Search, List, Code2 } from 'lucide-react'
import type { ReactNode } from 'react'

interface ActivityItem {
  id: 'explorer' | 'search' | 'outline' | 'snippets'
  icon: ReactNode
  tooltip: string
}

const ITEMS: ActivityItem[] = [
  { id: 'explorer', icon: <FolderOpen size={22} />, tooltip: '资源管理器 (Ctrl+Shift+E)' },
  { id: 'search', icon: <Search size={22} />, tooltip: '搜索 (Ctrl+Shift+F)' },
  { id: 'outline', icon: <List size={22} />, tooltip: '大纲 (Ctrl+Shift+O)' },
  { id: 'snippets', icon: <Code2 size={22} />, tooltip: '片段' },
]

interface ActivityBarProps {
  onToggleMobileSidebar?: () => void
  isMobile?: boolean
}

export function ActivityBar({ onToggleMobileSidebar, isMobile = false }: ActivityBarProps) {
  const { activeSidebarPanel, sidebarVisible, setActiveSidebarPanel, setSidebarVisible } = useUIStore()

  return (
    <div
      className="flex flex-col items-center py-1 flex-shrink-0 border-r"
      style={{
        width: 'var(--activitybar-width, 48px)',
        background: 'var(--bg-secondary)',
        borderColor: 'var(--border-primary)',
      }}
      role="navigation"
      aria-label="活动栏"
    >
      {ITEMS.map((item) => {
        const isActive = sidebarVisible && activeSidebarPanel === item.id
        return (
          <button
            key={item.id}
            className="relative flex items-center justify-center w-full transition-colors"
            style={{
              height: '48px',
              color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
              background: isActive ? 'var(--bg-active)' : 'transparent',
              borderLeft: `2px solid ${isActive ? 'var(--accent)' : 'transparent'}`,
            }}
            onClick={() => {
              if (isMobile && onToggleMobileSidebar) {
                // 移动端：切换 overlay
                setActiveSidebarPanel(item.id)
                onToggleMobileSidebar()
              } else {
                // 桌面端：标准侧边栏切换
                if (activeSidebarPanel === item.id && sidebarVisible) {
                  setSidebarVisible(false)
                } else {
                  setActiveSidebarPanel(item.id)
                }
              }
            }}
            title={item.tooltip}
            aria-label={item.tooltip}
            aria-pressed={isActive}
          >
            {/* Left accent indicator */}
            {isActive && (
              <span
                className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-full"
                style={{ background: 'var(--accent)' }}
              />
            )}
            {item.icon}
          </button>
        )
      })}
    </div>
  )
}
