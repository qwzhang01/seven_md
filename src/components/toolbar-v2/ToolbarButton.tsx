import { useState, type ReactNode } from 'react'

interface ToolbarButtonProps {
  icon: ReactNode
  tooltip: string
  shortcut?: string
  active?: boolean
  accent?: boolean
  disabled?: boolean
  onClick: () => void
}

export function ToolbarButton({
  icon,
  tooltip,
  shortcut,
  active = false,
  accent = false,
  disabled = false,
  onClick,
}: ToolbarButtonProps) {
  const [showTooltip, setShowTooltip] = useState(false)

  return (
    <div className="relative">
      <button
        className={`
          flex items-center justify-center w-7 h-7 rounded-sm transition-colors
          ${disabled
            ? 'text-[var(--text-disabled)] cursor-default'
            : active
            ? 'bg-[var(--bg-active)] text-[var(--text-accent)]'
            : accent
            ? 'text-[var(--text-accent)] hover:bg-[var(--bg-hover)]'
            : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]'
          }
        `}
        onClick={disabled ? undefined : onClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        disabled={disabled}
        aria-label={tooltip}
        title={shortcut ? `${tooltip} (${shortcut})` : tooltip}
      >
        {icon}
      </button>

      {/* Tooltip */}
      {showTooltip && !disabled && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 z-50 px-2 py-1 bg-[var(--bg-tertiary)] text-[var(--text-primary)] text-[10px] rounded shadow-lg whitespace-nowrap pointer-events-none">
          {tooltip}
          {shortcut && <span className="ml-1.5 text-[var(--text-secondary)]">{shortcut}</span>}
        </div>
      )}
    </div>
  )
}
