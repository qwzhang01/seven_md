/**
 * 工具注册表 — 统一管理 Agent 工具的注册、查询和权限
 *
 * 权限门控（Permission Gating）：
 * - auto 工具：直接执行
 * - confirm 工具：执行前调用 confirmationHandler 等待用户决定
 * - deny 工具：直接抛错
 */

import type { AgentTool, AgentToolResult } from '@pi/agent'
import type { TSchema } from '@sinclair/typebox'
import type { RegisteredTool, ToolPermission } from './types'
import { getEffectivePermission } from './permissionModel'

const registry = new Map<string, RegisteredTool>()

// ─── Confirmation Handler 注入点 ─────────────────────────────────────

/**
 * Confirmation 请求载荷（由权限门控发起，由 useAgentStore 实现处理器）
 */
export interface ConfirmationRequest {
  toolName: string
  args: Record<string, unknown>
  sessionId: string
  /** 可选：用于 UI 预览的字符串（例如目标路径或前 1KB 内容） */
  preview?: string
}

/**
 * Confirmation Handler 接收请求并返回 Promise<approved>
 * - 解析为 true：用户同意
 * - 解析为 false：用户拒绝
 */
export type ConfirmationHandler = (req: ConfirmationRequest) => Promise<boolean>

/**
 * 当前活跃会话 ID 提供者
 * 由 useAgentStore 在初始化时注入，未注入时回退到 'default'
 */
type ActiveSessionProvider = () => string

let confirmationHandler: ConfirmationHandler | null = null
let activeSessionProvider: ActiveSessionProvider = () => 'default'

/**
 * 由 useAgentStore 在初始化时注入
 */
export function setConfirmationHandler(handler: ConfirmationHandler | null): void {
  confirmationHandler = handler
}

/**
 * 由 useAgentStore 在初始化时注入
 */
export function setActiveSessionProvider(provider: ActiveSessionProvider): void {
  activeSessionProvider = provider
}

// ─── Tool 权限包装 ───────────────────────────────────────────────────

function wrapToolWithPermission<TParameters extends TSchema, TDetails = unknown>(
  tool: AgentTool<TParameters, TDetails>,
): AgentTool<TParameters, TDetails> {
  const originalExecute = tool.execute.bind(tool)
  return {
    ...tool,
    async execute(toolCallId, params): Promise<AgentToolResult<TDetails>> {
      const sessionId = activeSessionProvider()
      const permission = getEffectivePermission(tool.name, sessionId)

      if (permission === 'deny') {
        throw new Error('工具已被禁用')
      }

      if (permission === 'confirm') {
        if (!confirmationHandler) {
          // 未注入处理器时直接放行（向后兼容启动期）
          return originalExecute(toolCallId, params)
        }
        const preview = buildPreview(tool.name, params as unknown as Record<string, unknown>)
        const approved = await confirmationHandler({
          toolName: tool.name,
          args: params as unknown as Record<string, unknown>,
          sessionId,
          preview,
        })
        if (!approved) {
          throw new Error('用户拒绝执行此操作')
        }
      }

      return originalExecute(toolCallId, params)
    },
  } as AgentTool<TParameters, TDetails>
}

/**
 * 为预览生成简短摘要（截断至 1KB）
 */
function buildPreview(toolName: string, args: Record<string, unknown>): string {
  try {
    const json = JSON.stringify(args, null, 2)
    if (json.length <= 1024) return json
    return json.slice(0, 1024) + '\n...（已截断）'
  } catch {
    return `[${toolName}] 无法序列化参数`
  }
}

// ─── 注册 / 查询 API ─────────────────────────────────────────────────

/**
 * 注册一个工具及其默认权限级别
 * 自动包装权限门控逻辑
 */
export function registerTool<TParameters extends TSchema, TDetails = unknown>(
  tool: AgentTool<TParameters, TDetails>,
  permission: ToolPermission,
): void {
  const wrapped = wrapToolWithPermission(tool)
  registry.set(tool.name, { tool: wrapped as AgentTool, permission })
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
 * 获取工具的默认权限级别（不考虑会话覆盖）
 */
export function getToolPermission(name: string): ToolPermission | undefined {
  return registry.get(name)?.permission
}

/**
 * 仅供测试使用：清空注册表
 */
export function _resetRegistryForTest(): void {
  registry.clear()
  confirmationHandler = null
  activeSessionProvider = () => 'default'
}
