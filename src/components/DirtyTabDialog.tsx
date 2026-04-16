import { useEffect, useRef } from 'react'
import { TabState } from '../types'
import { getTabDisplayName } from '../utils/tabUtils'

interface DirtyTabDialogProps {
  tab: TabState
  onSave: () => void
  onDiscard: () => void
  onCancel: () => void
}

/**
 * Dialog shown when closing a tab with unsaved changes.
 */
export function DirtyTabDialog({ tab, onSave, onDiscard, onCancel }: DirtyTabDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null)
  const fileName = getTabDisplayName(tab)

  useEffect(() => {
    // Focus cancel button by default (safest option)
    cancelRef.current?.focus()

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onCancel()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onCancel])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dirty-dialog-title"
      aria-describedby="dirty-dialog-desc"
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-sm w-full mx-4">
        <h2
          id="dirty-dialog-title"
          className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2"
        >
          Unsaved Changes
        </h2>
        <p
          id="dirty-dialog-desc"
          className="text-sm text-gray-600 dark:text-gray-400 mb-6"
        >
          <strong className="text-gray-800 dark:text-gray-200">{fileName}</strong> has unsaved changes.
          Do you want to save them before closing?
        </p>

        <div className="flex gap-2 justify-end">
          <button
            ref={cancelRef}
            onClick={onCancel}
            className="px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onDiscard}
            className="px-3 py-1.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
          >
            Don't Save
          </button>
          <button
            onClick={onSave}
            className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}

interface BatchDirtyDialogProps {
  dirtyTabs: TabState[]
  onSaveAll: () => void
  onDiscardAll: () => void
  onCancel: () => void
}

/**
 * Dialog shown when closing multiple dirty tabs at once.
 */
export function BatchDirtyDialog({ dirtyTabs, onSaveAll, onDiscardAll, onCancel }: BatchDirtyDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    cancelRef.current?.focus()
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onCancel()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onCancel])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      role="dialog"
      aria-modal="true"
      aria-labelledby="batch-dirty-title"
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-sm w-full mx-4">
        <h2
          id="batch-dirty-title"
          className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2"
        >
          Unsaved Changes
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
          {dirtyTabs.length} file{dirtyTabs.length > 1 ? 's have' : ' has'} unsaved changes:
        </p>
        <ul className="mb-6 space-y-1 max-h-32 overflow-y-auto">
          {dirtyTabs.map(tab => (
            <li key={tab.id} className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
              {getTabDisplayName(tab)}
            </li>
          ))}
        </ul>

        <div className="flex gap-2 justify-end">
          <button
            ref={cancelRef}
            onClick={onCancel}
            className="px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onDiscardAll}
            className="px-3 py-1.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
          >
            Don't Save
          </button>
          <button
            onClick={onSaveAll}
            className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
          >
            Save All
          </button>
        </div>
      </div>
    </div>
  )
}
