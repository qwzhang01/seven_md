/**
 * 类型安全的事件总线
 *
 * 所有跨组件自定义事件集中在此定义，消除裸字符串和 any 类型。
 * 使用方式：
 *   dispatch('editor:insert', '**')
 *   on('editor:insert', (text) => { ... })
 */

// ── 事件 payload 类型定义 ────────────────────────────────────────────────────

export interface EditorEvents {
  /** 在光标处插入文本 */
  'editor:insert': string
  /** 跳转到指定行 */
  'editor:jump-to-line': number
  /** 撤销 */
  'editor:undo': void
  /** 重做 */
  'editor:redo': void
  /** 剪切 */
  'editor:cut': void
  /** 复制 */
  'editor:copy': void
  /** 粘贴 */
  'editor:paste': void
  /** 原样粘贴 */
  'editor:paste-match-style': void
  /** 全选 */
  'editor:select-all': void
  /** 格式化文档 */
  'editor:format': void
  /** 清除格式 */
  'editor:clear-format': void
  /** 替换选中文本 */
  'editor:replace-selection': string
  /** 切换行号显示 */
  'editor:toggle-line-numbers': void
  /** 切换迷你地图显示 */
  'editor:toggle-minimap': void
  /** 切换自动换行 */
  'editor:toggle-word-wrap': void
  /** 查找查询 */
  'editor:find-query': { query: string; caseSensitive: boolean; wholeWord: boolean; useRegex: boolean }
  /** 查找结果 */
  'editor:find-results': { total: number; current: number }
  /** 查找下一个 */
  'editor:find-next': { query: string; caseSensitive: boolean; wholeWord: boolean; useRegex: boolean }
  /** 查找上一个 */
  'editor:find-prev': { query: string; caseSensitive: boolean; wholeWord: boolean; useRegex: boolean }
  /** 替换一个 */
  'editor:replace-one': string
  /** 全部替换 */
  'editor:replace-all': { query: string; replaceText: string; caseSensitive: boolean; wholeWord: boolean; useRegex: boolean }
  /** 查找下一个（无 payload） */
  'editor:find-next-simple': void
  /** 查找上一个（无 payload） */
  'editor:find-prev-simple': void
}
export interface AppEvents {
  /** 新建文件 */
  'app:new-file': void
  /** 打开文件 */
  'app:open-file': void
  /** 打开文件夹 */
  'app:open-folder': void
  /** 保存文件 */
  'app:save-file': void
  /** 另存为 */
  'app:save-as': void
  /** 导出 PDF */
  'app:export-pdf': void
  /** 导出 HTML */
  'app:export-html': void
  /** 打开最近文档 */
  'app:open-recent': { path: string; type: 'file' | 'folder' }
  /** 显示最近文件 */
  'app:show-recent-files': void
}

export interface PreviewEvents {
  /** 预览面板滚动到标题 */
  'preview:scroll-to-heading': string
}

export interface ExportEvents {
  /** 导出状态通知 */
  'export-status': { type: 'success' | 'error'; message: string }
}

export interface AppEventMap extends EditorEvents, AppEvents, PreviewEvents, ExportEvents {}

// ── dispatch / on / off ────────────────────────────────────────────────────────

export function dispatch<K extends keyof AppEventMap>(
  type: K,
  detail: AppEventMap[K],
): void {
  window.dispatchEvent(new CustomEvent<AppEventMap[K]>(type, { detail }))
}

export function on<K extends keyof AppEventMap>(
  type: K,
  handler: (detail: AppEventMap[K]) => void,
): () => void {
  const listener = (e: Event) => {
    handler((e as CustomEvent<AppEventMap[K]>).detail)
  }
  window.addEventListener(type, listener)
  return () => window.removeEventListener(type, listener)
}
