import { TabBar } from './TabBar'

interface TitleBarProps {
  onCloseTab?: (tabId: string) => void
}

/**
 * 标题栏组件（VS Code 风格）
 * 包含文件标签页
 * 原生交通灯由 macOS 系统自动渲染（decorations: true）
 */
export function TitleBar({ onCloseTab }: TitleBarProps) {
  return (
    <div
      className="flex items-stretch bg-[var(--bg-secondary)] border-b border-[var(--border-default)] select-none"
      style={{ height: 'var(--titlebar-height, 38px)' }}
      data-tauri-drag-region
      role="banner"
      aria-label="标题栏"
    >
      {/* Tab Bar */}
      <TabBar onCloseTab={onCloseTab} />
    </div>
  )
}
