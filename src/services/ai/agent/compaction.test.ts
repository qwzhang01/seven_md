/**
 * compaction 单元测试 — 验证 estimateTokens / tokenThresholdFor / maybeCompact
 */

import { describe, it, expect, vi } from 'vitest'
import {
  estimateTokens,
  tokenThresholdFor,
  maybeCompact,
} from './compaction'
import type { Agent, AgentMessage } from '@pi/agent'

describe('compaction.estimateTokens', () => {
  it('estimates string-content message tokens', () => {
    const msgs: AgentMessage[] = [
      { role: 'user', content: 'hello world' } as never, // 11 chars
    ]
    // ceil(11/4) + 1*4 = 3 + 4 = 7
    expect(estimateTokens(msgs)).toBe(7)
  })

  it('aggregates across multiple messages', () => {
    const msgs: AgentMessage[] = [
      { role: 'user', content: 'a'.repeat(40) } as never,
      { role: 'user', content: 'b'.repeat(40) } as never,
    ]
    // ceil(80/4) + 2*4 = 20 + 8 = 28
    expect(estimateTokens(msgs)).toBe(28)
  })

  it('handles empty messages', () => {
    expect(estimateTokens([])).toBe(0)
  })
})

describe('compaction.tokenThresholdFor', () => {
  it('returns 80% of context window for known model', () => {
    expect(tokenThresholdFor('gpt-4o')).toBe(Math.floor(128_000 * 0.8))
  })

  it('returns default for unknown model', () => {
    expect(tokenThresholdFor('unknown-model-xyz')).toBe(25_000)
  })

  it('returns default when modelId undefined', () => {
    expect(tokenThresholdFor(undefined)).toBe(25_000)
  })
})

describe('compaction.maybeCompact', () => {
  function makeFakeAgent(messages: AgentMessage[]): Agent {
    return {
      state: { messages },
    } as unknown as Agent
  }

  it('does nothing when below threshold', async () => {
    const messages: AgentMessage[] = [
      { role: 'user', content: 'short' } as never,
    ]
    const agent = makeFakeAgent(messages)
    const onEvent = vi.fn()
    await maybeCompact(agent, { modelId: 'gpt-4o', onEvent })
    expect(onEvent).not.toHaveBeenCalled()
    expect(agent.state.messages.length).toBe(1)
  })

  it('truncates and emits compaction_done when above threshold', async () => {
    // 用未知 model 让阈值降到 25000；构造极长内容触发
    const longContent = 'x'.repeat(150_000) // 150K chars => ~37500 tokens
    const messages: AgentMessage[] = [
      { role: 'user', content: longContent } as never,
      ...Array.from({ length: 25 }, (_, i): AgentMessage => ({
        role: 'user',
        content: `msg ${i}`,
      } as never)),
    ]
    const agent = makeFakeAgent(messages)
    const onEvent = vi.fn()
    await maybeCompact(agent, { modelId: undefined, onEvent })
    expect(onEvent).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'compaction_done' }),
    )
    // 截断后只保留最近 20 条
    expect(agent.state.messages.length).toBeLessThanOrEqual(20)
  })
})
