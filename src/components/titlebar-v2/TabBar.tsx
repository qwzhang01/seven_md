import { memo, useState, useCallback } from 'react'
import { ChevronDown } from 'lucide-react'
import { TabItem } from './TabItem'
import { TabContextMenu } from './TabContextMenu'
import { useFileStore } from '../../stores'

interface TabBarProps {
  onCloseTab?: (tabId: string) => void
}

interface ContextMenuState {
  tabId: string
  x: number
  y: number
}

export const TabBar = memo(function TabBar({ onCloseTab }: TabBarProps) {
  const { tabs, activeTabId, switchTab } = useFileStore()
  const [dragFromIndex, setDragFromIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const [showOverflow, setShowOverflow] = useState(false)
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null)

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

  const handleDrop = useCallback(
    (e: React.DragEvent, toIndex: number) => {
      e.preventDefault()
      if (dragFromIndex !== null && dragFromIndex !== toIndex) {
        useFileStore.getState().reorderTabs(dragFromIndex, toIndex)
      }
      setDragFromIndex(null)
      setDragOverIndex(null)
    },
    [dragFromIndex]
  )

  const handleDragEnd = useCallback(() => {
    setDragFromIndex(null)
    setDragOverIndex(null)
  }, [])

  const handleClose = useCallback(
    (tabId: string) => {
      if (onCloseTab) {
        onCloseTab(tabId)
      } else {
        useFileStore.getState().closeTab(tabId)
      }
    },
    [onCloseTab]
  )

  const handleContextMenu = useCallback(
    (e: React.MouseEvent, tabId: string) => {
      e.preventDefault()
      setContextMenu({ tabId, x: e.clientX, y: e.clientY })
    },
    []
  )

  const handleCloseContextMenu = useCallback(() => {
    setContextMenu(null)
  }, [])

  return (
    <div
      className="flex-1 flex items-stretch h-full overflow-hidden"
      role="tablist"
      aria-label="打开的文件"
    >
      {/* Scrollable tab list */}
      <div
        className="flex-1 flex items-stretch overflow-x-auto"
        style={{ scrollbarWidth: 'none' }}
      >
        {tabs.map((tab, index) => (
          <div
            key={tab.id}
            className={`relative flex-shrink-0 ${
              dragOverIndex === index && dragFromIndex !== index
                ? 'border-l-2 border-[var(--text-accent)]'
                : ''
            }`}
            onDragEnd={handleDragEnd}
          >
            <TabItem
              id={tab.id}
              name={tab.name}
              isDirty={tab.isDirty}
              isActive={tab.id === activeTabId}
              index={index}
              onActivate={switchTab}
              onClose={handleClose}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onDragEnd={handleDragEnd}
              onContextMenu={(e) => handleContextMenu(e, tab.id)}
            />
          </div>
        ))}
      </div>

      {/* Overflow dropdown for many tabs */}
      {tabs.length > 5 && (
        <div className="relative flex-shrink-0 flex items-center border-l border-[var(--border-default)]">
          <button
            className="h-full px-2 text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors"
            onClick={() => setShowOverflow(!showOverflow)}
            aria-label="显示所有标签页"
          >
            <ChevronDown size={14} />
          </button>
          {showOverflow && (
            <div className="absolute right-0 top-full z-50 bg-[var(--bg-primary)] border border-[var(--border-default)] rounded shadow-lg py-1 min-w-[200px] max-h-64 overflow-y-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  className={`w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 truncate ${
                    tab.id === activeTabId
                      ? 'bg-[var(--bg-active)] text-[var(--text-accent)]'
                      : 'text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
                  }`}
                  onClick={() => {
                    switchTab(tab.id)
                    setShowOverflow(false)
                  }}
                >
                  {tab.isDirty && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--text-accent)] flex-shrink-0" />
                  )}
                  <span className="truncate">{tab.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab context menu */}
      {contextMenu && (
        <TabContextMenu
          tabId={contextMenu.tabId}
          position={{ x: contextMenu.x, y: contextMenu.y }}
          onClose={handleCloseContextMenu}
          onCloseTab={handleClose}
        />
      )}
    </div>
  )
})
