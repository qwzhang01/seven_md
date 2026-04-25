import { useState, useRef, useCallback } from 'react'
import type { MenuItemDef } from './MenuBar'

interface MenuDropdownProps {
  items: MenuItemDef[]
  onClose: () => void
}

/**
 * 通用下拉菜单组件
 * 渲染 MenuItemDef 数组，支持快捷键提示、分隔线、子菜单
 */
export function MenuDropdown({ items, onClose }: MenuDropdownProps) {
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const [openSubmenu, setOpenSubmenu] = useState<number | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Get focusable item indices (not separators)
  const focusableItems = items.filter((item) => !item.separator)

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setFocusedIndex((prev) => {
          const next = prev + 1
          return next >= focusableItems.length ? 0 : next
        })
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setFocusedIndex((prev) => {
          const next = prev - 1
          return next < 0 ? focusableItems.length - 1 : next
        })
      } else if (e.key === 'Enter') {
        e.preventDefault()
        const focused = focusableItems[focusedIndex]
        if (focused?.action && !focused.disabled) {
          focused.action()
          onClose()
        }
      } else if (e.key === 'Escape') {
        onClose()
      }
    },
    [focusedIndex, focusableItems, onClose]
  )

  return (
    <div
      ref={dropdownRef}
      className="absolute left-0 top-full z-50 min-w-[220px] bg-[var(--bg-primary)] border border-[var(--border-default)] rounded shadow-lg py-1"
      role="menu"
      onKeyDown={handleKeyDown}
    >
      {items.map((item, index) => {
        if (item.separator) {
          return <div key={`sep-${index}`} className="h-px my-1 bg-[var(--border-default)]" role="separator" />
        }

        const isFocused = focusableItems.indexOf(item) === focusedIndex

        return (
          <div
            key={`item-${index}`}
            className="relative"
            onMouseEnter={() => {
              setFocusedIndex(focusableItems.indexOf(item))
              if (item.submenu) setOpenSubmenu(index)
              else setOpenSubmenu(null)
            }}
            onMouseLeave={() => {
              if (!item.submenu) setOpenSubmenu(null)
            }}
          >
            <button
              className={`w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 ${
                item.disabled
                  ? 'text-[var(--text-disabled)] cursor-default'
                  : isFocused
                  ? 'bg-[var(--bg-active)] text-[var(--text-primary)]'
                  : 'text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
              }`}
              onClick={() => {
                if (item.action && !item.disabled) {
                  item.action()
                  onClose()
                }
              }}
              disabled={item.disabled}
              role="menuitem"
            >
              {item.icon && <span className="w-4 flex-shrink-0">{item.icon}</span>}
              <span className="flex-1 truncate">{item.label}</span>
              {item.submenu && <span className="text-[var(--text-secondary)] ml-auto">▶</span>}
              {item.shortcut && (
                <span className="text-[var(--text-secondary)] text-[10px] ml-4 flex-shrink-0">
                  {item.shortcut}
                </span>
              )}
            </button>

            {/* Submenu */}
            {item.submenu && openSubmenu === index && (
              <div className="absolute left-full top-0 z-50 min-w-[200px] bg-[var(--bg-primary)] border border-[var(--border-default)] rounded shadow-lg py-1">
                {item.submenu.map((subItem, subIndex) =>
                  subItem.separator ? (
                    <div key={`subsep-${subIndex}`} className="h-px my-1 bg-[var(--border-default)]" />
                  ) : (
                    <button
                      key={`sub-${subIndex}`}
                      className="w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
                      onClick={() => {
                        if (subItem.action) {
                          subItem.action()
                          onClose()
                        }
                      }}
                      role="menuitem"
                    >
                      {subItem.icon && <span className="w-4 flex-shrink-0">{subItem.icon}</span>}
                      <span className="flex-1 truncate">{subItem.label}</span>
                      {subItem.shortcut && (
                        <span className="text-[var(--text-secondary)] text-[10px] ml-4">
                          {subItem.shortcut}
                        </span>
                      )}
                    </button>
                  )
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
