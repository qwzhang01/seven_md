import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { invoke } from '@tauri-apps/api/core'
import { useAppState } from '../../context/AppContext'
import { useFileSearch } from '../../hooks/useFileSearch'
import type { SearchResult, TextSearchResult, SearchType } from '../../types'

interface SearchPanelProps {
  folderPath: string | null
}

export default function SearchPanel({ folderPath }: SearchPanelProps) {
  const { t } = useTranslation()
  const { dispatch } = useAppState()
  const inputRef = useRef<HTMLInputElement>(null)

  const {
    query,
    setQuery,
    searchType,
    setSearchType,
    fileResults,
    textResults,
    isLoading,
    error,
    truncated,
  } = useFileSearch(folderPath)

  const openFileInEditor = async (filePath: string) => {
    try {
      const content = await invoke<string>('read_file', { path: filePath })
      dispatch({ type: 'OPEN_TAB', payload: { path: filePath, content } })
    } catch (err) {
      console.error('Failed to open file from search result', err)
    }
  }

  const handleFileResultClick = (result: SearchResult) => {
    openFileInEditor(result.path)
  }

  const handleTextResultClick = (result: TextSearchResult) => {
    openFileInEditor(result.path).then(() => {
      // Emit navigate event after file is opened
      window.dispatchEvent(
        new CustomEvent('search:navigate', { detail: { lineNumber: result.lineNumber } })
      )
    })
  }

  const disabled = !folderPath

  return (
    <div className="flex flex-col h-full" data-testid="search-panel">
      {/* Search Input */}
      <div className="px-3 pt-3 pb-2">
        <input
          ref={inputRef}
          data-search-input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={disabled ? t('search.openFolderToSearch') : t('search.placeholder')}
          disabled={disabled}
          className="w-full px-3 py-1.5 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label={t('search.inputAriaLabel')}
        />
      </div>

      {/* Mode Toggle */}
      <div className="px-3 pb-2 flex gap-1">
        {(['filename', 'fulltext'] as SearchType[]).map((type) => (
          <button
            key={type}
            onClick={() => setSearchType(type)}
            disabled={disabled}
            className={`flex-1 py-1 text-xs rounded font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              searchType === type
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
            aria-pressed={searchType === type}
          >
            {type === 'filename' ? t('search.modeFiles') : t('search.modeText')}
          </button>
        ))}
      </div>

      {/* Results Area */}
      <div className="flex-1 overflow-y-auto px-1" role="list" aria-label={t('search.resultsAriaLabel')}>
        {/* No folder open */}
        {disabled && (
          <div className="flex items-center justify-center h-24 px-4">
            <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
              {t('search.openFolderToSearch')}
            </p>
          </div>
        )}

        {/* Loading */}
        {!disabled && isLoading && (
          <div
            className="flex items-center justify-center h-16"
            role="status"
            aria-label={t('search.loading')}
          >
            <span className="text-xs text-gray-400 dark:text-gray-500">{t('search.loading')}</span>
          </div>
        )}

        {/* Error */}
        {!disabled && !isLoading && error && (
          <div className="px-3 py-2">
            <p className="text-xs text-red-500">{error}</p>
          </div>
        )}

        {/* Truncation notice */}
        {!disabled && !isLoading && truncated && (
          <div className="px-3 py-1">
            <p className="text-xs text-yellow-600 dark:text-yellow-400">{t('search.truncated')}</p>
          </div>
        )}

        {/* Filename results */}
        {!disabled && !isLoading && !error && searchType === 'filename' && (
          <>
            {fileResults.length === 0 && query.trim().length > 0 && (
              <div className="flex items-center justify-center h-16 px-4">
                <p className="text-xs text-gray-400 dark:text-gray-500">{t('search.noResults')}</p>
              </div>
            )}
            {fileResults.map((result) => (
              <button
                key={result.path}
                role="listitem"
                onClick={() => handleFileResultClick(result)}
                className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer group"
                title={result.path}
              >
                <p className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate">
                  {result.name}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
                  {result.relativePath}
                </p>
              </button>
            ))}
          </>
        )}

        {/* Full-text results */}
        {!disabled && !isLoading && !error && searchType === 'fulltext' && (
          <>
            {textResults.length === 0 && query.trim().length > 0 && (
              <div className="flex items-center justify-center h-16 px-4">
                <p className="text-xs text-gray-400 dark:text-gray-500">{t('search.noResults')}</p>
              </div>
            )}
            {textResults.map((result, idx) => (
              <button
                key={`${result.path}-${result.lineNumber}-${idx}`}
                role="listitem"
                onClick={() => handleTextResultClick(result)}
                className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer"
                title={result.path}
              >
                <div className="flex items-center gap-1 mb-0.5">
                  <span className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate">
                    {result.name}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">
                    :{result.lineNumber}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate font-mono">
                  {result.snippet}
                </p>
              </button>
            ))}
          </>
        )}
      </div>
    </div>
  )
}
