/**
 * Markdown Tools — Markdown 专用 AgentTool
 *
 * 4 个工具：
 * - generate_toc（auto）— 生成目录
 * - format_markdown_table（auto）— 格式化 GFM 表格
 * - validate_markdown_links（auto）— 检查链接
 *
 * 所有工具内部限制处理长度 100KB 以避免极长文档的性能问题。
 * 注：generate_mermaid 已移除——LLM 可直接通过 insert_at_cursor 插入自己生成的 Mermaid 代码块。
 */

import type { AgentTool, AgentToolResult } from '@pi/agent'
import { Type, type Static } from '@sinclair/typebox'
import { useFileStore } from '../../../../stores/useFileStore'
import { useEditorStore } from '../../../../stores/useEditorStore'
import { extractHeadings, calculateCursorOffset } from '../../../../utils/markdownUtils'
import { readFile as tauriReadFile } from '../../../../tauriCommands'
import { createPatch } from '../patchProtocol'
import type { MarkdownPatch } from '../patchProtocol'

const MD_PROCESS_LIMIT = 100 * 1024 // 100KB

// ─── Helpers ────────────────────────────────────────────────────────

/**
 * 基于当前文档路径解析相对链接路径
 * 返回绝对路径，或 null 表示无法解析（如未保存的文档）
 */
function resolveLinkPath(linkUrl: string): string | null {
  const activeTab = useFileStore.getState().getActiveTab()
  if (!activeTab?.path) {
    // 文档未保存到磁盘，无法解析相对路径
    return null
  }
  // URL 编码的路径需要解码
  const decoded = decodeURIComponent(linkUrl)
  // 绝对路径直接使用
  if (decoded.startsWith('/')) return decoded
  // 相对路径：基于文档所在目录解析
  const docDir = activeTab.path.substring(0, activeTab.path.lastIndexOf('/'))
  const parts = decoded.split('/')
  const resolvedParts: string[] = docDir.split('/').filter(Boolean)
  for (const part of parts) {
    if (part === '..') resolvedParts.pop()
    else if (part === '.' || part === '') continue
    else resolvedParts.push(part)
  }
  return '/' + resolvedParts.join('/')
}

function errorResult(message: string): AgentToolResult<{ error: string }> {
  return {
    content: [{ type: 'text', text: JSON.stringify({ error: message }) }],
    details: { error: message },
  }
}

function patchResult(patch: MarkdownPatch): AgentToolResult<MarkdownPatch> {
  return {
    content: [{ type: 'text', text: JSON.stringify(patch, null, 2) }],
    details: patch,
  }
}

function textResult<T>(data: T): AgentToolResult<T> {
  return {
    content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
    details: data,
  }
}

function getActiveContent(): string {
  return useFileStore.getState().getActiveTab()?.content ?? ''
}

/**
 * 生成 GFM heading anchor（github 风格，简化版）
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[\s]+/g, '-')
    .replace(/[^\w\u4e00-\u9fa5\-]/g, '')
}

// ─── generate_toc ──────────────────────────────────────────────────

const GenerateTocSchema = Type.Object({
  maxDepth: Type.Optional(Type.Integer({ minimum: 1, maximum: 6, description: '最大标题层级，默认 3' })),
})
type GenerateTocParams = Static<typeof GenerateTocSchema>

export const generateTocTool: AgentTool<typeof GenerateTocSchema, MarkdownPatch> = {
  name: 'generate_toc',
  label: '生成目录',
  description: '基于当前文档标题生成 Markdown 目录（TOC），插入到光标处',
  parameters: GenerateTocSchema,
  async execute(_toolCallId, params: GenerateTocParams): Promise<AgentToolResult<MarkdownPatch>> {
    const content = getActiveContent()
    if (!content) {
      return errorResult('文档为空') as unknown as AgentToolResult<MarkdownPatch>
    }
    if (content.length > MD_PROCESS_LIMIT) {
      return errorResult('文档过大，请分段处理') as unknown as AgentToolResult<MarkdownPatch>
    }

    const maxDepth = params.maxDepth ?? 3
    const headings = extractHeadings(content).filter((h) => h.level <= maxDepth)
    if (headings.length === 0) {
      return errorResult('文档没有可用标题') as unknown as AgentToolResult<MarkdownPatch>
    }

    const minLevel = Math.min(...headings.map((h) => h.level))
    const lines = headings.map((h) => {
      const indent = '  '.repeat(h.level - minLevel)
      const anchor = slugify(h.text)
      return `${indent}- [${h.text}](#${anchor})`
    })
    const tocText = lines.join('\n') + '\n'

    // 在当前光标位置插入
    const { cursorPosition } = useEditorStore.getState()
    const position = calculateCursorOffset(content, cursorPosition.line, cursorPosition.column)
    const patch = createPatch({
      type: 'insert_at_cursor',
      position,
      text: tocText,
      description: `生成 ${headings.length} 项目录`,
    })
    return patchResult(patch)
  },
}

// ─── format_markdown_table ──────────────────────────────────────────

const FormatTableSchema = Type.Object({
  tableText: Type.String({ description: 'GFM 表格文本（包含表头分隔行）' }),
})
type FormatTableParams = Static<typeof FormatTableSchema>

/**
 * 计算字符显示宽度（CJK 字符算 2，其他 1）
 */
function displayWidth(s: string): number {
  let w = 0
  for (const ch of s) {
    const code = ch.codePointAt(0) ?? 0
    if (code >= 0x1100 && code <= 0x9fff) w += 2
    else if (code >= 0xff00 && code <= 0xffef) w += 2
    else w += 1
  }
  return w
}

function pad(s: string, width: number): string {
  const cur = displayWidth(s)
  if (cur >= width) return s
  return s + ' '.repeat(width - cur)
}

function parseTable(text: string): string[][] | null {
  const rawLines = text.trim().split('\n')
  if (rawLines.length < 2) return null
  const rows = rawLines.map((line) => {
    let l = line.trim()
    if (l.startsWith('|')) l = l.slice(1)
    if (l.endsWith('|')) l = l.slice(0, -1)
    return l.split('|').map((c) => c.trim())
  })
  // 第二行必须是分隔行
  if (!rows[1].every((c) => /^:?-+:?$/.test(c))) return null
  return rows
}

export const formatMarkdownTableTool: AgentTool<typeof FormatTableSchema, MarkdownPatch> = {
  name: 'format_markdown_table',
  label: '格式化 Markdown 表格',
  description: '将提供的 GFM 表格规范化（列宽对齐），返回 replace_selection patch',
  parameters: FormatTableSchema,
  async execute(_toolCallId, params: FormatTableParams): Promise<AgentToolResult<MarkdownPatch>> {
    if (params.tableText.length > MD_PROCESS_LIMIT) {
      return errorResult('表格过大，请分段处理') as unknown as AgentToolResult<MarkdownPatch>
    }
    const rows = parseTable(params.tableText)
    if (!rows) {
      return errorResult('不是有效的 Markdown 表格') as unknown as AgentToolResult<MarkdownPatch>
    }

    const colCount = Math.max(...rows.map((r) => r.length))
    // 补齐列
    rows.forEach((r) => {
      while (r.length < colCount) r.push('')
    })

    // 计算每列宽度（最少 3）
    const widths: number[] = []
    for (let c = 0; c < colCount; c++) {
      let w = 3
      for (let r = 0; r < rows.length; r++) {
        if (r === 1) continue // 分隔行
        w = Math.max(w, displayWidth(rows[r][c]))
      }
      widths.push(w)
    }

    // 重建表格
    const out: string[] = []
    rows.forEach((row, idx) => {
      const cells = row.map((cell, c) => {
        if (idx === 1) {
          // 分隔行：保留对齐方向
          const orig = parseTable(params.tableText)![1][c] ?? '---'
          const left = orig.startsWith(':')
          const right = orig.endsWith(':')
          const dashLen = Math.max(3, widths[c] - (left ? 1 : 0) - (right ? 1 : 0))
          return `${left ? ':' : ''}${'-'.repeat(dashLen)}${right ? ':' : ''}`
        }
        return pad(cell, widths[c])
      })
      out.push(`| ${cells.join(' | ')} |`)
    })
    const formatted = out.join('\n')

    // 取选区范围（如果存在）
    const editor = useEditorStore.getState()
    const selection = editor.selection ?? { from: 0, to: 0 }
    const patch = createPatch({
      type: 'replace_selection',
      from: selection.from,
      to: selection.to,
      newText: formatted,
      description: '格式化 Markdown 表格',
    })
    return patchResult(patch)
  },
}

// ─── validate_markdown_links ────────────────────────────────────────

const ValidateLinksSchema = Type.Object({})
type ValidateLinksParams = Static<typeof ValidateLinksSchema>

interface LinkCheckResult {
  url: string
  line: number
  status: 'ok' | 'broken' | 'unchecked'
}

const LINK_RE = /\[([^\]]+)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g

export const validateMarkdownLinksTool: AgentTool<typeof ValidateLinksSchema> = {
  name: 'validate_markdown_links',
  label: '检查 Markdown 链接',
  description: '检查当前文档所有链接的有效性（本地链接通过文件系统校验，外部链接标记为 unchecked）',
  parameters: ValidateLinksSchema,
  async execute(
    _toolCallId,
    _params: ValidateLinksParams,
  ): Promise<AgentToolResult<unknown>> {
    const content = getActiveContent()
    if (!content) return textResult({ links: [] })
    if (content.length > MD_PROCESS_LIMIT) {
      return errorResult('文档过大，请分段处理')
    }

    const lines = content.split('\n')
    const results: LinkCheckResult[] = []

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      let m: RegExpExecArray | null
      LINK_RE.lastIndex = 0
      while ((m = LINK_RE.exec(line)) !== null) {
        const url = m[2]
        if (/^https?:\/\//i.test(url) || /^mailto:/i.test(url)) {
          results.push({ url, line: i + 1, status: 'unchecked' })
        } else if (url.startsWith('#')) {
          // 锚点链接，跳过
          results.push({ url, line: i + 1, status: 'unchecked' })
        } else {
          // 本地相对/绝对链接 — 基于文档目录解析后读取
          let status: 'ok' | 'broken' | 'unchecked' = 'unchecked'
          const resolvedPath = resolveLinkPath(url)
          if (resolvedPath === null) {
            // 文档未保存到磁盘，无法验证
            status = 'unchecked'
          } else {
            try {
              await tauriReadFile(resolvedPath)
              status = 'ok'
            } catch {
              status = 'broken'
            }
          }
          results.push({ url, line: i + 1, status })
        }
      }
    }

    return textResult({ links: results, total: results.length })
  },
}
