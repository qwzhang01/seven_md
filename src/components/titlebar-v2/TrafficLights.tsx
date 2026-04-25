import { useCallback } from 'react'

/**
 * macOS 交通灯按钮组件
 * 在 Tauri 中，这些按钮由系统原生提供（decorations: true）
 * 这里提供视觉占位符和快捷键支持
 */
export function TrafficLights() {
  const isMac = navigator.platform.toLowerCase().includes('mac')

  const handleClose = useCallback(async () => {
    try {
      const { getCurrentWindow } = await import('@tauri-apps/api/window')
      await getCurrentWindow().close()
    } catch {
      window.close()
    }
  }, [])

  const handleMinimize = useCallback(async () => {
    try {
      const { getCurrentWindow } = await import('@tauri-apps/api/window')
      await getCurrentWindow().minimize()
    } catch {
      // fallback
    }
  }, [])

  const handleToggleMaximize = useCallback(async () => {
    try {
      const { getCurrentWindow } = await import('@tauri-apps/api/window')
      const win = getCurrentWindow()
      const isFullscreen = await win.isFullscreen()
      await win.setFullscreen(!isFullscreen)
    } catch {
      // fallback
    }
  }, [])

  if (!isMac) return null

  return (
    <div className="flex items-center gap-2 pl-3 pr-2" data-tauri-drag-region>
      <button
        className="w-3 h-3 rounded-full bg-[#FF5F57] hover:brightness-110 transition-all flex items-center justify-center group"
        onClick={handleClose}
        aria-label="关闭窗口"
        title="关闭窗口 (⌘W)"
      >
        <svg className="w-1.5 h-1.5 opacity-0 group-hover:opacity-100 text-black/50" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M1 1L9 9M9 1L1 9" />
        </svg>
      </button>
      <button
        className="w-3 h-3 rounded-full bg-[#FEBC2E] hover:brightness-110 transition-all flex items-center justify-center group"
        onClick={handleMinimize}
        aria-label="最小化"
        title="最小化 (⌘M)"
      >
        <svg className="w-1.5 h-1.5 opacity-0 group-hover:opacity-100 text-black/50" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M1 5H9" />
        </svg>
      </button>
      <button
        className="w-3 h-3 rounded-full bg-[#28C840] hover:brightness-110 transition-all flex items-center justify-center group"
        onClick={handleToggleMaximize}
        aria-label="全屏"
        title="全屏 (⌃⌘F)"
      >
        <svg className="w-1.5 h-1.5 opacity-0 group-hover:opacity-100 text-black/50" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M1 3V1H3M7 1H9V3M9 7V9H7M3 9H1V7" />
        </svg>
      </button>
    </div>
  )
}
