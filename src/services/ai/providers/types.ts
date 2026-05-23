/**
 * AI Provider 抽象接口
 * 所有 AI 提供商（OpenAI Compatible、Pi 等）均需实现此接口
 */

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface ChatOptions {
  /** 模型名称，覆盖配置中的默认模型 */
  model?: string
  /** 温度参数 (0-2) */
  temperature?: number
  /** 最大生成 token 数 */
  maxTokens?: number
  /** 工具定义（用于 tool calling） */
  tools?: unknown[]
  /** 取消信号 */
  signal?: AbortSignal
}

export interface AIProvider {
  /** Provider 唯一标识名称 */
  readonly name: string

  /**
   * 非流式对话 — 发送消息并返回完整响应
   * @param messages 消息列表
   * @param options 可选的调用参数
   * @returns 完整的助手回复文本
   */
  chat(messages: ChatMessage[], options?: ChatOptions): Promise<string>

  /**
   * 流式对话 — 发送消息并逐步 yield 文本片段
   * @param messages 消息列表
   * @param options 可选的调用参数
   * @returns AsyncGenerator，每次 yield 一段 text delta
   */
  chatStream(messages: ChatMessage[], options?: ChatOptions): AsyncGenerator<string>
}
