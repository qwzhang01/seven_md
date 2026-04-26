import { useState, useCallback, useEffect } from 'react'
import { useIsMobile } from './useMediaQuery'

/**
 * 移动端侧边栏 overlay hook
 * 桌面端使用标准 sidebar 状态，移动端使用 overlay 弹出模式
 */
export function useMobileSidebar() {
  const isMobile = useIsMobile()
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  // 移动端切换 sidebar 时同步状态
  useEffect(() => {
    if (isMobile && mobileSidebarOpen) {
      // 移动端打开 overlay 时不需要额外操作
    }
  }, [isMobile, mobileSidebarOpen])

  // 移动端切换 sidebar panel（会打开 overlay）
  const toggleMobileSidebar = useCallback((panelId?: 'explorer' | 'search' | 'outline' | 'snippets') => {
    setMobileSidebarOpen((prev) => !prev)
  }, [])

  // 关闭移动端 sidebar overlay
  const closeMobileSidebar = useCallback(() => {
    setMobileSidebarOpen(false)
  }, [])

  // 打开移动端 sidebar overlay
  const openMobileSidebar = useCallback(() => {
    setMobileSidebarOpen(true)
  }, [])

  return {
    isMobile,
    mobileSidebarOpen,
    toggleMobileSidebar,
    closeMobileSidebar,
    openMobileSidebar,
  }
}
