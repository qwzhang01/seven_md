import { useState, useCallback, useRef, useEffect } from 'react'
import { ChevronDown, ChevronRight, Folder, FolderOpen, FileText, FilePlus, FolderPlus, RefreshCw, Loader2, MinusSquare } from 'lucide-react'
import { useFileStore, useWorkspaceStore } from '../../stores'
import { readFile, deletePath, renamePath, openInTerminal, revealInFinder } from '../../tauriCommands'
import type { FileTreeNode } from '../../types'
import {
  ExplorerContextMenu,
  getFileContextMenuItems,
  getFolderContextMenuItems,
  type ContextMenuItem,
} from './ExplorerContextMenu'
import { ConfirmDialog } from '../modal-v2'

// 根据文件扩展名返回颜色/图标
function getFileIcon(name: string) {
  const ext = name.split('.').pop()?.toLowerCase()
  const colorMap: Record<string, string> = {
    md: 'text-blue-400', markdown: 'text-blue-400',
    ts: 'text-yellow-400', tsx: 'text-blue-300', js: 'text-yellow-300',
    json: 'text-yellow-200', html: 'text-orange-400', css: 'text-blue-500',
    rs: 'text-orange-500', go: 'text-cyan-400',
    png: 'text-purple-400', jpg: 'text-purple-400', svg: 'text-green-400',
  }
  return colorMap[ext || ''] || 'text-[var(--text-secondary)]'
}

/** 内联输入组件，用于新建文件/文件夹 */
function InlineInput({ onSubmit, onCancel, placeholder }: {
  onSubmit: (value: string) => void
  onCancel: () => void
  placeholder: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const value = inputRef.current?.value.trim()
      if (value) onSubmit(value)
      else onCancel()
    } else if (e.key === 'Escape') {
      onCancel()
    }
  }

  return (
    <input
      ref={inputRef}
      type="text"
      className="w-full text-xs px-1 py-0.5 outline-none"
      style={{
        background: 'var(--bg-primary)',
        color: 'var(--text-primary)',
        border: '1px solid var(--accent)',
        borderRadius: 2,
      }}
      placeholder={placeholder}
      onKeyDown={handleKeyDown}
      onBlur={onCancel}
    />
  )
}

/** 重命名对话框组件 */
function RenameDialog({ node, onSubmit, onCancel }: {
  node: FileTreeNode
  onSubmit: (newName: string) => void
  onCancel: () => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [value, setValue] = useState(node.name)

  useEffect(() => {
    inputRef.current?.focus()
    inputRef.current?.select()
  }, [])

  // 计算扩展名（保留原扩展名）
  const ext = node.type !== 'directory' ? '.' + node.name.split('.').pop() : ''

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const newName = value.trim()
      if (newName && newName !== node.name) {
        onSubmit(newName + ext)
      } else {
        onCancel()
      }
    } else if (e.key === 'Escape') {
      onCancel()
    }
  }

  return (
    <div
      className="fixed z-[9999] flex items-center gap-2 px-2 py-1 rounded"
      style={{
        background: 'var(--bg-primary)',
        border: '1px solid var(--accent)',
        boxShadow: 'var(--shadow-menu)',
        minWidth: 150,
      }}
    >
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="flex-1 text-xs px-1 py-0.5 outline-none"
        style={{
          background: 'transparent',
          color: 'var(--text-primary)',
        }}
        onKeyDown={handleKeyDown}
        onBlur={() => {
          const newName = value.trim()
          if (newName && newName !== node.name) {
            onSubmit(newName + ext)
          } else {
            onCancel()
          }
        }}
      />
      {node.type !== 'directory' && (
        <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
          {ext}
        </span>
      )}
    </div>
  )
}

interface TreeNodeItemProps {
  node: FileTreeNode
  depth: number
  activeFile: string | null
  selectedFolderPath: string | null
  onFileClick: (path: string) => void
  onFolderSelect: (path: string) => void
  onContextMenu: (e: React.MouseEvent, node: FileTreeNode) => void
  onDrop: (sourcePath: string, targetFolderPath: string) => void
}

/**
 * 递归树节点组件
 * 目录的展开/折叠状态和子节点数据来自 useWorkspaceStore
 */
function TreeNodeItem({ node, depth, activeFile, selectedFolderPath, onFileClick, onFolderSelect, onContextMenu, onDrop }: TreeNodeItemProps) {
  const expandedDirs = useWorkspaceStore((s) => s.expandedDirs)
  const folderTree = useWorkspaceStore((s) => s.folderTree)
  const toggleDirectory = useWorkspaceStore((s) => s.toggleDirectory)

  // 拖拽悬停计数器（避免子元素 onDragLeave 误触发）
  const dragCounterRef = useRef(0)
  const [dragState, setDragState] = useState<'none' | 'over' | 'invalid'>('none')
  const [isDragging, setIsDragging] = useState(false)

  // 后端返回 type: "directory"，统一处理
  const isDir = node.type === 'directory'

  if (isDir) {
    const expanded = expandedDirs.has(node.path)
    const children = folderTree.get(node.path) || []
    const isSelected = selectedFolderPath === node.path

    const handleDragStart = (e: React.DragEvent) => {
      e.stopPropagation()
      e.dataTransfer.setData('text/plain', node.path)
      e.dataTransfer.effectAllowed = 'move'
      setIsDragging(true)
    }

    const handleDragEnd = () => {
      setIsDragging(false)
    }

    const isValidDropTarget = (sourcePath: string) => {
      // 不能拖入自身或子孙
      return sourcePath !== node.path && !node.path.startsWith(sourcePath + '/')
    }

    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      const sourcePath = e.dataTransfer.getData('text/plain')
      if (sourcePath && !isValidDropTarget(sourcePath)) {
        e.dataTransfer.dropEffect = 'none'
        setDragState('invalid')
      } else {
        e.dataTransfer.dropEffect = 'move'
        setDragState('over')
      }
    }

    const handleDragEnter = (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      dragCounterRef.current += 1
      setDragState('over')
    }

    const handleDragLeave = (e: React.DragEvent) => {
      e.stopPropagation()
      dragCounterRef.current -= 1
      if (dragCounterRef.current === 0) {
        setDragState('none')
      }
    }

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      dragCounterRef.current = 0
      setDragState('none')
      const sourcePath = e.dataTransfer.getData('text/plain')
      if (sourcePath && isValidDropTarget(sourcePath)) {
        onDrop(sourcePath, node.path)
      }
    }

    const getDragStyle = (): React.CSSProperties => {
      if (dragState === 'over') return { outline: '1px solid var(--accent)', background: 'var(--bg-hover)' }
      if (dragState === 'invalid') return { outline: '1px solid #ef4444' }
      if (isSelected) return { background: 'var(--bg-active)' }
      return {}
    }

    return (
      <div data-tree-node>
        <div
          className="flex items-center cursor-pointer transition-colors hover:bg-[var(--bg-hover)]"
          style={{
            paddingLeft: `${8 + depth * 12}px`,
            height: '24px',
            color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
            opacity: isDragging ? 0.4 : 1,
            ...getDragStyle(),
          }}
          draggable
          onClick={(e) => {
            e.stopPropagation()
            onFolderSelect(node.path)
            toggleDirectory(node.path)
          }}
          onContextMenu={(e) => onContextMenu(e, node)}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <span className="flex-shrink-0 mr-1" style={{ color: 'var(--text-secondary)', fontSize: 12 }}>
            {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          </span>
          <span className="flex-shrink-0 mr-1" style={{ color: '#c09553', fontSize: 14 }}>
            {expanded ? <FolderOpen size={14} /> : <Folder size={14} />}
          </span>
          <span className="text-xs truncate">{node.name}</span>
        </div>
        {expanded && children.map((child) => (
          <TreeNodeItem
            key={child.path}
            node={child}
            depth={depth + 1}
            activeFile={activeFile}
            selectedFolderPath={selectedFolderPath}
            onFileClick={onFileClick}
            onFolderSelect={onFolderSelect}
            onContextMenu={onContextMenu}
            onDrop={onDrop}
          />
        ))}
      </div>
    )
  }

  // 文件节点
  const isActive = activeFile === node.path

  const handleFileDragStart = (e: React.DragEvent) => {
    e.stopPropagation()
    e.dataTransfer.setData('text/plain', node.path)
    e.dataTransfer.effectAllowed = 'move'
    setIsDragging(true)
  }

  const handleFileDragEnd = () => {
    setIsDragging(false)
  }

  return (
    <div
      className="flex items-center cursor-pointer transition-colors"
      style={{
        paddingLeft: `${20 + depth * 12}px`,
        height: '24px',
        background: isActive ? 'var(--bg-active)' : 'transparent',
        color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
        opacity: isDragging ? 0.4 : 1,
      }}
      draggable
      onClick={() => {
        onFolderSelect('')  // 点击文件时清除文件夹选中
        onFileClick(node.path)
      }}
      onContextMenu={(e) => onContextMenu(e, node)}
      onDragStart={handleFileDragStart}
      onDragEnd={handleFileDragEnd}
      onMouseEnter={(e) => {
        if (!isActive) e.currentTarget.style.background = 'var(--bg-hover)'
      }}
      onMouseLeave={(e) => {
        if (!isActive) e.currentTarget.style.background = 'transparent'
      }}
    >
      <span className={`flex-shrink-0 mr-1.5 ${getFileIcon(node.name)}`} style={{ fontSize: 14 }}>
        <FileText size={14} />
      </span>
      <span className="text-xs truncate">{node.name}</span>
    </div>
  )
}

export function ExplorerPanel() {
  const { tabs, activeTabId, switchTab, openTab } = useFileStore()
  const {
    folderPath,
    rootNodes,
    isLoading,
    openFolder,
    refreshTree,
    loadDirectory,
    createFile: wsCreateFile,
    createDirectory: wsCreateDirectory,
    moveItem,
    toggleDirectory,
    expandedDirs,
  } = useWorkspaceStore()

  const [openSections, setOpenSections] = useState({ openFiles: true, workspace: true })

  // 内联新建状态: 'file' | 'folder' | null
  const [inlineCreate, setInlineCreate] = useState<'file' | 'folder' | null>(null)

  // 当前选中的文件夹路径（用于感知新建目标）
  const [selectedFolderPath, setSelectedFolderPath] = useState<string | null>(null)

  // 右键菜单状态
  const [contextMenu, setContextMenu] = useState<{
    items: ContextMenuItem[]
    position: { x: number; y: number }
  } | null>(null)

  // 重命名状态
  const [renameState, setRenameState] = useState<{
    node: FileTreeNode
    position: { x: number; y: number }
  } | null>(null)

  // 删除确认对话框状态
  const [deleteConfirm, setDeleteConfirm] = useState<{
    node: FileTreeNode
  } | null>(null)

  const activeTab = tabs.find((t) => t.id === activeTabId)

  const handleFileClick = useCallback(
    async (path: string) => {
      const existing = tabs.find((t) => t.path === path)
      if (existing) {
        switchTab(existing.id)
      } else {
        // 通过 Tauri 读取文件内容并在新 tab 中打开
        try {
          const content = await readFile(path)
          openTab(path, content)
        } catch (error) {
          console.error('打开文件失败:', error)
        }
      }
    },
    [tabs, switchTab, openTab]
  )

  // 处理文件夹选中
  const handleFolderSelect = useCallback((path: string) => {
    setSelectedFolderPath(path || null)
  }, [])

  // 处理拖拽移动
  const handleDrop = useCallback(async (sourcePath: string, targetFolderPath: string) => {
    await moveItem(sourcePath, targetFolderPath)
  }, [moveItem])

  // 获取父目录路径
  const getParentPath = (node: FileTreeNode): string => {
    const lastSlash = node.path.lastIndexOf('/')
    return lastSlash > 0 ? node.path.substring(0, lastSlash) : folderPath || ''
  }

  // 处理右键菜单
  const handleContextMenu = useCallback(
    (e: React.MouseEvent, node: FileTreeNode) => {
      e.preventDefault()
      e.stopPropagation()

      const isDir = node.type === 'directory'
      const parentPath = getParentPath(node)

      if (isDir) {
        const items = getFolderContextMenuItems({
          folderPath: node.path,
          folderName: node.name,
          onNewFile: () => {
            setInlineCreate('file')
          },
          onNewFolder: () => {
            setInlineCreate('folder')
          },
          onRename: () => {
            setRenameState({ node, position: { x: e.clientX, y: e.clientY } })
          },
          onDelete: () => {
            setDeleteConfirm({ node })
          },
          onCopyPath: async () => {
            try {
              await navigator.clipboard.writeText(node.path)
            } catch (error) {
              console.error('复制路径失败:', error)
            }
          },
          onOpenTerminal: async () => {
            try {
              await openInTerminal(node.path)
            } catch (error) {
              console.error('在终端中打开失败:', error)
            }
          },
          onRevealInFinder: async () => {
            try {
              await revealInFinder(node.path)
            } catch (error) {
              console.error('在 Finder 中显示失败:', error)
            }
          },
        })
        setContextMenu({ items, position: { x: e.clientX, y: e.clientY } })
      } else {
        const items = getFileContextMenuItems({
          parentPath,
          fileName: node.name,
          filePath: node.path,
          onNewFile: () => {
            setInlineCreate('file')
          },
          onNewFolder: () => {
            setInlineCreate('folder')
          },
          onRename: () => {
            setRenameState({ node, position: { x: e.clientX, y: e.clientY } })
          },
          onDelete: () => {
            setDeleteConfirm({ node })
          },
          onCopyPath: async () => {
            try {
              await navigator.clipboard.writeText(node.path)
            } catch (error) {
              console.error('复制路径失败:', error)
            }
          },
          onOpenTerminal: async () => {
            try {
              await openInTerminal(node.path)
            } catch (error) {
              console.error('在终端中打开失败:', error)
            }
          },
          onRevealInFinder: async () => {
            try {
              await revealInFinder(node.path)
            } catch (error) {
              console.error('在 Finder 中显示失败:', error)
            }
          },
        })
        setContextMenu({ items, position: { x: e.clientX, y: e.clientY } })
      }
    },
    [folderPath]
  )

  // 处理重命名
  const handleRename = useCallback(async (newName: string) => {
    if (!renameState) return

    const { node } = renameState
    if (newName === node.name || !newName.trim()) {
      setRenameState(null)
      return
    }

    try {
      const parentPath = getParentPath(node)
      const separator = parentPath.endsWith('/') ? '' : '/'
      const newPath = `${parentPath}${separator}${newName}`
      await renamePath(node.path, newPath)

      // 如果是文件且在打开的标签中，需要更新标签
      if (node.type !== 'directory') {
        const existingTab = tabs.find((t) => t.path === node.path)
        if (existingTab) {
          // 暂时移除旧标签，用户需要手动重新打开
        }
      }

      // 刷新目录
      await loadDirectory(parentPath)
    } catch (error) {
      console.error('重命名失败:', error)
    }

    setRenameState(null)
  }, [renameState, tabs, loadDirectory])

  // 处理删除
  const handleDelete = useCallback(async () => {
    if (!deleteConfirm) return

    const { node } = deleteConfirm
    const parentPath = getParentPath(node)

    try {
      await deletePath(node.path)

      // 如果是文件且在打开的标签中，需要关闭标签
      if (node.type !== 'directory') {
        const existingTab = tabs.find((t) => t.path === node.path)
        if (existingTab) {
          // 可以添加关闭标签的逻辑
        }
      }

      // 刷新目录
      await loadDirectory(parentPath)
    } catch (error) {
      console.error('删除失败:', error)
    }

    setDeleteConfirm(null)
  }, [deleteConfirm, tabs, loadDirectory])

  const toggleSection = (section: 'openFiles' | 'workspace') => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }))
  }

  // 新建文件提交
  const handleCreateFile = useCallback(async (name: string) => {
    // 优先使用选中文件夹，否则使用根目录
    const parentDir = selectedFolderPath || folderPath
    if (!parentDir) return
    try {
      // 确保以 .md 结尾
      const fileName = name.endsWith('.md') || name.endsWith('.markdown') ? name : `${name}.md`
      await wsCreateFile(parentDir, fileName)
      // 确保目标文件夹展开
      if (selectedFolderPath && !expandedDirs.has(selectedFolderPath)) {
        await toggleDirectory(selectedFolderPath)
      }
    } catch (error) {
      console.error('新建文件失败:', error)
    }
    setInlineCreate(null)
    // 保持 selectedFolderPath 不变
  }, [selectedFolderPath, folderPath, wsCreateFile, expandedDirs, toggleDirectory])

  // 新建文件夹提交
  const handleCreateDirectory = useCallback(async (name: string) => {
    // 优先使用选中文件夹，否则使用根目录
    const parentDir = selectedFolderPath || folderPath
    if (!parentDir) return
    try {
      await wsCreateDirectory(parentDir, name)
      // 确保目标文件夹展开
      if (selectedFolderPath && !expandedDirs.has(selectedFolderPath)) {
        await toggleDirectory(selectedFolderPath)
      }
    } catch (error) {
      console.error('新建文件夹失败:', error)
    }
    setInlineCreate(null)
    // 保持 selectedFolderPath 不变
  }, [selectedFolderPath, folderPath, wsCreateDirectory, expandedDirs, toggleDirectory])

  const hasWorkspace = !!folderPath
  const folderName = folderPath?.split('/').pop() || '工作区'

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ background: 'var(--bg-secondary)' }}>
      {/* Open Files Section */}
      <div>
        <div
          className="flex items-center px-3 cursor-pointer group"
          style={{
            height: '28px',
            color: 'var(--text-secondary)',
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.5px',
          }}
          onClick={() => toggleSection('openFiles')}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          <span className="mr-1">
            {openSections.openFiles ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          </span>
          <span className="flex-1">打开的文件</span>
          <div className="opacity-0 group-hover:opacity-100 flex gap-1">
            <button
              className="hover:bg-[var(--bg-active)] rounded p-0.5"
              onClick={(e) => {
                e.stopPropagation()
                openTab(null, '')
              }}
              title="新建文件"
            >
              <FilePlus size={12} />
            </button>
          </div>
        </div>

        {openSections.openFiles && (
          <div>
            {tabs.map((tab) => {
              const isActive = tab.id === activeTabId
              return (
                <div
                  key={tab.id}
                  className="flex items-center px-6 cursor-pointer"
                  style={{
                    height: '24px',
                    background: isActive ? 'var(--bg-active)' : 'transparent',
                    color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                  }}
                  onClick={() => switchTab(tab.id)}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.background = 'var(--bg-hover)'
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.background = 'transparent'
                  }}
                >
                  <FileText size={12} className="mr-2 flex-shrink-0 text-blue-400" />
                  <span className="text-xs flex-1 truncate">{tab.name}</span>
                  {tab.isDirty && (
                    <span
                      className="w-2 h-2 rounded-full ml-1 flex-shrink-0"
                      style={{ background: 'var(--accent)' }}
                    />
                  )}
                </div>
              )
            })}
            {tabs.length === 0 && (
              <div className="px-6 py-2 text-xs" style={{ color: 'var(--text-tertiary)' }}>
                没有打开的文件
              </div>
            )}
          </div>
        )}
      </div>

      {/* Workspace Section */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div
          className="flex items-center px-3 cursor-pointer group flex-shrink-0"
          style={{
            height: '28px',
            color: 'var(--text-secondary)',
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.5px',
          }}
          onClick={() => toggleSection('workspace')}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          <span className="mr-1">
            {openSections.workspace ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          </span>
          <span className="flex-1 truncate">{hasWorkspace ? folderName : '工作区'}</span>
          {isLoading && <Loader2 size={12} className="animate-spin mr-1" />}
          {hasWorkspace && (
            <div className="opacity-0 group-hover:opacity-100 flex gap-1">
              <button
                className="hover:bg-[var(--bg-active)] rounded p-0.5"
                title="新建文件"
                onClick={(e) => { e.stopPropagation(); setInlineCreate('file') }}
              >
                <FilePlus size={12} />
              </button>
              <button
                className="hover:bg-[var(--bg-active)] rounded p-0.5"
                title="新建文件夹"
                onClick={(e) => { e.stopPropagation(); setInlineCreate('folder') }}
              >
                <FolderPlus size={12} />
              </button>
              <button
                className="hover:bg-[var(--bg-active)] rounded p-0.5"
                title="折叠全部"
                onClick={(e) => { e.stopPropagation(); useWorkspaceStore.getState().collapseAll() }}
              >
                <MinusSquare size={12} />
              </button>
              <button
                className="hover:bg-[var(--bg-active)] rounded p-0.5"
                title="刷新"
                onClick={(e) => { e.stopPropagation(); refreshTree() }}
              >
                <RefreshCw size={12} />
              </button>
            </div>
          )}
        </div>

        {openSections.workspace && (
          <div className="overflow-y-auto flex-1">
            {/* 内联新建输入框 */}
            {inlineCreate && hasWorkspace && (
              <div style={{ paddingLeft: '20px', paddingRight: '8px', height: '26px' }} className="flex items-center">
                <span className="flex-shrink-0 mr-1" style={{ fontSize: 14 }}>
                  {inlineCreate === 'folder'
                    ? <Folder size={14} style={{ color: '#c09553' }} />
                    : <FileText size={14} className="text-blue-400" />
                  }
                </span>
                <InlineInput
                  placeholder={inlineCreate === 'folder' ? '文件夹名称' : '文件名称.md'}
                  onSubmit={inlineCreate === 'folder' ? handleCreateDirectory : handleCreateFile}
                  onCancel={() => setInlineCreate(null)}
                />
              </div>
            )}

            {hasWorkspace ? (
              rootNodes.length > 0 ? (
                <div
                  className="min-h-full"
                  onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move' }}
                  onDrop={(e) => {
                    // 只处理直接投入根区域的拖拽（非文件夹节点上）
                    if ((e.target as HTMLElement).closest('[data-tree-node]')) return
                    e.preventDefault()
                    const sourcePath = e.dataTransfer.getData('text/plain')
                    if (sourcePath && folderPath) {
                      handleDrop(sourcePath, folderPath)
                    }
                  }}
                >
                  {rootNodes.map((node) => (
                    <TreeNodeItem
                      key={node.path}
                      node={node}
                      depth={0}
                      activeFile={activeTab?.path ?? null}
                      selectedFolderPath={selectedFolderPath}
                      onFileClick={handleFileClick}
                      onFolderSelect={handleFolderSelect}
                      onContextMenu={handleContextMenu}
                      onDrop={handleDrop}
                    />
                  ))}
                </div>
              ) : (
                <div className="px-6 py-4 text-xs text-center" style={{ color: 'var(--text-tertiary)' }}>
                  {isLoading ? '加载中...' : '文件夹为空'}
                </div>
              )
            ) : (
              <div
                className="px-6 py-4 text-xs text-center cursor-pointer hover:opacity-80"
                style={{ color: 'var(--text-tertiary)' }}
                onClick={openFolder}
              >
                <div className="mb-2 opacity-50">
                  <Folder size={32} className="mx-auto" />
                </div>
                <div>点击打开文件夹</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 右键菜单 */}
      {contextMenu && (
        <ExplorerContextMenu
          items={contextMenu.items}
          position={contextMenu.position}
          onClose={() => setContextMenu(null)}
        />
      )}

      {/* 重命名输入框 */}
      {renameState && (
        <RenameDialog
          node={renameState.node}
          onSubmit={handleRename}
          onCancel={() => setRenameState(null)}
        />
      )}

      {/* 删除确认对话框 */}
      {deleteConfirm && (
        <ConfirmDialog
          open={true}
          title="确认删除"
          message={`确定要删除 "${deleteConfirm.node.name}" 吗？${deleteConfirm.node.type === 'directory' ? '文件夹及其所有内容将被永久删除。' : '此操作不可撤销。'}`}
          confirmLabel="删除"
          cancelLabel="取消"
          danger={true}
          onConfirm={handleDelete}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}
    </div>
  )
}
