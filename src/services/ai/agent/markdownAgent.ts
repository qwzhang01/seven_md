/**
 * Markdown Agent 工厂 — 封装 Pi Agent 类
 * 注入 stream 函数、工具列表和系统提示词
 */

import { Agent } from '@pi/agent'
import type { AgentOptions } from '@pi/agent'
import { registerApiProvider } from '@pi/ai'
import { streamOpenAICompletions, streamSimpleOpenAICompletions } from '@pi/ai/providers/openai-completions.ts'
import type { Api, Model } from '@pi/ai'
import { getAIConfig } from '../config'
// 必须确保 tools/index.ts 的 side-effect（registerTool 调用）已执行
import './tools/index'
import { getAllTools } from './toolRegistry'
import { MARKDOWN_AGENT_SYSTEM_PROMPT } from './prompts'

let providerRegistered = false

/**
 * 确保 openai-completions provider 已注册（与 piProvider 共享逻辑）
 */
function ensureProviderRegistered(): void {
  if (providerRegistered) return
  providerRegistered = true
  registerApiProvider({
    api: 'openai-completions' as const,
    stream: streamOpenAICompletions,
    streamSimple: streamSimpleOpenAICompletions,
  })
}

/**
 * 根据当前 AI 配置构建 Pi Model 对象
 */
function buildAgentModel(): Model<Api> {
  const config = getAIConfig()
  return {
    id: config.model,
    name: config.model,
    api: 'openai-completions',
    provider: 'openai',
    baseUrl: config.endpoint.replace(/\/$/, ''),
    reasoning: false,
    input: ['text'],
    cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
    contextWindow: 128000,
    maxTokens: 4096,
  }
}

/**
 * 创建 Markdown Agent 实例
 *
 * 返回已配置的 Pi Agent 实例：
 * - streamFn: 使用默认 streamSimple（Pi 内部处理）
 * - tools: 7 个编辑器工具
 * - systemPrompt: Markdown Writing Agent
 * - toolExecution: sequential（顺序执行工具避免冲突）
 * - getApiKey: 从 localStorage 配置读取
 */
export function createMarkdownAgent(): Agent {
  ensureProviderRegistered()

  const config = getAIConfig()
  if (!config.apiKey) {
    throw new Error('AI 服务未配置。请先在设置中填写 API Key。')
  }

  const model = buildAgentModel()
  const tools = getAllTools()

  const options: AgentOptions = {
    initialState: {
      systemPrompt: MARKDOWN_AGENT_SYSTEM_PROMPT,
      model,
      tools,
      thinkingLevel: 'off',
    },
    getApiKey: () => config.apiKey,
    toolExecution: 'sequential',
  }

  return new Agent(options)
}
