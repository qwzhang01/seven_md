import React, { memo } from 'react'
import { X } from 'lucide-react'
import { TabState } from '../../types'
import { getFileIcon } from '../../utils/fileIcons'

interface TabProps {
  tab: TabState
  isActive: boolean
  displayName: string
  index: number
  onActivate: (tabId: string) => void
  onClose: (tabId: string) => void
  onContextMenu: (e: React.MouseEvent, tabId: string) => void
  onDragStart: (e: React.DragEvent, index: number) => void
  onDragOver: (e: React.DragEvent, index: number) => void
  onDrop: (e: React.DragEvent, index: number) => void
}

export const Tab = memo(function Tab({
  tab,
  isActive,
  displayName,
  index,
  onActivate,
  onClose,
  onContextMenu,
  onDragStart,
  onDragOver,
  onDrop
}: TabProps) {
  const iconConfig = getFileIcon(displayName, false, false)
  const IconComponent = iconConfig.icon

  const handleMouseDown = (e: React.MouseEvent) => {
    // Middle-click to close
    if (e.button === 1) {
      e.preventDefault()
      onClose(tab.id)
    }
  }

  const handleClick = (e: React.MouseEvent) => {
    if (e.button === 0) {
      onActivate(tab.id)
    }
  }

  const handleCloseClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onClose(tab.id)
  }

  return (
    <div
      className={`
        group relative flex items-center gap-1.5 px-3 py-1.5 min-w-0 max-w-[180px] shrink-0
        border-r border-gray-200 dark:border-gray-700 cursor-pointer select-none
        transition-colors text-xs
        ${isActive
          ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border-b-2 border-b-blue-500'
          : 'bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-750 hover:text-gray-700 dark:hover:text-gray-300'
        }
      `}
      role="tab"
      aria-selected={isActive}
      aria-label={`${displayName}${tab.isDirty ? ' (unsaved)' : ''}`}
      title={tab.path || displayName}
      tabIndex={isActive ? 0 : -1}
      draggable
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onContextMenu={(e) => onContextMenu(e, tab.id)}
      onDragStart={(e) => onDragStart(e, index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDrop={(e) => onDrop(e, index)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onActivate(tab.id)
        }
        if (e.key === 'Delete' || e.key === 'Backspace') {
          e.preventDefault()
          onClose(tab.id)
        }
      }}
    >
      {/* File icon */}
      <span className="flex-shrink-0" aria-hidden="true">
        <IconComponent className={`w-3.5 h-3.5 ${iconConfig.color}`} />
      </span>

      {/* File name */}
      <span className="truncate flex-1 min-w-0">
        {displayName}
      </span>

      {/* Dirty indicator dot */}
      {tab.isDirty && (
        <span
          className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-blue-500 dark:bg-blue-400"
          aria-label="unsaved changes"
          title="Unsaved changes"
        />
      )}

      {/* Close button */}
      <button
        className={`
          flex-shrink-0 rounded p-0.5 transition-colors
          ${isActive
            ? 'opacity-60 hover:opacity-100 hover:bg-gray-200 dark:hover:bg-gray-700'
            : 'opacity-0 group-hover:opacity-60 hover:!opacity-100 hover:bg-gray-200 dark:hover:bg-gray-700'
          }
        `}
        onClick={handleCloseClick}
        aria-label={`Close ${displayName}`}
        title={`Close ${displayName}`}
        tabIndex={-1}
      >
        <X size={10} />
      </button>
    </div>
  )
})
