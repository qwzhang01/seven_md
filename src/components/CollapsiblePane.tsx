import { ReactNode } from 'react'

interface CollapsiblePaneProps {
  children: ReactNode
  collapsed: boolean
  collapsedWidth?: string
  className?: string
  collapsedContent?: ReactNode
  direction?: 'left' | 'right'
}

export default function CollapsiblePane({
  children,
  collapsed,
  collapsedWidth = '0px',
  className = '',
  collapsedContent,
  direction: _direction = 'left'
}: CollapsiblePaneProps) {
  return (
    <div
      className={`transition-all duration-300 ease-in-out overflow-hidden ${className}`}
      style={{
        width: collapsed ? collapsedWidth : undefined,
        flex: collapsed ? 'none' : undefined,
        minWidth: collapsed ? collapsedWidth : undefined
      }}
    >
      {!collapsed && children}
      {collapsed && collapsedContent && (
        <div className="h-full flex items-center justify-center">
          {collapsedContent}
        </div>
      )}
    </div>
  )
}
