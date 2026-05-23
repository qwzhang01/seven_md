/**
 * AI 服务层统一入口
 * 导出配置管理、Provider 注册表、Legacy 兼容函数
 */

// 配置管理
export { getAIConfig, setAIConfig, isAIConfigured } from './config'

// Provider 注册表
export { registerProvider, getProvider, getActiveProvider } from './providers'

// Provider 类型和实现
export type { AIProvider, ChatMessage, ChatOptions } from './providers/types'
export { OpenAICompatibleProvider } from './providers/openaiCompatible'
export { PiProvider } from './providers/piProvider'

// 配置类型
export type { AIServiceConfig, ProviderType } from './types'

// Legacy 兼容函数（推荐新代码直接使用 getActiveProvider()）
export { aiChat, aiRewrite, aiTranslate, aiExplain } from './legacy'
