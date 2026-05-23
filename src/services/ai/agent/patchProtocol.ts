/**
 * MarkdownPatch 协议 — 结构化描述文档修改
 * 所有写操作工具生成 Patch 对象，不直接执行修改
 */

/** 替换选中文本 */
export interface ReplaceSelectionPatch {
  type: 'replace_selection'
  from: number
  to: number
  newText: string
  description?: string
}

/** 在光标位置插入 */
export interface InsertAtCursorPatch {
  type: 'insert_at_cursor'
  position: number
  text: string
  description?: string
}

/** 替换整个文档 */
export interface ReplaceDocumentPatch {
  type: 'replace_document'
  newContent: string
  description?: string
}

/** 在指定标题后插入 */
export interface InsertAfterHeadingPatch {
  type: 'insert_after_heading'
  headingLevel: number
  headingText: string
  content: string
  description?: string
}

/** 在文档末尾追加段落 */
export interface AppendSectionPatch {
  type: 'append_section'
  content: string
  description?: string
}

/** Patch 类型联合体（不含元数据） */
export type PatchBody =
  | ReplaceSelectionPatch
  | InsertAtCursorPatch
  | ReplaceDocumentPatch
  | InsertAfterHeadingPatch
  | AppendSectionPatch

/** Patch 元数据 */
export interface PatchMetadata {
  id: string
  applied: boolean
  requiresConfirmation: boolean
  createdAt: number
}

/** 完整的 MarkdownPatch = Body + Metadata */
export type MarkdownPatch = PatchBody & PatchMetadata

/** 创建带元数据的 Patch */
export function createPatch(body: PatchBody, requiresConfirmation = true): MarkdownPatch {
  return {
    ...body,
    id: crypto.randomUUID(),
    applied: false,
    requiresConfirmation,
    createdAt: Date.now(),
  }
}
