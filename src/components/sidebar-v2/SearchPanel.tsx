import { useState, useCallback, useRef } from 'react'
import { Search, FileText } from 'lucide-react'
import { useFileStore } from '../../stores'

interface SearchResult {
  fileName: string
  filePath: string
  matches: Array<{
    line: number
    text: string
    matchStart: number
    matchEnd: number
  }>
}

interface SearchPanelProps {
  content: string
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function searchInLine(
  line: string,
  query: string,
  caseSensitive: boolean,
  wholeWord: boolean,
  useRegex: boolean
): { start: number; end: number } | null {
  try {
    let regex: RegExp
    if (useRegex) {
      regex = new RegExp(query, caseSensitive ? '' : 'i')
    } else {
      const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const pattern = wholeWord ? `\\b${escaped}\\b` : escaped
      regex = new RegExp(pattern, caseSensitive ? '' : 'i')
    }
    const match = regex.exec(line)
    if (match) return { start: match.index, end: match.index + match[0].length }
  } catch {
    // invalid regex
  }
  return null
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function SearchPanel({ content: _content }: SearchPanelProps) {
  const { tabs, switchTab } = useFileStore()
  const [query, setQuery] = useState('')
  const [caseSensitive, setCaseSensitive] = useState(false)
  const [wholeWord, setWholeWord] = useState(false)
  const [useRegex, setUseRegex] = useState(false)
  const [results, setResults] = useState<SearchResult[]>([])
  const [status, setStatus] = useState<string>('输入关键词开始搜索')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const performSearch = useCallback(
    (q: string) => {
      if (!q.trim()) {
        setResults([])
        setStatus('输入关键词开始搜索')
        return
      }

      // 搜索当前所有打开的 tab 内容
      const found: SearchResult[] = []
      let totalMatches = 0

      for (const tab of tabs) {
        const text = tab.content || ''
        const lines = text.split('\n')
        const matches: SearchResult['matches'] = []

        for (let i = 0; i < lines.length; i++) {
          const result = searchInLine(lines[i], q, caseSensitive, wholeWord, useRegex)
          if (result) {
            matches.push({ line: i + 1, text: lines[i], matchStart: result.start, matchEnd: result.end })
            totalMatches++
          }
        }

        if (matches.length > 0) {
          found.push({ fileName: tab.name, filePath: tab.path || tab.name, matches })
        }
      }

      setResults(found)
      setStatus(
        totalMatches > 0
          ? `找到 ${totalMatches} 个结果（${found.length} 个文件）`
          : '未找到匹配结果'
      )
    },
    [tabs, caseSensitive, wholeWord, useRegex]
  )

  const handleInput = (q: string) => {
    setQuery(q)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => performSearch(q), 200)
  }

  const handleResultClick = (tabName: string, line: number) => {
    const tab = tabs.find((t) => t.name === tabName)
    if (tab) {
      switchTab(tab.id)
      // 通知编辑器跳转到指定行
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('editor:jump-to-line', { detail: line }))
      }, 100)
    }
  }

  const highlightMatch = (text: string, start: number, end: number) => {
    const before = escapeHtml(text.substring(0, start))
    const match = escapeHtml(text.substring(start, end))
    const after = escapeHtml(text.substring(end))
    const maxLen = 40
    const displayBefore = before.length > maxLen ? '...' + before.slice(-maxLen) : before
    const displayAfter = after.length > maxLen ? after.slice(0, maxLen) + '...' : after
    return `${displayBefore}<mark style="background:rgba(255,200,0,0.3);border-radius:2px;padding:0 1px">${match}</mark>${displayAfter}`
  }

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ background: 'var(--bg-secondary)' }}>
      {/* Search Input */}
      <div
        className="flex items-center gap-2 px-3 py-2"
        style={{ borderBottom: '1px solid var(--border-primary)' }}
      >
        <Search size={14} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
        <input
          className="flex-1 bg-transparent text-xs outline-none"
          style={{
            color: 'var(--text-primary)',
            caretColor: 'var(--text-primary)',
          }}
          placeholder="搜索文件内容..."
          value={query}
          onChange={(e) => handleInput(e.target.value)}
          autoFocus
        />
      </div>

      {/* Options */}
      <div
        className="flex items-center gap-1 px-3 py-1"
        style={{ borderBottom: '1px solid var(--border-primary)' }}
      >
        {[
          { label: 'Aa', active: caseSensitive, title: '区分大小写', toggle: () => { setCaseSensitive(!caseSensitive); if (query) performSearch(query) } },
          { label: 'W', active: wholeWord, title: '全字匹配', toggle: () => { setWholeWord(!wholeWord); if (query) performSearch(query) } },
          { label: '.*', active: useRegex, title: '正则表达式', toggle: () => { setUseRegex(!useRegex); if (query) performSearch(query) } },
        ].map((opt) => (
          <button
            key={opt.label}
            className="px-2 h-6 text-xs font-mono rounded transition-colors border"
            style={{
              background: opt.active ? 'var(--accent)' : 'transparent',
              color: opt.active ? '#fff' : 'var(--text-tertiary)',
              borderColor: opt.active ? 'var(--accent)' : 'var(--border-primary)',
            }}
            onClick={opt.toggle}
            title={opt.title}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Status */}
      <div
        className="px-3 py-1 text-xs"
        style={{ color: 'var(--text-tertiary)', borderBottom: '1px solid var(--border-primary)' }}
      >
        {status}
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto">
        {results.length === 0 && query ? (
          <div className="flex flex-col items-center justify-center py-10" style={{ color: 'var(--text-tertiary)' }}>
            <Search size={32} className="mb-3 opacity-40" />
            <span className="text-xs">未找到 "{query}" 的匹配结果</span>
          </div>
        ) : (
          results.map((file) => (
            <div key={file.filePath} className="mb-1">
              {/* File header */}
              <div
                className="flex items-center gap-2 px-3 py-1.5 cursor-pointer"
                style={{ color: 'var(--text-primary)', fontSize: 12 }}
                onClick={() => handleResultClick(file.fileName, file.matches[0].line)}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <FileText size={13} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
                <span className="flex-1 font-medium truncate">{file.fileName}</span>
                <span
                  className="text-xs px-1.5 py-0.5 rounded-full flex-shrink-0"
                  style={{ background: 'var(--bg-active)', color: 'var(--text-tertiary)' }}
                >
                  {file.matches.length}
                </span>
              </div>

              {/* Match items */}
              {file.matches.slice(0, 20).map((m, i) => (
                <div
                  key={i}
                  className="flex items-start px-7 py-0.5 cursor-pointer font-mono text-xs overflow-hidden"
                  style={{ color: 'var(--text-secondary)' }}
                  onClick={() => handleResultClick(file.fileName, m.line)}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <span className="text-xs mr-2 flex-shrink-0" style={{ color: 'var(--text-tertiary)', minWidth: 24 }}>
                    {m.line}
                  </span>
                  <span
                    className="truncate"
                    dangerouslySetInnerHTML={{
                      __html: highlightMatch(m.text, m.matchStart, m.matchEnd),
                    }}
                  />
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
