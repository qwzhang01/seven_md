/**
 * EditorPaneV2 - 连接新 V2 store 的编辑器面板
 * 基于现有 CodeMirrorEditor，增加：
 * - 主题感知（通过 data-theme CSS 变量而非 dark class）
 * - insert 事件处理（工具栏/菜单插入 Markdown）
 * - 光标位置同步到 useEditorStore
 * - 编辑器右键菜单
 */
import { useEffect, useRef, useCallback, useState } from 'react'
import { EditorState } from '@codemirror/state'
import { EditorView, lineNumbers, highlightActiveLine, highlightActiveLineGutter, keymap, KeyBinding } from '@codemirror/view'
import { undo, redo, indentWithTab, defaultKeymap, historyKeymap } from '@codemirror/commands'
import { history } from '@codemirror/commands'
import { markdown, markdownLanguage } from '@codemirror/lang-markdown'
import { languages } from '@codemirror/language-data'
import { syntaxHighlighting, HighlightStyle, bracketMatching } from '@codemirror/language'
import { search, SearchQuery, findNext, findPrevious, setSearchQuery, replaceAll } from '@codemirror/search'
import { closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete'
import { tags } from '@lezer/highlight'
import { useEditorStore, useUIStore, useThemeStore, useAIStore } from '../../stores'
import { EditorContextMenu } from './EditorContextMenu'

/**
 * List continuation extension:
 * When pressing Enter on a line starting with a list prefix (- , * , 1. , - [ ] , - [x] ),
 * automatically insert the same prefix on the new line.
 * If the line is empty (just the prefix), clear it to exit the list.
 */
function listContinuation(): KeyBinding[] {
  return [{
    key: 'Enter',
    run(view) {
      const { state } = view
      const sel = state.selection.main
      if (!sel.empty) return false

      const line = state.doc.lineAt(sel.head)
      const lineText = line.text

      // Match list patterns
      const listMatch = lineText.match(/^(\s*)([-*]|\d+\.|\-\s\[[ x]\])\s/)
      if (!listMatch) return false

      const indent = listMatch[1]
      const prefix = listMatch[2]

      // If line is just the prefix (empty list item), clear it to exit list
      const contentAfterPrefix = lineText.slice(indent.length + prefix.length + (prefix === '- [ ]' || prefix === '- [x]' ? 0 : 0)).trim()
      if (!contentAfterPrefix || lineText.trim() === prefix || lineText.trim() === '- [ ]' || lineText.trim() === '- [x]') {
        view.dispatch({
          changes: { from: line.from, to: line.to, insert: indent },
          selection: { anchor: line.from + indent.length },
        })
        return true
      }

      // Continue list: insert new prefix on next line
      let newPrefix = prefix
      // Increment numbered list
      if (/^\d+\.$/.test(prefix)) {
        const num = parseInt(prefix) + 1
        newPrefix = `${num}.`
      }

      const insertion = `\n${indent}${newPrefix} `
      view.dispatch({
        changes: { from: sel.head, insert: insertion },
        selection: { anchor: sel.head + insertion.length },
      })
      return true
    },
  }]
}

// Build highlight style from current CSS variables
function buildHighlightStyle(isDark: boolean) {
  return HighlightStyle.define([
    { tag: tags.heading1, fontWeight: 'bold', fontSize: '1.5em' },
    { tag: tags.heading2, fontWeight: 'bold', fontSize: '1.3em' },
    { tag: tags.heading3, fontWeight: 'bold', fontSize: '1.15em' },
    { tag: tags.heading4, fontWeight: 'bold', fontSize: '1.05em' },
    { tag: tags.strong, fontWeight: 'bold', color: isDark ? '#cc6699' : '#e50000' },
    { tag: tags.emphasis, fontStyle: 'italic', color: isDark ? '#c586c0' : '#af00db' },
    { tag: tags.strikethrough, textDecoration: 'line-through', color: isDark ? '#858585' : '#6b7280' },
    { tag: tags.link, color: isDark ? '#3794ff' : '#0066cc', textDecoration: 'underline' },
    { tag: tags.url, color: isDark ? '#3794ff' : '#0066cc' },
    { tag: tags.monospace, fontFamily: '"SF Mono", Menlo, Monaco, Consolas, monospace', backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)', borderRadius: '3px', padding: '0 3px' },
    { tag: tags.quote, color: isDark ? '#6a9955' : '#059669' },
    { tag: tags.list, color: isDark ? '#569cd6' : '#0066cc' },
    { tag: tags.meta, color: isDark ? '#9cdcfe' : '#6b7280' },
    { tag: tags.processingInstruction, color: isDark ? '#9cdcfe' : '#6b7280' },
    { tag: tags.comment, color: isDark ? '#6a9955' : '#008000', fontStyle: 'italic' },
    { tag: tags.keyword, color: isDark ? '#569cd6' : '#0000ff' },
    { tag: tags.string, color: isDark ? '#ce9178' : '#a31515' },
    { tag: tags.number, color: isDark ? '#b5cea8' : '#098658' },
  ])
}

interface EditorPaneV2Props {
  content: string
  onChange: (value: string) => void
  className?: string
}

export function EditorPaneV2({ content, onChange, className = '' }: EditorPaneV2Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)
  const isExternalUpdate = useRef(false)

  const { setCursorPosition } = useEditorStore()
  const { zoomLevel } = useUIStore()
  const currentTheme = useThemeStore((s) => s.currentTheme)

  const isDark = !['light', 'github'].includes(currentTheme)

  // Context menu state
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null)

  // Insert text at cursor
  const insertAtCursor = useCallback((text: string) => {
    if (!viewRef.current) return
    const view = viewRef.current
    const { from, to } = view.state.selection.main
    const selectedText = view.state.sliceDoc(from, to)

    // If text is a wrapping format (like ** ** ), wrap selection
    let insertText = text
    if (selectedText && (text === '**' || text === '*' || text === '~~' || text === '`')) {
      insertText = `${text}${selectedText}${text}`
      view.dispatch({
        changes: { from, to, insert: insertText },
        selection: { anchor: from + insertText.length },
      })
    } else {
      view.dispatch({
        changes: { from, to, insert: insertText },
        selection: { anchor: from + insertText.length },
      })
    }
    view.focus()
  }, [])

  // Initialize editor
  useEffect(() => {
    if (!containerRef.current) return

    const highlightStyle = buildHighlightStyle(isDark)

    const startState = EditorState.create({
      doc: content,
      extensions: [
        lineNumbers(),
        highlightActiveLine(),
        highlightActiveLineGutter(),
        markdown({ base: markdownLanguage, codeLanguages: languages }),
        syntaxHighlighting(highlightStyle),
        // D1: 禁用 search 扩展的内置 UI，只使用自定义的 FindReplaceBar
        search({ top: false }),
        bracketMatching(),
        // D4: 增强自动配对配置，添加反引号
        closeBrackets({
          brackets: ['(', '[', '{', '"', "'", '`'],
        }),
        history(),
        keymap.of([
          ...closeBracketsKeymap,
          ...listContinuation(),
          indentWithTab,
          ...historyKeymap,
          ...defaultKeymap,
        ]),
        EditorView.lineWrapping,
        EditorView.updateListener.of((update) => {
          if (update.docChanged && !isExternalUpdate.current) {
            onChange(update.state.doc.toString())
          }
          if (update.selectionSet) {
            const pos = update.state.selection.main.head
            const line = update.state.doc.lineAt(pos)
            setCursorPosition({ line: line.number, column: pos - line.from + 1 })
            // 同步选中文本到 AI Store
            const sel = update.state.selection.main
            const selectedText = sel.empty ? null : update.state.sliceDoc(sel.from, sel.to)
            useAIStore.getState().setSelectedText(selectedText)
          }
        }),
        EditorView.theme({
          '&': { height: '100%', background: 'var(--editor-bg, var(--bg-primary))' },
          '.cm-scroller': { overflow: 'auto', fontFamily: 'var(--font-mono, "SF Mono", Menlo, Monaco, Consolas, monospace)' },
          '.cm-content': { fontSize: `${zoomLevel}px`, padding: '8px 0', caretColor: 'var(--editor-cursor, #aeafad)' },
          '.cm-line': { padding: '0 16px' },
          '.cm-gutters': {
            backgroundColor: 'var(--editor-gutter-bg, var(--bg-primary))',
            borderRight: '1px solid var(--border-primary)',
            color: 'var(--editor-gutter-fg, var(--text-tertiary))',
          },
          '.cm-activeLineGutter': { backgroundColor: 'var(--editor-line-highlight, var(--bg-hover))', color: 'var(--text-primary)' },
          '.cm-activeLine': { backgroundColor: 'var(--editor-line-highlight, rgba(255,255,255,0.05))' },
          '.cm-selectionBackground, ::selection': { backgroundColor: 'var(--editor-selection, #264f78) !important' },
          '.cm-cursor': { borderLeftColor: 'var(--editor-cursor, #aeafad)' },
          '.cm-lineNumbers': { color: 'var(--editor-gutter-fg, #858585)' },
        }),
        EditorView.baseTheme({
          '&.cm-focused': { outline: 'none' },
        }),
      ],
    })

    const view = new EditorView({
      state: startState,
      parent: containerRef.current,
    })
    viewRef.current = view

    // 滚动同步：监听 CodeMirror scroller 的 scroll 事件
    const scroller = view.scrollDOM
    let rafId: number | null = null
    const handleScroll = () => {
      const editorStore = useEditorStore.getState()
      if (!editorStore.scrollSyncEnabled) return
      if (rafId !== null) return // 节流
      rafId = requestAnimationFrame(() => {
        rafId = null
        const scrollHeight = scroller.scrollHeight
        const clientHeight = scroller.clientHeight
        if (scrollHeight > clientHeight) {
          const ratio = scroller.scrollTop / (scrollHeight - clientHeight)
          useEditorStore.getState().setScrollRatio(Math.max(0, Math.min(1, ratio)))
        }
      })
    }
    scroller.addEventListener('scroll', handleScroll)

    return () => {
      scroller.removeEventListener('scroll', handleScroll)
      if (rafId !== null) cancelAnimationFrame(rafId)
      view.destroy()
      viewRef.current = null
    }
  }, [isDark, zoomLevel]) // Re-create when theme/zoom changes

  // Sync external content
  useEffect(() => {
    if (!viewRef.current) return
    const current = viewRef.current.state.doc.toString()
    if (current !== content) {
      isExternalUpdate.current = true
      viewRef.current.dispatch({
        changes: { from: 0, to: current.length, insert: content },
      })
      isExternalUpdate.current = false
    }
  }, [content])

  // Listen to editor:insert custom events
  useEffect(() => {
    const handler = (e: Event) => {
      insertAtCursor((e as CustomEvent<string>).detail)
    }
    window.addEventListener('editor:insert', handler)
    return () => window.removeEventListener('editor:insert', handler)
  }, [insertAtCursor])

  // Listen to editor:jump-to-line
  useEffect(() => {
    const handler = (e: Event) => {
      const lineNum = (e as CustomEvent<number>).detail
      if (!viewRef.current) return
      const view = viewRef.current
      const doc = view.state.doc
      if (lineNum < 1 || lineNum > doc.lines) return
      const line = doc.line(lineNum)
      view.dispatch({
        selection: { anchor: line.from },
        effects: EditorView.scrollIntoView(line.from, { y: 'center' }),
      })
      view.focus()
    }
    window.addEventListener('editor:jump-to-line', handler)
    return () => window.removeEventListener('editor:jump-to-line', handler)
  }, [])

  // Listen to undo/redo events
  useEffect(() => {
    const handleUndo = () => { if (viewRef.current) undo(viewRef.current) }
    const handleRedo = () => { if (viewRef.current) redo(viewRef.current) }
    window.addEventListener('editor:undo', handleUndo)
    window.addEventListener('editor:redo', handleRedo)
    return () => {
      window.removeEventListener('editor:undo', handleUndo)
      window.removeEventListener('editor:redo', handleRedo)
    }
  }, [])

  // D1: 监听查找事件并统计匹配数量
  useEffect(() => {
    const handleFindQuery = (e: Event) => {
      if (!viewRef.current) return
      const view = viewRef.current
      const detail = (e as CustomEvent<{ query: string; caseSensitive: boolean; wholeWord: boolean; useRegex: boolean }>).detail
      const { query, caseSensitive, wholeWord, useRegex } = detail

      if (!query) {
        window.dispatchEvent(new CustomEvent('editor:find-results', { detail: { total: 0, current: 0 } }))
        return
      }

      try {
        const docText = view.state.doc.toString()
        const sel = view.state.selection.main

        // 转义正则特殊字符
        const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

        let pattern: RegExp
        if (useRegex) {
          pattern = new RegExp(query, caseSensitive ? 'g' : 'gi')
        } else {
          const escaped = escapeRegex(query)
          const flags = caseSensitive ? 'g' : 'gi'
          pattern = wholeWord ? new RegExp(`\\b${escaped}\\b`, flags) : new RegExp(escaped, flags)
        }

        let matchCount = 0
        let currentMatch = 0
        let match: RegExpExecArray | null

        // 使用 lastIndex 来遍历所有匹配
        while ((match = pattern.exec(docText)) !== null) {
          matchCount++
          // 检查当前光标位置是否在此匹配范围内
          if (match.index <= sel.head && match.index + match[0].length >= sel.head) {
            currentMatch = matchCount
          }
          // 防止无限循环（零长度匹配）
          if (match.index === pattern.lastIndex) {
            pattern.lastIndex++
          }
        }

        window.dispatchEvent(new CustomEvent('editor:find-results', { detail: { total: matchCount, current: currentMatch } }))
      } catch {
        window.dispatchEvent(new CustomEvent('editor:find-results', { detail: { total: 0, current: 0 } }))
      }
    }

    window.addEventListener('editor:find-query', handleFindQuery)
    return () => window.removeEventListener('editor:find-query', handleFindQuery)
  }, [])

  // D1: 处理查找下一个/上一个事件
  useEffect(() => {
    const handleFindNext = () => {
      if (!viewRef.current) return
      findNext(viewRef.current)
    }
    const handleFindPrev = () => {
      if (!viewRef.current) return
      findPrevious(viewRef.current)
    }

    window.addEventListener('editor:find-next', handleFindNext)
    window.addEventListener('editor:find-prev', handleFindPrev)
    return () => {
      window.removeEventListener('editor:find-next', handleFindNext)
      window.removeEventListener('editor:find-prev', handleFindPrev)
    }
  }, [])

  // D1: 处理替换事件
  useEffect(() => {
    const handleReplaceOne = (e: Event) => {
      if (!viewRef.current) return
      const view = viewRef.current
      const replaceText = (e as CustomEvent<string>).detail
      const sel = view.state.selection.main
      if (sel.empty) return
      view.dispatch({
        changes: { from: sel.from, to: sel.to, insert: replaceText },
        selection: { anchor: sel.from + replaceText.length },
      })
    }
    const handleReplaceAll = (e: Event) => {
      if (!viewRef.current) return
      const view = viewRef.current
      const replaceText = (e as CustomEvent<string>).detail
      const state = view.state
      const sel = state.selection.main
      if (sel.empty) return
      const selectedText = state.sliceDoc(sel.from, sel.to)
      const query = new SearchQuery({ search: selectedText })
      setSearchQuery(view, query)
      replaceAll(view, replaceText)
    }

    window.addEventListener('editor:replace-one', handleReplaceOne)
    window.addEventListener('editor:replace-all', handleReplaceAll)
    return () => {
      window.removeEventListener('editor:replace-one', handleReplaceOne)
      window.removeEventListener('editor:replace-all', handleReplaceAll)
    }
  }, [])

  // Listen to editor:format — Markdown 格式化
  useEffect(() => {
    const handler = () => {
      if (!viewRef.current) return
      const view = viewRef.current
      const doc = view.state.doc.toString()

      // 格式化规则：
      // 1. 合并多余空行为 2 行（保留 Markdown 换行语义）
      // 2. 去除行尾空格（但保留 Markdown 换行所需的两个尾部空格）
      // 3. 确保文件末尾有一个换行符
      let formatted = doc
        // 去除行尾空格（保留 "  " Markdown 换行标记）
        .split('\n')
        .map((line: string) => {
          const trailingSpaces = line.match(/(  +)$/)
          // 如果行尾恰好两个空格（Markdown 换行），保留
          if (trailingSpaces && trailingSpaces[1] === '  ') {
            return line.replace(/\s+$/, '') + '  '
          }
          return line.replace(/\s+$/, '')
        })
        .join('\n')

      // 合并 3+ 连续空行为 2 行
      formatted = formatted.replace(/\n{3,}/g, '\n\n')

      // 确保末尾换行
      if (formatted.length > 0 && !formatted.endsWith('\n')) {
        formatted += '\n'
      }

      if (formatted !== doc) {
        view.dispatch({
          changes: { from: 0, to: view.state.doc.length, insert: formatted },
        })
      }
    }
    window.addEventListener('editor:format', handler)
    return () => window.removeEventListener('editor:format', handler)
  }, [])

  // Listen to editor:replace-selection — 替换编辑器选中文本（AI 改写/翻译应用）
  useEffect(() => {
    const handler = (e: Event) => {
      if (!viewRef.current) return
      const view = viewRef.current
      const newText = (e as CustomEvent<string>).detail
      if (!newText) return
      const sel = view.state.selection.main
      if (sel.empty) return
      view.dispatch({
        changes: { from: sel.from, to: sel.to, insert: newText },
        selection: { anchor: sel.from + newText.length },
      })
      view.focus()
    }
    window.addEventListener('editor:replace-selection', handler)
    return () => window.removeEventListener('editor:replace-selection', handler)
  }, [])

  // 编辑器焦点跟踪 — 更新全局状态供快捷键上下文判断
  useEffect(() => {
    const setEditorFocused = useUIStore.getState().setEditorFocused
    const view = viewRef.current
    if (!view) return

    // CodeMirror 的 focus/blur 事件
    view.dom.addEventListener('focus', () => setEditorFocused(true))
    view.dom.addEventListener('blur', () => setEditorFocused(false))

    // 初始检查
    if (view.hasFocus) {
      setEditorFocused(true)
    }

    return () => {
      view.dom.removeEventListener('focus', () => setEditorFocused(true))
      view.dom.removeEventListener('blur', () => setEditorFocused(false))
      setEditorFocused(false)
    }
  }, [])

  // Right-click context menu
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setContextMenu({ x: e.clientX, y: e.clientY })
  }, [])

  return (
    <div
      className={`relative flex flex-col h-full overflow-hidden ${className}`}
      style={{ background: 'var(--editor-bg, var(--bg-primary))' }}
    >
      <div
        ref={containerRef}
        className="flex-1 overflow-hidden"
        onContextMenu={handleContextMenu}
      />

      {/* Context menu */}
      {contextMenu && (
        <EditorContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          onInsert={insertAtCursor}
          onFind={() => { useUIStore.getState().setFindReplaceMode('find'); useUIStore.getState().setFindReplaceOpen(true) }}
          onAIRewrite={() => { useUIStore.getState().setAIPanelOpen(true) }}
          onFormat={() => { window.dispatchEvent(new CustomEvent('editor:format')) }}
        />
      )}
    </div>
  )
}
