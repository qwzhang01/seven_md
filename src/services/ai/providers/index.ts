/**
 * AI Provider 注册表
 * 管理所有已注册的 Provider 实例，根据配置返回当前活跃的 Provider
 */

import type { AIProvider } from './types'
import { OpenAICompatibleProvider } from './openaiCompatible'
import { PiProvider } from './piProvider'
import { getAIConfig } from '../config'

// Provider 注册表（单例）
const providerRegistry = new Map<string, AIProvider>()

/**
 * 注册一个 Provider 到注册表
 */
export function registerProvider(provider: AIProvider): void {
  providerRegistry.set(provider.name, provider)
}

/**
 * 根据名称获取 Provider 实例
 */
export function getProvider(name: string): AIProvider | undefined {
  return providerRegistry.get(name)
}

/**
 * 获取当前激活的 Provider
 * 根据 config.provider 字段返回对应实例
 * @throws 如果配置的 provider 未注册
 */
export function getActiveProvider(): AIProvider {
  const config = getAIConfig()
  const provider = providerRegistry.get(config.provider)
  if (!provider) {
    throw new Error(
      `AI Provider "${config.provider}" 未注册。可用的 Provider: ${Array.from(providerRegistry.keys()).join(', ')}`
    )
  }
  return provider
}

// ---- 模块初始化：自动注册内置 Providers ----
registerProvider(new OpenAICompatibleProvider())
registerProvider(new PiProvider())

// 导出类型和类
export type { AIProvider, ChatMessage, ChatOptions } from './types'
export { OpenAICompatibleProvider } from './openaiCompatible'
export { PiProvider } from './piProvider'
