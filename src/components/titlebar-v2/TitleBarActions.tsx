import { Command, PanelLeft } from 'lucide-react'
import { useUIStore } from '../../stores'

/**
 * 标题栏右侧操作按钮
 * - 命令面板按钮
 * - 侧边栏切换按钮
 */
export function TitleBarActions() {
  const { toggleCommandPalette, toggleSidebar, sidebarVisible } = useUIStore()

  return (
    <div className="flex items-center gap-0.5 pr-2" data-tauri-drag-region>
      {/* Command Palette Button */}
      <button
        className="flex items-center justify-center w-7 h-7 rounded-sm text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-colors"
        onClick={toggleCommandPalette}
        aria-label="命令面板"
        title="命令面板 (Ctrl+Shift+P)"
      >
        <Command size={14} />
      </button>

      {/* Toggle Sidebar Button */}
      <button
        className={`flex items-center justify-center w-7 h-7 rounded-sm transition-colors ${
          sidebarVisible
            ? 'text-[var(--text-accent)] hover:bg-[var(--bg-hover)]'
            : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]'
        }`}
        onClick={toggleSidebar}
        aria-label={sidebarVisible ? '隐藏侧边栏' : '显示侧边栏'}
        title="切换侧边栏 (Ctrl+B)"
      >
        <PanelLeft size={14} />
      </button>
    </div>
  )
}
