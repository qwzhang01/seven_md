/**
 * AI 服务层统一入口
 * 仅导出配置管理。Agent 运行时通过 agent/ 子目录直接导入。
 */

export { getAIConfig, setAIConfig, isAIConfigured } from './config'
export type { AIServiceConfig } from './config'
