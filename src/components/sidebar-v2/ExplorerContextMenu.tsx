import { useEffect, useRef, type ReactNode } from 'react'
import { FilePlus, FolderPlus, Pencil, Trash2, Copy, Terminal, FolderSearch } from 'lucide-react'

export interface ContextMenuItem {
  id: string
  label: string
  icon?: ReactNode
  shortcut?: string
  disabled?: boolean
  danger?: boolean
  separator?: boolean
  onClick?: () => void
}

export interface ExplorerContextMenuProps {
  items: ContextMenuItem[]
  position: { x: number; y: number }
  onClose: () => void
}

/**
 * 资源管理器右键菜单组件
 */
export function ExplorerContextMenu({ items, position, onClose }: ExplorerContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)

  // 调整菜单位置，避免超出屏幕
  const menuX = Math.min(position.x, window.innerWidth - 220)
  const menuY = Math.min(position.y, window.innerHeight - 300)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [onClose])

  return (
    <div
      ref={menuRef}
      className="fixed z-[9999] min-w-[180px] rounded py-1 shadow-lg"
      style={{
        left: menuX,
        top: menuY,
        background: 'var(--bg-context-menu, var(--bg-secondary))',
        border: '1px solid var(--border-primary)',
        boxShadow: 'var(--shadow-menu)',
      }}
      role="menu"
    >
      {items.map((item, i) => {
        if (item.separator) {
          return (
            <div
              key={`sep-${i}`}
              className="h-px my-1 mx-2"
              style={{ background: 'var(--border-primary)' }}
            />
          )
        }

        return (
          <button
            key={item.id}
            className="w-full text-left flex items-center gap-2 px-4 py-1.5 text-xs transition-colors"
            style={{
              color: item.danger
                ? 'var(--error-color, #f14c4c)'
                : item.disabled
                ? 'var(--text-tertiary)'
                : 'var(--text-primary)',
              background: 'transparent',
              border: 'none',
              cursor: item.disabled ? 'default' : 'pointer',
              opacity: item.disabled ? 0.5 : 1,
            }}
            onMouseEnter={(e) => {
              if (!item.disabled) {
                e.currentTarget.style.background = 'var(--bg-context-hover, var(--bg-active))'
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
            }}
            onClick={() => {
              if (!item.disabled && item.onClick) {
                item.onClick()
                onClose()
              }
            }}
            role="menuitem"
            disabled={item.disabled}
          >
            {item.icon && <span className="flex-shrink-0 w-4 h-4">{item.icon}</span>}
            <span className="flex-1">{item.label}</span>
            {item.shortcut && (
              <span className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>
                {item.shortcut}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

/**
 * 获取文件右键菜单项
 */
export function getFileContextMenuItems(options: {
  parentPath: string
  fileName: string
  filePath: string
  onNewFile: () => void
  onNewFolder: () => void
  onRename: () => void
  onDelete: () => void
  onCopyPath: () => void
  onOpenTerminal: () => void
  onRevealInFinder: () => void
}): ContextMenuItem[] {
  const { onNewFile, onNewFolder, onRename, onDelete, onCopyPath, onOpenTerminal, onRevealInFinder } = options

  return [
    { id: 'new-file', label: '新建文件', icon: <FilePlus size={14} />, onClick: onNewFile },
    { id: 'new-folder', label: '新建文件夹', icon: <FolderPlus size={14} />, onClick: onNewFolder },
    { id: 'sep1', label: '', separator: true },
    { id: 'rename', label: '重命名', icon: <Pencil size={14} />, onClick: onRename },
    { id: 'sep2', label: '', separator: true },
    { id: 'copy-path', label: '复制路径', icon: <Copy size={14} />, onClick: onCopyPath },
    { id: 'open-terminal', label: '在终端中打开', icon: <Terminal size={14} />, onClick: onOpenTerminal },
    { id: 'reveal-finder', label: '在 Finder 中显示', icon: <FolderSearch size={14} />, onClick: onRevealInFinder },
    { id: 'sep3', label: '', separator: true },
    { id: 'delete', label: '删除', icon: <Trash2 size={14} />, danger: true, onClick: onDelete },
  ]
}

/**
 * 获取文件夹右键菜单项
 */
export function getFolderContextMenuItems(options: {
  folderPath: string
  folderName: string
  onNewFile: () => void
  onNewFolder: () => void
  onRename: () => void
  onDelete: () => void
  onCopyPath: () => void
  onOpenTerminal: () => void
  onRevealInFinder: () => void
}): ContextMenuItem[] {
  const { onNewFile, onNewFolder, onRename, onDelete, onCopyPath, onOpenTerminal, onRevealInFinder } = options

  return [
    { id: 'new-file', label: '新建文件', icon: <FilePlus size={14} />, onClick: onNewFile },
    { id: 'new-folder', label: '新建文件夹', icon: <FolderPlus size={14} />, onClick: onNewFolder },
    { id: 'sep1', label: '', separator: true },
    { id: 'rename', label: '重命名', icon: <Pencil size={14} />, onClick: onRename },
    { id: 'sep2', label: '', separator: true },
    { id: 'copy-path', label: '复制路径', icon: <Copy size={14} />, onClick: onCopyPath },
    { id: 'open-terminal', label: '在终端中打开', icon: <Terminal size={14} />, onClick: onOpenTerminal },
    { id: 'reveal-finder', label: '在 Finder 中显示', icon: <FolderSearch size={14} />, onClick: onRevealInFinder },
    { id: 'sep3', label: '', separator: true },
    { id: 'delete', label: '删除', icon: <Trash2 size={14} />, danger: true, onClick: onDelete },
  ]
}
