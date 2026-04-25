import type { ReactNode } from 'react'

interface ToolbarGroupProps {
  children: ReactNode
}

export function ToolbarGroup({ children }: ToolbarGroupProps) {
  return (
    <div className="flex items-center gap-0.5 px-1 border-r border-[var(--border-default)] last:border-r-0">
      {children}
    </div>
  )
}
