import { dispatch } from '../../lib/eventBus'
import { useMemo } from 'react'
import { FilePlus, FolderOpen, Clock } from 'lucide-react'
import { ContextMenuBase, type ContextMenuItem } from '../shared/ContextMenuBase'
import { useFileStore } from '../../stores'

interface TabBarContextMenuProps {
  x: number
  y: number
  onClose: () => void
}

export function TabBarContextMenu({ x, y, onClose }: TabBarContextMenuProps) {
  const items: ContextMenuItem[] = useMemo(() => [
    {
      label: '新建文件',
      icon: <FilePlus size={14} />,
      shortcut: '⌘N',
      action: () => {
        useFileStore.getState().openTab(null, '')
      },
    },
    {
      label: '打开文件',
      icon: <FolderOpen size={14} />,
      shortcut: '⌘O',
      action: () => {
        dispatch('app:open-file', undefined)
      },
    },
    { separator: true },
    {
      label: '打开最近文件',
      icon: <Clock size={14} />,
      action: () => {
        // 触发最近文件列表（通过命令面板的最近文件模式）
        dispatch('app:show-recent-files', undefined)
      },
    },
  ], [])

  return <ContextMenuBase x={x} y={y} items={items} onClose={onClose} />
}
