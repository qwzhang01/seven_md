import { GitBranch, RefreshCw, AlertTriangle, Bell } from 'lucide-react'
import { useEditorStore, useNotificationStore } from '../../stores'

interface StatusBarProps {
  branch?: string
  isSyncing?: boolean
  errorCount?: number
  warningCount?: number
  language?: string
}

export function StatusBar({
  branch = 'main',
  isSyncing = false,
  errorCount = 0,
  warningCount = 0,
  language = 'Markdown',
}: StatusBarProps) {
  const { cursorPosition, fileEncoding, lineEnding } = useEditorStore()
  const { unreadCount, markAllRead } = useNotificationStore()

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
          title={isSyncing ? '同步中...' : '已同步'}
          style={{ color: '#fff', background: 'transparent', border: 'none' }}
        >
          <RefreshCw
            size={11}
            className={isSyncing ? 'animate-spin' : ''}
          />
          {!isSyncing && <span>已同步</span>}
        </button>

        <button
          className="flex items-center gap-1 hover:bg-white/10 px-1 rounded transition-colors cursor-pointer"
          title="错误与警告"
          style={{ color: '#fff', background: 'transparent', border: 'none' }}
        >
          <AlertTriangle size={11} />
          <span>{errorCount}</span>
          <span className="ml-1">⚠</span>
          <span>{warningCount}</span>
        </button>
      </div>

      {/* Right region */}
      <div className="flex items-center gap-3">
        <button
          className="hover:bg-white/10 px-1 rounded transition-colors"
          title="跳转到行"
          style={{ color: '#fff', background: 'transparent', border: 'none', cursor: 'pointer' }}
        >
          行 {cursorPosition.line}, 列 {cursorPosition.column}
        </button>

        <button
          className="hover:bg-white/10 px-1 rounded transition-colors"
          title="文件编码"
          style={{ color: '#fff', background: 'transparent', border: 'none', cursor: 'pointer' }}
        >
          {fileEncoding}
        </button>

        <button
          className="hover:bg-white/10 px-1 rounded transition-colors"
          title="行结束符"
          style={{ color: '#fff', background: 'transparent', border: 'none', cursor: 'pointer' }}
        >
          {lineEnding}
        </button>

        <button
          className="hover:bg-white/10 px-1 rounded transition-colors"
          title="语言模式"
          style={{ color: '#fff', background: 'transparent', border: 'none', cursor: 'pointer' }}
        >
          {language}
        </button>

        <button
          className="flex items-center gap-1 hover:bg-white/10 px-1 rounded transition-colors"
          title="通知"
          style={{ color: '#fff', background: 'transparent', border: 'none', cursor: 'pointer' }}
          onClick={markAllRead}
        >
          <Bell size={11} />
          {unreadCount > 0 && <span>{unreadCount}</span>}
        </button>
      </div>
    </div>
  )
}
