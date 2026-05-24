/**
 * AgentPresetBar — Agent 预设栏
 * 横向滚动的预设按钮列表，点击直接发送预设 prompt
 */

import { List, PenLine, FileCode, Link, FilePlus } from 'lucide-react'
import { BUILTIN_PRESETS, type AgentPreset } from '../../services/ai/agent/agentPresets'
import { useAgentStore } from '../../stores/useAgentStore'
import { useAIStore } from '../../stores/useAIStore'

const ICON_MAP = {
  List,
  PenLine,
  FileCode,
  Link,
  FilePlus,
}

interface PresetChipProps {
  preset: AgentPreset
  disabled: boolean
  onClick: () => void
}

function PresetChip({ preset, disabled, onClick }: PresetChipProps) {
  const Icon = preset.icon ? ICON_MAP[preset.icon as keyof typeof ICON_MAP] : null
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={preset.description ?? preset.label}
      className="flex-shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] transition-colors"
      style={{
        background: 'var(--bg-tertiary)',
        color: 'var(--text-secondary)',
        border: '1px solid var(--border-primary)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {Icon && <Icon size={11} />}
      <span>{preset.label}</span>
    </button>
  )
}

export function AgentPresetBar() {
  const isRunning = useAgentStore((s) => s.isRunning)
  const startAgent = useAgentStore((s) => s.startAgent)
  const selectedText = useAIStore((s) => s.selectedText)

  const handleClick = (preset: AgentPreset) => {
    if (isRunning) return
    if (preset.requiresSelection && (!selectedText || selectedText.trim().length === 0)) {
      // 简单内联提示（未来可接入 toast 系统）
      alert('请先选中文本')
      return
    }
    startAgent(preset.prompt)
  }

  return (
    <div
      className="flex items-center gap-1.5 overflow-x-auto px-3 py-1.5 scrollbar-thin"
      style={{ borderBottom: '1px solid var(--border-primary)' }}
    >
      {BUILTIN_PRESETS.map((preset) => (
        <PresetChip
          key={preset.id}
          preset={preset}
          disabled={isRunning}
          onClick={() => handleClick(preset)}
        />
      ))}
    </div>
  )
}
