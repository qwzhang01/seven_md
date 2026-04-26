/**
 * AI 服务抽象层 — 对接 OpenAI 兼容 API
 * 支持可配置端点，通过 localStorage 持久化配置
 */

export interface AIServiceConfig {
  apiKey: string
  endpoint: string
  model: string
}

const CONFIG_KEY = 'md-mate-ai-config'

const DEFAULT_CONFIG: AIServiceConfig = {
  apiKey: '',
  endpoint: 'https://api.openai.com/v1',
  model: 'gpt-3.5-turbo',
}

// ---- 配置读写 ----

export function getAIConfig(): AIServiceConfig {
  try {
    const raw = localStorage.getItem(CONFIG_KEY)
    if (!raw) return DEFAULT_CONFIG
    return { ...DEFAULT_CONFIG, ...JSON.parse(raw) }
  } catch {
    return DEFAULT_CONFIG
  }
}

export function setAIConfig(config: Partial<AIServiceConfig>): void {
  const current = getAIConfig()
  const updated = { ...current, ...config }
  localStorage.setItem(CONFIG_KEY, JSON.stringify(updated))
}

export function isAIConfigured(): boolean {
  const config = getAIConfig()
  return !!config.apiKey
}

// ---- 统一调用 ----

interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

async function callAI(messages: ChatMessage[]): Promise<string> {
  const config = getAIConfig()

  if (!config.apiKey) {
    throw new Error('AI 服务未配置。请先在设置中填写 API Key。')
  }

  const url = `${config.endpoint.replace(/\/$/, '')}/chat/completions`

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages,
      temperature: 0.7,
      max_tokens: 2000,
    }),
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

// ---- 四个公开方法 ----

export async function aiChat(messages: { role: 'user' | 'assistant'; content: string }[]): Promise<string> {
  const systemMsg: ChatMessage = {
    role: 'system',
    content: '你是 MD Mate AI 助手，专注于帮助用户编写和改进 Markdown 文档。请用中文回复。',
  }
  return callAI([systemMsg, ...messages])
}

export async function aiRewrite(text: string, style: string): Promise<string> {
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
  return callAI([systemMsg, { role: 'user', content: text }])
}

export async function aiTranslate(text: string, direction: string): Promise<string> {
  const dirMap: Record<string, string> = {
    'zh-en': '将中文翻译为英文',
    'en-zh': '将英文翻译为中文',
    'zh-ja': '将中文翻译为日文',
  }
  const systemMsg: ChatMessage = {
    role: 'system',
    content: `你是专业翻译。请${dirMap[direction] || direction}以下文本，保持 Markdown 格式不变。只输出翻译结果，不要解释。`,
  }
  return callAI([systemMsg, { role: 'user', content: text }])
}

export async function aiExplain(text: string): Promise<string> {
  const systemMsg: ChatMessage = {
    role: 'system',
    content: '你是 Markdown 技术文档专家。请用中文解释用户提供的文本内容，包括其含义、用途和可能的改进建议。',
  }
  return callAI([systemMsg, { role: 'user', content: text }])
}
