/**
 * Markdown Agent 工厂 — 封装 Pi Agent 类
 * 注入 stream 函数、工具列表和系统提示词
 *
 * 增强：
 * - 接受 modelId 参数（可选）；未指定时回退到 AI 配置默认模型
 * - 在每次 prompt 之前调用 maybeCompact 自动压缩 transcript
 * - 在返回的 Agent 上附加 _markdownMeta 字段以便外部读取 modelId 等信息
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
import { maybeCompact, getContextWindowFor, type CompactionEventHandler } from './compaction'

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
 * 根据当前 AI 配置和 modelId 构建 Pi Model 对象
 */
function buildAgentModel(modelId: string): Model<Api> {
  const config = getAIConfig()
  const contextWindow = getContextWindowFor(modelId)
  return {
    id: modelId,
    name: modelId,
    api: 'openai-completions',
    provider: 'openai',
    baseUrl: config.endpoint.replace(/\/$/, ''),
    reasoning: false,
    input: ['text'],
    cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
    contextWindow,
    maxTokens: Math.min(4096, Math.floor(contextWindow / 4)),
  }
}

/**
 * 由 useAgentStore 注入：返回当前 active model id
 * 未注入时回退到 AI 配置中的 model
 */
type ActiveModelProvider = () => string | undefined
let activeModelProvider: ActiveModelProvider = () => undefined

export function setActiveModelProvider(provider: ActiveModelProvider): void {
  activeModelProvider = provider
}

/**
 * Markdown Agent 元数据（附加在 Agent 实例上以便外部读取）
 */
export interface MarkdownAgentMeta {
  modelId: string
  /** 触发 compaction 的回调，由 useAgentStore 注入 */
  onCompactionEvent?: CompactionEventHandler
  /** compaction 开始前回调（用于设置 UI 压缩指示器） */
  onCompactionBegin?: () => void
}

const META_KEY = '__markdownAgentMeta'

/**
 * 读取 Agent 实例的元数据
 */
export function getAgentMeta(agent: Agent): MarkdownAgentMeta | undefined {
  return (agent as unknown as Record<string, unknown>)[META_KEY] as MarkdownAgentMeta | undefined
}

/**
 * 设置 Agent 实例的元数据（仅供 Store 使用）
 */
export function setAgentMeta(agent: Agent, meta: Partial<MarkdownAgentMeta>): void {
  const existing = getAgentMeta(agent) ?? { modelId: '' }
  ;(agent as unknown as Record<string, unknown>)[META_KEY] = { ...existing, ...meta }
}

/**
 * 创建 Markdown Agent 实例的选项
 */
export interface CreateMarkdownAgentOptions {
  /** 显式指定模型 ID。优先级：参数 > activeModelProvider() > AI 配置默认 */
  modelId?: string
  /** Compaction 事件回调（由 store 接管 UI 状态） */
  onCompactionEvent?: CompactionEventHandler
  /** Compaction 开始前回调（由 store 接管 UI 状态） */
  onCompactionBegin?: () => void
}

/**
 * 创建 Markdown Agent 实例
 *
 * 返回已配置的 Pi Agent 实例：
 * - streamFn: 使用默认 streamSimple（Pi 内部处理）
 * - tools: 全部已注册工具（编辑器 + 工作区 + Markdown）
 * - systemPrompt: Markdown Writing Agent
 * - toolExecution: sequential（顺序执行工具避免冲突）
 * - getApiKey: 从 localStorage 配置读取
 *
 * 在 prompt() 之前会自动调用 maybeCompact 压缩 transcript。
 */
export function createMarkdownAgent(options: CreateMarkdownAgentOptions = {}): Agent {
  ensureProviderRegistered()

  const config = getAIConfig()
  if (!config.apiKey) {
    throw new Error('AI 服务未配置。请先在设置中填写 API Key。')
  }

  // 解析 modelId 优先级：参数 > activeModelProvider > config
  const resolvedModelId = options.modelId ?? activeModelProvider() ?? config.model

  const model = buildAgentModel(resolvedModelId)
  const tools = getAllTools()

  const agentOptions: AgentOptions = {
    initialState: {
      systemPrompt: MARKDOWN_AGENT_SYSTEM_PROMPT,
      model,
      tools,
      thinkingLevel: 'off',
    },
    getApiKey: (_provider: string) => getAIConfig().apiKey,
    toolExecution: 'sequential',
  }

  const agent = new Agent(agentOptions)

  // 写入元数据
  setAgentMeta(agent, {
    modelId: resolvedModelId,
    onCompactionEvent: options.onCompactionEvent,
    onCompactionBegin: options.onCompactionBegin,
  })

  // 包装 prompt 方法以注入 compaction
  const originalPrompt = agent.prompt.bind(agent)
  agent.prompt = (async (...args: Parameters<typeof originalPrompt>) => {
    const meta = getAgentMeta(agent)
    await maybeCompact(agent, {
      modelId: meta?.modelId,
      onBegin: () => meta?.onCompactionBegin?.(),
      onEvent: (e) => meta?.onCompactionEvent?.(e),
    })
    return originalPrompt(...args)
  }) as typeof originalPrompt

  return agent
}
