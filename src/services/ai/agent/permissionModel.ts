/**
 * Permission Model — 工具权限的运行时模型
 *
 * 提供：
 * - ToolPermission 类型（auto/confirm/deny）
 * - 会话级覆盖 Map（in-memory）
 * - getEffectivePermission(name, sessionId) 解析最终权限
 * - setSessionPermissionOverride / clearSessionOverrides
 *
 * 权限语义：
 * - auto: 自动执行
 * - confirm: 执行前需用户确认（向 useAgentStore 推 pendingConfirmations）
 * - deny: 拒绝执行
 */

import { getToolPermission } from './toolRegistry'
import type { ToolPermission } from './types'

/**
 * 接口：定义在此处避免与 useAgentStore 形成循环依赖
 */
export interface PermissionModel {
  getEffectivePermission(name: string, sessionId: string): ToolPermission
  setSessionPermissionOverride(sessionId: string, name: string, permission: ToolPermission): void
  clearSessionOverrides(sessionId: string): void
}

// 会话级覆盖：sessionId -> { toolName -> permission }
const sessionOverrides = new Map<string, Map<string, ToolPermission>>()

/**
 * 获取工具在指定会话下的有效权限
 * 优先级：会话覆盖 > 默认注册值 > 'auto' 兜底
 */
export function getEffectivePermission(name: string, sessionId: string): ToolPermission {
  const sessionMap = sessionOverrides.get(sessionId)
  if (sessionMap) {
    const override = sessionMap.get(name)
    if (override) return override
  }
  return getToolPermission(name) ?? 'auto'
}

/**
 * 为指定会话设置工具权限覆盖
 */
export function setSessionPermissionOverride(
  sessionId: string,
  name: string,
  permission: ToolPermission,
): void {
  let sessionMap = sessionOverrides.get(sessionId)
  if (!sessionMap) {
    sessionMap = new Map()
    sessionOverrides.set(sessionId, sessionMap)
  }
  sessionMap.set(name, permission)
}

/**
 * 清除指定会话的所有权限覆盖（会话销毁时调用）
 */
export function clearSessionOverrides(sessionId: string): void {
  sessionOverrides.delete(sessionId)
}

/**
 * 仅供测试使用：清除所有覆盖
 */
export function _resetAllOverridesForTest(): void {
  sessionOverrides.clear()
}
