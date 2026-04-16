import { useEffect, useState, useCallback, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { listen } from '@tauri-apps/api/event'
import { useAppState } from '../context/AppContext'
import { useFileTree } from '../hooks/useAppState'
import { usePerformanceMonitor } from '../hooks/usePerformanceMonitor'
import { useAnnouncer } from '../hooks/useAnnouncer'
import { startFsWatch, stopFsWatch } from '../tauriCommands'
import FileTree from './FileTree'
import SearchPanel from './SearchPanel'
import { createLogger } from '../utils/logger'

const logger = createLogger('Sidebar')

// Expose a ref so App.tsx can focus the search input via the shortcut
export const sidebarSearchInputRef = { current: null as HTMLInputElement | null }

export default function Sidebar() {
  const { state, dispatch } = useAppState()
  const { loadDirectory } = useFileTree()
  const [isLoading, setIsLoading] = useState(false)
  const [activeView, setActiveView] = useState<'files' | 'search'>('files')
  const { announceLoading, announceSuccess, announceError } = useAnnouncer()
  const { t } = useTranslation()
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  
  // Performance monitoring
  usePerformanceMonitor('Sidebar')

  const loadFolderTree = useCallback(async (folderPath: string) => {
    setIsLoading(true)
    announceLoading(t('sidebar.loadingContents'))
    try {
      const nodes = await loadDirectory(folderPath)
      dispatch({ type: 'SET_FOLDER_TREE', payload: nodes })
      announceSuccess(t('sidebar.folderLoaded', { count: nodes.length }))
    } catch (error) {
      logger.error('Failed to load folder tree', { error: String(error), path: folderPath })
      announceError(t('errors.fileLoadError'))
    } finally {
      setIsLoading(false)
    }
  }, [loadDirectory, dispatch, announceLoading, announceSuccess, announceError, t])

  // Load tree and start watcher when folder path changes
  useEffect(() => {
    if (!state.folder.path) return

    const folderPath = state.folder.path
    loadFolderTree(folderPath)

    // Start fs watcher
    startFsWatch(folderPath).catch(err =>
      logger.error('Failed to start fs watch', { error: String(err), path: folderPath })
    )

    // Subscribe to fs-watch:changed events with 200ms debounce
    let unlisten: (() => void) | undefined
    listen('fs-watch:changed', () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current)
      debounceTimer.current = setTimeout(() => {
        loadFolderTree(folderPath)
      }, 200)
    }).then(fn => { unlisten = fn })

    return () => {
      // Stop watcher and unsubscribe on cleanup
      stopFsWatch().catch(() => {})
      unlisten?.()
      if (debounceTimer.current) clearTimeout(debounceTimer.current)
    }
  }, [state.folder.path])

  // Listen for the global search shortcut to switch to search view
  useEffect(() => {
    const handleOpenSearch = () => {
      setActiveView('search')
      // Focus the search input after a short delay to allow render
      setTimeout(() => {
        const input = document.querySelector<HTMLInputElement>('[data-search-input]')
        if (input) {
          input.focus()
          sidebarSearchInputRef.current = input
        }
      }, 50)
    }
    window.addEventListener('sidebar:open-search', handleOpenSearch)
    return () => window.removeEventListener('sidebar:open-search', handleOpenSearch)
  }, [])

  const getFolderName = () => {
    if (!state.folder.path) return ''
    const parts = state.folder.path.split('/')
    return parts[parts.length - 1] || state.folder.path
  }

  return (
    <aside 
      className="h-full flex flex-col bg-gray-50 dark:bg-gray-900"
      role="complementary"
      aria-label={t('sidebar.ariaLabel')}
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <h2 className="font-semibold text-sm truncate text-gray-900 dark:text-gray-100" id="sidebar-title">
            {activeView === 'search' ? t('search.title') : getFolderName()}
          </h2>
        </div>
        {/* View toggle buttons */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Files button */}
          <button
            onClick={() => setActiveView('files')}
            title={t('sidebar.files')}
            aria-label={t('sidebar.files')}
            aria-pressed={activeView === 'files'}
            className={`p-1 rounded transition-colors ${
              activeView === 'files'
                ? 'text-blue-500 bg-blue-50 dark:bg-blue-900/30'
                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
            }`}
          >
            {/* Files icon */}
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M2 2h7l3 3v9H2V2zm7 0v3h3"/>
              <path fillRule="evenodd" d="M2 2a1 1 0 00-1 1v10a1 1 0 001 1h10a1 1 0 001-1V5.414L9.586 2H2zm7 .707L12.293 6H9V2.707zM1 3a1 1 0 011-1h6.586L13 6.414V13a1 1 0 01-1 1H2a1 1 0 01-1-1V3z"/>
            </svg>
          </button>
          {/* Search button */}
          <button
            onClick={() => {
              setActiveView('search')
              setTimeout(() => {
                const input = document.querySelector<HTMLInputElement>('[data-search-input]')
                if (input) input.focus()
              }, 50)
            }}
            title={t('search.title')}
            aria-label={t('search.title')}
            aria-pressed={activeView === 'search'}
            className={`p-1 rounded transition-colors ${
              activeView === 'search'
                ? 'text-blue-500 bg-blue-50 dark:bg-blue-900/30'
                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
            }`}
          >
            {/* Search icon */}
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="6.5" cy="6.5" r="4.5"/>
              <line x1="10" y1="10" x2="14" y2="14"/>
            </svg>
          </button>
          {/* Refresh button (visible only when a folder is open) */}
          {state.folder.path && (
            <button
              onClick={() => loadFolderTree(state.folder.path!)}
              title={t('sidebar.refresh')}
              aria-label={t('sidebar.refresh')}
              className="p-1 rounded transition-colors text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              {/* Refresh icon */}
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M13.5 8A5.5 5.5 0 1 1 8 2.5" strokeLinecap="round"/>
                <polyline points="11 1 13.5 3.5 11 6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}
        </div>
      </div>
      
      {/* Content Area */}
      {activeView === 'search' ? (
        <SearchPanel folderPath={state.folder.path} />
      ) : (
        <div 
          className="flex-1 overflow-y-auto" 
          role="tree" 
          aria-labelledby="sidebar-title"
          aria-live="polite"
        >
          {isLoading ? (
            <div 
              className="flex items-center justify-center h-32"
              role="status"
              aria-label={t('sidebar.loadingFiles')}
              aria-live="polite"
            >
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {t('common.loading')}
              </div>
            </div>
          ) : state.folder.tree && state.folder.tree.length > 0 ? (
            <FileTree nodes={state.folder.tree} />
          ) : state.folder.path ? (
            <div 
              className="flex items-center justify-center h-32 px-4"
              role="status"
              aria-label={t('sidebar.noMarkdownFiles')}
            >
              <div className="text-sm text-gray-500 dark:text-gray-400 text-center">
                {t('sidebar.noMarkdownFiles')}
              </div>
            </div>
          ) : (
            <div 
              className="flex items-center justify-center h-32 px-4"
              role="status"
              aria-label={t('sidebar.noFolderOpen')}
            >
              <div className="text-sm text-gray-500 dark:text-gray-400 text-center">
                {t('sidebar.openFolderPrompt')}
              </div>
            </div>
          )}
        </div>
      )}
    </aside>
  )
}
