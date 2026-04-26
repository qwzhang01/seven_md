import { useState, useEffect, useCallback } from 'react'
import { GitBranch, RefreshCw, AlertTriangle, Bell, ArrowUpDown } from 'lucide-react'
import { useEditorStore, useFileStore, useNotificationStore, useWorkspaceStore } from '../../stores'
import { getGitBranch } from '../../tauriCommands'

export function StatusBar() {
  const { cursorPosition, fileEncoding, lineEnding, scrollSyncEnabled, toggleScrollSync } = useEditorStore()
  const { getActiveTab } = useFileStore()
  const { unreadCount, markAllRead } = useNotificationStore()
  const { folderPath } = useWorkspaceStore()

  // Git 分支
  const [branch, setBranch] = useState<string>('—')

  useEffect(() => {
    let cancelled = false
    let intervalId: ReturnType<typeof setInterval> | null = null

    const fetchBranch = async () => {
      if (!folderPath) {
        setBranch('—')
        return
      }
      try {
        const result = await getGitBranch(folderPath)
        if (!cancelled) {
          setBranch(result || '—')
        }
      } catch {
        if (!cancelled) setBranch('—')
      }
    }

    fetchBranch()
    // 每 5 秒轮询
    intervalId = setInterval(fetchBranch, 5000)

    return () => {
      cancelled = true
      if (intervalId) clearInterval(intervalId)
    }
  }, [folderPath])

  // 行号跳转
  const handleJumpToLine = useCallback(() => {
    const input = prompt('跳转到行号:', String(cursorPosition.line))
    if (input === null) return
    const lineNum = parseInt(input, 10)
    if (isNaN(lineNum) || lineNum < 1) return
    window.dispatchEvent(new CustomEvent('editor:jump-to-line', { detail: lineNum }))
  }, [cursorPosition.line])

  // 编码点击
  const handleEncodingClick = useCallback(() => {
    const { addNotification } = useNotificationStore.getState()
    addNotification({ type: 'info', message: `当前编码: ${fileEncoding}`, autoClose: true, duration: 2000 })
  }, [fileEncoding])

  // 换行符点击
  const handleLineEndingClick = useCallback(() => {
    const { addNotification } = useNotificationStore.getState()
    addNotification({ type: 'info', message: `当前换行符: ${lineEnding}`, autoClose: true, duration: 2000 })
  }, [lineEnding])

  // 同步状态：从 fileStore 读取当前 tab 的 isDirty
  const activeTab = getActiveTab()
  const isDirty = activeTab?.isDirty ?? false

  return (
    <div
      className="flex items-center justify-between px-2.5 flex-shrink-0"
      style={{
        height: 'var(--statusbar-height, 24px)',
        background: 'var(--bg-statusbar, #007acc)',
        color: '#ffffff',
        fontSize: 11,
        zIndex: 70,
      }}
      role="status"
      aria-label="状态栏"
      data-component="statusbar"
    >
      {/* Left region */}
      <div className="flex items-center gap-3">
        <button
          className="flex items-center gap-1 hover:bg-white/10 px-1 rounded transition-colors cursor-pointer"
          title={`Git 分支: ${branch}`}
          style={{ color: '#fff', background: 'transparent', border: 'none' }}
        >
          <GitBranch size={12} />
          <span>{branch}</span>
        </button>

        <button
          className="flex items-center gap-1 hover:bg-white/10 px-1 rounded transition-colors cursor-pointer"
          title={isDirty ? '未保存' : '已保存'}
          style={{ color: '#fff', background: 'transparent', border: 'none' }}
        >
          <RefreshCw
            size={11}
            className={isDirty ? 'animate-spin' : ''}
          />
          {isDirty ? <span>未保存</span> : <span>已保存</span>}
        </button>

        <button
          className="flex items-center gap-1 hover:bg-white/10 px-1 rounded transition-colors cursor-pointer"
          title="错误与警告"
          style={{ color: '#fff', background: 'transparent', border: 'none' }}
        >
          <AlertTriangle size={11} />
          <span>0</span>
          <span className="ml-1">⚠</span>
          <span>0</span>
        </button>
      </div>

      {/* Right region */}
      <div className="flex items-center gap-3">
        <button
          className="hover:bg-white/10 px-1 rounded transition-colors"
          title="跳转到行"
          style={{ color: '#fff', background: 'transparent', border: 'none', cursor: 'pointer' }}
          onClick={handleJumpToLine}
        >
          行 {cursorPosition.line}, 列 {cursorPosition.column}
        </button>

        <button
          className="hover:bg-white/10 px-1 rounded transition-colors"
          title="文件编码"
          style={{ color: '#fff', background: 'transparent', border: 'none', cursor: 'pointer' }}
          onClick={handleEncodingClick}
        >
          {fileEncoding}
        </button>

        <button
          className="hover:bg-white/10 px-1 rounded transition-colors"
          title="行结束符"
          style={{ color: '#fff', background: 'transparent', border: 'none', cursor: 'pointer' }}
          onClick={handleLineEndingClick}
        >
          {lineEnding}
        </button>

        <button
          className="relative flex items-center gap-1 hover:bg-white/10 px-1 rounded transition-colors"
          title={scrollSyncEnabled ? '滚动同步: 开 (点击关闭)' : '滚动同步: 关 (点击开启)'}
          style={{
            color: scrollSyncEnabled ? '#fff' : 'rgba(255,255,255,0.5)',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
          }}
          onClick={toggleScrollSync}
        >
          <ArrowUpDown size={11} />
          <span style={{ opacity: scrollSyncEnabled ? 1 : 0.5 }}>
            {scrollSyncEnabled ? '同步: 开' : '同步: 关'}
          </span>
        </button>

        <button
          className="hover:bg-white/10 px-1 rounded transition-colors"
          title="语言模式"
          style={{ color: '#fff', background: 'transparent', border: 'none', cursor: 'pointer' }}
        >
          Markdown
        </button>

        <button
          className="relative flex items-center gap-1 hover:bg-white/10 px-1 rounded transition-colors"
          title="通知"
          style={{ color: '#fff', background: 'transparent', border: 'none', cursor: 'pointer' }}
          onClick={markAllRead}
        >
          <Bell size={11} />
          {unreadCount > 0 && <span>{unreadCount}</span>}
          {unreadCount > 0 && (
            <span
              className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full"
              aria-label={`${unreadCount} 条未读通知`}
            />
          )}
        </button>
      </div>
    </div>
  )
}
