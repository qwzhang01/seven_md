/**
 * Compaction — Agent transcript 上下文压缩
 *
 * 策略：
 * 1. estimateTokens：基于字符数的轻量级估算（不依赖 tokenizer）
 * 2. tokenThresholdFor：按模型 context window × 0.8 计算阈值
 * 3. maybeCompact：超阈值时尝试 Pi compaction，失败则截断到 system prompt + 最近 20 条消息
 * 4. emit：通过 onEvent 回调对外发出 compaction_done / compaction_failed
 *
 * 注意：当前 v1 版直接使用 truncate 作为主策略（Pi 的 compactTranscript 需要
 * 完整 SessionTreeEntry 结构，集成成本较高，留作后续增强）。
 */

import type { Agent, AgentMessage } from '@pi/agent'

/**
 * Compaction 事件回调
 */
export type CompactionEventHandler = (event:
  | { type: 'compaction_done'; removedMessages: number }
  | { type: 'compaction_failed'; error: string }
) => void

/**
 * Compaction 选项
 */
export interface CompactionOptions {
  /** 当前模型 ID，用于阈值计算 */
  modelId?: string
  /** 触发压缩前回调（用于设置 UI 状态） */
  onBegin?: () => void
  /** 完成或失败回调 */
  onEvent?: CompactionEventHandler
}

// ─── Token Estimation ───────────────────────────────────────────────

/**
 * 提取消息的字符数（保守估算）
 */
function charsOfMessage(msg: AgentMessage): number {
  let chars = 0
  const m = msg as unknown as { role: string; content: unknown }

  if (typeof m.content === 'string') {
    chars = m.content.length
  } else if (Array.isArray(m.content)) {
    for (const block of m.content as Array<Record<string, unknown>>) {
      if (typeof block.text === 'string') chars += block.text.length
      if (typeof block.thinking === 'string') chars += (block.thinking as string).length
      if (block.type === 'toolCall') {
        const name = (block.name as string) ?? ''
        const args = (block.arguments as unknown) ?? {}
        chars += name.length
        try { chars += JSON.stringify(args).length } catch { /* ignore */ }
      }
      if (block.type === 'image') chars += 4800
    }
  }
  // 兼容其他扩展角色（branchSummary / compactionSummary）
  const summary = (msg as unknown as { summary?: string }).summary
  if (typeof summary === 'string') chars += summary.length

  return chars
}

/**
 * 估算消息列表的 token 数（保守上界）
 *
 * 公式：Math.ceil(totalChars / 4) + messages.length * 4
 */
export function estimateTokens(messages: AgentMessage[]): number {
  let total = 0
  for (const m of messages) total += charsOfMessage(m)
  return Math.ceil(total / 4) + messages.length * 4
}

// ─── Threshold ──────────────────────────────────────────────────────

const MODEL_CONTEXT_WINDOWS: Record<string, number> = {
  'gpt-4o': 128_000,
  'gpt-4o-mini': 128_000,
  'gpt-4-turbo': 128_000,
  'gpt-4': 8_192,
  'gpt-3.5-turbo': 16_385,
  'claude-3-5-sonnet': 200_000,
  'claude-3-5-sonnet-20241022': 200_000,
  'claude-sonnet-4': 200_000,
  'claude-opus-4': 200_000,
  'claude-haiku-4': 200_000,
  'deepseek-chat': 64_000,
  'deepseek-reasoner': 64_000,
}

const DEFAULT_THRESHOLD = 25_000

/**
 * 获取指定模型的 token 阈值（context window × 0.8）
 */
export function tokenThresholdFor(modelId: string | undefined): number {
  if (!modelId) return DEFAULT_THRESHOLD
  const cw = MODEL_CONTEXT_WINDOWS[modelId]
  if (!cw) return DEFAULT_THRESHOLD
  return Math.floor(cw * 0.8)
}

// ─── Truncation Fallback ────────────────────────────────────────────

const TRUNCATE_KEEP_LAST = 20

/**
 * 截断到最近 N 条消息
 * 注意：调用方应保证 systemPrompt 单独存在于 agent.state.systemPrompt（非 messages 内），
 * 因此 truncate 仅操作 messages。
 */
function truncateMessages(messages: AgentMessage[]): AgentMessage[] {
  if (messages.length <= TRUNCATE_KEEP_LAST) return messages
  return messages.slice(messages.length - TRUNCATE_KEEP_LAST)
}

// ─── maybeCompact ───────────────────────────────────────────────────

/**
 * 在 agent.prompt() 之前调用：检查 transcript 是否超阈值，超则压缩。
 *
 * 当前 v1 实现：超阈值即 truncate，并发出 compaction_done。
 * 失败时（理论上 truncate 不会失败）发出 compaction_failed。
 *
 * 后续可对接 Pi 的 compactTranscript（需要构造 SessionTreeEntry）。
 */
export async function maybeCompact(agent: Agent, options: CompactionOptions = {}): Promise<void> {
  const { modelId, onBegin, onEvent } = options

  const messages = agent.state.messages
  const tokens = estimateTokens(messages)
  const threshold = tokenThresholdFor(modelId)

  if (tokens < threshold) return // 不需要压缩

  onBegin?.()

  try {
    const before = messages.length
    const truncated = truncateMessages(messages)
    agent.state.messages = truncated
    const removed = before - truncated.length
    onEvent?.({ type: 'compaction_done', removedMessages: removed })
  } catch (err) {
    onEvent?.({
      type: 'compaction_failed',
      error: err instanceof Error ? err.message : 'compaction error',
    })
    // 兜底再次截断
    try {
      agent.state.messages = truncateMessages(agent.state.messages)
    } catch {
      // ignore
    }
  }
}
