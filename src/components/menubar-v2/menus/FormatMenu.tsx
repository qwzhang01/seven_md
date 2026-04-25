import type { MenuItemDef } from '../MenuBar'
import { MenuDropdown } from '../MenuDropdown'

interface FormatMenuProps {
  onClose: () => void
}

function insertFormat(text: string) {
  window.dispatchEvent(new CustomEvent('editor:insert', { detail: text }))
}

export function FormatMenu({ onClose }: FormatMenuProps) {
  const items: MenuItemDef[] = [
    { label: '加粗', shortcut: 'Ctrl+B', action: () => { insertFormat('**'); onClose() } },
    { label: '斜体', shortcut: 'Ctrl+I', action: () => { insertFormat('*'); onClose() } },
    { label: '删除线', action: () => { insertFormat('~~'); onClose() } },
    { label: '', separator: true },
    { label: '标题 1', action: () => { insertFormat('# '); onClose() } },
    { label: '标题 2', action: () => { insertFormat('## '); onClose() } },
    { label: '标题 3', action: () => { insertFormat('### '); onClose() } },
    { label: '', separator: true },
    { label: '代码', action: () => { insertFormat('`'); onClose() } },
    { label: '链接', action: () => { insertFormat('[](url)'); onClose() } },
  ]

  return <MenuDropdown items={items} onClose={onClose} />
}
