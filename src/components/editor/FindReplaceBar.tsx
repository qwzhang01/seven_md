import { useState, useRef, useCallback, useEffect } from 'react'
import { Search, Replace, ChevronUp, ChevronDown, X } from 'lucide-react'
import { useUIStore } from '../../stores'

/**
 * 内联查找替换栏 — 出现在编辑器上方
 * 通过 CodeMirror 的 search 扩展直接在编辑器内高亮/跳转
 */
export function FindReplaceBar() {
  const { findReplaceOpen, findReplaceMode, setFindReplaceOpen } = useUIStore()
  const [query, setQuery] = useState('')
  const [replaceText, setReplaceText] = useState('')
  const [caseSensitive, setCaseSensitive] = useState(false)
  const [wholeWord, setWholeWord] = useState(false)
  const [useRegex, setUseRegex] = useState(false)
  // D1: 匹配计数状态
  const [matchCount, setMatchCount] = useState(0)
  const [currentMatch, setCurrentMatch] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const isReplace = findReplaceMode === 'replace'

  // D1: 监听编辑器发送的匹配结果更新事件
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ total: number; current: number }>).detail
      setMatchCount(detail.total)
      setCurrentMatch(detail.current)
    }
    window.addEventListener('editor:find-results', handler)
    return () => window.removeEventListener('editor:find-results', handler)
  }, [])

  // Focus input when opened
  useEffect(() => {
    if (findReplaceOpen) {
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [findReplaceOpen])

  // Keyboard handler
  useEffect(() => {
    if (!findReplaceOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setFindReplaceOpen(false)
      if (e.key === 'Enter') {
        if (e.shiftKey) handlePrev()
        else handleNext()
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [findReplaceOpen, query, caseSensitive, wholeWord, useRegex])

  // Dispatch find to editor
  const dispatchFind = useCallback((q: string) => {
    window.dispatchEvent(new CustomEvent('editor:find-query', {
      detail: { query: q, caseSensitive, wholeWord, useRegex }
    }))
  }, [caseSensitive, wholeWord, useRegex])

  const handleQueryChange = (q: string) => {
    setQuery(q)
    dispatchFind(q)
  }

  const handleNext = useCallback(() => {
    window.dispatchEvent(new CustomEvent('editor:find-next', {
      detail: { query, caseSensitive, wholeWord, useRegex }
    }))
  }, [query, caseSensitive, wholeWord, useRegex])

  const handlePrev = useCallback(() => {
    window.dispatchEvent(new CustomEvent('editor:find-prev', {
      detail: { query, caseSensitive, wholeWord, useRegex }
    }))
  }, [query, caseSensitive, wholeWord, useRegex])

  const handleReplaceOne = useCallback(() => {
    window.dispatchEvent(new CustomEvent('editor:replace-one', { detail: replaceText }))
  }, [replaceText])

  const handleReplaceAll = useCallback(() => {
    window.dispatchEvent(new CustomEvent('editor:replace-all', {
      detail: { query, replaceText, caseSensitive, wholeWord, useRegex }
    }))
  }, [replaceText])

  if (!findReplaceOpen) return null

  return (
    <div
      className="absolute right-5 top-0 z-50 rounded-b-lg shadow-lg"
      style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-primary)',
        borderTop: 'none',
        minWidth: '360px',
        padding: '8px 12px',
        animation: 'slideDown 0.1s ease',
      }}
    >
      {/* Find row */}
      <div className="flex items-center gap-1.5 mb-1.5">
        <div className="flex items-center gap-1.5 flex-1">
          <Search size={13} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
          <input
            ref={inputRef}
            className="flex-1 text-xs outline-none px-2 py-1 rounded border"
            style={{
              background: 'var(--bg-input, var(--bg-primary))',
              border: '1px solid var(--border-primary)',
              color: 'var(--text-primary)',
              caretColor: 'var(--text-primary)',
            }}
            placeholder="查找..."
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
          />
        </div>
        {/* D1: 匹配计数显示 */}
        <span className="text-xs whitespace-nowrap" style={{ color: 'var(--text-tertiary)' }}>
          {query && (
            matchCount > 0
              ? `${currentMatch} of ${matchCount}`
              : '无结果'
          )}
        </span>
        <button
          className="flex items-center justify-center w-6 h-6 rounded transition-colors"
          style={{ color: 'var(--text-secondary)', background: 'transparent', border: 'none' }}
          onClick={handlePrev}
          title="上一个 (Shift+Enter)"
          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        >
          <ChevronUp size={14} />
        </button>
        <button
          className="flex items-center justify-center w-6 h-6 rounded transition-colors"
          style={{ color: 'var(--text-secondary)', background: 'transparent', border: 'none' }}
          onClick={handleNext}
          title="下一个 (Enter)"
          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        >
          <ChevronDown size={14} />
        </button>
      </div>

      {/* Replace row */}
      {isReplace && (
        <div className="flex items-center gap-1.5 mb-1.5">
          <div className="flex items-center gap-1.5 flex-1">
            <Replace size={13} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
            <input
              className="flex-1 text-xs outline-none px-2 py-1 rounded border"
              style={{
                background: 'var(--bg-input, var(--bg-primary))',
                border: '1px solid var(--border-primary)',
                color: 'var(--text-primary)',
              }}
              placeholder="替换..."
              value={replaceText}
              onChange={(e) => setReplaceText(e.target.value)}
            />
          </div>
          <button
            className="px-2 py-1 text-xs rounded border transition-colors"
            style={{
              background: 'transparent',
              border: '1px solid var(--border-primary)',
              color: 'var(--text-secondary)',
            }}
            onClick={handleReplaceOne}
            title="替换"
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            替换
          </button>
          <button
            className="px-2 py-1 text-xs rounded border transition-colors"
            style={{
              background: 'transparent',
              border: '1px solid var(--border-primary)',
              color: 'var(--text-secondary)',
            }}
            onClick={handleReplaceAll}
            title="全部替换"
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            全部替换
          </button>
        </div>
      )}

      {/* Options row */}
      <div className="flex items-center gap-2">
        {[
          { label: 'Aa', title: '区分大小写', active: caseSensitive, toggle: () => setCaseSensitive(!caseSensitive) },
          { label: 'W', title: '全字匹配', active: wholeWord, toggle: () => setWholeWord(!wholeWord) },
          { label: '.*', title: '正则表达式', active: useRegex, toggle: () => setUseRegex(!useRegex) },
        ].map((opt) => (
          <button
            key={opt.label}
            className="px-1.5 h-5 text-xs font-mono rounded border transition-colors"
            style={{
              background: opt.active ? 'var(--accent)' : 'transparent',
              color: opt.active ? '#fff' : 'var(--text-tertiary)',
              borderColor: opt.active ? 'var(--accent)' : 'var(--border-primary)',
            }}
            title={opt.title}
            onClick={() => { opt.toggle(); if (query) dispatchFind(query) }}
          >
            {opt.label}
          </button>
        ))}
        <div className="flex-1" />
        <button
          className="flex items-center justify-center w-5 h-5 rounded transition-colors"
          style={{ color: 'var(--text-secondary)', background: 'transparent', border: 'none' }}
          onClick={() => setFindReplaceOpen(false)}
          title="关闭 (Esc)"
          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        >
          <X size={13} />
        </button>
      </div>

      <style>{`
        @keyframes slideDown {
          from { transform: translateY(-8px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
