import { useMemo } from 'react'
import { Clipboard, Type, Search } from 'lucide-react'
import { ContextMenuBase, type ContextMenuItem } from '../shared/ContextMenuBase'
import { useUIStore } from '../../stores'

interface PreviewContextMenuProps {
  x: number
  y: number
  onClose: () => void
  hasSelection: boolean
}

export function PreviewContextMenu({ x, y, onClose, hasSelection }: PreviewContextMenuProps) {
  const items: ContextMenuItem[] = useMemo(() => [
    {
      label: '复制',
      icon: <Clipboard size={14} />,
      shortcut: '⌘C',
      disabled: !hasSelection,
      action: () => {
        document.execCommand('copy')
      },
    },
    { separator: true },
    {
      label: '全选',
      icon: <Type size={14} />,
      shortcut: '⌘A',
      action: () => {
        // 选中预览面板内容
        const previewEl = document.getElementById('md-preview-content')
        if (previewEl) {
          const range = document.createRange()
          range.selectNodeContents(previewEl)
          const selection = window.getSelection()
          selection?.removeAllRanges()
          selection?.addRange(range)
        }
      },
    },
    { separator: true },
    {
      label: '在文档中查找',
      icon: <Search size={14} />,
      shortcut: '⌘F',
      action: () => {
        useUIStore.getState().setFindReplaceOpen(true)
        useUIStore.getState().setFindReplaceMode('find')
      },
    },
  ], [hasSelection])

  return <ContextMenuBase x={x} y={y} items={items} onClose={onClose} />
}
