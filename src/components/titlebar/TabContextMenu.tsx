import { useEffect, useRef } from 'react'
import { X, Layers, XCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import { useFileStore } from '../../stores'

interface TabContextMenuProps {
  tabId: string
  position: { x: number; y: number }
  onClose: () => void
  onCloseTab: (tabId: string) => void
}

export function TabContextMenu({ tabId, position, onClose, onCloseTab }: TabContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)
  const tabs = useFileStore((s) => s.tabs)

  const tabIndex = tabs.findIndex((t) => t.id === tabId)
  const isOnlyTab = tabs.length === 1
  const isLeftmost = tabIndex === 0
  const isRightmost = tabIndex === tabs.length - 1

  // Adjust position to avoid viewport overflow
  const menuWidth = 180
  const menuHeight = 200
  const menuX = Math.min(position.x, window.innerWidth - menuWidth - 8)
  const menuY = Math.min(position.y, window.innerHeight - menuHeight - 8)

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('keydown', handleKey)
    }
  }, [onClose])

  const handleClose = () => {
    onCloseTab(tabId)
    onClose()
  }

  const handleCloseOthers = () => {
    const others = tabs.filter((t) => t.id !== tabId)
    others.forEach((t) => onCloseTab(t.id))
    onClose()
  }

  const handleCloseAll = () => {
    // Close all tabs via onCloseTab to respect dirty check
    const allTabs = [...tabs]
    allTabs.forEach((t) => onCloseTab(t.id))
    onClose()
  }

  const handleCloseLeft = () => {
    const leftTabs = tabs.slice(0, tabIndex)
    leftTabs.forEach((t) => onCloseTab(t.id))
    onClose()
  }

  const handleCloseRight = () => {
    const rightTabs = tabs.slice(tabIndex + 1)
    rightTabs.forEach((t) => onCloseTab(t.id))
    onClose()
  }

  return (
    <div
      ref={menuRef}
      className="fixed z-[9999] min-w-[160px] rounded py-1 shadow-lg"
      style={{
        left: menuX,
        top: menuY,
        background: 'var(--bg-context-menu, var(--bg-secondary))',
        border: '1px solid var(--border-primary)',
        boxShadow: 'var(--shadow-menu)',
      }}
      role="menu"
    >
      <MenuItem
        icon={<X size={14} />}
        label="关闭"
        onClick={handleClose}
      />
      <MenuItem
        icon={<Layers size={14} />}
        label="关闭其他"
        disabled={isOnlyTab}
        onClick={handleCloseOthers}
      />
      <MenuItem
        icon={<XCircle size={14} />}
        label="关闭全部"
        onClick={handleCloseAll}
      />
      <div
        className="h-px my-1 mx-2"
        style={{ background: 'var(--border-primary)' }}
      />
      <MenuItem
        icon={<ChevronLeft size={14} />}
        label="关闭左侧"
        disabled={isLeftmost}
        onClick={handleCloseLeft}
      />
      <MenuItem
        icon={<ChevronRight size={14} />}
        label="关闭右侧"
        disabled={isRightmost}
        onClick={handleCloseRight}
      />
    </div>
  )
}

interface MenuItemProps {
  icon: React.ReactNode
  label: string
  disabled?: boolean
  onClick: () => void
}

function MenuItem({ icon, label, disabled = false, onClick }: MenuItemProps) {
  return (
    <button
      className="w-full text-left flex items-center gap-2 px-3 py-1.5 text-xs transition-colors"
      style={{
        color: disabled ? 'var(--text-tertiary, var(--text-secondary))' : 'var(--text-primary)',
        background: 'transparent',
        border: 'none',
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.5 : 1,
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.background = 'var(--bg-context-hover, var(--bg-active))'
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent'
      }}
      onClick={() => {
        if (!disabled) onClick()
      }}
      disabled={disabled}
      role="menuitem"
    >
      <span className="flex-shrink-0 w-4 h-4 flex items-center justify-center">
        {icon}
      </span>
      <span className="flex-1">{label}</span>
    </button>
  )
}
