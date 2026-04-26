import { useEffect, useRef, type ReactNode } from 'react'
import { Scissors, Clipboard, FileText, Plus, Type, Search, Sparkles, Bot } from 'lucide-react'

interface EditorContextMenuProps {
  x: number
  y: number
  onClose: () => void
  onInsert: (text: string) => void
  onFind: () => void
  onAIRewrite: () => void
  onFormat?: () => void
}

interface MenuItem {
  label?: string
  icon?: ReactNode
  shortcut?: string
  action?: () => void
  separator?: boolean
  submenu?: MenuItem[]
}

export function EditorContextMenu({ x, y, onClose, onInsert, onFind, onAIRewrite, onFormat }: EditorContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)

  // Adjust position to avoid overflow
  const menuX = Math.min(x, window.innerWidth - 220)
  const menuY = Math.min(y, window.innerHeight - 400)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) onClose()
    }
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [onClose])

  const insertItems: MenuItem[] = [
    { label: '标题', action: () => onInsert('# ') },
    { label: '加粗', action: () => onInsert('**') },
    { label: '斜体', action: () => onInsert('*') },
    { separator: true },
    { label: '行内代码', action: () => onInsert('`') },
    { label: '代码块', action: () => onInsert('```language\n\n```') },
    { separator: true },
    { label: '链接', action: () => onInsert('[文本](url)') },
    { label: '图片', action: () => onInsert('![描述](url)') },
    { separator: true },
    { label: '表格', action: () => onInsert('| 列1 | 列2 |\n|------|------|\n| | |') },
    { label: '水平线', action: () => onInsert('\n---\n') },
    { separator: true },
    { label: '无序列表', action: () => onInsert('- ') },
    { label: '有序列表', action: () => onInsert('1. ') },
    { label: '任务列表', action: () => onInsert('- [ ] ') },
    { separator: true },
    { label: '引用', action: () => onInsert('> ') },
  ]

  const menuItems: MenuItem[] = [
    { label: '剪切', icon: <Scissors size={14} />, shortcut: 'Ctrl+X', action: () => document.execCommand('cut') },
    { label: '复制', icon: <Clipboard size={14} />, shortcut: 'Ctrl+C', action: () => document.execCommand('copy') },
    { label: '粘贴', icon: <FileText size={14} />, shortcut: 'Ctrl+V', action: () => document.execCommand('paste') },
    { separator: true },
    { label: '插入', icon: <Plus size={14} />, submenu: insertItems },
    { separator: true },
    { label: '全选', icon: <Type size={14} />, shortcut: 'Ctrl+A', action: () => document.execCommand('selectAll') },
    { separator: true },
    { label: '查找', icon: <Search size={14} />, shortcut: 'Ctrl+F', action: onFind },
    { separator: true },
    { label: '格式化文档', icon: <Sparkles size={14} />, action: onFormat },
    { separator: true },
    { label: 'AI 改写', icon: <Bot size={14} />, action: onAIRewrite },
  ]

  return (
    <div
      ref={menuRef}
      className="fixed z-[9999] min-w-[200px] rounded py-1 shadow-lg"
      style={{
        left: menuX,
        top: menuY,
        background: 'var(--bg-context-menu, var(--bg-secondary))',
        border: '1px solid var(--border-primary)',
        boxShadow: 'var(--shadow-menu)',
      }}
      role="menu"
    >
      {menuItems.map((item, i) => (
        item.separator ? (
          <div key={i} className="h-px my-1" style={{ background: 'var(--border-primary)' }} />
        ) : (
          <MenuItemRow
            key={i}
            item={item}
            onClose={onClose}
          />
        )
      ))}
    </div>
  )
}

function MenuItemRow({ item, onClose }: { item: MenuItem; onClose: () => void }) {
  const hasSubmenu = !!item.submenu

  return (
    <div
      className="relative group"
    >
      <button
        className="w-full text-left flex items-center gap-2 px-4 py-1.5 text-xs transition-colors"
        style={{ color: 'var(--text-primary)', background: 'transparent', border: 'none', cursor: 'pointer' }}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-context-hover, var(--bg-active))' }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
        onClick={() => {
          if (item.action) { item.action(); onClose() }
        }}
        role="menuitem"
      >
        {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
        <span className="flex-1">{item.label}</span>
        {item.shortcut && <span className="text-[10px]" style={{ color: 'var(--text-menu-shortcut, var(--text-secondary))' }}>{item.shortcut}</span>}
        {hasSubmenu && <span className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>▶</span>}
      </button>

      {/* Submenu */}
      {hasSubmenu && item.submenu && (
        <div
          className="absolute left-full top-0 z-[10000] min-w-[180px] rounded py-1 shadow-lg hidden group-hover:block"
          style={{
            background: 'var(--bg-context-menu, var(--bg-secondary))',
            border: '1px solid var(--border-primary)',
          }}
        >
          {item.submenu.map((sub, j) =>
            sub.separator ? (
              <div key={j} className="h-px my-1" style={{ background: 'var(--border-primary)' }} />
            ) : (
              <button
                key={j}
                className="w-full text-left px-4 py-1.5 text-xs transition-colors"
                style={{ color: 'var(--text-primary)', background: 'transparent', border: 'none', cursor: 'pointer', display: 'block' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-context-hover, var(--bg-active))' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                onClick={() => { sub.action?.(); onClose() }}
                role="menuitem"
              >
                {sub.label}
              </button>
            )
          )}
        </div>
      )}
    </div>
  )
}
