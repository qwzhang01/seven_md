import { useEffect, useRef, useState, useCallback, type ReactNode } from 'react'

export interface ContextMenuItem {
  id?: string
  label?: string
  icon?: ReactNode
  shortcut?: string
  action?: () => void
  separator?: boolean
  disabled?: boolean
  danger?: boolean
}

interface ContextMenuBaseProps {
  x: number
  y: number
  items: ContextMenuItem[]
  onClose: () => void
  minWidth?: number
}

/**
 * 右键菜单基础组件
 * 封装：定位计算、视口边界检测、主题化样式、外部点击/ESC关闭、无障碍标注、键盘导航
 */
export function ContextMenuBase({ x, y, items, onClose, minWidth = 180 }: ContextMenuBaseProps) {
  const menuRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(-1)

  // 计算菜单位置，避免超出视口
  const [position, setPosition] = useState({ left: x, top: y })

  useEffect(() => {
    if (!menuRef.current) return
    const rect = menuRef.current.getBoundingClientRect()
    const newLeft = x + rect.width > window.innerWidth ? Math.max(0, window.innerWidth - rect.width - 8) : x
    const newTop = y + rect.height > window.innerHeight ? Math.max(0, window.innerHeight - rect.height - 8) : y
    setPosition({ left: newLeft, top: newTop })
  }, [x, y])

  // 外部点击关闭
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleMouseDown)
    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [onClose])

  // ESC 关闭 + 键盘导航
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          e.preventDefault()
          onClose()
          break
        case 'ArrowDown':
          e.preventDefault()
          setActiveIndex((prev) => {
            let next = prev + 1
            while (next < items.length && items[next].separator) next++
            return next < items.length ? next : prev
          })
          break
        case 'ArrowUp':
          e.preventDefault()
          setActiveIndex((prev) => {
            let next = prev - 1
            while (next >= 0 && items[next].separator) next--
            return next >= 0 ? next : prev
          })
          break
        case 'Enter':
          e.preventDefault()
          if (activeIndex >= 0 && activeIndex < items.length) {
            const item = items[activeIndex]
            if (item.action && !item.disabled && !item.separator) {
              item.action()
              onClose()
            }
          }
          break
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose, items, activeIndex])

  const handleItemClick = useCallback((item: ContextMenuItem) => {
    if (item.disabled || item.separator) return
    item.action?.()
    onClose()
  }, [onClose])

  return (
    <div
      ref={menuRef}
      className="fixed z-[9999] rounded py-1 shadow-lg"
      style={{
        left: position.left,
        top: position.top,
        minWidth,
        background: 'var(--bg-context-menu, var(--bg-secondary))',
        border: '1px solid var(--border-primary)',
        boxShadow: 'var(--shadow-menu, 0 4px 12px rgba(0,0,0,0.15))',
      }}
      role="menu"
    >
      {items.map((item, i) =>
        item.separator ? (
          <div key={i} className="h-px my-1" style={{ background: 'var(--border-primary)' }} />
        ) : (
          <button
            key={i}
            className="w-full text-left flex items-center gap-2 px-3 py-1.5 text-xs transition-colors"
            style={{
              color: item.disabled ? 'var(--text-tertiary)' : 'var(--text-primary)',
              background: activeIndex === i ? 'var(--bg-context-hover, var(--bg-active))' : 'transparent',
              border: 'none',
              cursor: item.disabled ? 'default' : 'pointer',
              opacity: item.disabled ? 0.5 : 1,
            }}
            onMouseEnter={(e) => {
              setActiveIndex(i)
              if (!item.disabled) e.currentTarget.style.background = 'var(--bg-context-hover, var(--bg-active))'
            }}
            onMouseLeave={(e) => {
              if (activeIndex === i) setActiveIndex(-1)
              e.currentTarget.style.background = 'transparent'
            }}
            onClick={() => handleItemClick(item)}
            role="menuitem"
            aria-disabled={item.disabled}
            tabIndex={-1}
          >
            {item.icon && <span className="flex-shrink-0 w-4 h-4 flex items-center justify-center">{item.icon}</span>}
            <span className="flex-1">{item.label}</span>
            {item.shortcut && (
              <span className="text-[10px] ml-4" style={{ color: 'var(--text-menu-shortcut, var(--text-secondary))' }}>
                {item.shortcut}
              </span>
            )}
          </button>
        )
      )}
    </div>
  )
}
