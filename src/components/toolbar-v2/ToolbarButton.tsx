import { useState, type ReactNode } from 'react'

interface ToolbarButtonProps {
  icon?: ReactNode
  label?: string
  tooltip: string
  shortcut?: string
  active?: boolean
  accent?: boolean
  disabled?: boolean
  onClick: () => void
}

export function ToolbarButton({
  icon,
  label,
  tooltip,
  shortcut,
  active = false,
  accent = false,
  disabled = false,
  onClick,
}: ToolbarButtonProps) {
  const [showTooltip, setShowTooltip] = useState(false)

  const hasContent = icon || label

  return (
    <div className="relative">
      <button
        className={`
          flex items-center gap-1 px-1.5 h-7 rounded-sm transition-colors
          ${hasContent ? '' : 'w-7 justify-center'}
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
        {icon && <span className="flex-shrink-0">{icon}</span>}
        {label && <span className="text-[13px] font-medium leading-none">{label}</span>}
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
