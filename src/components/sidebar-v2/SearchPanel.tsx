import { useState, useCallback, useRef } from 'react'
import { Search, FileText, FolderOpen, Loader2, AlertTriangle } from 'lucide-react'
import { useFileStore, useWorkspaceStore } from '../../stores'
import { useFileSearch } from '../../hooks/useFileSearch'
import { readFile } from '../../tauriCommands'

// ==================== Tab 内搜索的本地类型 ====================

interface LocalSearchResult {
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

function highlightMatch(text: string, start: number, end: number) {
  const before = escapeHtml(text.substring(0, start))
  const match = escapeHtml(text.substring(start, end))
  const after = escapeHtml(text.substring(end))
  const maxLen = 40
  const displayBefore = before.length > maxLen ? '...' + before.slice(-maxLen) : before
  const displayAfter = after.length > maxLen ? after.slice(0, maxLen) + '...' : after
  return `${displayBefore}<mark style="background:rgba(255,200,0,0.3);border-radius:2px;padding:0 1px">${match}</mark>${displayAfter}`
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function SearchPanel({ content: _content }: SearchPanelProps) {
  const { tabs, switchTab, openTab } = useFileStore()
  const folderPath = useWorkspaceStore((s) => s.folderPath)

  // 是否有打开的工作区
  const hasWorkspace = !!folderPath
  const folderName = folderPath?.split('/').pop() || ''

  // ==================== Tab 搜索状态 ====================
  const [tabQuery, setTabQuery] = useState('')
  const [caseSensitive, setCaseSensitive] = useState(false)
  const [wholeWord, setWholeWord] = useState(false)
  const [useRegex, setUseRegex] = useState(false)
  const [tabResults, setTabResults] = useState<LocalSearchResult[]>([])
  const [tabStatus, setTabStatus] = useState<string>('输入关键词开始搜索')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ==================== 工作区搜索状态（useFileSearch hook） ====================
  const fileSearch = useFileSearch(folderPath)

  // ==================== Tab 搜索逻辑 ====================
  const performTabSearch = useCallback(
    (q: string) => {
      if (!q.trim()) {
        setTabResults([])
        setTabStatus('输入关键词开始搜索')
        return
      }

      const found: LocalSearchResult[] = []
      let totalMatches = 0

      for (const tab of tabs) {
        const text = tab.content || ''
        const lines = text.split('\n')
        const matches: LocalSearchResult['matches'] = []

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

      setTabResults(found)
      setTabStatus(
        totalMatches > 0
          ? `找到 ${totalMatches} 个结果（${found.length} 个文件）`
          : '未找到匹配结果'
      )
    },
    [tabs, caseSensitive, wholeWord, useRegex]
  )

  const handleTabInput = (q: string) => {
    setTabQuery(q)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => performTabSearch(q), 200)
  }

  // ==================== 结果点击处理 ====================

  /** Tab 搜索结果点击 */
  const handleTabResultClick = (tabName: string, line: number) => {
    const tab = tabs.find((t) => t.name === tabName)
    if (tab) {
      switchTab(tab.id)
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('editor:jump-to-line', { detail: line }))
      }, 100)
    }
  }

  /** 工作区搜索结果点击：打开文件（或切换到已打开的 tab）并跳转行号 */
  const handleWorkspaceResultClick = useCallback(async (filePath: string, lineNumber?: number) => {
    // 检查文件是否已在 tab 中打开
    const existingTab = tabs.find((t) => t.path === filePath)
    if (existingTab) {
      switchTab(existingTab.id)
    } else {
      try {
        const content = await readFile(filePath)
        openTab(filePath, content)
      } catch (error) {
        console.error('打开搜索结果文件失败:', error)
        return
      }
    }

    // 跳转到指定行
    if (lineNumber) {
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('editor:jump-to-line', { detail: lineNumber }))
      }, 150)
    }
  }, [tabs, switchTab, openTab])

  // ==================== 渲染 ====================

  // 计算搜索状态文本（工作区模式）
  const wsStatus = (() => {
    if (!fileSearch.query.trim()) return '输入关键词搜索工作区'
    if (fileSearch.isLoading) return '搜索中...'
    if (fileSearch.error) return `搜索出错: ${fileSearch.error}`
    const totalResults = fileSearch.fileResults.length + fileSearch.textResults.length
    if (totalResults === 0) return '未找到匹配结果'
    if (fileSearch.searchType === 'filename') {
      return `找到 ${fileSearch.fileResults.length} 个文件`
    }
    return `找到 ${fileSearch.textResults.length} 个结果`
  })()

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ background: 'var(--bg-secondary)' }}>
      {/* 模式指示器 */}
      <div
        className="flex items-center gap-1.5 px-3 py-1 text-xs"
        style={{
          color: 'var(--text-tertiary)',
          borderBottom: '1px solid var(--border-primary)',
          fontSize: 10,
        }}
      >
        {hasWorkspace ? (
          <>
            <FolderOpen size={10} />
            <span>搜索工作区: {folderName}</span>
          </>
        ) : (
          <>
            <FileText size={10} />
            <span>搜索已打开文件</span>
          </>
        )}
      </div>

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
          placeholder={hasWorkspace ? '搜索工作区文件...' : '搜索文件内容...'}
          value={hasWorkspace ? fileSearch.query : tabQuery}
          onChange={(e) => {
            if (hasWorkspace) {
              fileSearch.setQuery(e.target.value)
            } else {
              handleTabInput(e.target.value)
            }
          }}
          autoFocus
        />
        {hasWorkspace && fileSearch.isLoading && (
          <Loader2 size={14} className="animate-spin" style={{ color: 'var(--text-tertiary)' }} />
        )}
      </div>

      {/* Options */}
      <div
        className="flex items-center gap-1 px-3 py-1"
        style={{ borderBottom: '1px solid var(--border-primary)' }}
      >
        {hasWorkspace ? (
          /* 工作区搜索：文件名/全文切换 */
          <>
            {(['filename', 'fulltext'] as const).map((type) => (
              <button
                key={type}
                className="px-2 h-6 text-xs rounded transition-colors border"
                style={{
                  background: fileSearch.searchType === type ? 'var(--accent)' : 'transparent',
                  color: fileSearch.searchType === type ? '#fff' : 'var(--text-tertiary)',
                  borderColor: fileSearch.searchType === type ? 'var(--accent)' : 'var(--border-primary)',
                }}
                onClick={() => fileSearch.setSearchType(type)}
              >
                {type === 'filename' ? '文件名' : '全文'}
              </button>
            ))}
          </>
        ) : (
          /* Tab 搜索：大小写/全字/正则 */
          <>
            {[
              { label: 'Aa', active: caseSensitive, title: '区分大小写', toggle: () => { setCaseSensitive(!caseSensitive); if (tabQuery) performTabSearch(tabQuery) } },
              { label: 'W', active: wholeWord, title: '全字匹配', toggle: () => { setWholeWord(!wholeWord); if (tabQuery) performTabSearch(tabQuery) } },
              { label: '.*', active: useRegex, title: '正则表达式', toggle: () => { setUseRegex(!useRegex); if (tabQuery) performTabSearch(tabQuery) } },
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
          </>
        )}
      </div>

      {/* Status */}
      <div
        className="px-3 py-1 text-xs flex items-center gap-1"
        style={{ color: 'var(--text-tertiary)', borderBottom: '1px solid var(--border-primary)' }}
      >
        {hasWorkspace ? wsStatus : tabStatus}
        {/* truncated 提示 */}
        {hasWorkspace && fileSearch.truncated && (
          <span className="inline-flex items-center gap-0.5 ml-1" style={{ color: 'var(--warning, orange)' }}>
            <AlertTriangle size={10} />
            <span>结果已限制为 200 条</span>
          </span>
        )}
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto">
        {hasWorkspace ? (
          /* ==================== 工作区搜索结果 ==================== */
          <>
            {/* 文件名搜索结果 */}
            {fileSearch.searchType === 'filename' && fileSearch.fileResults.length > 0 && (
              fileSearch.fileResults.map((result) => (
                <div
                  key={result.path}
                  className="flex items-center gap-2 px-3 py-1.5 cursor-pointer"
                  style={{ color: 'var(--text-primary)', fontSize: 12 }}
                  onClick={() => handleWorkspaceResultClick(result.path)}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <FileText size={13} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
                  <div className="flex-1 overflow-hidden">
                    <div className="font-medium truncate">{result.name}</div>
                    <div className="text-xs truncate" style={{ color: 'var(--text-tertiary)', fontSize: 10 }}>
                      {result.relativePath}
                    </div>
                  </div>
                </div>
              ))
            )}

            {/* 全文搜索结果（按文件分组） */}
            {fileSearch.searchType === 'fulltext' && fileSearch.textResults.length > 0 && (() => {
              // 按文件分组
              const grouped = new Map<string, typeof fileSearch.textResults>()
              for (const r of fileSearch.textResults) {
                const existing = grouped.get(r.path) || []
                existing.push(r)
                grouped.set(r.path, existing)
              }

              return Array.from(grouped.entries()).map(([filePath, matches]) => (
                <div key={filePath} className="mb-1">
                  {/* 文件头 */}
                  <div
                    className="flex items-center gap-2 px-3 py-1.5 cursor-pointer"
                    style={{ color: 'var(--text-primary)', fontSize: 12 }}
                    onClick={() => handleWorkspaceResultClick(filePath, matches[0].lineNumber)}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <FileText size={13} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
                    <span className="flex-1 font-medium truncate">{matches[0].name}</span>
                    <span
                      className="text-xs px-1.5 py-0.5 rounded-full flex-shrink-0"
                      style={{ background: 'var(--bg-active)', color: 'var(--text-tertiary)' }}
                    >
                      {matches.length}
                    </span>
                  </div>

                  {/* 匹配行 */}
                  {matches.slice(0, 20).map((m, i) => (
                    <div
                      key={i}
                      className="flex items-start px-7 py-0.5 cursor-pointer font-mono text-xs overflow-hidden"
                      style={{ color: 'var(--text-secondary)' }}
                      onClick={() => handleWorkspaceResultClick(filePath, m.lineNumber)}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <span className="text-xs mr-2 flex-shrink-0" style={{ color: 'var(--text-tertiary)', minWidth: 24 }}>
                        {m.lineNumber}
                      </span>
                      <span className="truncate">{m.snippet}</span>
                    </div>
                  ))}
                </div>
              ))
            })()}

            {/* 空结果 */}
            {(hasWorkspace && fileSearch.query.trim() && !fileSearch.isLoading &&
              fileSearch.fileResults.length === 0 && fileSearch.textResults.length === 0) && (
              <div className="flex flex-col items-center justify-center py-10" style={{ color: 'var(--text-tertiary)' }}>
                <Search size={32} className="mb-3 opacity-40" />
                <span className="text-xs">未找到 &quot;{fileSearch.query}&quot; 的匹配结果</span>
              </div>
            )}
          </>
        ) : (
          /* ==================== Tab 搜索结果 ==================== */
          <>
            {tabResults.length === 0 && tabQuery ? (
              <div className="flex flex-col items-center justify-center py-10" style={{ color: 'var(--text-tertiary)' }}>
                <Search size={32} className="mb-3 opacity-40" />
                <span className="text-xs">未找到 &quot;{tabQuery}&quot; 的匹配结果</span>
              </div>
            ) : (
              tabResults.map((file) => (
                <div key={file.filePath} className="mb-1">
                  {/* File header */}
                  <div
                    className="flex items-center gap-2 px-3 py-1.5 cursor-pointer"
                    style={{ color: 'var(--text-primary)', fontSize: 12 }}
                    onClick={() => handleTabResultClick(file.fileName, file.matches[0].line)}
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
                      onClick={() => handleTabResultClick(file.fileName, m.line)}
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
          </>
        )}
      </div>
    </div>
  )
}
