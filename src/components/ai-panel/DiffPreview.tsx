/**
 * DiffPreview — 展示 pending patches 的差异预览
 */

import type { MarkdownPatch } from '../../services/ai/agent/patchProtocol'

interface Props {
  patches: MarkdownPatch[]
}

export function DiffPreview({ patches }: Props) {
  const sorted = [...patches].sort((a, b) => a.createdAt - b.createdAt)

  return (
    <div className="space-y-2">
      <div className="text-[10px] font-medium" style={{ color: 'var(--text-secondary)' }}>
        待确认修改 ({patches.length})
      </div>
      {sorted.map((patch) => (
        <PatchDiff key={patch.id} patch={patch} />
      ))}
    </div>
  )
}

function PatchDiff({ patch }: { patch: MarkdownPatch }) {
  return (
    <div
      className="rounded overflow-hidden text-[10px]"
      style={{ border: '1px solid var(--border-primary)' }}
    >
      {/* Header */}
      <div
        className="px-2 py-1 flex items-center justify-between"
        style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
      >
        <span className="font-mono">{patch.type}</span>
        {patch.description && (
          <span className="truncate ml-2" style={{ color: 'var(--text-tertiary)' }}>
            {patch.description}
          </span>
        )}
      </div>

      {/* Diff content */}
      <div className="px-2 py-1.5 font-mono" style={{ fontSize: '9px' }}>
        {patch.type === 'replace_selection' && (
          <div className="space-y-1">
            <div
              className="px-1.5 py-0.5 rounded line-through"
              style={{ background: 'rgba(220, 38, 38, 0.1)', color: 'var(--text-error, #dc2626)' }}
            >
              {truncateText(`[${patch.from}:${patch.to}]`, 100)}
            </div>
            <div
              className="px-1.5 py-0.5 rounded"
              style={{ background: 'rgba(22, 163, 74, 0.1)', color: 'var(--text-success, #16a34a)' }}
            >
              + {truncateText(patch.newText, 200)}
            </div>
          </div>
        )}

        {patch.type === 'insert_at_cursor' && (
          <div
            className="px-1.5 py-0.5 rounded"
            style={{ background: 'rgba(22, 163, 74, 0.1)', color: 'var(--text-success, #16a34a)' }}
          >
            + {truncateText(patch.text, 200)}
          </div>
        )}

        {patch.type === 'replace_document' && (
          <div style={{ color: 'var(--text-tertiary)' }}>
            替换整个文档（{patch.newContent.split('\n').length} 行）
          </div>
        )}

        {patch.type === 'insert_after_heading' && (
          <div className="space-y-1">
            <div style={{ color: 'var(--text-tertiary)' }}>
              在标题 "{'#'.repeat(patch.headingLevel)} {patch.headingText}" 后插入:
            </div>
            <div
              className="px-1.5 py-0.5 rounded"
              style={{ background: 'rgba(22, 163, 74, 0.1)', color: 'var(--text-success, #16a34a)' }}
            >
              + {truncateText(patch.content, 200)}
            </div>
          </div>
        )}

        {patch.type === 'append_section' && (
          <div className="space-y-1">
            <div style={{ color: 'var(--text-tertiary)' }}>追加到文档末尾:</div>
            <div
              className="px-1.5 py-0.5 rounded"
              style={{ background: 'rgba(22, 163, 74, 0.1)', color: 'var(--text-success, #16a34a)' }}
            >
              + {truncateText(patch.content, 200)}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function truncateText(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text
  return text.slice(0, maxLen) + '...'
}
