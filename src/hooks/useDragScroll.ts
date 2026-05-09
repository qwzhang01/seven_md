import { useRef, useCallback, useEffect } from 'react'

/**
 * useDragScroll - 为容器元素添加鼠标按住拖拽水平滚动能力
 *
 * 功能：
 * - 按住鼠标左键左右拖动即可水平滚动容器
 * - 超过 5px 移动阈值判定为拖拽，抑制后续 click 事件
 * - 拖拽中显示 grabbing 光标
 */
export function useDragScroll<T extends HTMLElement = HTMLDivElement>() {
  const containerRef = useRef<T>(null)
  const isDragging = useRef(false)
  const hasMoved = useRef(false)
  const startX = useRef(0)
  const scrollLeft = useRef(0)

  const DRAG_THRESHOLD = 5

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const container = containerRef.current
    if (!container) return

    // 只响应鼠标左键
    if (e.button !== 0) return

    isDragging.current = true
    hasMoved.current = false
    startX.current = e.pageX - container.offsetLeft
    scrollLeft.current = container.scrollLeft

    container.style.cursor = 'grabbing'
    container.style.userSelect = 'none'
  }, [])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging.current) return

    const container = containerRef.current
    if (!container) return

    const x = e.pageX - container.offsetLeft
    const walk = x - startX.current

    // 超过阈值才视为拖拽
    if (Math.abs(walk) > DRAG_THRESHOLD) {
      hasMoved.current = true
    }

    if (hasMoved.current) {
      container.scrollLeft = scrollLeft.current - walk
    }
  }, [])

  const handleMouseUp = useCallback(() => {
    if (!isDragging.current) return

    isDragging.current = false

    const container = containerRef.current
    if (!container) return

    container.style.cursor = ''
    container.style.userSelect = ''
  }, [])

  // 抑制 click 事件：如果发生了拖拽（hasMoved），则捕获阶段阻止 click 传播
  const handleClick = useCallback((e: MouseEvent) => {
    if (hasMoved.current) {
      e.stopPropagation()
      e.preventDefault()
      hasMoved.current = false
    }
  }, [])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // 在 document 上监听 mousemove 和 mouseup，确保鼠标移出容器后仍能正常结束拖拽
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    // 在捕获阶段监听 click，用于在拖拽后抑制按钮点击
    container.addEventListener('click', handleClick, true)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      container.removeEventListener('click', handleClick, true)
    }
  }, [handleMouseMove, handleMouseUp, handleClick])

  return {
    containerRef,
    handleMouseDown,
  }
}
