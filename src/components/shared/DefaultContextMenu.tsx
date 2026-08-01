import { dispatch } from '../../lib/eventBus'
import { useMemo } from 'react'
import { FilePlus, FolderOpen, FolderPlus, Terminal } from 'lucide-react'
import { ContextMenuBase, type ContextMenuItem } from './ContextMenuBase'
import { useFileStore, useUIStore, useWorkspaceStore } from '../../stores'

interface DefaultContextMenuProps {
  x: number
  y: number
  onClose: () => void
}

/**
 * 默认兜底右键菜单
 * 在未被其他组件覆盖的空白区域显示
 */
export function DefaultContextMenu({ x, y, onClose }: DefaultContextMenuProps) {
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
    {
      label: '打开文件夹',
      icon: <FolderPlus size={14} />,
      action: () => {
        useWorkspaceStore.getState().openFolder()
      },
    },
    { separator: true },
    {
      label: '命令面板',
      icon: <Terminal size={14} />,
      shortcut: '⇧⌘P',
      action: () => {
        useUIStore.getState().toggleCommandPalette()
      },
    },
  ], [])

  return <ContextMenuBase x={x} y={y} items={items} onClose={onClose} />
}
