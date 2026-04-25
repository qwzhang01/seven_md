import { TrafficLights } from './TrafficLights'
import { TabBar } from './TabBar'
import { TitleBarActions } from './TitleBarActions'

interface TitleBarProps {
  onCloseTab?: (tabId: string) => void
}

/**
 * 统一标题栏组件（VS Code 风格）
 * 整合了：交通灯按钮 + 标签页 + 操作按钮
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
      {/* macOS Traffic Lights */}
      <TrafficLights />

      {/* Tab Bar */}
      <TabBar onCloseTab={onCloseTab} />

      {/* Action Buttons */}
      <TitleBarActions />
    </div>
  )
}
