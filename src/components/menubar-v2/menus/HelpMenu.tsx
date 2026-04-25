import type { MenuItemDef } from '../MenuBar'
import { MenuDropdown } from '../MenuDropdown'

interface HelpMenuProps {
  onClose: () => void
}

export function HelpMenu({ onClose }: HelpMenuProps) {
  const items: MenuItemDef[] = [
    { label: '欢迎页', action: () => { onClose() } },
    { label: 'Markdown 指南', action: () => { window.open('https://www.markdownguide.org/', '_blank'); onClose() } },
    { label: '快捷键参考', action: () => { onClose() } },
    { label: '', separator: true },
    { label: '关于 MD Mate', action: () => { onClose() } },
    { label: '检查更新', action: () => { onClose() } },
  ]

  return <MenuDropdown items={items} onClose={onClose} />
}
