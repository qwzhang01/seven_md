/**
 * File Tools — 工作区级 AgentTool 集合
 *
 * 4 个工具：
 * - search_workspace（auto）
 * - read_workspace_file（confirm）
 * - create_markdown_file（confirm）
 * - list_workspace_files（auto）
 *
 * 所有路径参数必经 `assertInsideWorkspace` 校验。
 * 工作区未打开时所有工具返回友好错误。
 */

import type { AgentTool, AgentToolResult } from '@pi/agent'
import { Type, type Static } from 'typebox'
import {
  readFile as tauriReadFile,
  searchInFiles,
  createFile as tauriCreateFile,
  readDirectory,
} from '../../../../tauriCommands'
import type { FileTreeNode } from '../../../../types'
import { useWorkspaceStore } from '../../../../stores/useWorkspaceStore'
import {
  assertInsideWorkspace,
  toWorkspaceRelative,
  WorkspaceBoundaryError,
} from './workspaceGuard'

// ─── Helpers ────────────────────────────────────────────────────────

function textResult<T>(data: T): AgentToolResult<T> {
  return {
    content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
    details: data,
  }
}

function errorResult(message: string): AgentToolResult<{ error: string }> {
  return {
    content: [{ type: 'text', text: JSON.stringify({ error: message }) }],
    details: { error: message },
  }
}

/**
 * 检查是否打开工作区，未打开返回错误结果（不抛错）
 */
function checkWorkspaceOpen(): { error: string } | null {
  const root = useWorkspaceStore.getState().folderPath
  if (!root) {
    return { error: '未打开工作区，无法使用工作区工具' }
  }
  return null
}

function isMarkdownPath(p: string): boolean {
  return /\.(md|markdown)$/i.test(p)
}

// ─── search_workspace ──────────────────────────────────────────────

const SearchWorkspaceSchema = Type.Object({
  query: Type.String({ description: '搜索关键词' }),
  type: Type.Optional(
    Type.Union(
      [Type.Literal('content'), Type.Literal('filename')],
      { description: 'content：全文搜索；filename：文件名搜索（默认 content）' },
    ),
  ),
})
type SearchWorkspaceParams = Static<typeof SearchWorkspaceSchema>

interface SearchHit {
  path: string
  line?: number
  snippet?: string
}

export const searchWorkspaceTool: AgentTool<typeof SearchWorkspaceSchema> = {
  name: 'search_workspace',
  label: '搜索工作区',
  description: '在工作区中搜索 Markdown 文件（按内容或文件名），最多返回 50 条结果',
  parameters: SearchWorkspaceSchema,
  async execute(_toolCallId, params: SearchWorkspaceParams): Promise<AgentToolResult<unknown>> {
    const wsErr = checkWorkspaceOpen()
    if (wsErr) return errorResult(wsErr.error)

    const root = useWorkspaceStore.getState().folderPath as string
    const type = params.type ?? 'content'
    const tauriType: 'fulltext' | 'filename' = type === 'content' ? 'fulltext' : 'filename'

    try {
      const response = await searchInFiles(root, params.query, tauriType)
      const hits: SearchHit[] = []
      if (tauriType === 'fulltext') {
        for (const r of response.textResults.slice(0, 50)) {
          hits.push({ path: r.path, line: r.lineNumber, snippet: r.snippet })
        }
      } else {
        for (const r of response.fileResults.slice(0, 50)) {
          hits.push({ path: r.path })
        }
      }
      return textResult({
        type,
        query: params.query,
        results: hits,
        truncated: response.truncated || (hits.length === 50),
      })
    } catch (err) {
      return errorResult(err instanceof Error ? err.message : '搜索失败')
    }
  },
}

// ─── read_workspace_file ────────────────────────────────────────────

const ReadWorkspaceFileSchema = Type.Object({
  path: Type.String({ description: '相对工作区或绝对路径，必须在工作区内' }),
})
type ReadWorkspaceFileParams = Static<typeof ReadWorkspaceFileSchema>

const READ_SIZE_LIMIT = 200 * 1024 // 200KB

export const readWorkspaceFileTool: AgentTool<typeof ReadWorkspaceFileSchema> = {
  name: 'read_workspace_file',
  label: '读取工作区文件',
  description: '读取工作区中指定路径的 Markdown 文件内容（最大 200KB，需确认）',
  parameters: ReadWorkspaceFileSchema,
  async execute(_toolCallId, params: ReadWorkspaceFileParams): Promise<AgentToolResult<unknown>> {
    const wsErr = checkWorkspaceOpen()
    if (wsErr) return errorResult(wsErr.error)

    let absPath: string
    try {
      absPath = assertInsideWorkspace(params.path)
    } catch (err) {
      if (err instanceof WorkspaceBoundaryError) return errorResult(err.message)
      throw err
    }

    if (!isMarkdownPath(absPath)) {
      return errorResult('仅支持读取 Markdown 文件')
    }

    try {
      const content = await tauriReadFile(absPath)
      const sizeBytes = new TextEncoder().encode(content).length
      if (sizeBytes > READ_SIZE_LIMIT) {
        return errorResult(
          `文件过大（${(sizeBytes / 1024).toFixed(1)}KB > 200KB），请使用 search_workspace 进行片段搜索`,
        )
      }
      return textResult({
        path: absPath,
        relativePath: toWorkspaceRelative(absPath),
        content,
        sizeBytes,
      })
    } catch (err) {
      return errorResult(err instanceof Error ? err.message : '读取失败')
    }
  },
}

// ─── create_markdown_file ───────────────────────────────────────────

const CreateMarkdownFileSchema = Type.Object({
  path: Type.String({ description: '新文件路径（相对工作区或绝对路径），必须以 .md/.markdown 结尾' }),
  content: Type.Optional(Type.String({ description: '初始内容（可选）' })),
})
type CreateMarkdownFileParams = Static<typeof CreateMarkdownFileSchema>

export const createMarkdownFileTool: AgentTool<typeof CreateMarkdownFileSchema> = {
  name: 'create_markdown_file',
  label: '创建 Markdown 文件',
  description: '在工作区内创建新的 Markdown 文件（需确认）',
  parameters: CreateMarkdownFileSchema,
  async execute(_toolCallId, params: CreateMarkdownFileParams): Promise<AgentToolResult<unknown>> {
    const wsErr = checkWorkspaceOpen()
    if (wsErr) return errorResult(wsErr.error)

    let absPath: string
    try {
      absPath = assertInsideWorkspace(params.path)
    } catch (err) {
      if (err instanceof WorkspaceBoundaryError) return errorResult(err.message)
      throw err
    }

    if (!isMarkdownPath(absPath)) {
      return errorResult('仅支持创建 Markdown 文件')
    }

    // 检查是否已存在（通过尝试读取）
    try {
      await tauriReadFile(absPath)
      return errorResult('文件已存在')
    } catch {
      // 不存在，继续
    }

    try {
      await tauriCreateFile(absPath)
      // 如有初始内容则写入（依赖 saveFile 命令）
      if (params.content && params.content.length > 0) {
        const { saveFile } = await import('../../../../tauriCommands')
        await saveFile(absPath, params.content)
      }
      return textResult({
        created: true,
        path: absPath,
        relativePath: toWorkspaceRelative(absPath),
      })
    } catch (err) {
      return errorResult(err instanceof Error ? err.message : '创建失败')
    }
  },
}

// ─── list_workspace_files ───────────────────────────────────────────

const ListWorkspaceFilesSchema = Type.Object({
  dir: Type.Optional(
    Type.String({ description: '可选起始目录（相对工作区或绝对路径），默认工作区根' }),
  ),
})
type ListWorkspaceFilesParams = Static<typeof ListWorkspaceFilesSchema>

interface ListEntry {
  path: string
  type: 'file' | 'directory'
}

const LIST_LIMIT = 500

/**
 * 递归读取目录（限制总数）
 */
async function listRecursive(rootDir: string): Promise<{ entries: ListEntry[]; truncated: boolean }> {
  const out: ListEntry[] = []
  const queue: string[] = [rootDir]
  let truncated = false

  while (queue.length > 0) {
    if (out.length >= LIST_LIMIT) {
      truncated = true
      break
    }
    const dir = queue.shift()!
    let nodes: FileTreeNode[]
    try {
      nodes = await readDirectory(dir)
    } catch {
      continue
    }
    for (const node of nodes) {
      if (out.length >= LIST_LIMIT) {
        truncated = true
        break
      }
      if (node.type === 'directory') {
        out.push({ path: node.path, type: 'directory' })
        queue.push(node.path)
      } else if (isMarkdownPath(node.path)) {
        out.push({ path: node.path, type: 'file' })
      }
    }
  }

  return { entries: out, truncated }
}

export const listWorkspaceFilesTool: AgentTool<typeof ListWorkspaceFilesSchema> = {
  name: 'list_workspace_files',
  label: '列出工作区文件',
  description: '递归列出工作区内的 Markdown 文件与目录，最多 500 条',
  parameters: ListWorkspaceFilesSchema,
  async execute(_toolCallId, params: ListWorkspaceFilesParams): Promise<AgentToolResult<unknown>> {
    const wsErr = checkWorkspaceOpen()
    if (wsErr) return errorResult(wsErr.error)

    const root = useWorkspaceStore.getState().folderPath as string

    let startDir = root
    if (params.dir) {
      try {
        startDir = assertInsideWorkspace(params.dir)
      } catch (err) {
        if (err instanceof WorkspaceBoundaryError) return errorResult(err.message)
        throw err
      }
    }

    try {
      const { entries, truncated } = await listRecursive(startDir)
      return textResult({
        root: startDir,
        entries,
        count: entries.length,
        truncated,
      })
    } catch (err) {
      return errorResult(err instanceof Error ? err.message : '列出失败')
    }
  },
}
