/**
 * Legacy 桥接层
 * 导出与旧 aiService.ts 相同签名的函数，内部委托给新的 Provider 架构
 * 确保现有组件（ChatMode、RewriteMode、TranslateMode、ExplainMode）零退化
 */

import { getActiveProvider } from './providers'
import type { ChatMessage } from './providers/types'

/**
 * AI 对话 — 发送消息并获取回复
 * 签名与旧 aiService.ts 的 aiChat 完全一致
 */
export async function aiChat(messages: { role: 'user' | 'assistant'; content: string }[]): Promise<string> {
  const provider = getActiveProvider()
  const systemMsg: ChatMessage = {
    role: 'system',
    content: '你是 Seven Markdown AI 助手，专注于帮助用户编写和改进 Markdown 文档。请用中文回复。',
  }
  return provider.chat([systemMsg, ...messages])
}

/**
 * AI 改写 — 将文本改写为指定风格
 * 签名与旧 aiService.ts 的 aiRewrite 完全一致
 */
export async function aiRewrite(text: string, style: string): Promise<string> {
  const provider = getActiveProvider()
  const styleMap: Record<string, string> = {
    professional: '专业正式',
    casual: '轻松随意',
    concise: '简洁精炼',
    expansive: '详细扩展',
  }
  const systemMsg: ChatMessage = {
    role: 'system',
    content: `你是 Markdown 文档改写专家。请将用户提供的文本改写为${styleMap[style] || style}风格，保持 Markdown 格式不变。只输出改写后的内容，不要解释。`,
  }
  return provider.chat([systemMsg, { role: 'user', content: text }])
}

/**
 * AI 翻译 — 将文本翻译为指定语言
 * 签名与旧 aiService.ts 的 aiTranslate 完全一致
 */
export async function aiTranslate(text: string, direction: string): Promise<string> {
  const provider = getActiveProvider()
  const dirMap: Record<string, string> = {
    'zh-en': '将中文翻译为英文',
    'en-zh': '将英文翻译为中文',
    'zh-ja': '将中文翻译为日文',
  }
  const systemMsg: ChatMessage = {
    role: 'system',
    content: `你是专业翻译。请${dirMap[direction] || direction}以下文本，保持 Markdown 格式不变。只输出翻译结果，不要解释。`,
  }
  return provider.chat([systemMsg, { role: 'user', content: text }])
}

/**
 * AI 解释 — 解释文本内容
 * 签名与旧 aiService.ts 的 aiExplain 完全一致
 */
export async function aiExplain(text: string): Promise<string> {
  const provider = getActiveProvider()
  const systemMsg: ChatMessage = {
    role: 'system',
    content: '你是 Markdown 技术文档专家。请用中文解释用户提供的文本内容，包括其含义、用途和可能的改进建议。',
  }
  return provider.chat([systemMsg, { role: 'user', content: text }])
}
