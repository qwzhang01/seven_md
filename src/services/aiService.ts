/**
 * @deprecated 请使用 `src/services/ai/` 模块代替
 * 此文件仅为兼容性保留，内部委托给新的 AI 服务层
 *
 * 新代码应直接引用：
 * - import { getAIConfig, setAIConfig, isAIConfigured } from './ai'
 * - import { getActiveProvider } from './ai'
 * - import { aiChat, aiRewrite, aiTranslate, aiExplain } from './ai'
 */

// Re-export config functions
export { getAIConfig, setAIConfig, isAIConfigured } from './ai/config'

// Re-export legacy AI functions
export { aiChat, aiRewrite, aiTranslate, aiExplain } from './ai/legacy'

// Re-export config type for backward compatibility
export type { AIServiceConfig } from './ai/types'
