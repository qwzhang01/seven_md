import type { AgentTool } from '@pi/agent'
import type { TSchema } from '@sinclair/typebox'

/**
 * 工具权限级别
 * - auto: 自动执行，无需确认（只读工具）
 * - confirm: 执行前需用户确认（写操作工具）
 * - deny: 禁止执行
 */
export type ToolPermission = 'auto' | 'confirm' | 'deny'

/**
 * 注册到工具注册表中的工具条目
 */
export interface RegisteredTool<TParameters extends TSchema = TSchema> {
  tool: AgentTool<TParameters>
  permission: ToolPermission
}
