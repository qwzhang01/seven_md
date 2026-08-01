import { memo, useCallback, useState, useRef, useEffect } from 'react'
import { X, AlertTriangle } from 'lucide-react'

interface TabItemProps {
  id: string
  name: string
  isDirty: boolean
  isActive: boolean
  hasExternalConflict?: boolean
  index: number
  onActivate: (id: string) => void
  onClose: (id: string) => void
  onReloadTab?: (id: string) => void
  onKeepLocal?: (id: string) => void
  onDragStart: (e: React.DragEvent, index: number) => void
  onDragOver: (e: React.DragEvent, index: number) => void
  onDrop: (e: React.DragEvent, index: number) => void
  onDragEnd: () => void
  onContextMenu?: (e: React.MouseEvent) => void
}

export const TabItem = memo(function TabItem({
  id,
  name,
  isDirty,
  isActive,
  hasExternalConflict = false,
  index,
  onActivate,
  onClose,
  onReloadTab,
  onKeepLocal,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  onContextMenu,
}: TabItemProps) {
  const [showConflictMenu, setShowConflictMenu] = useState(false)
  const conflictMenuRef = useRef<HTMLDivElement>(null)

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

  const handleConflictClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    setShowConflictMenu((v) => !v)
  }, [])

  // 点击外部关闭冲突菜单
  useEffect(() => {
    if (!showConflictMenu) return
    const handleClickOutside = (e: MouseEvent) => {
      if (conflictMenuRef.current && !conflictMenuRef.current.contains(e.target as Node)) {
        setShowConflictMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showConflictMenu])

  return (
    <div
      className={`
        group relative flex items-center h-full px-2 cursor-pointer select-none min-w-0 max-w-[180px]
        border-r border-[var(--border-default)]
        ${isActive
          ? 'bg-[var(--bg-primary)] text-[var(--text-primary)]'
          : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
        }
      `}
      onClick={handleClick}
      draggable
      onDragStart={(e) => onDragStart(e, index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDrop={(e) => onDrop(e, index)}
      onDragEnd={onDragEnd}
      onContextMenu={onContextMenu}
      role="tab"
      aria-selected={isActive}
      title={name}
    >
      {/* Active indicator - top accent bar */}
      {isActive && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-[var(--text-accent)]" />
      )}

      {/* External conflict warning icon */}
      {hasExternalConflict && (
        <div className="relative flex-shrink-0 mr-1">
          <button
            className="w-4 h-4 flex items-center justify-center text-yellow-500 hover:text-yellow-400"
            onClick={handleConflictClick}
            title="文件已在外部被修改"
          >
            <AlertTriangle size={12} />
          </button>
          {showConflictMenu && (
            <div
              ref={conflictMenuRef}
              className="absolute top-full left-0 z-50 mt-1 bg-[var(--bg-primary)] border border-[var(--border-default)] rounded shadow-lg py-1 min-w-[140px]"
            >
              <button
                className="w-full text-left px-3 py-1.5 text-xs text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
                onClick={(e) => {
                  e.stopPropagation()
                  setShowConflictMenu(false)
                  onReloadTab?.(id)
                }}
              >
                重新加载文件
              </button>
              <button
                className="w-full text-left px-3 py-1.5 text-xs text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
                onClick={(e) => {
                  e.stopPropagation()
                  setShowConflictMenu(false)
                  onKeepLocal?.(id)
                }}
              >
                保留本地修改
              </button>
            </div>
          )}
        </div>
      )}

      {/* Dirty indicator (blue dot) - always visible when dirty */}
      {isDirty && !hasExternalConflict && (
        <span className="w-1.5 h-1.5 rounded-full bg-[var(--text-accent)] flex-shrink-0 mr-1.5" />
      )}

      {/* Tab name */}
      <span className="truncate text-xs whitespace-nowrap flex-1 min-w-0">{name}</span>

      {/* Close button - always visible */}
      <button
        className="ml-1.5 flex-shrink-0 w-4 h-4 flex items-center justify-center rounded-sm
          hover:bg-[var(--bg-active)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        onClick={handleClose}
        aria-label={`关闭 ${name}`}
      >
        <X size={12} />
      </button>
    </div>
  )
})
