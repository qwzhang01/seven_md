/**
 * 注册所有编辑器工具到注册表
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

// 读工具 — auto 权限（无需确认）
registerTool(getCurrentDocumentTool, 'auto')
registerTool(getSelectionTool, 'auto')
registerTool(getCursorPositionTool, 'auto')
registerTool(extractHeadingsTool, 'auto')

// 写工具 — confirm 权限（需用户确认）
registerTool(replaceSelectionTool, 'confirm')
registerTool(insertAtCursorTool, 'confirm')
registerTool(replaceDocumentTool, 'confirm')
