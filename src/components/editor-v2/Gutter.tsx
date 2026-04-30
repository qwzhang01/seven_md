import { useRef, useCallback } from 'react'

interface GutterProps {
  onResize: (dx: number) => void
}

export function Gutter({ onResize }: GutterProps) {
  const isDragging = useRef(false)
  const startX = useRef(0)

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      isDragging.current = true
      startX.current = e.clientX
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
      document.documentElement.setAttribute('data-resizing', '')

      const handleMouseMove = (ev: MouseEvent) => {
        if (!isDragging.current) return
        const dx = ev.clientX - startX.current
        startX.current = ev.clientX
        onResize(dx)
      }

      const handleMouseUp = () => {
        isDragging.current = false
        document.documentElement.removeAttribute('data-resizing')
        document.body.style.cursor = ''
        document.body.style.userSelect = ''
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }

      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    },
    [onResize]
  )

  return (
    <div
      className="flex-shrink-0 relative cursor-col-resize group"
      style={{
        width: '6px',
        background: 'var(--bg-primary)',
        borderLeft: '1px solid var(--border-primary)',
        borderRight: '1px solid var(--border-primary)',
        transition: 'background 0.1s ease',
      }}
      onMouseDown={handleMouseDown}
      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--accent)' }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--bg-primary)' }}
      title="拖拽调整宽度"
    />
  )
}
