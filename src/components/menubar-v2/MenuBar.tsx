import { useState, useCallback, useRef, useEffect } from 'react'
import { FileMenu } from './menus/FileMenu'
import { EditMenu } from './menus/EditMenu'
import { ViewMenu } from './menus/ViewMenu'
import { InsertMenu } from './menus/InsertMenu'
import { FormatMenu } from './menus/FormatMenu'
import { ThemeMenu } from './menus/ThemeMenu'
import { HelpMenu } from './menus/HelpMenu'

export interface MenuItemDef {
  label: string
  icon?: React.ReactNode
  shortcut?: string
  action?: () => void
  separator?: boolean
  disabled?: boolean
  submenu?: MenuItemDef[]
}

export interface MenuDef {
  label: string
  items: MenuItemDef[]
}

const MENUS: { key: string; label: string }[] = [
  { key: 'file', label: '文件' },
  { key: 'edit', label: '编辑' },
  { key: 'view', label: '视图' },
  { key: 'insert', label: '插入' },
  { key: 'format', label: '格式' },
  { key: 'theme', label: '主题' },
  { key: 'help', label: '帮助' },
]

export function MenuBar() {
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const menuBarRef = useRef<HTMLDivElement>(null)

  const toggleMenu = useCallback((key: string) => {
    setOpenMenu((prev) => (prev === key ? null : key))
  }, [])

  const closeMenu = useCallback(() => {
    setOpenMenu(null)
  }, [])

  // Close menu on outside click
  useEffect(() => {
    if (!openMenu) return
    const handleClick = (e: MouseEvent) => {
      if (menuBarRef.current && !menuBarRef.current.contains(e.target as Node)) {
        closeMenu()
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [openMenu, closeMenu])

  // Keyboard navigation
  useEffect(() => {
    if (!openMenu) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeMenu()
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        const currentIdx = MENUS.findIndex((m) => m.key === openMenu)
        const nextIdx =
          e.key === 'ArrowRight'
            ? (currentIdx + 1) % MENUS.length
            : (currentIdx - 1 + MENUS.length) % MENUS.length
        setOpenMenu(MENUS[nextIdx].key)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [openMenu, closeMenu])

  const renderMenuItems = (key: string) => {
    switch (key) {
      case 'file': return <FileMenu onClose={closeMenu} />
      case 'edit': return <EditMenu onClose={closeMenu} />
      case 'view': return <ViewMenu onClose={closeMenu} />
      case 'insert': return <InsertMenu onClose={closeMenu} />
      case 'format': return <FormatMenu onClose={closeMenu} />
      case 'theme': return <ThemeMenu onClose={closeMenu} />
      case 'help': return <HelpMenu onClose={closeMenu} />
      default: return null
    }
  }

  return (
    <div
      ref={menuBarRef}
      className="flex items-stretch bg-[var(--bg-secondary)] border-b border-[var(--border-default)] select-none"
      style={{ height: 'var(--menubar-height, 32px)' }}
      role="menubar"
      data-component="menubar"
    >
      {MENUS.map((menu) => (
        <div key={menu.key} className="relative">
          <button
            className={`px-3 h-full text-xs font-medium transition-colors ${
              openMenu === menu.key
                ? 'bg-[var(--bg-active)] text-[var(--text-primary)]'
                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]'
            }`}
            onClick={() => toggleMenu(menu.key)}
            onMouseEnter={() => openMenu && setOpenMenu(menu.key)}
            role="menuitem"
            aria-haspopup="true"
            aria-expanded={openMenu === menu.key}
          >
            {menu.label}
          </button>
          {openMenu === menu.key && renderMenuItems(menu.key)}
        </div>
      ))}
    </div>
  )
}
