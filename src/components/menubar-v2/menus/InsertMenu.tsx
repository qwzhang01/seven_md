import type { MenuItemDef } from '../MenuBar'
import { MenuDropdown } from '../MenuDropdown'

interface InsertMenuProps {
  onClose: () => void
}

function insertAtCursor(text: string) {
  window.dispatchEvent(new CustomEvent('editor:insert', { detail: text }))
}

export function InsertMenu({ onClose }: InsertMenuProps) {
  const items: MenuItemDef[] = [
    { label: '标题', action: () => { insertAtCursor('# '); onClose() } },
    { label: '加粗', action: () => { insertAtCursor('**加粗文本**'); onClose() } },
    { label: '斜体', action: () => { insertAtCursor('*斜体文本*'); onClose() } },
    { label: '', separator: true },
    { label: '行内代码', action: () => { insertAtCursor('`代码`'); onClose() } },
    { label: '代码块', action: () => { insertAtCursor('```language\n\n```'); onClose() } },
    { label: '', separator: true },
    { label: '链接', shortcut: 'Ctrl+K', action: () => { insertAtCursor('[文本](url)'); onClose() } },
    { label: '图片', action: () => { insertAtCursor('![描述](url)'); onClose() } },
    { label: '', separator: true },
    { label: '表格', action: () => { insertAtCursor('| 列1 | 列2 | 列3 |\n|------|------|------|\n| | | |'); onClose() } },
    { label: '水平线', action: () => { insertAtCursor('\n---\n'); onClose() } },
    { label: '', separator: true },
    { label: '无序列表', action: () => { insertAtCursor('- '); onClose() } },
    { label: '有序列表', action: () => { insertAtCursor('1. '); onClose() } },
    { label: '任务列表', action: () => { insertAtCursor('- [ ] '); onClose() } },
    { label: '', separator: true },
    { label: '引用', action: () => { insertAtCursor('> '); onClose() } },
  ]

  return <MenuDropdown items={items} onClose={onClose} />
}
