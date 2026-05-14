/**
 * Markdown 链接导航工具模块
 * 负责分类链接类型、解析相对路径、处理链接点击
 */

/**
 * 链接类型枚举
 */
export type LinkType = 'anchor' | 'external' | 'internal-md' | 'unknown'

/**
 * 分类链接类型
 * 优先级: anchor > external > internal-md > unknown
 */
export function classifyLink(href: string): LinkType {
  if (!href) return 'unknown'

  // 锚点链接: 以 # 开头
  if (href.startsWith('#')) return 'anchor'

  // 外部链接: http:// 或 https://
  if (/^https?:\/\//i.test(href)) return 'external'

  // 内部 Markdown 链接: 以 .md 或 .markdown 结尾（忽略大小写）
  // 先 decode 以处理 URL 编码的扩展名
  const decoded = safeDecodeURI(href)
  if (/\.(md|markdown)$/i.test(decoded)) return 'internal-md'

  return 'unknown'
}

/**
 * 安全的 URI 解码，解码失败时返回原始字符串
 */
function safeDecodeURI(uri: string): string {
  try {
    return decodeURIComponent(uri)
  } catch {
    return uri
  }
}

/**
 * 解析 Markdown 相对链接为绝对路径
 * @param href - 链接 href（如 ./other.md, ../notes/guide.md, changelog.md）
 * @param currentFilePath - 当前文件的绝对路径（如 /project/docs/readme.md）
 * @returns 解析后的绝对路径
 */
export function resolveMarkdownLink(href: string, currentFilePath: string | null): string | null {
  if (!href || !currentFilePath) return null

  // 解码 URL 编码
  const decoded = safeDecodeURI(href)

  // 获取当前文件所在目录
  const lastSlash = currentFilePath.lastIndexOf('/')
  const currentDir = lastSlash >= 0 ? currentFilePath.substring(0, lastSlash) : ''

  if (!currentDir) return null

  // 拼接目录和相对路径
  let fullPath: string
  if (decoded.startsWith('/')) {
    // 绝对路径，直接使用
    fullPath = decoded
  } else {
    fullPath = `${currentDir}/${decoded}`
  }

  // 标准化路径: 处理 . 和 ..
  return normalizePath(fullPath)
}

/**
 * 标准化路径，处理 . 和 .. 部分
 */
function normalizePath(path: string): string {
  const parts = path.split('/')
  const resolved: string[] = []

  for (const part of parts) {
    if (part === '' && resolved.length === 0) {
      // 保留起始的空字符串（代表根 /）
      resolved.push('')
    } else if (part === '.' || part === '') {
      // 忽略当前目录标记和多余的斜杠
      continue
    } else if (part === '..') {
      // 回到上一级目录（但不超过根）
      if (resolved.length > 1) {
        resolved.pop()
      }
    } else {
      resolved.push(part)
    }
  }

  return resolved.join('/')
}
