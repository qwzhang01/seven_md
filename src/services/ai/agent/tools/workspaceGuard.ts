/**
 * Workspace Guard — 工作区路径边界校验
 *
 * 用于工作区级 AgentTool（search/read/create/list）防止 path traversal。
 *
 * 注意：当前实现工作在 WebView 端的字符串层面，最终的写入安全
 * 由 Tauri 后端命令的权限白名单兜底。WebView 端的校验目的：
 * 1. 提供友好的错误信息
 * 2. 阻止明显的 traversal payload 进入 invoke 调用
 */

import { useWorkspaceStore } from '../../../../stores/useWorkspaceStore'

/**
 * 抛出的错误类型，便于上层识别并转换为 tool error
 */
export class WorkspaceBoundaryError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'WorkspaceBoundaryError'
  }
}

/**
 * 获取当前工作区根目录（实时读取，不缓存）
 * 未打开工作区时返回 null
 */
export function getCurrentWorkspaceRoot(): string | null {
  return useWorkspaceStore.getState().folderPath
}

/**
 * 规范化路径分隔符为 '/'（仅用于内部比对，不影响实际写入）
 */
function normalizeSeparators(p: string): string {
  return p.replace(/\\/g, '/')
}

/**
 * 折叠 . 和 ..，去除多余 /
 *
 * 注意：在 WebView 中没有 path 模块，自实现简化版：
 * - 输入按 '/' 拆分
 * - '.' 直接跳过
 * - '..' 弹出栈顶（如果栈顶不是根锚点 '' 或绝对路径锚点）
 */
function normalizePath(p: string): string {
  const normalized = normalizeSeparators(p)
  const isAbsolute = normalized.startsWith('/')
  const segments = normalized.split('/')
  const stack: string[] = []
  for (const seg of segments) {
    if (seg === '' || seg === '.') continue
    if (seg === '..') {
      // 不允许越过绝对路径根
      if (stack.length === 0 && isAbsolute) {
        throw new WorkspaceBoundaryError('路径越界：尝试越过根目录')
      }
      if (stack.length === 0 || stack[stack.length - 1] === '..') {
        stack.push('..')
      } else {
        stack.pop()
      }
      continue
    }
    stack.push(seg)
  }
  const joined = stack.join('/')
  return isAbsolute ? '/' + joined : joined
}

/**
 * 检查 path 是否绝对路径（POSIX 或 Windows 盘符）
 */
function isAbsolutePath(p: string): boolean {
  if (p.startsWith('/')) return true
  // Windows: C:/  C:\
  if (/^[a-zA-Z]:[\\/]/.test(p)) return true
  return false
}

/**
 * 校验给定路径是否落在当前工作区根目录之内
 *
 * @param inputPath 用户/Agent 提供的路径，可以是相对（相对于工作区根）或绝对路径
 * @returns 规范化后的绝对路径
 * @throws {WorkspaceBoundaryError} 当未打开工作区或路径越界时
 */
export function assertInsideWorkspace(inputPath: string): string {
  if (typeof inputPath !== 'string' || inputPath.length === 0) {
    throw new WorkspaceBoundaryError('路径越界：路径为空')
  }

  const root = getCurrentWorkspaceRoot()
  if (!root) {
    throw new WorkspaceBoundaryError('未打开工作区')
  }

  const normalizedRoot = normalizePath(normalizeSeparators(root))

  // 解析为绝对路径
  let absolute: string
  if (isAbsolutePath(inputPath)) {
    absolute = normalizePath(normalizeSeparators(inputPath))
  } else {
    // 相对路径：拼接根目录
    const joined = normalizedRoot + '/' + normalizeSeparators(inputPath)
    absolute = normalizePath(joined)
  }

  // 越界检查：必须以 root 为前缀，并且边界后是分隔符或字符串结束
  const rootWithSep = normalizedRoot.endsWith('/')
    ? normalizedRoot
    : normalizedRoot + '/'

  if (absolute !== normalizedRoot && !absolute.startsWith(rootWithSep)) {
    throw new WorkspaceBoundaryError(
      `路径越界：${inputPath} 不在工作区 ${normalizedRoot} 内`,
    )
  }

  return absolute
}

/**
 * 安全地把绝对路径转回用户友好的相对路径（仅用于错误/日志显示）
 */
export function toWorkspaceRelative(absolutePath: string): string {
  const root = getCurrentWorkspaceRoot()
  if (!root) return absolutePath
  const normalizedRoot = normalizePath(normalizeSeparators(root))
  const normalizedPath = normalizePath(normalizeSeparators(absolutePath))
  const prefix = normalizedRoot.endsWith('/') ? normalizedRoot : normalizedRoot + '/'
  if (normalizedPath === normalizedRoot) return ''
  if (normalizedPath.startsWith(prefix)) return normalizedPath.slice(prefix.length)
  return absolutePath
}
