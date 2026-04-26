interface TitleBarProps {
  // onCloseTab 已移除 - TabBar 不再在 TitleBar 中
}

/**
 * 标题栏组件（VS Code 风格）
 * 仅包含窗口拖拽区域，原生交通灯由 macOS 系统自动渲染（decorations: true）
 * 文件标签栏已移至 Toolbar 下方
 */
export function TitleBar(_props: TitleBarProps) {
  return (
    <div
      className="flex items-stretch bg-[var(--bg-secondary)] border-b border-[var(--border-default)] select-none"
      style={{ height: 'var(--titlebar-height, 38px)' }}
      data-tauri-drag-region
      role="banner"
      aria-label="标题栏"
    />
  )
}
