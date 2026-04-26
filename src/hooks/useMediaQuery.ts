import { useState, useEffect } from 'react'

/**
 * 响应式断点 hook
 * @param query CSS 媒体查询字符串，如 "(max-width: 768px)"
 * @returns 媒体查询匹配状态
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches
    }
    return false
  })

  useEffect(() => {
    const mediaQuery = window.matchMedia(query)

    // 设置初始值
    setMatches(mediaQuery.matches)

    // 监听变化
    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }

    // 现代浏览器
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handler)
      return () => mediaQuery.removeEventListener('change', handler)
    } else {
      // 旧版浏览器兼容
      mediaQuery.addEventListener(handler)
      return () => mediaQuery.removeListener(handler)
    }
  }, [query])

  return matches
}

/**
 * 便捷 hook：检测是否为移动端 (<768px)
 */
export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 767px)')
}

/**
 * 便捷 hook：检测是否为桌面端 (>=768px)
 */
export function useIsDesktop(): boolean {
  return useMediaQuery('(min-width: 768px)')
}
