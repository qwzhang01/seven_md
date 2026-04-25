import { useState, useCallback } from 'react'
import { ChevronDown, ChevronRight, Folder, FolderOpen, FileText, FilePlus, FolderPlus, RefreshCw } from 'lucide-react'
import { useFileStore } from '../../stores'

interface TreeNode {
  name: string
  path: string
  type: 'file' | 'folder'
  children?: TreeNode[]
}

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

interface TreeItemProps {
  node: TreeNode
  depth: number
  activeFile: string | null
  onFileClick: (path: string) => void
}

function TreeItem({ node, depth, activeFile, onFileClick }: TreeItemProps) {
  const [expanded, setExpanded] = useState(depth < 2)

  if (node.type === 'folder') {
    return (
      <div>
        <div
          className="flex items-center cursor-pointer transition-colors hover:bg-[var(--bg-hover)]"
          style={{ paddingLeft: `${8 + depth * 12}px`, height: '24px', color: 'var(--text-secondary)' }}
          onClick={() => setExpanded(!expanded)}
        >
          <span className="flex-shrink-0 mr-1" style={{ color: 'var(--text-secondary)', fontSize: 12 }}>
            {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          </span>
          <span className="flex-shrink-0 mr-1" style={{ color: '#c09553', fontSize: 14 }}>
            {expanded ? <FolderOpen size={14} /> : <Folder size={14} />}
          </span>
          <span className="text-xs truncate">{node.name}</span>
        </div>
        {expanded && node.children?.map((child) => (
          <TreeItem
            key={child.path}
            node={child}
            depth={depth + 1}
            activeFile={activeFile}
            onFileClick={onFileClick}
          />
        ))}
      </div>
    )
  }

  const isActive = activeFile === node.path
  return (
    <div
      className="flex items-center cursor-pointer transition-colors"
      style={{
        paddingLeft: `${20 + depth * 12}px`,
        height: '24px',
        background: isActive ? 'var(--bg-active)' : 'transparent',
        color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
      }}
      onClick={() => onFileClick(node.path)}
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
  const [openSections, setOpenSections] = useState({ openFiles: true, workspace: true })

  const activeTab = tabs.find((t) => t.id === activeTabId)

  const handleFileClick = useCallback(
    (path: string) => {
      const existing = tabs.find((t) => t.path === path)
      if (existing) {
        switchTab(existing.id)
      } else {
        window.dispatchEvent(new CustomEvent('app:open-specific-file', { detail: path }))
      }
    },
    [tabs, switchTab]
  )

  const toggleSection = (section: 'openFiles' | 'workspace') => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }))
  }

  // 模拟工作区文件树（实际应从 useAppState 或 fileStore 获取）
  const workspaceTree: TreeNode | null = null  // 将在联调阶段填充

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
          onClick={() => toggleSection('workspace')}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          <span className="mr-1">
            {openSections.workspace ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          </span>
          <span className="flex-1">工作区</span>
          <div className="opacity-0 group-hover:opacity-100 flex gap-1">
            <button className="hover:bg-[var(--bg-active)] rounded p-0.5" title="新建文件" onClick={(e) => e.stopPropagation()}>
              <FilePlus size={12} />
            </button>
            <button className="hover:bg-[var(--bg-active)] rounded p-0.5" title="新建文件夹" onClick={(e) => e.stopPropagation()}>
              <FolderPlus size={12} />
            </button>
            <button className="hover:bg-[var(--bg-active)] rounded p-0.5" title="刷新" onClick={(e) => { e.stopPropagation(); window.dispatchEvent(new CustomEvent('app:refresh-tree')) }}>
              <RefreshCw size={12} />
            </button>
          </div>
        </div>

        {openSections.workspace && (
          <div className="overflow-y-auto flex-1">
            {workspaceTree ? (
              <TreeItem
                node={workspaceTree}
                depth={0}
                activeFile={activeTab?.path ?? null}
                onFileClick={handleFileClick}
              />
            ) : (
              <div className="px-6 py-4 text-xs text-center" style={{ color: 'var(--text-tertiary)' }}>
                <div className="mb-2 opacity-50">
                  <Folder size={32} className="mx-auto" />
                </div>
                <div>点击"打开文件夹"加载工作区</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
