import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'

export type ContextMenuAction = 'new-file' | 'new-folder' | 'rename' | 'delete'

interface ContextMenuProps {
  x: number
  y: number
  onAction: (action: ContextMenuAction) => void
  onClose: () => void
}

export default function ContextMenu({ x, y, onAction, onClose }: ContextMenuProps) {
  const { t } = useTranslation()
  const menuRef = useRef<HTMLUListElement>(null)

  // Close on outside mousedown
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleMouseDown)
    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [onClose])

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const items: { action: ContextMenuAction; label: string; danger?: boolean }[] = [
    { action: 'new-file', label: t('fileTree.newFile') },
    { action: 'new-folder', label: t('fileTree.newFolder') },
    { action: 'rename', label: t('fileTree.rename') },
    { action: 'delete', label: t('fileTree.delete'), danger: true },
  ]

  return createPortal(
    <ul
      ref={menuRef}
      role="menu"
      className="fixed z-50 min-w-[140px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded shadow-lg py-1 text-sm"
      style={{ left: x, top: y }}
    >
      {items.map(({ action, label, danger }) => (
        <li key={action} role="none">
          <button
            role="menuitem"
            className={`w-full text-left px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
              danger ? 'text-red-600 dark:text-red-400' : 'text-gray-700 dark:text-gray-200'
            }`}
            onMouseDown={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onAction(action)
              onClose()
            }}
          >
            {label}
          </button>
        </li>
      ))}
    </ul>,
    document.body
  )
}
