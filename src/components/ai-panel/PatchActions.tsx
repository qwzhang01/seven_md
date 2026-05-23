/**
 * PatchActions — 应用/拒绝 Patch 操作按钮
 */

import { Check, X } from 'lucide-react'
import { useAgentStore } from '../../stores/useAgentStore'

export function PatchActions() {
  const { pendingPatches, applyPatch, rejectPatch, applyAllPatches, rejectAllPatches } = useAgentStore()

  if (pendingPatches.length === 0) return null

  return (
    <div className="space-y-2">
      {/* 单个 Patch 操作 */}
      {pendingPatches.length > 0 && (
        <div className="space-y-1">
          {pendingPatches.map((patch) => (
            <div key={patch.id} className="flex items-center justify-end gap-1">
              <span className="text-[9px] mr-auto truncate" style={{ color: 'var(--text-tertiary)' }}>
                {patch.type}{patch.description ? `: ${patch.description}` : ''}
              </span>
              <button
                className="flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] transition-colors"
                style={{
                  background: 'rgba(22, 163, 74, 0.1)',
                  color: 'var(--text-success, #16a34a)',
                  border: '1px solid rgba(22, 163, 74, 0.3)',
                  cursor: 'pointer',
                }}
                onClick={() => applyPatch(patch.id)}
              >
                <Check size={10} />
                应用
              </button>
              <button
                className="flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] transition-colors"
                style={{
                  background: 'rgba(220, 38, 38, 0.1)',
                  color: 'var(--text-error, #dc2626)',
                  border: '1px solid rgba(220, 38, 38, 0.3)',
                  cursor: 'pointer',
                }}
                onClick={() => rejectPatch(patch.id)}
              >
                <X size={10} />
                拒绝
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 批量操作 */}
      {pendingPatches.length > 1 && (
        <div className="flex items-center justify-end gap-2 pt-1" style={{ borderTop: '1px solid var(--border-primary)' }}>
          <button
            className="px-3 py-1 rounded text-[10px] font-medium transition-colors"
            style={{
              background: 'var(--accent)',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
            }}
            onClick={applyAllPatches}
          >
            全部应用
          </button>
          <button
            className="px-3 py-1 rounded text-[10px] font-medium transition-colors"
            style={{
              background: 'var(--bg-tertiary)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-primary)',
              cursor: 'pointer',
            }}
            onClick={rejectAllPatches}
          >
            全部拒绝
          </button>
        </div>
      )}
    </div>
  )
}
