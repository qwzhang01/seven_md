/**
 * OpenAI Compatible Provider
 * 直接通过 fetch 调用 OpenAI Chat Completions API（含兼容端点）
 * 从原 aiService.ts 的 callAI() 重构而来
 */

import type { AIProvider, ChatMessage, ChatOptions } from './types'
import { getAIConfig } from '../config'

export class OpenAICompatibleProvider implements AIProvider {
  readonly name = 'openai-compatible'

  /**
   * 非流式对话
   * 发送完整请求，等待并返回完整响应
   */
  async chat(messages: ChatMessage[], options?: ChatOptions): Promise<string> {
    const config = getAIConfig()

    if (!config.apiKey) {
      throw new Error('AI 服务未配置。请先在设置中填写 API Key。')
    }

    const url = `${config.endpoint.replace(/\/$/, '')}/chat/completions`
    const model = options?.model ?? config.model
    const temperature = options?.temperature ?? 0.7
    const maxTokens = options?.maxTokens ?? 2000

    const body: Record<string, unknown> = {
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
    }

    if (options?.tools && options.tools.length > 0) {
      body.tools = options.tools
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify(body),
      signal: options?.signal,
    })

    if (!response.ok) {
      const text = await response.text().catch(() => '')
      throw new Error(`AI 服务请求失败 (${response.status}): ${text || response.statusText}`)
    }

    const data = await response.json()
    const content = data?.choices?.[0]?.message?.content
    if (!content) {
      throw new Error('AI 服务返回了空响应')
    }
    return content.trim()
  }

  /**
   * 流式对话
   * 使用 SSE 解析逐步 yield text delta
   */
  async *chatStream(messages: ChatMessage[], options?: ChatOptions): AsyncGenerator<string> {
    const config = getAIConfig()

    if (!config.apiKey) {
      throw new Error('AI 服务未配置。请先在设置中填写 API Key。')
    }

    const url = `${config.endpoint.replace(/\/$/, '')}/chat/completions`
    const model = options?.model ?? config.model
    const temperature = options?.temperature ?? 0.7
    const maxTokens = options?.maxTokens ?? 2000

    const body: Record<string, unknown> = {
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
      stream: true,
    }

    if (options?.tools && options.tools.length > 0) {
      body.tools = options.tools
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify(body),
      signal: options?.signal,
    })

    if (!response.ok) {
      const text = await response.text().catch(() => '')
      throw new Error(`AI 服务请求失败 (${response.status}): ${text || response.statusText}`)
    }

    if (!response.body) {
      throw new Error('AI 服务未返回流式响应体')
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })

        // 按行解析 SSE
        const lines = buffer.split('\n')
        // 保留最后一个可能不完整的行
        buffer = lines.pop() || ''

        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed || !trimmed.startsWith('data:')) continue

          const data = trimmed.slice(5).trim()
          if (data === '[DONE]') return

          try {
            const parsed = JSON.parse(data)
            const delta = parsed?.choices?.[0]?.delta?.content
            if (delta) {
              yield delta
            }
          } catch {
            // 忽略不完整的 JSON 行
          }
        }
      }
    } finally {
      reader.releaseLock()
    }
  }
}
