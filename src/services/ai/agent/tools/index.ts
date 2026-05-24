/**
 * 注册所有 Agent 工具到注册表
 *
 * 工具分类：
 * - 编辑器工具（4 read + 3 write）
 * - 工作区工具（search/read/create/list）
 * - Markdown 工具（toc/table/links/mermaid）
 */

import { registerTool } from '../toolRegistry'
import {
  getCurrentDocumentTool,
  getSelectionTool,
  getCursorPositionTool,
  extractHeadingsTool,
  replaceSelectionTool,
  insertAtCursorTool,
  replaceDocumentTool,
} from './editorTools'
import {
  searchWorkspaceTool,
  readWorkspaceFileTool,
  createMarkdownFileTool,
  listWorkspaceFilesTool,
} from './fileTools'
import {
  generateTocTool,
  formatMarkdownTableTool,
  validateMarkdownLinksTool,
  generateMermaidTool,
} from './markdownTools'

// ── Editor: read（auto） ────────────────────────────────────────────
registerTool(getCurrentDocumentTool, 'auto')
registerTool(getSelectionTool, 'auto')
registerTool(getCursorPositionTool, 'auto')
registerTool(extractHeadingsTool, 'auto')

// ── Editor: write（confirm） ────────────────────────────────────────
registerTool(replaceSelectionTool, 'confirm')
registerTool(insertAtCursorTool, 'confirm')
registerTool(replaceDocumentTool, 'confirm')

// ── Workspace tools ────────────────────────────────────────────────
registerTool(searchWorkspaceTool, 'auto')
registerTool(readWorkspaceFileTool, 'confirm')
registerTool(createMarkdownFileTool, 'confirm')
registerTool(listWorkspaceFilesTool, 'auto')

// ── Markdown tools ─────────────────────────────────────────────────
registerTool(generateTocTool, 'auto')
registerTool(formatMarkdownTableTool, 'auto')
registerTool(validateMarkdownLinksTool, 'auto')
registerTool(generateMermaidTool, 'confirm')
