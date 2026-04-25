import { useMemo, useState, useCallback } from 'react'
import { List } from 'lucide-react'

interface Heading {
  level: number
  text: string
  line: number
}

interface OutlinePanelProps {
  content: string
}

const HEADING_COLORS = [
  'var(--markdown-h1, #569cd6)',
  'var(--markdown-h2, #4ec9b0)',
  'var(--markdown-h3, #c586c0)',
  'var(--markdown-h4, #cc6699)',
  'var(--text-secondary)',
  'var(--text-tertiary)',
]

function parseHeadings(content: string): Heading[] {
  const lines = content.split('\n')
  const headings: Heading[] = []
  lines.forEach((line, idx) => {
    const match = line.match(/^(#{1,6})\s+(.+)$/)
    if (match) {
      headings.push({ level: match[1].length, text: match[2].trim(), line: idx + 1 })
    }
  })
  return headings
}

export function OutlinePanel({ content }: OutlinePanelProps) {
  const [filter, setFilter] = useState('')
  const [activeHeading, setActiveHeading] = useState<number | null>(null)

  const headings = useMemo(() => parseHeadings(content), [content])

  const filtered = useMemo(() => {
    if (!filter) return headings
    const q = filter.toLowerCase()
    return headings.filter((h) => h.text.toLowerCase().includes(q))
  }, [headings, filter])

  const handleHeadingClick = useCallback((heading: Heading) => {
    setActiveHeading(heading.line)
    window.dispatchEvent(new CustomEvent('editor:jump-to-line', { detail: heading.line }))
  }, [])

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ background: 'var(--bg-secondary)' }}>
      {/* Filter input */}
      <div
        className="px-3 py-2"
        style={{ borderBottom: '1px solid var(--border-primary)' }}
      >
        <input
          className="w-full bg-transparent text-xs outline-none px-2 py-1 rounded border"
          style={{
            color: 'var(--text-primary)',
            borderColor: 'var(--border-primary)',
            background: 'var(--bg-input, var(--bg-primary))',
          }}
          placeholder="筛选大纲..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>

      {/* Heading tree */}
      <div className="flex-1 overflow-y-auto py-1">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10" style={{ color: 'var(--text-tertiary)' }}>
            <List size={32} className="mb-3 opacity-40" />
            <span className="text-xs">
              {content.trim() ? '未找到匹配的标题' : '编辑文档后自动生成大纲'}
            </span>
          </div>
        ) : (
          filtered.map((heading, i) => {
            const isActive = heading.line === activeHeading
            const indent = (heading.level - 1) * 12
            const color = HEADING_COLORS[Math.min(heading.level - 1, HEADING_COLORS.length - 1)]

            return (
              <div
                key={i}
                className="flex items-center cursor-pointer transition-colors overflow-hidden"
                style={{
                  paddingLeft: `${12 + indent}px`,
                  paddingRight: '12px',
                  height: '28px',
                  background: isActive ? 'var(--bg-active)' : 'transparent',
                  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                }}
                onClick={() => handleHeadingClick(heading)}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.background = 'var(--bg-hover)'
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.background = 'transparent'
                }}
              >
                <span
                  className="text-xs font-bold mr-2 flex-shrink-0 w-7 text-center rounded"
                  style={{
                    color,
                    background: `${color}22`,
                    padding: '1px 0',
                  }}
                >
                  H{heading.level}
                </span>
                <span className="text-xs truncate">{heading.text}</span>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
