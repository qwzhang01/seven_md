import { useEffect, useRef, useState, useCallback } from 'react'
import { Terminal, X } from 'lucide-react'
import { useUIStore, useCommandStore } from '../../stores'
import { CATEGORY_LABELS } from '../../stores'
import type { Command } from '../../stores'

export function CommandPalette() {
  const { commandPaletteOpen, setCommandPaletteOpen } = useUIStore()
  const { getFilteredCommands, executeCommand } = useCommandStore()
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const filtered = getFilteredCommands()
    .filter((cmd) => !query || `${cmd.category}: ${cmd.title}`.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 30)

  useEffect(() => {
    if (commandPaletteOpen) {
      setQuery('')
      setSelected(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [commandPaletteOpen])

  const close = useCallback(() => {
    setCommandPaletteOpen(false)
  }, [setCommandPaletteOpen])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        close()
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelected((prev) => Math.min(prev + 1, filtered.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelected((prev) => Math.max(prev - 1, 0))
      } else if (e.key === 'Enter') {
        e.preventDefault()
        if (filtered[selected]) {
          executeCommand(filtered[selected].id)
          close()
        }
      }
    },
    [close, filtered, selected, executeCommand]
  )

  useEffect(() => {
    if (listRef.current) {
      const el = listRef.current.children[selected] as HTMLElement
      el?.scrollIntoView({ block: 'nearest' })
    }
  }, [selected])

  if (!commandPaletteOpen) return null

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-start justify-center"
      style={{ paddingTop: '15vh' }}
    >
      {/* Overlay */}
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(0,0,0,0.6)' }}
        onClick={close}
      />

      {/* Panel */}
      <div
        className="relative w-[520px] max-h-[400px] flex flex-col overflow-hidden rounded-lg"
        style={{
          background: 'var(--bg-modal, var(--bg-secondary))',
          border: '1px solid var(--border-primary)',
          boxShadow: 'var(--shadow-lg, 0 4px 16px rgba(0,0,0,0.5))',
          animation: 'cmdPaletteIn 0.1s ease',
        }}
        onKeyDown={handleKeyDown}
      >
        {/* Input row */}
        <div
          className="flex items-center gap-2 px-3 py-2.5"
          style={{ borderBottom: '1px solid var(--border-primary)' }}
        >
          <Terminal size={16} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
          <input
            ref={inputRef}
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: 'var(--text-primary)', caretColor: 'var(--text-primary)' }}
            placeholder="输入命令或搜索..."
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelected(0) }}
          />
          <button
            className="flex items-center justify-center w-6 h-6 rounded transition-colors"
            style={{ color: 'var(--text-secondary)', background: 'transparent' }}
            onClick={close}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <X size={14} />
          </button>
        </div>

        {/* Command list */}
        <div ref={listRef} className="overflow-y-auto flex-1 py-1">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-sm" style={{ color: 'var(--text-tertiary)' }}>
              没有找到匹配的命令
            </div>
          ) : (
            filtered.map((cmd, i) => (
              <CommandItem
                key={cmd.id}
                command={cmd}
                isSelected={i === selected}
                onHover={() => setSelected(i)}
                onExecute={() => { executeCommand(cmd.id); close() }}
              />
            ))
          )}
        </div>
      </div>

      <style>{`
        @keyframes cmdPaletteIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  )
}

function CommandItem({
  command,
  isSelected,
  onHover,
  onExecute,
}: {
  command: Command
  isSelected: boolean
  onHover: () => void
  onExecute: () => void
}) {
  const categoryLabel = CATEGORY_LABELS[command.category] || command.category

  return (
    <div
      className="flex items-center gap-3 px-4 py-2 cursor-pointer text-sm"
      style={{
        background: isSelected ? 'var(--bg-menu-hover, var(--bg-active))' : 'transparent',
        color: 'var(--text-primary)',
      }}
      onMouseEnter={onHover}
      onClick={onExecute}
    >
      {command.icon && (
        <span className="text-base flex-shrink-0">{command.icon}</span>
      )}
      <span className="flex-1 truncate">
        <span style={{ color: 'var(--text-secondary)' }}>{categoryLabel}: </span>
        {command.title}
      </span>
      {command.shortcut && (
        <span className="text-xs flex-shrink-0" style={{ color: 'var(--text-menu-shortcut, var(--text-secondary))' }}>
          {command.shortcut}
        </span>
      )}
    </div>
  )
}
