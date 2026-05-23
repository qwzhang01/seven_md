/**
 * Editor Tools — 7 个编辑器工具（4 读 + 3 写）
 * 符合 Pi AgentTool 接口
 */

import type { AgentTool, AgentToolResult } from '@pi/agent'
import { Type, type Static } from 'typebox'
import { useEditorStore } from '../../../../stores/useEditorStore'
import { useFileStore } from '../../../../stores/useFileStore'
import { useAIStore } from '../../../../stores/useAIStore'
import { extractTitle, extractHeadings, calculateCursorOffset } from '../../../../utils/markdownUtils'
import { createPatch } from '../patchProtocol'
import type { MarkdownPatch } from '../patchProtocol'

// ─── Helper ─────────────────────────────────────────────────────────

function textResult(data: unknown): AgentToolResult<unknown> {
  return {
    content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
    details: data,
  }
}

function errorResult(message: string): AgentToolResult<unknown> {
  return {
    content: [{ type: 'text', text: JSON.stringify({ error: message }) }],
    details: { error: message },
  }
}

// ─── Read Tools ─────────────────────────────────────────────────────

const GetCurrentDocumentSchema = Type.Object({})
type GetCurrentDocumentParams = Static<typeof GetCurrentDocumentSchema>

export const getCurrentDocumentTool: AgentTool<typeof GetCurrentDocumentSchema> = {
  name: 'get_current_document',
  label: '获取当前文档',
  description: '获取当前编辑器中打开的文档内容、路径和标题',
  parameters: GetCurrentDocumentSchema,
  async execute(
    _toolCallId: string,
    _params: GetCurrentDocumentParams,
  ): Promise<AgentToolResult<unknown>> {
    const activeTab = useFileStore.getState().getActiveTab()
    if (!activeTab) {
      return textResult({ content: '', path: null, title: 'Untitled' })
    }
    return textResult({
      content: activeTab.content,
      path: activeTab.path,
      title: extractTitle(activeTab.content),
    })
  },
}

const GetSelectionSchema = Type.Object({})
type GetSelectionParams = Static<typeof GetSelectionSchema>

export const getSelectionTool: AgentTool<typeof GetSelectionSchema> = {
  name: 'get_selection',
  label: '获取选中文本',
  description: '获取编辑器中当前选中的文本及其位置范围',
  parameters: GetSelectionSchema,
  async execute(
    _toolCallId: string,
    _params: GetSelectionParams,
  ): Promise<AgentToolResult<unknown>> {
    const aiState = useAIStore.getState()
    const editorState = useEditorStore.getState()

    if (aiState.selectedText) {
      const selection = editorState.selection
      return textResult({
        text: aiState.selectedText,
        from: selection?.from ?? 0,
        to: selection?.to ?? 0,
      })
    }

    if (editorState.selection) {
      const content = editorState.content
      const { from, to } = editorState.selection
      return textResult({
        text: content.slice(from, to),
        from,
        to,
      })
    }

    return textResult({ text: '', from: 0, to: 0 })
  },
}

const GetCursorPositionSchema = Type.Object({})
type GetCursorPositionParams = Static<typeof GetCursorPositionSchema>

export const getCursorPositionTool: AgentTool<typeof GetCursorPositionSchema> = {
  name: 'get_cursor_position',
  label: '获取光标位置',
  description: '获取编辑器中当前光标的行号和列号',
  parameters: GetCursorPositionSchema,
  async execute(
    _toolCallId: string,
    _params: GetCursorPositionParams,
  ): Promise<AgentToolResult<unknown>> {
    const { cursorPosition } = useEditorStore.getState()
    return textResult({
      line: cursorPosition.line,
      column: cursorPosition.column,
    })
  },
}

const ExtractHeadingsSchema = Type.Object({})
type ExtractHeadingsParams = Static<typeof ExtractHeadingsSchema>

export const extractHeadingsTool: AgentTool<typeof ExtractHeadingsSchema> = {
  name: 'extract_headings',
  label: '提取文档大纲',
  description: '提取当前文档中所有标题，返回大纲结构',
  parameters: ExtractHeadingsSchema,
  async execute(
    _toolCallId: string,
    _params: ExtractHeadingsParams,
  ): Promise<AgentToolResult<unknown>> {
    const activeTab = useFileStore.getState().getActiveTab()
    const content = activeTab?.content ?? ''
    const headings = extractHeadings(content)
    return textResult({ headings })
  },
}

// ─── Write Tools ────────────────────────────────────────────────────

const ReplaceSelectionSchema = Type.Object({
  newText: Type.String({ description: '替换选中文本的新内容' }),
})
type ReplaceSelectionParams = Static<typeof ReplaceSelectionSchema>

export const replaceSelectionTool: AgentTool<typeof ReplaceSelectionSchema, MarkdownPatch> = {
  name: 'replace_selection',
  label: '替换选中文本',
  description: '将编辑器中选中的文本替换为新内容（需确认）',
  parameters: ReplaceSelectionSchema,
  async execute(
    _toolCallId: string,
    params: ReplaceSelectionParams,
  ): Promise<AgentToolResult<MarkdownPatch>> {
    const editorState = useEditorStore.getState()
    const aiState = useAIStore.getState()

    // 验证是否有选区
    const hasSelection = aiState.selectedText || editorState.selection
    if (!hasSelection) {
      return errorResult('没有选中任何文本') as AgentToolResult<MarkdownPatch>
    }

    const selection = editorState.selection ?? { from: 0, to: 0 }
    const patch = createPatch({
      type: 'replace_selection',
      from: selection.from,
      to: selection.to,
      newText: params.newText,
    })

    return {
      content: [{ type: 'text', text: JSON.stringify(patch, null, 2) }],
      details: patch,
    }
  },
}

const InsertAtCursorSchema = Type.Object({
  text: Type.String({ description: '要在光标位置插入的文本' }),
})
type InsertAtCursorParams = Static<typeof InsertAtCursorSchema>

export const insertAtCursorTool: AgentTool<typeof InsertAtCursorSchema, MarkdownPatch> = {
  name: 'insert_at_cursor',
  label: '在光标处插入',
  description: '在当前光标位置插入文本（需确认）',
  parameters: InsertAtCursorSchema,
  async execute(
    _toolCallId: string,
    params: InsertAtCursorParams,
  ): Promise<AgentToolResult<MarkdownPatch>> {
    const { cursorPosition } = useEditorStore.getState()
    const activeTab = useFileStore.getState().getActiveTab()
    const content = activeTab?.content ?? ''

    const position = calculateCursorOffset(content, cursorPosition.line, cursorPosition.column)
    const patch = createPatch({
      type: 'insert_at_cursor',
      position,
      text: params.text,
    })

    return {
      content: [{ type: 'text', text: JSON.stringify(patch, null, 2) }],
      details: patch,
    }
  },
}

const ReplaceDocumentSchema = Type.Object({
  newContent: Type.String({ description: '替换整个文档的新内容' }),
})
type ReplaceDocumentParams = Static<typeof ReplaceDocumentSchema>

export const replaceDocumentTool: AgentTool<typeof ReplaceDocumentSchema, MarkdownPatch> = {
  name: 'replace_document',
  label: '替换整个文档',
  description: '用新内容替换当前文档的全部内容（需确认）',
  parameters: ReplaceDocumentSchema,
  async execute(
    _toolCallId: string,
    params: ReplaceDocumentParams,
  ): Promise<AgentToolResult<MarkdownPatch>> {
    const patch = createPatch({
      type: 'replace_document',
      newContent: params.newContent,
    })

    return {
      content: [{ type: 'text', text: JSON.stringify(patch, null, 2) }],
      details: patch,
    }
  },
}
