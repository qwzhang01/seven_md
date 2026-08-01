import { useCallback, useRef, useEffect } from 'react'
import { open } from '@tauri-apps/plugin-dialog'
import { useFileStore, useNotificationStore } from '../stores'
import { readFile, saveFile, createNewWindow as tauriCreateNewWindow } from '../tauriCommands'
import { addRecentDocument } from '../utils/recentDocuments'

export function useFileActions() {
  const { openTab, setTabDirty, getActiveTab } = useFileStore()
  const { addNotification } = useNotificationStore()

  const createNewWindow = useCallback(async () => {
    try {
      await tauriCreateNewWindow()
    } catch (e) {
      console.error('创建新窗口失败:', e)
      addNotification({ type: 'error', message: `创建窗口失败: ${e}`, autoClose: true, duration: 5000 })
    }
  }, [addNotification])

  const handleOpenFile = useCallback(async () => {
    try {
      const selected = await open({
        multiple: false,
        filters: [{ name: 'Markdown', extensions: ['md', 'markdown'] }],
      })
      if (selected) {
        const content = await readFile(selected as string)
        openTab(selected as string, content)
        addRecentDocument(selected as string, 'file')
      }
    } catch (e) {
      addNotification({ type: 'error', message: `打开文件失败: ${e}`, autoClose: true, duration: 5000 })
    }
  }, [openTab, addNotification])

  const handleSaveFile = useCallback(async () => {
    const activeTab = getActiveTab()
    if (!activeTab) return
    try {
      if (!activeTab.path) {
        const selected = await open({
          multiple: false,
          directory: false,
          title: '保存文件',
          filters: [{ name: 'Markdown', extensions: ['md', 'markdown'] }],
        })
        if (selected) {
          await saveFile(selected as string, activeTab.content)
          useFileStore.getState().updateTabPath(activeTab.id, selected as string)
          addNotification({ type: 'success', message: '文件已保存', autoClose: true, duration: 2000 })
        }
      } else {
        await saveFile(activeTab.path, activeTab.content)
        setTabDirty(activeTab.id, false)
        addNotification({ type: 'success', message: `${activeTab.name} 已保存`, autoClose: true, duration: 2000 })
      }
    } catch (e) {
      addNotification({ type: 'error', message: `保存失败: ${e}`, autoClose: true, duration: 5000 })
    }
  }, [getActiveTab, setTabDirty, addNotification])

  const handleSaveAs = useCallback(async () => {
    const activeTab = useFileStore.getState().getActiveTab()
    if (!activeTab) return
    try {
      const selected = await open({
        multiple: false,
        directory: false,
        title: '另存为',
        filters: [{ name: 'Markdown', extensions: ['md', 'markdown'] }],
      })
      if (selected) {
        await saveFile(selected as string, activeTab.content)
        useFileStore.getState().updateTabPath(activeTab.id, selected as string)
        addNotification({ type: 'success', message: '文件已保存', autoClose: true, duration: 2000 })
      }
    } catch (e) {
      addNotification({ type: 'error', message: `保存失败: ${e}`, autoClose: true, duration: 5000 })
    }
  }, [addNotification])

  const handleSaveAll = useCallback(async () => {
    const tabs = useFileStore.getState().tabs
    for (const tab of tabs) {
      if (tab.isDirty && tab.path) {
        await saveFile(tab.path, tab.content)
        useFileStore.getState().setTabDirty(tab.id, false)
      }
    }
    addNotification({ type: 'success', message: '所有文件已保存', autoClose: true, duration: 2000 })
  }, [addNotification])

  // Stable refs so the Tauri menu listener (dep=[]) can always call latest
  const handleOpenFileRef = useRef(handleOpenFile)
  const handleSaveFileRef = useRef(handleSaveFile)
  const openTabRef = useRef(openTab)
  const addNotificationRef = useRef(addNotification)
  const createNewWindowRef = useRef(createNewWindow)
  useEffect(() => { handleOpenFileRef.current = handleOpenFile }, [handleOpenFile])
  useEffect(() => { handleSaveFileRef.current = handleSaveFile }, [handleSaveFile])
  useEffect(() => { openTabRef.current = openTab }, [openTab])
  useEffect(() => { addNotificationRef.current = addNotification }, [addNotification])
  useEffect(() => { createNewWindowRef.current = createNewWindow }, [createNewWindow])

  return {
    createNewWindow,
    handleOpenFile,
    handleSaveFile,
    handleSaveAs,
    handleSaveAll,
    // refs for use in dep=[] listeners
    handleOpenFileRef,
    handleSaveFileRef,
    openTabRef,
    addNotificationRef,
    createNewWindowRef,
  }
}
