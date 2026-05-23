/**
 * Pi Provider — 桥接 @pi/ai 的 streaming 能力
 * 通过 Pi 的 provider registry 和 stream() 函数实现流式对话
 */

import {
  registerApiProvider,
  stream as piStream,
} from '@pi/ai'
import type { Model, Api, Message as PiMessage } from '@pi/ai'
import { streamOpenAICompletions, streamSimpleOpenAICompletions } from '@pi/ai/providers/openai-completions.ts'
import type { AIProvider, ChatMessage, ChatOptions } from './types'
import { getAIConfig } from '../config'

export class PiProvider implements AIProvider {
  readonly name = 'pi'

  private registered = false

  /**
   * 确保 openai-completions provider 已注册到 Pi registry
   * 惰性注册，首次调用时执行
   */
  private ensureRegistered(): void {
    if (this.registered) return
    this.registered = true

    registerApiProvider({
      api: 'openai-completions' as const,
      stream: streamOpenAICompletions,
      streamSimple: streamSimpleOpenAICompletions,
    })
  }

  /**
   * 将 ChatMessage[] 转换为 Pi 的 Message[] 格式
   * 注意：Pi 的 Context 使用 systemPrompt 字段而非 system role message
   */
  private convertMessages(messages: ChatMessage[]): { systemPrompt?: string; piMessages: PiMessage[] } {
    let systemPrompt: string | undefined
    const piMessages: PiMessage[] = []

    for (const msg of messages) {
      if (msg.role === 'system') {
        // 收集 system 消息作为 systemPrompt
        systemPrompt = systemPrompt ? `${systemPrompt}\n${msg.content}` : msg.content
      } else if (msg.role === 'user') {
        piMessages.push({
          role: 'user',
          content: msg.content,
          timestamp: Date.now(),
        })
      } else if (msg.role === 'assistant') {
        piMessages.push({
          role: 'assistant',
          content: [{ type: 'text', text: msg.content }],
          api: 'openai-completions',
          provider: 'openai',
          model: '',
          usage: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, totalTokens: 0, cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, total: 0 } },
          stopReason: 'stop',
          timestamp: Date.now(),
        })
      }
    }

    return { systemPrompt, piMessages }
  }

  /**
   * 根据当前配置构建 Pi Model 对象
   */
  private buildModel(options?: ChatOptions): Model<Api> {
    const config = getAIConfig()
    const modelId = options?.model ?? config.model

    return {
      id: modelId,
      name: modelId,
      api: 'openai-completions',
      provider: 'openai',
      baseUrl: config.endpoint.replace(/\/$/, ''),
      reasoning: false,
      input: ['text'],
      cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
      contextWindow: 128000,
      maxTokens: options?.maxTokens ?? 2000,
    }
  }

  /**
   * 流式对话 — 通过 Pi 的 stream() 函数实现
   */
  async *chatStream(messages: ChatMessage[], options?: ChatOptions): AsyncGenerator<string> {
    this.ensureRegistered()

    const config = getAIConfig()
    if (!config.apiKey) {
      throw new Error('AI 服务未配置。请先在设置中填写 API Key。')
    }

    const { systemPrompt, piMessages } = this.convertMessages(messages)
    const model = this.buildModel(options)

    const eventStream = piStream(model, {
      systemPrompt,
      messages: piMessages,
      tools: options?.tools as any,
    }, {
      apiKey: config.apiKey,
      temperature: options?.temperature ?? 0.7,
      maxTokens: options?.maxTokens ?? 2000,
      signal: options?.signal,
    })

    for await (const event of eventStream) {
      if (event.type === 'text_delta') {
        yield event.delta
      }
      if (event.type === 'done' || event.type === 'error') {
        break
      }
    }
  }

  /**
   * 非流式对话 — 内部收集 chatStream 的完整结果
   */
  async chat(messages: ChatMessage[], options?: ChatOptions): Promise<string> {
    let result = ''
    for await (const delta of this.chatStream(messages, options)) {
      result += delta
    }
    if (!result) {
      throw new Error('AI 服务返回了空响应')
    }
    return result.trim()
  }
}
