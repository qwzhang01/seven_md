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
  'var(--heading-h1)',
  'var(--heading-h2)',
  'var(--heading-h3)',
  'var(--heading-h4)',
  'var(--text-secondary)',
  'var(--text-tertiary)',
]

// 层级缩进配置：H1=0, H2=0, H3=16px, H4=32px
const LEVEL_INDENTS: Record<number, number> = {
  1: 0,
  2: 0,
  3: 16,
  4: 32,
}

// 字号配置：H1 最大，H2 中等，H3-H4 较小
const LEVEL_FONT_SIZES: Record<number, string> = {
  1: 'text-sm',
  2: 'text-xs',
  3: 'text-xs',
  4: 'text-xs',
}

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
            const indent = LEVEL_INDENTS[heading.level] ?? 0
            const baseIndent = heading.level <= 2 ? 0 : (heading.level - 1) * 12
            const color = HEADING_COLORS[Math.min(heading.level - 1, HEADING_COLORS.length - 1)]
            const fontSize = LEVEL_FONT_SIZES[heading.level] ?? 'text-xs'

            return (
              <div
                key={i}
                className={`flex items-center cursor-pointer transition-colors overflow-hidden ${fontSize}`}
                style={{
                  paddingLeft: `${12 + indent + baseIndent}px`,
                  paddingRight: '12px',
                  height: heading.level === 1 ? '32px' : '28px',
                  background: isActive ? 'var(--bg-active)' : 'transparent',
                  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontWeight: heading.level === 1 ? '600' : heading.level === 2 ? '500' : '400',
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
                  className="font-bold mr-2 flex-shrink-0 w-7 text-center rounded"
                  style={{
                    color,
                    background: `${color}22`,
                    padding: '1px 0',
                    fontSize: heading.level === 1 ? '11px' : '10px',
                  }}
                >
                  H{heading.level}
                </span>
                <span className="truncate">{heading.text}</span>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
