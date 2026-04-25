import { useAppState } from '../../context/AppContext'
import { useMemo, useState, useEffect } from 'react'
import { getTabDisplayName } from '../../utils/tabUtils'
import { EXPORT_STATUS_EVENT, ExportStatusDetail } from '../../hooks/useExport'

export function StatusBar() {
  const { state } = useAppState()
  const { cursorPosition, documentStats, fileEncoding, lineEnding } = state.editor

  // Transient status message (export success/error, auto-clears after 4s)
  const [transientMessage, setTransientMessage] = useState<{ text: string; isError: boolean } | null>(null)

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<ExportStatusDetail>).detail
      setTransientMessage({ text: detail.message, isError: detail.type === 'error' })
      const timer = setTimeout(() => setTransientMessage(null), 4000)
      return () => clearTimeout(timer)
    }
    window.addEventListener(EXPORT_STATUS_EVENT, handler)
    return () => window.removeEventListener(EXPORT_STATUS_EVENT, handler)
  }, [])

  // Derive active tab info
  const activeTab = state.tabs.tabs.find(t => t.id === state.tabs.activeTabId) ?? null
  const tabCount = state.tabs.tabs.length
  const activeTabIndex = activeTab ? state.tabs.tabs.findIndex(t => t.id === activeTab.id) + 1 : 0

  // Calculate stats with memoization
  const stats = useMemo(() => {
    return {
      lines: documentStats.lines || 0,
      words: documentStats.words || 0,
      characters: documentStats.characters || 0
    }
  }, [documentStats])

  return (
    <div
      className="h-6 flex items-center justify-between px-3 bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 text-xs select-none"
      role="status"
      aria-live="polite"
      aria-label="Editor status"
    >
      {/* Left section: Cursor position + tab info */}
      <div className="flex items-center gap-4 text-gray-600 dark:text-gray-400">
        <span>
          Ln {cursorPosition.line}, Col {cursorPosition.column}
        </span>
        <span className="text-gray-400 dark:text-gray-500" aria-hidden="true">|</span>
        <span>
          {stats.lines} lines, {stats.words} words, {stats.characters} characters
        </span>
        {tabCount > 1 && (
          <>
            <span className="text-gray-400 dark:text-gray-500" aria-hidden="true">|</span>
            <span title={activeTab?.path ?? undefined}>
              Tab {activeTabIndex} of {tabCount}
            </span>
          </>
        )}
        {activeTab && (
          <>
            <span className="text-gray-400 dark:text-gray-500" aria-hidden="true">|</span>
            <span
              className={`truncate max-w-[200px] ${activeTab.isDirty ? 'text-blue-600 dark:text-blue-400' : ''}`}
              title={activeTab.path ?? undefined}
            >
              {getTabDisplayName(activeTab)}{activeTab.isDirty ? ' ●' : ''}
            </span>
          </>
        )}
      </div>

      {/* Right section: Transient message + File encoding and line ending */}
      <div className="flex items-center gap-4 text-gray-600 dark:text-gray-400">
        {transientMessage && (
          <>
            <span className={`truncate max-w-[300px] ${transientMessage.isError ? 'text-red-500 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
              {transientMessage.text}
            </span>
            <span className="text-gray-300 dark:text-gray-600">|</span>
          </>
        )}
        <span>{lineEnding}</span>
        <span className="text-gray-300 dark:text-gray-600">|</span>
        <span>{fileEncoding}</span>
      </div>    </div>
  )
}
