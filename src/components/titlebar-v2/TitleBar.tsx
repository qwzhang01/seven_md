import { useUIStore } from '../../stores'

interface TitleBarProps {
  // onCloseTab 已移除 - TabBar 不再在 TitleBar 中
}

/**
 * 标题栏组件（VS Code 风格）
 * 仅包含窗口拖拽区域，原生交通灯由 macOS 系统自动渲染（decorations: true）
 * 文件标签栏已移至 Toolbar 下方
 * 全屏模式下自动隐藏（交通灯消失，不需要拖拽区域）
 */
export function TitleBar(_props: TitleBarProps) {
  const isFullscreen = useUIStore((s) => s.isFullscreen)

  return (
    <div
      className="flex items-stretch bg-[var(--bg-secondary)] border-b border-[var(--border-default)] select-none"
      style={{
        height: isFullscreen ? 0 : 'var(--titlebar-height, 38px)',
        overflow: 'hidden',
      }}
      data-tauri-drag-region
      role="banner"
      aria-label="标题栏"
    />
  )
}
