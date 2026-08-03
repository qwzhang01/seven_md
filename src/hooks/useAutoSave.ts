import { useEffect, useRef } from 'react'
import { useFileStore } from '../stores/useFileStore'
import { useSettingsStore } from '../stores/useSettingsStore'
import { saveFile } from '../tauriCommands'

/**
 * 自动保存 hook。
 * 当活动标签页内容变更（isDirty 变为 true）时，
 * 在 autoSaveDelay 毫秒后自动保存到磁盘。
 * 仅对已有关联文件路径的标签页生效；未命名文件需手动保存。
 */
export function useAutoSave() {
  const { tabs, activeTabId, setTabDirty } = useFileStore()
  const { autoSave, autoSaveDelay } = useSettingsStore()
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const activeTab = tabs.find((t) => t.id === activeTabId)

  useEffect(() => {
    if (!autoSave || !activeTab || !activeTab.path || !activeTab.isDirty) {
      return
    }

    // 清除上一次的防抖计时器
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }

    const { id: tabId, path: filePath, content: fileContent } = activeTab

    // 设置新的防抖计时器
    timerRef.current = setTimeout(async () => {
      try {
        await saveFile(filePath, fileContent)
        setTabDirty(tabId, false)
      } catch (e) {
        console.error('自动保存失败:', e)
      }
    }, autoSaveDelay)

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }
  }, [autoSave, autoSaveDelay, activeTab?.id, activeTab?.isDirty, activeTab?.content, setTabDirty])
}
