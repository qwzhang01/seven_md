import { useState, useEffect } from 'react'
import { ChevronRight, ChevronDown } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { FileTreeNode } from '../types'
import { useAppState } from '../context/AppContext'
import { useFileTree } from '../hooks/useAppState'
import { readFile } from '../tauriCommands'
import { getFileIcon } from '../utils/fileIcons'
import { createLogger } from '../utils/logger'
import { useAnnouncer } from '../hooks/useAnnouncer'
import ContextMenu, { ContextMenuAction } from './FileTree/ContextMenu'
import InlineInput from './FileTree/InlineInput'

const logger = createLogger('FileTreeItem')

type InlineMode = 'create-file' | 'create-folder' | 'rename' | null

interface FileTreeItemProps {
  node: FileTreeNode
  depth: number
}

export default function FileTreeItem({ node, depth }: FileTreeItemProps) {
  const { state, dispatch } = useAppState()
  const { loadDirectory, isExpanded, toggleDirectory, createFile, createDirectory, renamePath, deletePath } = useFileTree()
  const { announceSuccess, announceError, announceInfo } = useAnnouncer()
  const { t } = useTranslation()
  const [children, setChildren] = useState<FileTreeNode[]>(node.children || [])
  const [isLoading, setIsLoading] = useState(false)

  // Context menu state
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null)

  // Inline edit state
  const [inlineMode, setInlineMode] = useState<InlineMode>(null)
  const [inlineError, setInlineError] = useState<string | undefined>(undefined)

  const isDirectory = node.type === 'directory'
  const expanded = isExpanded(node.path)
  const activeTab = state.tabs.tabs.find(t => t.id === state.tabs.activeTabId) ?? null
  const isActive = activeTab?.path === node.path
  // Check if file is open in any tab (not necessarily active)
  const isOpenInTab = !isDirectory && state.tabs.tabs.some(t => t.path === node.path)

  useEffect(() => {
    if (isDirectory && expanded && node.isLoaded === false) {
      loadChildren()
    }
  }, [expanded])

  useEffect(() => {
    if (node.children && node.isLoaded) {
      setChildren(node.children)
    }
  }, [node.children, node.isLoaded])

  const loadChildren = async () => {
    setIsLoading(true)
    try {
      const nodes = await loadDirectory(node.path)
      setChildren(nodes)
      announceInfo(`Folder ${node.name} expanded with ${nodes.length} items`)
    } catch (error) {
      logger.error('Failed to load children', { error: String(error), path: node.path })
      announceError(`Failed to load folder ${node.name}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClick = async () => {
    if (isDirectory) {
      toggleDirectory(node.path)
      if (!expanded) {
        announceInfo(`Opening folder ${node.name}`)
      } else {
        announceInfo(`Closing folder ${node.name}`)
      }
    } else {
      // Check if file is already open in a tab
      const existingTab = state.tabs.tabs.find(t => t.path === node.path)
      if (existingTab) {
        dispatch({ type: 'SWITCH_TAB', payload: existingTab.id })
        announceSuccess(`Switched to ${node.name}`)
        return
      }
      
      // Open file in new tab
      try {
        announceInfo(`Opening file ${node.name}`)
        const content = await readFile(node.path)
        dispatch({ type: 'OPEN_TAB', payload: { path: node.path, content } })
        announceSuccess(`File ${node.name} opened`)
      } catch (error) {
        logger.error('Failed to open file', { error: String(error), path: node.path })
        announceError(`Failed to open file ${node.name}`)
      }
    }
  }

  // ─── Context Menu ────────────────────────────────────────────────────────

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setContextMenu({ x: e.clientX, y: e.clientY })
  }

  const handleContextMenuAction = (action: ContextMenuAction) => {
    setInlineError(undefined)
    switch (action) {
      case 'new-file':
        if (isDirectory && !expanded) toggleDirectory(node.path)
        setInlineMode('create-file')
        break
      case 'new-folder':
        if (isDirectory && !expanded) toggleDirectory(node.path)
        setInlineMode('create-folder')
        break
      case 'rename':
        setInlineMode('rename')
        break
      case 'delete':
        handleDelete()
        break
    }
  }

  const handleDelete = async () => {
    const confirmed = window.confirm(t('fileTree.deleteConfirm', { name: node.name }))
    if (!confirmed) return
    try {
      await deletePath(node.path)
      announceSuccess(`Deleted ${node.name}`)
    } catch (error) {
      logger.error('Failed to delete', { error: String(error), path: node.path })
      announceError(`Failed to delete ${node.name}`)
    }
  }

  // ─── Inline Input Handlers ───────────────────────────────────────────────

  /** Parent directory for create operations */
  const parentDir = isDirectory ? node.path : node.path.substring(0, node.path.lastIndexOf('/'))

  /** Sibling names for duplicate detection */
  const siblingNames = children.map(c => c.name.toLowerCase())

  const handleCreateFileConfirm = async (value: string) => {
    const trimmed = value.trim()
    if (!trimmed) {
      setInlineError(t('fileTree.errorEmpty'))
      return
    }
    // Append .md if no extension
    const name = trimmed.includes('.') ? trimmed : `${trimmed}.md`
    if (siblingNames.includes(name.toLowerCase())) {
      setInlineError(t('fileTree.errorDuplicate'))
      return
    }
    try {
      await createFile(parentDir, name)
      setInlineMode(null)
      setInlineError(undefined)
      announceSuccess(`Created file ${name}`)
    } catch (error) {
      setInlineError(String(error))
    }
  }

  const handleCreateFolderConfirm = async (value: string) => {
    const trimmed = value.trim()
    if (!trimmed) {
      setInlineError(t('fileTree.errorEmpty'))
      return
    }
    if (siblingNames.includes(trimmed.toLowerCase())) {
      setInlineError(t('fileTree.errorDuplicate'))
      return
    }
    try {
      await createDirectory(parentDir, trimmed)
      setInlineMode(null)
      setInlineError(undefined)
      announceSuccess(`Created folder ${trimmed}`)
    } catch (error) {
      setInlineError(String(error))
    }
  }

  const handleRenameConfirm = async (value: string) => {
    const trimmed = value.trim()
    if (!trimmed) {
      setInlineError(t('fileTree.errorEmpty'))
      return
    }
    if (trimmed === node.name) {
      setInlineMode(null)
      return
    }
    const newPath = `${parentDir}/${trimmed}`
    // Check duplicate among siblings (excluding self)
    const dir = node.path.substring(0, node.path.lastIndexOf('/'))
    const siblingNamesExcludingSelf = children
      .filter(c => c.path !== node.path)
      .map(c => c.name.toLowerCase())
    if (siblingNamesExcludingSelf.includes(trimmed.toLowerCase())) {
      setInlineError(t('fileTree.errorDuplicate'))
      return
    }
    try {
      await renamePath(node.path, newPath)
      setInlineMode(null)
      setInlineError(undefined)
      announceSuccess(`Renamed to ${trimmed}`)
    } catch (error) {
      setInlineError(String(error))
    }
  }

  const handleInlineCancel = () => {
    setInlineMode(null)
    setInlineError(undefined)
  }

  const paddingLeft = depth * 16 + 12

  return (
    <div role="treeitem" aria-selected={isActive} aria-expanded={isDirectory ? expanded : undefined}>
      {/* Row */}
      {inlineMode === 'rename' ? (
        <div className="flex items-center gap-1 py-1 px-2" style={{ paddingLeft }}>
          {isDirectory && (
            <span className="flex-shrink-0" aria-hidden="true">
              {expanded ? (
                <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              )}
            </span>
          )}
          {!isDirectory && <span className="w-4" aria-hidden="true" />}
          <span className="flex-shrink-0" aria-hidden="true">
            {(() => {
              const iconConfig = getFileIcon(node.name, isDirectory, expanded)
              const IconComponent = iconConfig.icon
              return <IconComponent className={`w-4 h-4 ${iconConfig.color} dark:${iconConfig.darkColor}`} />
            })()}
          </span>
          <InlineInput
            defaultValue={node.name}
            placeholder={isDirectory ? t('fileTree.newFolderPlaceholder') : t('fileTree.newFilePlaceholder')}
            error={inlineError}
            onConfirm={handleRenameConfirm}
            onCancel={handleInlineCancel}
          />
        </div>
      ) : (
        <div
          className={`
            flex items-center gap-1 py-1 px-2 cursor-pointer
            hover:bg-gray-100 dark:hover:bg-gray-800
            ${isActive ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
            transition-colors
          `}
          style={{ paddingLeft }}
          onClick={handleClick}
          onContextMenu={handleContextMenu}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              handleClick()
            }
          }}
          aria-label={`${isDirectory ? 'Folder' : 'File'}: ${node.name}${isDirectory ? (expanded ? ', collapsed' : ', expanded') : ''}`}
        >
          {isDirectory && (
            <span className="flex-shrink-0" aria-hidden="true">
              {expanded ? (
                <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              )}
            </span>
          )}
          
          {!isDirectory && <span className="w-4" aria-hidden="true" />}
          
          <span className="flex-shrink-0" aria-hidden="true">
            {(() => {
              const iconConfig = getFileIcon(node.name, isDirectory, expanded)
              const IconComponent = iconConfig.icon
              return (
                <IconComponent 
                  className={`w-4 h-4 ${iconConfig.color} dark:${iconConfig.darkColor}`} 
                />
              )
            })()}
          </span>
          
          <span className={`
            text-sm truncate
            ${isActive ? 'text-blue-600 dark:text-blue-400 font-medium' : isOpenInTab ? 'text-gray-900 dark:text-gray-100 font-medium' : 'text-gray-700 dark:text-gray-300'}
          `}>
            {node.name}
          </span>
          
          {isLoading && (
            <span className="text-xs text-gray-400 ml-auto" aria-label="Loading">
              ...
            </span>
          )}
        </div>
      )}

      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onAction={handleContextMenuAction}
          onClose={() => setContextMenu(null)}
        />
      )}

      {/* Children */}
      {isDirectory && expanded && (
        <div role="group">
          {/* Inline create row */}
          {(inlineMode === 'create-file' || inlineMode === 'create-folder') && (
            <div
              className="flex items-center gap-1 py-1 px-2"
              style={{ paddingLeft: (depth + 1) * 16 + 12 }}
            >
              <span className="w-4" aria-hidden="true" />
              <InlineInput
                placeholder={
                  inlineMode === 'create-file'
                    ? t('fileTree.newFilePlaceholder')
                    : t('fileTree.newFolderPlaceholder')
                }
                error={inlineError}
                onConfirm={
                  inlineMode === 'create-file'
                    ? handleCreateFileConfirm
                    : handleCreateFolderConfirm
                }
                onCancel={handleInlineCancel}
              />
            </div>
          )}
          {children.map((child) => (
            <FileTreeItem
              key={child.path}
              node={child}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}
