import { useEffect } from 'react'

/**
 * 快捷键配置接口
 * 与测试文件 API 契约完全兼容
 */
export interface ShortcutConfig {
  /** 触发键（e.g., 's', 'Escape', 'p', '='） */
  key: string
  /** 需要 Ctrl 键（macOS 上自动映射为 ⌘ Command） */
  ctrlKey?: boolean
  /** 需要 Shift 键 */
  shiftKey?: boolean
  /** 需要 Alt 键（macOS 上为 ⌥ Option） */
  altKey?: boolean
  /** 需要 Meta 键（⌘ Command），直接指定时不做平台映射 */
  metaKey?: boolean
  /** 快捷键触发的回调 */
  action: () => void
  /** 快捷键描述（用于 UI 显示和调试） */
  description: string
  /** 是否调用 event.preventDefault()，默认 true */
  preventDefault?: boolean
  /** 是否为全局快捷键（保留字段，当前不影响行为） */
  global?: boolean
}

/**
 * 检测当前平台是否为 macOS
 */
export function isMacOS(): boolean {
  return typeof navigator !== 'undefined' && navigator.platform.startsWith('Mac')
}

/**
 * 获取当前平台的主修饰键符号
 * macOS: '⌘'  Windows/Linux: 'Ctrl'
 */
export function getModifierKey(): string {
  return isMacOS() ? '⌘' : 'Ctrl'
}

/**
 * 格式化快捷键为用户友好的显示字符串
 *
 * @param key - 按键名称
 * @param modifiers - 修饰键配置（ctrl, shift, alt）
 * @returns 格式化后的快捷键字符串
 *
 * @example
 * formatShortcut('s', { ctrl: true }) // macOS: '⌘S', Windows: 'Ctrl+S'
 * formatShortcut('S', { ctrl: true, shift: true }) // Windows: 'Ctrl+Shift+S'
 * formatShortcut('f', { alt: true }) // macOS: '⌥F', Windows: 'Alt+F'
 */
export function formatShortcut(
  key: string,
  modifiers?: { ctrl?: boolean; shift?: boolean; alt?: boolean }
): string {
  const mac = isMacOS()
  const parts: string[] = []

  if (modifiers?.ctrl) {
    parts.push(mac ? '⌘' : 'Ctrl')
  }
  if (modifiers?.alt) {
    parts.push(mac ? '⌥' : 'Alt')
  }
  if (modifiers?.shift) {
    parts.push(mac ? '⇧' : 'Shift')
  }

  // macOS 风格：符号紧连键名（⌘S）
  // Windows 风格：用 + 连接（Ctrl+S）
  const displayKey = key.length === 1 ? key.toUpperCase() : key

  if (mac) {
    return parts.join('') + displayKey
  } else {
    return [...parts, displayKey].join('+')
  }
}

/**
 * 统一的全局快捷键管理 Hook
 *
 * 在组件挂载时注册 keydown 事件监听器，卸载时自动清理。
 * 支持 macOS/Windows 双平台修饰键适配，精确修饰键匹配。
 *
 * @param shortcuts - 快捷键配置数组
 *
 * @example
 * useKeyboardShortcuts([
 *   { key: 's', ctrlKey: true, action: handleSave, description: '保存文件' },
 *   { key: 'Escape', action: handleClose, description: '关闭面板' },
 * ])
 */
export function useKeyboardShortcuts(shortcuts: ShortcutConfig[]): void {
  useEffect(() => {
    if (shortcuts.length === 0) return

    const mac = isMacOS()

    const handler = (event: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        if (matchesShortcut(event, shortcut, mac)) {
          // 默认调用 preventDefault，除非显式配置为 false
          if (shortcut.preventDefault !== false) {
            event.preventDefault()
          }
          shortcut.action()
          return
        }
      }
    }

    document.addEventListener('keydown', handler)
    return () => {
      document.removeEventListener('keydown', handler)
    }
  }, [shortcuts])
}

/**
 * 判断键盘事件是否匹配指定的快捷键配置
 *
 * 匹配规则：
 * 1. key 必须匹配（大小写不敏感比较）
 * 2. 所有修饰键状态必须精确匹配（未指定的修饰键默认为 false）
 * 3. macOS 上 ctrlKey 配置映射为 metaKey 检查
 * 4. 直接指定 metaKey 时不做平台映射
 */
function matchesShortcut(
  event: KeyboardEvent,
  shortcut: ShortcutConfig,
  mac: boolean
): boolean {
  // key 比较：大小写不敏感
  if (event.key.toLowerCase() !== shortcut.key.toLowerCase()) {
    return false
  }

  // 确定各修饰键的期望状态
  const expectShift = shortcut.shiftKey ?? false
  const expectAlt = shortcut.altKey ?? false

  // ctrlKey / metaKey 的平台适配逻辑
  let expectCtrl: boolean
  let expectMeta: boolean

  if (shortcut.metaKey !== undefined) {
    // 直接指定了 metaKey，不做平台映射
    expectMeta = shortcut.metaKey
    expectCtrl = shortcut.ctrlKey ?? false
  } else if (shortcut.ctrlKey) {
    // ctrlKey: true — macOS 上映射为 metaKey 检查
    if (mac) {
      expectMeta = true
      expectCtrl = false
    } else {
      expectMeta = false
      expectCtrl = true
    }
  } else {
    expectCtrl = false
    expectMeta = false
  }

  // 精确匹配：所有修饰键状态都必须完全一致
  if (event.ctrlKey !== expectCtrl) return false
  if (event.metaKey !== expectMeta) return false
  if (event.shiftKey !== expectShift) return false
  if (event.altKey !== expectAlt) return false

  return true
}
