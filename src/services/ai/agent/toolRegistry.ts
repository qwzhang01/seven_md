/**
 * 工具注册表 — 统一管理 Agent 工具的注册、查询和权限
 */

import type { AgentTool } from '@pi/agent'
import type { TSchema } from 'typebox'
import type { RegisteredTool, ToolPermission } from './types'

const registry = new Map<string, RegisteredTool>()

/**
 * 注册一个工具及其权限级别
 */
export function registerTool<TParameters extends TSchema>(
  tool: AgentTool<TParameters>,
  permission: ToolPermission,
): void {
  registry.set(tool.name, { tool: tool as AgentTool, permission })
}

/**
 * 通过名称获取已注册的工具
 */
export function getTool(name: string): AgentTool | undefined {
  return registry.get(name)?.tool
}

/**
 * 获取所有已注册的 AgentTool 数组
 * 可直接传入 Pi Agent 构造器的 tools 选项
 */
export function getAllTools(): AgentTool[] {
  return Array.from(registry.values()).map((entry) => entry.tool)
}

/**
 * 获取工具的权限级别
 */
export function getToolPermission(name: string): ToolPermission | undefined {
  return registry.get(name)?.permission
}
