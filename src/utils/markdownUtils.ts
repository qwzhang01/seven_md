/**
 * Markdown 解析辅助函数
 * 为 Agent Editor Tools 提供文档分析能力
 */

export interface HeadingInfo {
  level: number
  text: string
  line: number
}

/**
 * 提取文档的第一个 level-1 标题作为标题
 * 如果没有 `# ` 标题则返回 "Untitled"
 */
export function extractTitle(content: string): string {
  const match = content.match(/^#\s+(.+)$/m)
  return match ? match[1].trim() : 'Untitled'
}

/**
 * 提取文档中所有 ATX 风格标题
 * 跳过在 fenced code block 内的标题
 */
export function extractHeadings(content: string): HeadingInfo[] {
  const headings: HeadingInfo[] = []
  const lines = content.split('\n')
  let inCodeBlock = false

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // 检测 fenced code block 边界（``` 或 ~~~）
    if (/^(`{3,}|~{3,})/.test(line)) {
      inCodeBlock = !inCodeBlock
      continue
    }

    if (inCodeBlock) continue

    // 匹配 ATX 标题
    const match = line.match(/^(#{1,6})\s+(.+)$/)
    if (match) {
      headings.push({
        level: match[1].length,
        text: match[2].trim(),
        line: i + 1, // 1-based
      })
    }
  }

  return headings
}

/**
 * 将 line/column（均为 1-based）转换为 0-based 字符偏移量
 */
export function calculateCursorOffset(content: string, line: number, column: number): number {
  const lines = content.split('\n')
  let offset = 0

  for (let i = 0; i < line - 1 && i < lines.length; i++) {
    offset += lines[i].length + 1 // +1 for \n
  }

  offset += column - 1
  return offset
}

/**
 * 根据字符偏移范围提取文本
 */
export function getSelectionText(content: string, from: number, to: number): string {
  return content.slice(from, to)
}
