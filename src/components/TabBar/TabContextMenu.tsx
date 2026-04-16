import { useEffect, useRef } from 'react'

interface TabContextMenuProps {
  tabId: string
  x: number
  y: number
  canCloseOthers: boolean
  canCloseToRight: boolean
  filePath: string | null
  onClose: () => void
  onCloseOthers: () => void
  onCloseToRight: () => void
  onCloseAll: () => void
  onCopyPath: () => void
  onDismiss: () => void
}

export function TabContextMenu({
  tabId: _tabId,
  x,
  y,
  canCloseOthers,
  canCloseToRight,
  filePath,
  onClose,
  onCloseOthers,
  onCloseToRight,
  onCloseAll,
  onCopyPath,
  onDismiss
}: TabContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onDismiss()
      }
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onDismiss()
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [onDismiss])

  const menuItems = [
    { label: 'Close', action: onClose, shortcut: '⌘W' },
    { label: 'Close Others', action: onCloseOthers, disabled: !canCloseOthers },
    { label: 'Close to the Right', action: onCloseToRight, disabled: !canCloseToRight },
    { label: 'Close All', action: onCloseAll },
    null, // separator
    { label: 'Copy Path', action: onCopyPath, disabled: !filePath },
  ]

  return (
    <div
      ref={menuRef}
      className="fixed z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg py-1 min-w-[180px]"
      style={{ left: x, top: y }}
      role="menu"
      aria-label="Tab context menu"
    >
      {menuItems.map((item, i) =>
        item === null ? (
          <div key={i} className="my-1 border-t border-gray-200 dark:border-gray-700" role="separator" />
        ) : (
          <button
            key={item.label}
            className={`
              w-full text-left px-3 py-1.5 text-xs flex items-center justify-between gap-4
              ${item.disabled
                ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer'
              }
            `}
            onClick={() => {
              if (!item.disabled) {
                item.action()
                onDismiss()
              }
            }}
            disabled={item.disabled}
            role="menuitem"
          >
            <span>{item.label}</span>
            {item.shortcut && (
              <span className="text-gray-400 dark:text-gray-500">{item.shortcut}</span>
            )}
          </button>
        )
      )}
    </div>
  )
}
