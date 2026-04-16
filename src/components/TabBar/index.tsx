import React, { memo, useState, useRef, useCallback } from 'react'
import { ChevronDown } from 'lucide-react'
import { TabState } from '../../types'
import { Tab } from './Tab'
import { TabContextMenu } from './TabContextMenu'
import { useTabManagement } from '../../hooks/useTabManagement'
import { useAppState } from '../../context/AppContext'

interface ContextMenuState {
  tabId: string
  x: number
  y: number
}

interface TabBarProps {
  onCloseTab?: (tab: TabState) => void  // Called before close to allow dirty check
}

export const TabBar = memo(function TabBar({ onCloseTab }: TabBarProps) {
  const {
    tabs,
    activeTabId,
    switchTab,
    closeTab,
    closeAllTabs,
    closeOtherTabs,
    closeTabsToRight,
    getTabName
  } = useTabManagement()

  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null)
  const [showOverflow, setShowOverflow] = useState(false)
  const [dragFromIndex, setDragFromIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const { dispatch } = useAppState()

  const handleContextMenu = useCallback((e: React.MouseEvent, tabId: string) => {
    e.preventDefault()
    setContextMenu({ tabId, x: e.clientX, y: e.clientY })
  }, [])

  const handleClose = useCallback((tabId: string) => {
    const tab = tabs.find(t => t.id === tabId)
    if (!tab) return
    if (onCloseTab) {
      onCloseTab(tab)
    } else {
      closeTab(tabId)
    }
  }, [tabs, closeTab, onCloseTab])

  // Drag and drop handlers
  const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
    setDragFromIndex(index)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', String(index))
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverIndex(index)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent, toIndex: number) => {
    e.preventDefault()
    if (dragFromIndex !== null && dragFromIndex !== toIndex) {
      dispatch({ type: 'REORDER_TABS', payload: { fromIndex: dragFromIndex, toIndex } })
    }
    setDragFromIndex(null)
    setDragOverIndex(null)
  }, [dragFromIndex, dispatch])

  const handleDragEnd = useCallback(() => {
    setDragFromIndex(null)
    setDragOverIndex(null)
  }, [])

  // Context menu actions
  const contextTab = contextMenu ? tabs.find(t => t.id === contextMenu.tabId) : null
  const contextTabIndex = contextMenu ? tabs.findIndex(t => t.id === contextMenu.tabId) : -1

  // Hide tab bar when only one tab is open (must be after all hooks)
  if (tabs.length <= 1) return null

  return (
    <div
      className="flex items-stretch bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 h-9 overflow-hidden"
      role="tablist"
      aria-label="Open files"
    >
      {/* Scrollable tab list */}
      <div
        ref={scrollRef}
        className="flex-1 flex items-stretch overflow-x-auto scrollbar-none"
        style={{ scrollbarWidth: 'none' }}
      >
        {tabs.map((tab, index) => (
          <div
            key={tab.id}
            className={`relative ${dragOverIndex === index && dragFromIndex !== index ? 'border-l-2 border-blue-500' : ''}`}
            onDragEnd={handleDragEnd}
          >
            <Tab
              tab={tab}
              isActive={tab.id === activeTabId}
              displayName={getTabName(tab)}
              index={index}
              onActivate={switchTab}
              onClose={handleClose}
              onContextMenu={handleContextMenu}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            />
          </div>
        ))}
      </div>

      {/* Overflow dropdown button */}
      {tabs.length > 5 && (
        <div className="relative flex-shrink-0">
          <button
            className="h-full px-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 border-l border-gray-200 dark:border-gray-700 transition-colors"
            onClick={() => setShowOverflow(!showOverflow)}
            aria-label="Show all tabs"
            title="Show all tabs"
          >
            <ChevronDown size={14} />
          </button>

          {showOverflow && (
            <div className="absolute right-0 top-full z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg py-1 min-w-[200px] max-h-64 overflow-y-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  className={`
                    w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 truncate
                    ${tab.id === activeTabId
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }
                  `}
                  onClick={() => {
                    switchTab(tab.id)
                    setShowOverflow(false)
                  }}
                >
                  {tab.isDirty && (
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                  )}
                  <span className="truncate">{getTabName(tab)}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Context menu */}
      {contextMenu && contextTab && (
        <TabContextMenu
          tabId={contextMenu.tabId}
          x={contextMenu.x}
          y={contextMenu.y}
          canCloseOthers={tabs.length > 1}
          canCloseToRight={contextTabIndex < tabs.length - 1}
          filePath={contextTab.path}
          onClose={() => handleClose(contextMenu.tabId)}
          onCloseOthers={() => closeOtherTabs(contextMenu.tabId)}
          onCloseToRight={() => closeTabsToRight(contextMenu.tabId)}
          onCloseAll={closeAllTabs}
          onCopyPath={() => {
            if (contextTab.path) {
              navigator.clipboard.writeText(contextTab.path)
            }
          }}
          onDismiss={() => setContextMenu(null)}
        />
      )}
    </div>
  )
})
