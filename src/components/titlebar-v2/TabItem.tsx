import { memo, useState, useCallback } from 'react'
import { X } from 'lucide-react'

interface TabItemProps {
  id: string
  name: string
  isDirty: boolean
  isActive: boolean
  index: number
  onActivate: (id: string) => void
  onClose: (id: string) => void
  onDragStart: (e: React.DragEvent, index: number) => void
  onDragOver: (e: React.DragEvent, index: number) => void
  onDrop: (e: React.DragEvent, index: number) => void
  onDragEnd: () => void
}

export const TabItem = memo(function TabItem({
  id,
  name,
  isDirty,
  isActive,
  index,
  onActivate,
  onClose,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}: TabItemProps) {
  const [isHovered, setIsHovered] = useState(false)

  const handleClose = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      onClose(id)
    },
    [id, onClose]
  )

  const handleClick = useCallback(() => {
    onActivate(id)
  }, [id, onActivate])

  return (
    <div
      className={`
        group relative flex items-center h-full px-3 cursor-pointer select-none min-w-0 max-w-[180px]
        border-r border-[var(--border-default)]
        ${isActive
          ? 'bg-[var(--bg-primary)] text-[var(--text-primary)]'
          : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
        }
      `}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      draggable
      onDragStart={(e) => onDragStart(e, index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDrop={(e) => onDrop(e, index)}
      onDragEnd={onDragEnd}
      role="tab"
      aria-selected={isActive}
      title={name}
    >
      {/* Active indicator - top accent bar */}
      {isActive && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-[var(--text-accent)]" />
      )}

      {/* Dirty indicator (blue dot) or close button */}
      <span className="flex items-center mr-1.5 flex-shrink-0">
        {isHovered && !isActive ? (
          <button
            className="w-4 h-4 flex items-center justify-center rounded-sm hover:bg-[var(--bg-active)] text-[var(--text-secondary)]"
            onClick={handleClose}
            aria-label={`关闭 ${name}`}
          >
            <X size={12} />
          </button>
        ) : isDirty ? (
          <span className="w-2 h-2 rounded-full bg-[var(--text-accent)] flex-shrink-0" />
        ) : null}
      </span>

      {/* Tab name */}
      <span className="truncate text-xs whitespace-nowrap">{name}</span>

      {/* Close button for active/hovered tab */}
      {isHovered && isActive && (
        <button
          className="ml-auto pl-2 flex items-center justify-center rounded-sm hover:bg-[var(--bg-active)] text-[var(--text-secondary)] flex-shrink-0"
          onClick={handleClose}
          aria-label={`关闭 ${name}`}
        >
          <X size={12} />
        </button>
      )}
    </div>
  )
})
