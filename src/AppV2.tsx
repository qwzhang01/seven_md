/**
 * Seven Markdown V2 - 新版主布局
 * VS Code 风格: TitleBar + Toolbar + [ActivityBar|Sidebar] + [Editor|Preview] + StatusBar
 */

import { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import { open } from '@tauri-apps/plugin-dialog'
import { readText as clipboardReadText, writeText as clipboardWriteText } from '@tauri-apps/plugin-clipboard-manager'
import { listen } from '@tauri-apps/api/event'
import { invoke } from '@tauri-apps/api/core'
import { getCurrentWindow } from '@tauri-apps/api/window'

// Keyboard shortcuts hook
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import type { ShortcutConfig } from './hooks/useKeyboardShortcuts'
import { useIsMobile } from './hooks/useMediaQuery'

// V2 Components
import { TitleBar } from './components/titlebar-v2/TitleBar'
import { TabBar } from './components/titlebar-v2/TabBar'
import { Toolbar } from './components/toolbar-v2/Toolbar'
import { ActivityBar } from './components/activitybar-v2/ActivityBar'
import { Sidebar } from './components/sidebar-v2/Sidebar'
import { CommandPalette } from './components/cmd-palette/CommandPalette'
import { AIPanel } from './components/ai-panel/AIPanel'
import { NotificationContainer } from './components/notification-v2/NotificationContainer'
import { DirtyTabModal } from './components/modal-v2/DirtyTabModal'
import { StatusBar as StatusBarV2 } from './components/statusbar-v2/StatusBar'
import { Gutter, EditorPaneV2, FindReplaceBar, PreviewPaneV2 } from './components/editor-v2'

import { ShortcutReferenceDialog } from './components/dialogs/ShortcutReferenceDialog'
import { AboutDialog } from './components/dialogs/AboutDialog'
import { WelcomeDialog } from './components/dialogs/WelcomeDialog'
import { WechatPanel } from './wechat'

import { ErrorBoundary } from './components/ErrorBoundary'
import { DefaultContextMenu } from './components/shared/DefaultContextMenu'

// Stores
import { useUIStore, useFileStore, useThemeStore, useNotificationStore, useEditorStore, useWorkspaceStore, useAIStore } from './stores'
import type { ThemeId } from './stores/useThemeStore'
import { readFile, saveFile, createNewWindow as tauriCreateNewWindow } from './tauriCommands'

// ---- Recent Documents Utility ----
const RECENT_DOCS_KEY = 'recent-documents'
const MAX_RECENT_DOCS = 10

function addRecentDocument(path: string, type: 'file' | 'folder') {
  try {
    const name = path.split('/').pop() || path
    const stored = localStorage.getItem(RECENT_DOCS_KEY)
    const existing: Array<{ path: string; name: string; lastOpened: number; type: string }> = stored
      ? JSON.parse(stored)
      : []
    // Remove duplicate
    const filtered = existing.filter((f) => f.path !== path)
    // Add to top
    const updated = [{ path, name, lastOpened: Date.now(), type }, ...filtered].slice(0, MAX_RECENT_DOCS)
    localStorage.setItem(RECENT_DOCS_KEY, JSON.stringify(updated))
    // Sync paths to Rust backend so the native menu is updated on next launch
    const paths = updated.map((f) => f.path)
    invoke('update_recent_menu', { paths }).catch((e) => console.warn('update_recent_menu failed:', e))
  } catch (e) {
    console.error('Failed to save recent document', e)
  }
}

// Commands registration
import { registerAllCommands } from './commands'

const MIN_EDITOR_WIDTH = 200
const MAX_EDITOR_WIDTH_RATIO = 0.85

function AppV2() {
  const ui = useUIStore()
  const { tabs, openTab, closeTab, updateTabContent, setTabDirty, getActiveTab, switchToNextTab, switchToPrevTab } = useFileStore()
  const theme = useThemeStore((s) => s.currentTheme)
  const { addNotification } = useNotificationStore()
  const editorStore = useEditorStore()
  const isMobile = useIsMobile()

  // 移动端侧边栏 overlay 状态
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  // 全局兜底右键菜单状态
  const [defaultContextMenu, setDefaultContextMenu] = useState<{ x: number; y: number } | null>(null)

  // 全局 contextmenu 拦截：阻止浏览器默认右键菜单
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      // 始终阻止浏览器默认右键菜单
      e.preventDefault()

      // 如果事件已被子组件处理（通过自定义标记），不显示兜底菜单
      if ((e as any).__contextMenuHandled) return

      // 检查目标是否在"静默区域"（工具栏、状态栏、活动栏）
      const target = e.target as HTMLElement
      const isSilentZone = !!(
        target.closest('[data-component="activitybar"]') ||
        target.closest('[data-component="toolbar"]') ||
        target.closest('[data-component="statusbar"]')
      )

      if (!isSilentZone) {
        setDefaultContextMenu({ x: e.clientX, y: e.clientY })
      }
    }
    document.addEventListener('contextmenu', handler)
    return () => document.removeEventListener('contextmenu', handler)
  }, [])

  const activeTab = getActiveTab()
  const activeContent = activeTab?.content ?? ''

  // 防抖 refreshTree 用的 timer ref
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Editor pixel width from store (null = flex:1, auto split)
  const editorWidth = ui.editorWidth
  const setEditorWidth = ui.setEditorWidth

  // Dirty tab modal
  const [dirtyTabId, setDirtyTabId] = useState<string | null>(null)
  const dirtyTab = dirtyTabId ? tabs.find((t) => t.id === dirtyTabId) : null

  // 创建新窗口
  const createNewWindow = useCallback(async () => {
    try {
      await tauriCreateNewWindow()
    } catch (e) {
      console.error('创建新窗口失败:', e)
      addNotification({ type: 'error', message: `创建窗口失败: ${e}`, autoClose: true, duration: 5000 })
    }
  }, [addNotification])

  // Open file
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

  // Save file
  const handleSaveFile = useCallback(async () => {
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
  }, [activeTab, setTabDirty, addNotification])

  // Stable refs so the menu-listener useEffect (dep=[]) can always call the
  // latest version of these callbacks without re-registering listeners.
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

  // 监听原生菜单事件 + 文件系统变更事件
  // IMPORTANT: dep=[] so listeners are registered exactly once.
  // Callbacks are accessed via refs to always use the latest version.
  useEffect(() => {
    const unlisteners: Array<() => void> = []

    const setup = async () => {
      // --- 文件系统变更 ---
      unlisteners.push(await listen('fs-watch:changed', () => {
        if (refreshTimerRef.current) {
          clearTimeout(refreshTimerRef.current)
        }
        refreshTimerRef.current = setTimeout(async () => {
          // 刷新目录树
          useWorkspaceStore.getState().refreshTree()

          // 热重载已打开的 Tab 文件内容
          const { tabs } = useFileStore.getState()
          const tabsWithPath = tabs.filter((t) => t.path)

          // 限制并发数量为 5
          const BATCH_SIZE = 5
          for (let i = 0; i < tabsWithPath.length; i += BATCH_SIZE) {
            const batch = tabsWithPath.slice(i, i + BATCH_SIZE)
            await Promise.allSettled(
              batch.map(async (tab) => {
                if (!tab.path) return
                try {
                  const newContent = await readFile(tab.path)
                  if (newContent === tab.content) return // 内容没变，跳过

                  if (!tab.isDirty) {
                    // 没有未保存修改：静默更新
                    useFileStore.getState().reloadTabContent(tab.id, newContent)
                  } else {
                    // 有未保存修改：标记外部冲突
                    useFileStore.getState().markTabExternalConflict(tab.id, true)
                  }
                } catch {
                  // 文件可能已被删除，忽略读取错误
                }
              })
            )
          }
        }, 1000)
      }))

      // --- File 菜单事件 ---
      unlisteners.push(await listen('menu-new-file', () => openTabRef.current(null, '')))
      unlisteners.push(await listen('menu-new-window', () => createNewWindowRef.current()))
      unlisteners.push(await listen('menu-open-file', () => handleOpenFileRef.current()))
      unlisteners.push(await listen('menu-open-folder', async () => {
        await useWorkspaceStore.getState().openFolder()
        const folderPath = useWorkspaceStore.getState().folderPath
        if (folderPath) {
          addRecentDocument(folderPath, 'folder')
        }
      }))
      unlisteners.push(await listen('menu-close-folder', () => {
        useWorkspaceStore.getState().closeFolder()
      }))
      unlisteners.push(await listen('menu-open-folder-new-window', async () => {
        // 弹出文件夹选择器，选择后在新窗口打开
        try {
          const { openFolderDialog } = await import('./tauriCommands')
          const selectedPath = await openFolderDialog()
          if (selectedPath) {
            await tauriCreateNewWindow(selectedPath)
          }
        } catch (e) {
          addNotificationRef.current({ type: 'error', message: `打开文件夹失败: ${e}`, autoClose: true, duration: 5000 })
        }
      }))
      unlisteners.push(await listen('menu-clear-recent', () => {
        localStorage.removeItem('recent-documents')
        // Sync cleared list to backend
        invoke('update_recent_menu', { paths: [] }).catch(() => {})
        addNotificationRef.current({ type: 'info', message: '已清除最近文档', autoClose: true, duration: 2000 })
      }))
      // Handle native menu click on a recent document item
      unlisteners.push(await listen<string>('menu-open-recent-doc', async (event) => {
        const path = event.payload
        if (!path) return
        // Look up the type from localStorage recent-documents list
        let itemType: 'file' | 'folder' = 'file'
        try {
          const stored = localStorage.getItem('recent-documents')
          if (stored) {
            const docs = JSON.parse(stored) as Array<{ path: string; type?: 'file' | 'folder' }>
            const found = docs.find((d) => d.path === path)
            if (found?.type === 'folder') itemType = 'folder'
          }
        } catch {
          // ignore parse errors, default to 'file'
        }
        try {
          if (itemType === 'folder') {
            const { readDirectory, startFsWatch } = await import('./tauriCommands')
            const nodes = await readDirectory(path)
            const newTree = new Map<string, import('./types').FileTreeNode[]>()
            newTree.set(path, nodes)
            useWorkspaceStore.setState({
              folderPath: path,
              folderTree: newTree,
              expandedDirs: new Set(),
              rootNodes: nodes,
              isLoading: false,
            })
            await startFsWatch(path)
            addRecentDocument(path, 'folder')
          } else {
            const content = await readFile(path)
            openTabRef.current(path, content)
            addRecentDocument(path, 'file')
          }
        } catch (err) {
          addNotificationRef.current({ type: 'error', message: `打开最近文档失败: ${err}`, autoClose: true, duration: 5000 })
        }
      }))
      unlisteners.push(await listen('menu-save', () => handleSaveFileRef.current()))
      unlisteners.push(await listen('menu-save-all', () => {
        // 保存所有已修改的文件
        const tabs = useFileStore.getState().tabs
        tabs.forEach(async (tab) => {
          if (tab.isDirty && tab.path) {
            await saveFile(tab.path, tab.content)
            useFileStore.getState().setTabDirty(tab.id, false)
          }
        })
        addNotificationRef.current({ type: 'success', message: '所有文件已保存', autoClose: true, duration: 2000 })
      }))
      unlisteners.push(await listen('menu-save-as', () => {
        // 另存为：与 handleSaveFile 类似但总是弹出保存对话框
        const activeTab = useFileStore.getState().getActiveTab()
        if (!activeTab) return
        open({
          multiple: false,
          directory: false,
          title: '另存为',
          filters: [{ name: 'Markdown', extensions: ['md', 'markdown'] }],
        }).then(async (selected) => {
          if (selected) {
            await saveFile(selected as string, activeTab.content)
            useFileStore.getState().updateTabPath(activeTab.id, selected as string)
            addNotificationRef.current({ type: 'success', message: '文件已保存', autoClose: true, duration: 2000 })
          }
        }).catch((e) => {
          addNotificationRef.current({ type: 'error', message: `保存失败: ${e}`, autoClose: true, duration: 5000 })
        })
      }))
      unlisteners.push(await listen('menu-export-pdf', () => {
        window.dispatchEvent(new CustomEvent('app:export-pdf'))
      }))
      unlisteners.push(await listen('menu-export-html', () => {
        window.dispatchEvent(new CustomEvent('app:export-html'))
      }))
      unlisteners.push(await listen('menu-close-tab', () => {
        const tab = useFileStore.getState().getActiveTab()
        if (tab) {
          const tabEl = document.querySelector(`[data-tab-id="${tab.id}"] .tab-close`)
          if (tabEl) {
            (tabEl as HTMLElement).click()
          } else {
            // fallback: 直接调用 closeTab
            useFileStore.getState().closeTab(tab.id)
          }
        }
      }))
      unlisteners.push(await listen('menu-quit', async () => {
        const { getCurrentWindow } = await import('@tauri-apps/api/window')
        await getCurrentWindow().close()
      }))

      // --- Edit 菜单事件 ---
      unlisteners.push(await listen('menu-undo', () => {
        window.dispatchEvent(new CustomEvent('editor:undo'))
      }))
      unlisteners.push(await listen('menu-redo', () => {
        window.dispatchEvent(new CustomEvent('editor:redo'))
      }))
      unlisteners.push(await listen('menu-cut', () => {
        const el = document.activeElement
        if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
          const start = el.selectionStart ?? 0
          const end = el.selectionEnd ?? 0
          if (start !== end) {
            clipboardWriteText(el.value.slice(start, end))
            const nativeSetter = Object.getOwnPropertyDescriptor(
              el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype, 'value'
            )?.set
            const newValue = el.value.slice(0, start) + el.value.slice(end)
            nativeSetter ? nativeSetter.call(el, newValue) : (el.value = newValue)
            el.selectionStart = el.selectionEnd = start
            el.dispatchEvent(new Event('input', { bubbles: true }))
          }
          return
        }
        window.dispatchEvent(new CustomEvent('editor:cut'))
      }))
      unlisteners.push(await listen('menu-copy', () => {
        const el = document.activeElement
        if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
          const start = el.selectionStart ?? 0
          const end = el.selectionEnd ?? 0
          if (start !== end) {
            clipboardWriteText(el.value.slice(start, end))
          }
          return
        }
        window.dispatchEvent(new CustomEvent('editor:copy'))
      }))
      unlisteners.push(await listen('menu-paste', () => {
        const el = document.activeElement
        if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
          clipboardReadText().then((text) => {
            if (!text) return
            const target = document.activeElement
            if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)) return
            const start = target.selectionStart ?? 0
            const end = target.selectionEnd ?? 0
            const nativeSetter = Object.getOwnPropertyDescriptor(
              target instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype, 'value'
            )?.set
            const newValue = target.value.slice(0, start) + text + target.value.slice(end)
            nativeSetter ? nativeSetter.call(target, newValue) : (target.value = newValue)
            target.selectionStart = target.selectionEnd = start + text.length
            target.dispatchEvent(new Event('input', { bubbles: true }))
          })
          return
        }
        window.dispatchEvent(new CustomEvent('editor:paste'))
      }))
      unlisteners.push(await listen('menu-paste-match-style', () => {
        const el = document.activeElement
        if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
          clipboardReadText().then((text) => {
            if (!text) return
            const target = document.activeElement
            if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)) return
            const start = target.selectionStart ?? 0
            const end = target.selectionEnd ?? 0
            const nativeSetter = Object.getOwnPropertyDescriptor(
              target instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype, 'value'
            )?.set
            const newValue = target.value.slice(0, start) + text + target.value.slice(end)
            nativeSetter ? nativeSetter.call(target, newValue) : (target.value = newValue)
            target.selectionStart = target.selectionEnd = start + text.length
            target.dispatchEvent(new Event('input', { bubbles: true }))
          })
          return
        }
        window.dispatchEvent(new CustomEvent('editor:paste-match-style'))
      }))
      unlisteners.push(await listen('menu-select-all', () => {
        const el = document.activeElement
        if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
          el.select()
          return
        }
        window.dispatchEvent(new CustomEvent('editor:select-all'))
      }))
      unlisteners.push(await listen('menu-find', () => {
        useUIStore.getState().setFindReplaceOpen(true)
        useUIStore.getState().setFindReplaceMode('find')
      }))
      unlisteners.push(await listen('menu-replace', () => {
        useUIStore.getState().setFindReplaceOpen(true)
        useUIStore.getState().setFindReplaceMode('replace')
      }))
      unlisteners.push(await listen('menu-find-next', () => {
        window.dispatchEvent(new CustomEvent('editor:find-next'))
      }))
      unlisteners.push(await listen('menu-find-previous', () => {
        window.dispatchEvent(new CustomEvent('editor:find-previous'))
      }))
      unlisteners.push(await listen('menu-clear-format', () => {
        window.dispatchEvent(new CustomEvent('editor:clear-format'))
      }))

      // --- View 菜单事件 ---
      unlisteners.push(await listen('menu-command-palette', () => {
        useUIStore.getState().toggleCommandPalette()
      }))
      unlisteners.push(await listen('menu-toggle-ai-panel', () => {
        const aiStore = useAIStore.getState()
        aiStore.setOpen(!aiStore.isOpen)
      }))
      unlisteners.push(await listen('menu-toggle-sidebar', () => {
        useUIStore.getState().toggleSidebar()
      }))
      unlisteners.push(await listen('menu-toggle-outline', () => {
        useUIStore.getState().setActiveSidebarPanel('outline')
      }))
      unlisteners.push(await listen('menu-toggle-explorer', () => {
        useUIStore.getState().setActiveSidebarPanel('explorer')
      }))
      unlisteners.push(await listen('menu-show-line-numbers', () => {
        // 切换行号显示
        window.dispatchEvent(new CustomEvent('editor:toggle-line-numbers'))
      }))
      unlisteners.push(await listen('menu-show-minimap', () => {
        // 切换迷你地图显示
        window.dispatchEvent(new CustomEvent('editor:toggle-minimap'))
      }))
      unlisteners.push(await listen('menu-word-wrap', () => {
        // 切换自动换行
        window.dispatchEvent(new CustomEvent('editor:toggle-word-wrap'))
      }))
      unlisteners.push(await listen('menu-zoom-in', () => {
        useUIStore.getState().zoomIn()
      }))
      unlisteners.push(await listen('menu-zoom-out', () => {
        useUIStore.getState().zoomOut()
      }))
      unlisteners.push(await listen('menu-reset-zoom', () => {
        useUIStore.getState().setZoomLevel(14)
      }))
      unlisteners.push(await listen('menu-view-editor-only', () => {
        useUIStore.getState().setViewMode('editor-only')
      }))
      unlisteners.push(await listen('menu-view-preview-only', () => {
        useUIStore.getState().setViewMode('preview-only')
      }))
      unlisteners.push(await listen('menu-view-split', () => {
        useUIStore.getState().setViewMode('split')
      }))
      unlisteners.push(await listen('menu-toggle-fullscreen', async () => {
        const { getCurrentWindow } = await import('@tauri-apps/api/window')
        const win = getCurrentWindow()
        const isFullscreen = await win.isFullscreen()
        await win.setFullscreen(!isFullscreen)
      }))
      unlisteners.push(await listen('menu-next-tab', () => {
        useFileStore.getState().switchToNextTab()
      }))
      unlisteners.push(await listen('menu-prev-tab', () => {
        useFileStore.getState().switchToPrevTab()
      }))

      // --- Insert 菜单事件 ---
      const insertMap: Record<string, string> = {
        'menu-insert-heading': '# ',
        'menu-insert-h1': '# ',
        'menu-insert-h2': '## ',
        'menu-insert-h3': '### ',
        'menu-insert-h4': '#### ',
        'menu-insert-h5': '##### ',
        'menu-insert-h6': '###### ',
        'menu-insert-bold': '**加粗文本**',
        'menu-insert-italic': '*斜体文本*',
        'menu-insert-strikethrough': '~~删除线文本~~',
        'menu-insert-inline-code': '`代码`',
        'menu-insert-code-block': '```language\n\n```',
        'menu-insert-link': '[文本](url)',
        'menu-insert-image': '![描述](url)',
        'menu-insert-table': '| 列1 | 列2 | 列3 |\n|------|------|------|\n| | | |',
        'menu-insert-hr': '\n---\n',
        'menu-insert-ul': '- ',
        'menu-insert-ol': '1. ',
        'menu-insert-task': '- [ ] ',
        'menu-insert-quote': '> ',
        'menu-insert-footnote': '[^1]\n\n[^1]: 脚注内容',
        'menu-insert-details': '<details>\n<summary>点击展开</summary>\n\n内容\n</details>',
      }
      for (const [event, detail] of Object.entries(insertMap)) {
        unlisteners.push(await listen(event, () => {
          window.dispatchEvent(new CustomEvent('editor:insert', { detail }))
        }))
      }

      // --- Format 菜单事件 ---
      const formatMap: Record<string, string> = {
        'menu-format-bold': '**',
        'menu-format-italic': '*',
        'menu-format-strikethrough': '~~',
        'menu-format-h1': '# ',
        'menu-format-h2': '## ',
        'menu-format-h3': '### ',
        'menu-format-h4': '#### ',
        'menu-format-h5': '##### ',
        'menu-format-h6': '###### ',
        'menu-format-code': '`',
        'menu-format-link': '[](url)',
      }
      for (const [event, detail] of Object.entries(formatMap)) {
        unlisteners.push(await listen(event, () => {
          window.dispatchEvent(new CustomEvent('editor:insert', { detail }))
        }))
      }

      // --- Theme 菜单事件 ---
      unlisteners.push(await listen<string>('menu-theme-change', (event) => {
        useThemeStore.getState().setTheme(event.payload as ThemeId)
      }))

      // --- Help 菜单事件 ---
      unlisteners.push(await listen('menu-welcome', () => {
        useUIStore.getState().setDialogType('welcome')
      }))
      unlisteners.push(await listen('menu-markdown-guide', () => {
        window.open('https://www.markdownguide.org/', '_blank')
      }))
      unlisteners.push(await listen('menu-keyboard-shortcuts', () => {
        useUIStore.getState().setDialogType('shortcut-reference')
      }))
      unlisteners.push(await listen('menu-about', () => {
        useUIStore.getState().setDialogType('about')
      }))
      unlisteners.push(await listen('menu-check-update', async () => {
        try {
          addNotificationRef.current({ type: 'info', message: '正在检查更新...', autoClose: false, duration: 0 })
          // 获取当前版本
          const currentVersion = '0.1.0'
          // 简单实现：显示当前版本信息
          // 后期可接入真正的版本检查 API
          addNotificationRef.current({
            type: 'success',
            message: `当前已是最新版本 v${currentVersion}`,
            autoClose: true,
            duration: 3000
          })
        } catch (e) {
          addNotificationRef.current({ type: 'error', message: `检查更新失败: ${e}`, autoClose: true, duration: 5000 })
        }
      }))

      // --- 全屏状态检测 ---
      // 初始化时检测全屏状态（支持 HMR 热重载场景）
      const appWindow = getCurrentWindow()
      appWindow.isFullscreen().then((fs) => {
        useUIStore.getState().setIsFullscreen(fs)
      }).catch(() => {})

      // 监听 resize 事件，延迟检测全屏状态变化
      unlisteners.push(await listen('tauri://resize', () => {
        setTimeout(() => {
          appWindow.isFullscreen().then((fs) => {
            useUIStore.getState().setIsFullscreen(fs)
          }).catch(() => {})
        }, 50)
      }))
    }

    setup()

    // Task 4.1-4.3: 窗口初始化时读取 URL 参数，自动打开文件夹
    // 放在 setup() 之后确保所有事件监听都已注册
    const urlParams = new URLSearchParams(window.location.search)
    const folderParam = urlParams.get('folder')
    if (folderParam) {
      const decodedPath = decodeURIComponent(folderParam)
      // 延迟一帧确保 store 已就绪
      requestAnimationFrame(() => {
        useWorkspaceStore.getState().openFolderByPath(decodedPath)
      })
    }

    return () => {
      unlisteners.forEach((fn) => fn())
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current)
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Handle export-pdf via window.print()
  useEffect(() => {
    const handler = () => {
      window.print()
    }
    window.addEventListener('app:export-pdf', handler)
    return () => window.removeEventListener('app:export-pdf', handler)
  }, [])

  // Handle WelcomeDialog quick-action events
  useEffect(() => {
    // app:new-file — create a new empty tab
    const onNewFile = () => openTab(null, '')

    // app:open-file — open file picker dialog (reuse the existing handleOpenFile callback)
    const onOpenFile = () => handleOpenFile()

    // app:open-folder — open folder picker dialog
    const onOpenFolder = async () => {
      await useWorkspaceStore.getState().openFolder()
      const folderPath = useWorkspaceStore.getState().folderPath
      if (folderPath) {
        addRecentDocument(folderPath, 'folder')
      }
    }

    window.addEventListener('app:new-file', onNewFile)
    window.addEventListener('app:open-file', onOpenFile)
    window.addEventListener('app:open-folder', onOpenFolder)
    return () => {
      window.removeEventListener('app:new-file', onNewFile)
      window.removeEventListener('app:open-file', onOpenFile)
      window.removeEventListener('app:open-folder', onOpenFolder)
    }
  }, [openTab, handleOpenFile, addNotification])

  // Handle app:open-recent — open a file or folder from the recent documents list
  useEffect(() => {
    const handler = async (e: Event) => {
      const detail = (e as CustomEvent<{ path: string; type: 'file' | 'folder' } | string>).detail
      // Support both new { path, type } format and legacy string format
      const path = typeof detail === 'string' ? detail : detail?.path
      const type = typeof detail === 'string' ? 'file' : (detail?.type ?? 'file')
      if (!path) return
      try {
        if (type === 'folder') {
          const { readDirectory, startFsWatch } = await import('./tauriCommands')
          const nodes = await readDirectory(path)
          const newTree = new Map<string, import('./types').FileTreeNode[]>()
          newTree.set(path, nodes)
          useWorkspaceStore.setState({
            folderPath: path,
            folderTree: newTree,
            expandedDirs: new Set(),
            rootNodes: nodes,
            isLoading: false,
          })
          await startFsWatch(path)
          addRecentDocument(path, 'folder')
        } else {
          const content = await readFile(path)
          openTab(path, content)
          addRecentDocument(path, 'file')
        }
      } catch (err) {
        addNotification({ type: 'error', message: `打开最近文档失败: ${err}`, autoClose: true, duration: 5000 })
      }
    }
    window.addEventListener('app:open-recent', handler)
    return () => window.removeEventListener('app:open-recent', handler)
  }, [openTab, addNotification])

  // Handle window resize: auto-adjust sidebar and layout
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      // Auto-close mobile sidebar overlay on resize to desktop
      if (width >= 768 && mobileSidebarOpen) {
        setMobileSidebarOpen(false)
      }
      // Reset editor width on significant resize
      if (editorWidth !== null) {
        const mainEl = document.getElementById('md-mate-editor-preview')
        if (mainEl && editorWidth > mainEl.offsetWidth * 0.8) {
          setEditorWidth(null) // Reset to flex auto-split
        }
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [editorWidth, mobileSidebarOpen])

  // Register commands on mount
  useEffect(() => {
    registerAllCommands()
    // Apply initial theme
    document.documentElement.setAttribute('data-theme', theme)
  }, [])

  // Theme sync
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  // 用 ref 保持 editorWidth 最新值，避免 handleGutterResize 频繁重建
  const editorWidthRef = useRef(editorWidth)
  editorWidthRef.current = editorWidth

  // Handle gutter resize
  const handleGutterResize = useCallback((dx: number) => {
    const mainEl = document.getElementById('md-mate-editor-preview')
    if (!mainEl) return
    const total = mainEl.offsetWidth
    const currentEditorW = editorWidthRef.current ?? total / 2
    const maxW = Math.min(total - MIN_EDITOR_WIDTH, total * MAX_EDITOR_WIDTH_RATIO)
    const newW = Math.max(MIN_EDITOR_WIDTH, Math.min(maxW, currentEditorW + dx))
    setEditorWidth(newW)
  }, [setEditorWidth])

  // Handle tab close with dirty check
  const handleCloseTab = useCallback((tabId: string) => {
    const tab = tabs.find((t) => t.id === tabId)
    if (!tab) return
    if (tab.isDirty) {
      setDirtyTabId(tabId)
    } else {
      closeTab(tabId)
    }
  }, [tabs, closeTab])

  // Handle content change
  const handleMarkdownChange = useCallback((value: string) => {
    if (activeTab) {
      updateTabContent(activeTab.id, value)
      editorStore.setContent(value)
    }
  }, [activeTab, updateTabContent, editorStore])

  // Keyboard shortcuts — 使用统一 hook 替代内联 keydown 处理
  // IMPORTANT: Do NOT register Cmd/Ctrl+C, X, V, Z, A here.
  // These are native OS/browser clipboard and undo shortcuts handled by
  // CodeMirror's defaultKeymap and historyKeymap. Registering them here
  // would call preventDefault() and break CodeMirror's built-in handling.
  const shortcuts: ShortcutConfig[] = useMemo(() => [
    // === 文件操作 ===
    { key: 's', ctrlKey: true, action: () => handleSaveFile(), description: '保存文件' },
    { key: 'o', ctrlKey: true, action: () => handleOpenFile(), description: '打开文件' },
    { key: 'n', ctrlKey: true, action: () => openTab(null, ''), description: '新建文件' },
    { key: 'N', ctrlKey: true, shiftKey: true, action: createNewWindow, description: '新建窗口' },
    { key: 'w', ctrlKey: true, action: () => { const tab = getActiveTab(); if (tab) handleCloseTab(tab.id) }, description: '关闭标签' },

    // === 面板切换 ===
    { key: 'P', ctrlKey: true, shiftKey: true, action: () => ui.toggleCommandPalette(), description: '命令面板' },
    { key: 'e', ctrlKey: true, shiftKey: true, action: () => ui.setActiveSidebarPanel('explorer'), description: '资源管理器' },
    { key: 'f', ctrlKey: true, shiftKey: true, action: () => ui.setActiveSidebarPanel('search'), description: '搜索面板' },
    { key: 'o', ctrlKey: true, shiftKey: true, action: () => ui.setActiveSidebarPanel('outline'), description: '大纲面板' },

    // === Ctrl+B 上下文判断：编辑器焦点时加粗，否则切换侧边栏 ===
    {
      key: 'b', ctrlKey: true,
      action: () => {
        if (ui.editorFocused) {
          // 编辑器焦点时：触发加粗
          window.dispatchEvent(new CustomEvent('editor:insert', { detail: '**' }))
        } else {
          // 非编辑器焦点时：切换侧边栏
          ui.toggleSidebar()
        }
      },
      description: '加粗/侧边栏',
    },

    // === 编辑器格式快捷键（编辑器焦点时生效）===
    {
      key: 'i', ctrlKey: true,
      action: () => {
        if (ui.editorFocused) {
          window.dispatchEvent(new CustomEvent('editor:insert', { detail: '*' }))
        }
      },
      description: '斜体',
    },
    {
      key: 'k', ctrlKey: true,
      action: () => {
        if (ui.editorFocused) {
          window.dispatchEvent(new CustomEvent('editor:insert', { detail: '[](url)' }))
        }
      },
      description: '链接',
    },

    // === 查找替换 ===
    { key: 'f', ctrlKey: true, action: () => ui.setFindReplaceMode('find'), description: '查找' },
    { key: 'h', ctrlKey: true, action: () => ui.setFindReplaceMode('replace'), description: '查找+替换' },

    // === 缩放 ===
    { key: '=', ctrlKey: true, action: () => ui.zoomIn(), description: '放大' },
    { key: '+', ctrlKey: true, action: () => ui.zoomIn(), description: '放大（+号）' },
    { key: '-', ctrlKey: true, action: () => ui.zoomOut(), description: '缩小' },
    { key: '0', ctrlKey: true, action: () => ui.setZoomLevel(14), description: '重置缩放' },

    // === 关闭面板 ===
    {
      key: 'Escape',
      action: () => {
        if (ui.commandPaletteOpen) ui.setCommandPaletteOpen(false)
        else if (useAIStore.getState().isOpen) useAIStore.getState().setOpen(false)
        else if (ui.findReplaceOpen) ui.setFindReplaceOpen(false)
        else if (isMobile && mobileSidebarOpen) setMobileSidebarOpen(false)
      },
      description: '关闭面板',
      preventDefault: false,
    },

    // === 标签页导航 ===
    { key: 'Tab', ctrlKey: true, action: () => switchToNextTab(), description: '下一个标签页', preventDefault: true },
    { key: 'Tab', ctrlKey: true, shiftKey: true, action: () => switchToPrevTab(), description: '上一个标签页', preventDefault: true },
    {
      key: 'ArrowLeft', altKey: true,
      action: () => { if (!ui.editorFocused) switchToPrevTab() },
      description: '上一个标签页（非编辑器焦点）',
      preventDefault: false,
    },
    {
      key: 'ArrowRight', altKey: true,
      action: () => { if (!ui.editorFocused) switchToNextTab() },
      description: '下一个标签页（非编辑器焦点）',
      preventDefault: false,
    },
  ], [handleSaveFile, handleOpenFile, openTab, ui, getActiveTab, handleCloseTab, isMobile, mobileSidebarOpen, setMobileSidebarOpen, createNewWindow, switchToNextTab, switchToPrevTab])

  useKeyboardShortcuts(shortcuts)

  // View mode display
  const viewMode = ui.viewMode
  const showEditor = viewMode !== 'preview-only'
  const showPreview = viewMode !== 'editor-only'
  const showGutter = viewMode === 'split'

  return (
    <div
      className="flex flex-col overflow-hidden"
      style={{
        fontFamily: 'var(--font-primary, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif)',
        background: 'var(--bg-primary)',
        color: 'var(--text-primary)',
        fontSize: ui.zoomLevel,
        height: '100%',
      }}
      data-theme={theme}
    >
      {/* === TITLEBAR (已注释：decorations:true 时原生标题栏已提供拖拽，无需额外占位) === */}
      {/* <TitleBar /> */}

      {/* === TOOLBAR === */}
      <div data-component="toolbar">
        <Toolbar />
      </div>

      {/* === MAIN AREA === */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Activity Bar */}
        <div data-component="activitybar">
          <ActivityBar
            onToggleMobileSidebar={() => setMobileSidebarOpen((prev) => !prev)}
            isMobile={isMobile}
          />
        </div>

        {/* Desktop Sidebar */}
        {!isMobile && (
          <ErrorBoundary boundaryName="Sidebar">
            <div data-component="sidebar" data-collapsed={!ui.sidebarVisible}>
              <Sidebar content={activeContent} />
            </div>
          </ErrorBoundary>
        )}

        {/* Mobile Sidebar Overlay */}
        {isMobile && mobileSidebarOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40 bg-black/50 transition-opacity duration-250"
              onClick={() => setMobileSidebarOpen(false)}
            />
            {/* Sidebar Panel */}
            <div
              className="fixed top-0 left-12 bottom-0 w-72 z-50 flex flex-col shadow-xl"
              style={{
                background: 'var(--bg-sidebar, var(--bg-secondary))',
                borderRight: '1px solid var(--border-primary)',
              }}
            >
              <Sidebar content={activeContent} />
            </div>
          </>
        )}

        {/* Editor Area */}
        <div className="flex-1 flex flex-col overflow-hidden" style={{ minWidth: 0 }}>
          {/* Tab Bar - 仅在编辑区域内 */}
          {tabs.length > 0 && (
            <div
              className="flex items-stretch bg-[var(--bg-secondary)] border-b border-[var(--border-default)] select-none"
              style={{ height: 'var(--tabbar-height, 38px)', flexShrink: 0 }}
            >
              <TabBar onCloseTab={handleCloseTab} />
            </div>
          )}

          {/* Editor + Preview */}
          {/* 桌面端: flex-row (水平排列); 移动端: flex-col (垂直排列) */}
          <div
            id="md-mate-editor-preview"
            data-component="editor-preview"
            className="flex-1 flex overflow-hidden relative"
          >
            {/* Editor Pane - 始终渲染，通过 flex 控制显隐以获得统一动画 */}
            {tabs.length > 0 && (
              <div
                data-component="editor-pane"
                className="relative flex-col flex overflow-hidden"
                style={{
                  flex: showEditor
                    ? (isMobile ? '1 1 50%' : (showGutter && editorWidth ? `0 0 ${editorWidth}px` : 1))
                    : '0 0 0px',
                  minHeight: isMobile && showEditor ? '50%' : 'auto',
                  opacity: showEditor ? 1 : 0,
                  pointerEvents: showEditor ? 'auto' : 'none',
                }}
              >
                <ErrorBoundary boundaryName="Editor">
                  <EditorPaneV2
                    content={activeContent}
                    onChange={handleMarkdownChange}
                    className="flex-1"
                  />
                </ErrorBoundary>
                {/* FindReplaceBar anchored to editor */}
                <FindReplaceBar />
              </div>
            )}

            {/* Desktop Gutter (vertical divider) - 仅 split 模式显示 */}
            {!isMobile && showGutter && tabs.length > 0 && (
              <Gutter onResize={handleGutterResize} onReset={() => setEditorWidth(null)} />
            )}

            {/* Mobile Horizontal Divider - 仅移动端显示 */}
            {isMobile && showGutter && tabs.length > 0 && (
              <div
                data-component="mobile-gutter"
                className="h-2 flex-shrink-0 flex items-center justify-center bg-[var(--bg-secondary)] cursor-row-resize"
                style={{ borderTop: '1px solid var(--border-primary)', borderBottom: '1px solid var(--border-primary)' }}
              >
                <div
                  className="w-10 h-1 rounded-full"
                  style={{ background: 'var(--text-tertiary)' }}
                />
              </div>
            )}

            {/* Preview Pane - 始终渲染，通过 flex 控制显隐以获得统一动画 */}
            {tabs.length > 0 && (
              <div
                data-component="preview-pane"
                style={{
                  flex: showPreview
                    ? (isMobile ? '1 1 50%' : 1)
                    : '0 0 0px',
                  minHeight: isMobile && showPreview ? '50%' : 0,
                  overflow: 'hidden',
                  minWidth: showPreview ? MIN_EDITOR_WIDTH : 0,
                  opacity: showPreview ? 1 : 0,
                  pointerEvents: showPreview ? 'auto' : 'none',
                }}
              >
                <ErrorBoundary boundaryName="Preview">
                  <PreviewPaneV2 content={activeContent} className="h-full" />
                </ErrorBoundary>
              </div>
            )}

            {/* Empty state */}
            {tabs.length === 0 && (
              <div className="flex-1 flex items-center justify-center" style={{ color: 'var(--text-secondary)' }}>
                <div className="text-center">
                  <div className="text-4xl mb-4 opacity-20">📝</div>
                  <p className="text-sm mb-2">没有打开的文件</p>
                  <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                    使用 <kbd className="px-1 py-0.5 rounded text-xs" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)' }}>
                      {navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'}+O
                    </kbd> 打开文件
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* AI Panel */}
        <AIPanel />
      </div>

      {/* === STATUS BAR === */}
      <div data-component="statusbar">
        <StatusBarV2 />
      </div>

      {/* === OVERLAYS === */}
      <CommandPalette />
      <NotificationContainer />

      {/* 全局兜底右键菜单 */}
      {defaultContextMenu && (
        <DefaultContextMenu
          x={defaultContextMenu.x}
          y={defaultContextMenu.y}
          onClose={() => setDefaultContextMenu(null)}
        />
      )}

      {/* Dialogs */}
      {ui.dialogType === 'shortcut-reference' && (
        <ShortcutReferenceDialog onClose={() => ui.setDialogType(null)} />
      )}
      {ui.dialogType === 'about' && (
        <AboutDialog onClose={() => ui.setDialogType(null)} />
      )}
      {ui.dialogType === 'welcome' && (
        <WelcomeDialog onClose={() => ui.setDialogType(null)} />
      )}

      {/* Dirty Tab Modal */}
      {dirtyTab && (
        <DirtyTabModal
          open={!!dirtyTab}
          fileName={dirtyTab.name}
          onSave={async () => {
            if (dirtyTab.path) {
              await saveFile(dirtyTab.path, dirtyTab.content)
            }
            closeTab(dirtyTab.id)
            setDirtyTabId(null)
          }}
          onDiscard={() => {
            closeTab(dirtyTab.id)
            setDirtyTabId(null)
          }}
          onCancel={() => setDirtyTabId(null)}
        />
      )}

      {/* WeChat Export Panel */}
      <WechatPanel />
    </div>
  )
}

export default AppV2
