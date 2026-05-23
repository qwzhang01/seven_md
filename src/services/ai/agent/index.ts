/**
 * Agent 工具层入口
 * 导出工具注册表、Patch 协议和类型
 */

// 初始化：注册所有编辑器工具
import './tools/index'

// 工具注册表
export { registerTool, getTool, getAllTools, getToolPermission } from './toolRegistry'

// Patch 协议
export { createPatch } from './patchProtocol'
export type {
  MarkdownPatch,
  PatchBody,
  PatchMetadata,
  ReplaceSelectionPatch,
  InsertAtCursorPatch,
  ReplaceDocumentPatch,
  InsertAfterHeadingPatch,
  AppendSectionPatch,
} from './patchProtocol'

// 类型
export type { ToolPermission, RegisteredTool } from './types'

// Agent Runtime
export { createMarkdownAgent } from './markdownAgent'
export { MARKDOWN_AGENT_SYSTEM_PROMPT } from './prompts'
export { mapPiEvent, resetEventMapper } from './eventMapper'
export type { MarkdownAgentEvent } from './eventMapper'
