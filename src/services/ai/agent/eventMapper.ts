/**
 * 事件映射器 — 将 Pi AgentEvent 映射为应用层 MarkdownAgentEvent
 *
 * 扩展事件：
 * - confirmation_required：confirm 工具等待用户决定
 * - compaction_done / compaction_failed：上下文压缩
 *
 * 设计：EventMapper 类持有 per-session 状态（lastMessageText），
 * 避免多会话交错时增量 delta 计算串台。
 */

import type { AgentEvent } from '@pi/agent'
import type { MarkdownPatch } from './patchProtocol'

// ─── MarkdownAgentEvent 类型 ────────────────────────────────────────

export type MarkdownAgentEvent =
  | { type: 'thinking'; content: string }
  | { type: 'message'; content: string; delta?: string }
  | { type: 'tool_call'; name: string; args: Record<string, unknown>; toolCallId: string }
  | { type: 'tool_result'; name: string; result: unknown; toolCallId: string }
  | { type: 'patch'; patch: MarkdownPatch; toolCallId: string }
  | { type: 'confirmation_required'; id: string; toolName: string; args: Record<string, unknown>; preview?: string }
  | { type: 'compaction_done'; removedMessages: number }
  | { type: 'compaction_failed'; error: string }
  | { type: 'error'; error: string }
  | { type: 'done' }

// ─── 辅助：判断 tool result 是否为 MarkdownPatch ─────────────────────

const PATCH_TYPES = new Set([
  'replace_selection',
  'insert_at_cursor',
  'replace_document',
  'insert_after_heading',
  'append_section',
])

function isPatchResult(result: unknown): result is { details: MarkdownPatch } {
  if (!result || typeof result !== 'object') return false
  const details = (result as Record<string, unknown>).details
  if (!details || typeof details !== 'object') return false
  const type = (details as Record<string, unknown>).type
  return typeof type === 'string' && PATCH_TYPES.has(type)
}

// ─── 文本提取 ────────────────────────────────────────────────────────

function extractTextFromMessage(message: unknown): string {
  if (!message || typeof message !== 'object') return ''
  const content = (message as Record<string, unknown>).content
  if (typeof content === 'string') return content
  if (Array.isArray(content)) {
    return content
      .filter((c: unknown) => c && typeof c === 'object' && (c as Record<string, unknown>).type === 'text')
      .map((c: unknown) => ((c as Record<string, unknown>).text as string) || '')
      .join('')
  }
  return ''
}

// ─── EventMapper 类（per-session 状态隔离）──────────────────────────

/**
 * 事件映射器实例，持有 per-session 的 lastMessageText 状态
 */
export class EventMapper {
  private lastMessageText = ''

  /** 重置内部状态（Agent 启动时调用） */
  reset(): void {
    this.lastMessageText = ''
  }

  /**
   * 将 Pi AgentEvent 映射为 MarkdownAgentEvent
   * 返回 null 表示该事件不需要被消费
   */
  map(event: AgentEvent): MarkdownAgentEvent | null {
    switch (event.type) {
      case 'agent_start':
        this.lastMessageText = ''
        return null

      case 'turn_start':
        return { type: 'thinking', content: '' }

      case 'message_update': {
        const fullText = extractTextFromMessage(event.message)
        const delta = fullText.slice(this.lastMessageText.length)
        this.lastMessageText = fullText
        if (!delta) return null
        return { type: 'message', content: fullText, delta }
      }

      case 'message_end':
        this.lastMessageText = ''
        return null

      case 'tool_execution_start':
        return {
          type: 'tool_call',
          name: event.toolName,
          args: event.args as Record<string, unknown>,
          toolCallId: event.toolCallId,
        }

      case 'tool_execution_end': {
        if (isPatchResult(event.result)) {
          return {
            type: 'patch',
            patch: (event.result as { details: MarkdownPatch }).details,
            toolCallId: event.toolCallId,
          }
        }
        return {
          type: 'tool_result',
          name: event.toolName,
          result: event.result,
          toolCallId: event.toolCallId,
        }
      }

      case 'agent_end':
        return { type: 'done' }

      default:
        return null
    }
  }
}
