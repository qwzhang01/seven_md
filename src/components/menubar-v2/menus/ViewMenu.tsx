import type { MenuItemDef } from '../MenuBar'
import { MenuDropdown } from '../MenuDropdown'
import { useUIStore } from '../../../stores'

interface ViewMenuProps {
  onClose: () => void
}

export function ViewMenu({ onClose }: ViewMenuProps) {
  const ui = useUIStore()

  const items: MenuItemDef[] = [
    { label: '命令面板', shortcut: 'Ctrl+Shift+P', action: () => { ui.toggleCommandPalette(); onClose() } },
    { label: '', separator: true },
    { label: '切换侧边栏', shortcut: 'Ctrl+B', action: () => { ui.toggleSidebar(); onClose() } },
    { label: '切换大纲面板', shortcut: 'Ctrl+Shift+O', action: () => { ui.setActiveSidebarPanel('outline'); onClose() } },
    { label: '', separator: true },
    { label: '放大', shortcut: 'Ctrl++', action: () => { ui.zoomIn(); onClose() } },
    { label: '缩小', shortcut: 'Ctrl+-', action: () => { ui.zoomOut(); onClose() } },
    { label: '重置缩放', shortcut: 'Ctrl+0', action: () => { ui.setZoomLevel(14); onClose() } },
    { label: '', separator: true },
    { label: '仅编辑器', action: () => { ui.setViewMode('editor-only'); onClose() } },
    { label: '仅预览', action: () => { ui.setViewMode('preview-only'); onClose() } },
    { label: '分栏视图', action: () => { ui.setViewMode('split'); onClose() } },
  ]

  return <MenuDropdown items={items} onClose={onClose} />
}
