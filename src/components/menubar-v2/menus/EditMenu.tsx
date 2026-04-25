import type { MenuItemDef } from '../MenuBar'
import { MenuDropdown } from '../MenuDropdown'

interface EditMenuProps {
  onClose: () => void
}

export function EditMenu({ onClose }: EditMenuProps) {
  const items: MenuItemDef[] = [
    { label: '撤销', shortcut: 'Ctrl+Z', action: () => { window.dispatchEvent(new CustomEvent('editor:undo')); onClose() } },
    { label: '重做', shortcut: 'Ctrl+Shift+Z', action: () => { window.dispatchEvent(new CustomEvent('editor:redo')); onClose() } },
    { label: '', separator: true },
    { label: '剪切', shortcut: 'Ctrl+X', action: () => { window.dispatchEvent(new CustomEvent('editor:cut')); onClose() } },
    { label: '复制', shortcut: 'Ctrl+C', action: () => { window.dispatchEvent(new CustomEvent('editor:copy')); onClose() } },
    { label: '粘贴', shortcut: 'Ctrl+V', action: () => { window.dispatchEvent(new CustomEvent('editor:paste')); onClose() } },
    { label: '', separator: true },
    { label: '查找', shortcut: 'Ctrl+F', action: () => { window.dispatchEvent(new CustomEvent('editor:find')); onClose() } },
    { label: '替换', shortcut: 'Ctrl+H', action: () => { window.dispatchEvent(new CustomEvent('editor:replace')); onClose() } },
  ]

  return <MenuDropdown items={items} onClose={onClose} />
}
