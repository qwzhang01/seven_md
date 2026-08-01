/**
 * AI 服务配置管理
 * - 使用新 key: seven-markdown-ai-config
 * - 首次调用 getAIConfig() 时自动从旧 key 迁移
 */

export interface AIServiceConfig {
  apiKey: string
  endpoint: string
  model: string
  provider: string
}

const CONFIG_KEY = 'seven-markdown-ai-config'
const LEGACY_CONFIG_KEY = 'md-mate-ai-config'

const DEFAULT_CONFIG: AIServiceConfig = {
  apiKey: '',
  endpoint: 'https://api.openai.com/v1',
  model: 'gpt-4o',
  provider: 'openai-compatible',
}

let migrated = false

/**
 * 从旧 key 迁移配置到新 key
 * - 旧 key 存在且新 key 不存在时执行迁移
 * - 迁移后删除旧 key
 * - 幂等操作，多次调用安全
 */
function migrateConfigKey(): void {
  if (migrated) return
  migrated = true

  try {
    const newRaw = localStorage.getItem(CONFIG_KEY)
    // 新 key 已存在，不覆盖
    if (newRaw) return

    const oldRaw = localStorage.getItem(LEGACY_CONFIG_KEY)
    if (!oldRaw) return

    // 迁移：将旧数据写入新 key
    localStorage.setItem(CONFIG_KEY, oldRaw)
    // 删除旧 key
    localStorage.removeItem(LEGACY_CONFIG_KEY)
  } catch {
    // localStorage 不可用时静默失败
  }
}

/**
 * 获取当前 AI 配置
 * 首次调用时自动执行旧 key 迁移
 */
export function getAIConfig(): AIServiceConfig {
  migrateConfigKey()

  try {
    const raw = localStorage.getItem(CONFIG_KEY)
    if (!raw) return { ...DEFAULT_CONFIG }
    return { ...DEFAULT_CONFIG, ...JSON.parse(raw) }
  } catch {
    return { ...DEFAULT_CONFIG }
  }
}

/**
 * 更新 AI 配置（合并写入）
 */
export function setAIConfig(config: Partial<AIServiceConfig>): void {
  const current = getAIConfig()
  const updated = { ...current, ...config }
  localStorage.setItem(CONFIG_KEY, JSON.stringify(updated))
}

/**
 * 检查 AI 服务是否已配置（apiKey 非空）
 */
export function isAIConfigured(): boolean {
  const config = getAIConfig()
  return !!config.apiKey
}
