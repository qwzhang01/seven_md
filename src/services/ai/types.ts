/**
 * AI 服务配置类型
 * 相比旧 AIServiceConfig，新增 provider 字段以支持多 Provider 切换
 */

export type ProviderType = 'openai-compatible' | 'pi'

export interface AIServiceConfig {
  /** API Key */
  apiKey: string
  /** API 端点 URL */
  endpoint: string
  /** 默认模型名称 */
  model: string
  /** 当前激活的 Provider */
  provider: ProviderType
}
