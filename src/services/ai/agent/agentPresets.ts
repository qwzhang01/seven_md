/**
 * Agent Presets — 内置预设清单 + 事件总线
 *
 * 数据驱动：每个预设是 prompt + 选区要求的简单结构。
 * 触发方式：dispatchAgentRunPreset(presetId) 发出 CustomEvent。
 * 处理方：AgentMode 监听并启动 Agent。
 */

import type { AgentPreset, AgentRunPresetDetail } from '../../../types'

export type { AgentPreset, AgentRunPresetDetail }

// ─── Built-in Presets ───────────────────────────────────────────────

export const BUILTIN_PRESETS: AgentPreset[] = [
  {
    id: 'organize-structure',
    label: '整理结构',
    description: '调整标题层级与段落组织，让文档更有条理',
    icon: 'List',
    prompt: '请阅读当前文档，调整标题层级和段落组织，使文档结构清晰。请使用最小修改原则，不要改变原有内容的核心含义。',
    requiresSelection: false,
    category: 'editor',
  },
  {
    id: 'generate-toc',
    label: '生成目录',
    description: '基于当前文档标题生成目录',
    icon: 'List',
    prompt: '请使用 generate_toc 工具为当前文档生成目录，并将其插入到光标位置。',
    requiresSelection: false,
    category: 'editor',
  },
  {
    id: 'expand-selection',
    label: '扩写选区',
    description: '将选中的内容扩写为更详细的段落',
    icon: 'PenLine',
    prompt: '请扩写选中的内容，使其更加详细、生动，但保持原意。完成后用 replace_selection 替换选区。',
    requiresSelection: true,
    category: 'editor',
  },
  {
    id: 'draft-to-article',
    label: '草稿转正文',
    description: '将草稿格式整理为可发表的正文',
    icon: 'FileCode',
    prompt: '当前文档是一份草稿。请把它整理成结构完整、表达正式的正文：补充段落过渡、修正错别字、规范标点。',
    requiresSelection: false,
    category: 'editor',
  },
  {
    id: 'validate-links',
    label: '检查链接',
    description: '检查文档中所有链接的有效性',
    icon: 'Link',
    prompt: '请使用 validate_markdown_links 工具检查当前文档中的所有链接，并把检查结果以列表形式告诉我。',
    requiresSelection: false,
    category: 'editor',
  },
  {
    id: 'generate-readme',
    label: '生成 README',
    description: '为当前工作区生成 README.md',
    icon: 'FilePlus',
    prompt: '请使用 list_workspace_files 工具浏览工作区结构，然后用 create_markdown_file 在工作区根目录创建 README.md，内容包含项目概述、目录结构、关键文件说明。如果 README.md 已存在则提示用户。',
    requiresSelection: false,
    category: 'workspace',
  },
]

/**
 * 根据 id 查找预设
 */
export function findPreset(id: string): AgentPreset | undefined {
  return BUILTIN_PRESETS.find((p) => p.id === id)
}

// ─── 事件总线 ───────────────────────────────────────────────────────

export const AGENT_RUN_PRESET_EVENT = 'agent:run-preset'

// ─── 事件总线 ───────────────────────────────────────────────────────
export function dispatchAgentRunPreset(presetId: string): void {
  window.dispatchEvent(
    new CustomEvent<AgentRunPresetDetail>(AGENT_RUN_PRESET_EVENT, {
      detail: { presetId },
    }),
  )
}
