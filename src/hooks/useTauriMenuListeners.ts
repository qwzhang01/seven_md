import { useEffect, useRef } from 'react'
import { listen } from '@tauri-apps/api/event'
import { writeText as clipboardWriteText } from '@tauri-apps/plugin-clipboard-manager'
import { getCurrentWindow } from '@tauri-apps/api/window'
import type { MutableRefObject } from 'react'
import {
  useUIStore,
  useFileStore,
  useThemeStore,
  useWorkspaceStore,
  useAIStore,
} from '../stores'
import type { Notification } from '../stores/useNotificationStore'
import type { ThemeId } from '../stores/useThemeStore'
import { readFile, saveFile, createNewWindow as tauriCreateNewWindow, openFolderDialog, readDirectory, startFsWatch } from '../tauriCommands'
import { addRecentDocument, clearRecentDocuments, getRecentDocType } from '../utils/recentDocuments'
import type { FileTreeNode } from '../types'

interface FileActionRefs {
  handleOpenFileRef: MutableRefObject<() => Promise<void>>
  handleSaveFileRef: MutableRefObject<() => Promise<void>>
  openTabRef: MutableRefObject<(path: string | null, content: string) => string>
  addNotificationRef: MutableRefObject<(n: Omit<Notification, 'id' | 'createdAt'>) => string>
  createNewWindowRef: MutableRefObject<() => Promise<void>>
}

const INSERT_MAP: Record<string, string> = {
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

const FORMAT_MAP: Record<string, string> = {
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

function dispatchEditorEvent(eventName: string, detail?: string) {
  window.dispatchEvent(detail !== undefined ? new CustomEvent(eventName, { detail }) : new CustomEvent(eventName))
}

function handleClipboardCut() {
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
  dispatchEditorEvent('editor:cut')
}

function handleClipboardCopy() {
  const el = document.activeElement
  if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
    const start = el.selectionStart ?? 0
    const end = el.selectionEnd ?? 0
    if (start !== end) {
      clipboardWriteText(el.value.slice(start, end))
    }
    return
  }
  dispatchEditorEvent('editor:copy')
}

async function openFolderByPath(path: string) {
  const nodes = await readDirectory(path)
  const newTree = new Map<string, FileTreeNode[]>()
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
}

export function useTauriMenuListeners(refs: FileActionRefs) {
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const unlisteners: Array<() => void> = []

    const setup = async () => {
      // --- 文件系统变更 ---
      unlisteners.push(await listen('fs-watch:changed', () => {
        if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current)
        refreshTimerRef.current = setTimeout(async () => {
          useWorkspaceStore.getState().refreshTree()
          const { tabs } = useFileStore.getState()
          const tabsWithPath = tabs.filter((t) => t.path)
          const BATCH_SIZE = 5
          for (let i = 0; i < tabsWithPath.length; i += BATCH_SIZE) {
            const batch = tabsWithPath.slice(i, i + BATCH_SIZE)
            await Promise.allSettled(
              batch.map(async (tab) => {
                if (!tab.path) return
                try {
                  const newContent = await readFile(tab.path)
                  if (newContent === tab.content) return
                  if (!tab.isDirty) {
                    useFileStore.getState().reloadTabContent(tab.id, newContent)
                  } else {
                    useFileStore.getState().markTabExternalConflict(tab.id, true)
                  }
                } catch {
                  // 文件可能已被删除
                }
              })
            )
          }
        }, 1000)
      }))

      // --- File 菜单 ---
      unlisteners.push(await listen('menu-new-file', () => refs.openTabRef.current(null, '')))
      unlisteners.push(await listen('menu-new-window', () => refs.createNewWindowRef.current()))
      unlisteners.push(await listen('menu-open-file', () => refs.handleOpenFileRef.current()))
      unlisteners.push(await listen('menu-open-folder', async () => {
        await useWorkspaceStore.getState().openFolder()
        const folderPath = useWorkspaceStore.getState().folderPath
        if (folderPath) addRecentDocument(folderPath, 'folder')
      }))
      unlisteners.push(await listen('menu-close-folder', () => useWorkspaceStore.getState().closeFolder()))
      unlisteners.push(await listen('menu-open-folder-new-window', async () => {
        try {
          const selectedPath = await openFolderDialog()
          if (selectedPath) await tauriCreateNewWindow(selectedPath)
        } catch (e) {
          refs.addNotificationRef.current({ type: 'error', message: `打开文件夹失败: ${e}`, autoClose: true, duration: 5000 })
        }
      }))
      unlisteners.push(await listen('menu-clear-recent', () => {
        clearRecentDocuments()
        refs.addNotificationRef.current({ type: 'info', message: '已清除最近文档', autoClose: true, duration: 2000 })
      }))
      unlisteners.push(await listen<string>('menu-open-recent-doc', async (event) => {
        const path = event.payload
        if (!path) return
        const itemType = getRecentDocType(path)
        try {
          if (itemType === 'folder') {
            await openFolderByPath(path)
          } else {
            const content = await readFile(path)
            refs.openTabRef.current(path, content)
            addRecentDocument(path, 'file')
          }
        } catch (err) {
          refs.addNotificationRef.current({ type: 'error', message: `打开最近文档失败: ${err}`, autoClose: true, duration: 5000 })
        }
      }))
      unlisteners.push(await listen('menu-save', () => refs.handleSaveFileRef.current()))
      unlisteners.push(await listen('menu-save-all', () => {
        const tabs = useFileStore.getState().tabs
        tabs.forEach(async (tab) => {
          if (tab.isDirty && tab.path) {
            await saveFile(tab.path, tab.content)
            useFileStore.getState().setTabDirty(tab.id, false)
          }
        })
        refs.addNotificationRef.current({ type: 'success', message: '所有文件已保存', autoClose: true, duration: 2000 })
      }))
      unlisteners.push(await listen('menu-save-as', async () => {
        const activeTab = useFileStore.getState().getActiveTab()
        if (!activeTab) return
        try {
          const { open } = await import('@tauri-apps/plugin-dialog')
          const selected = await open({
            multiple: false,
            directory: false,
            title: '另存为',
            filters: [{ name: 'Markdown', extensions: ['md', 'markdown'] }],
          })
          if (selected) {
            await saveFile(selected as string, activeTab.content)
            useFileStore.getState().updateTabPath(activeTab.id, selected as string)
            refs.addNotificationRef.current({ type: 'success', message: '文件已保存', autoClose: true, duration: 2000 })
          }
        } catch (e) {
          refs.addNotificationRef.current({ type: 'error', message: `保存失败: ${e}`, autoClose: true, duration: 5000 })
        }
      }))
      unlisteners.push(await listen('menu-export-pdf', () => dispatchEditorEvent('app:export-pdf')))
      unlisteners.push(await listen('menu-export-html', () => dispatchEditorEvent('app:export-html')))
      unlisteners.push(await listen('menu-close-tab', () => {
        const tab = useFileStore.getState().getActiveTab()
        if (tab) {
          const tabEl = document.querySelector(`[data-tab-id="${tab.id}"] .tab-close`)
          if (tabEl) {
            (tabEl as HTMLElement).click()
          } else {
            useFileStore.getState().closeTab(tab.id)
          }
        }
      }))
      unlisteners.push(await listen('menu-quit', async () => {
        await getCurrentWindow().close()
      }))

      // --- Edit 菜单 ---
      unlisteners.push(await listen('menu-undo', () => dispatchEditorEvent('editor:undo')))
      unlisteners.push(await listen('menu-redo', () => dispatchEditorEvent('editor:redo')))
      unlisteners.push(await listen('menu-cut', handleClipboardCut))
      unlisteners.push(await listen('menu-copy', handleClipboardCopy))
      unlisteners.push(await listen('menu-paste', () => {
        const el = document.activeElement
        if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) return
        dispatchEditorEvent('editor:paste')
      }))
      unlisteners.push(await listen('menu-paste-match-style', () => {
        const el = document.activeElement
        if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) return
        dispatchEditorEvent('editor:paste-match-style')
      }))
      unlisteners.push(await listen('menu-select-all', () => {
        const el = document.activeElement
        if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
          el.select()
          return
        }
        dispatchEditorEvent('editor:select-all')
      }))
      unlisteners.push(await listen('menu-find', () => {
        useUIStore.getState().setFindReplaceOpen(true)
        useUIStore.getState().setFindReplaceMode('find')
      }))
      unlisteners.push(await listen('menu-replace', () => {
        useUIStore.getState().setFindReplaceOpen(true)
        useUIStore.getState().setFindReplaceMode('replace')
      }))
      unlisteners.push(await listen('menu-find-next', () => dispatchEditorEvent('editor:find-next')))
      unlisteners.push(await listen('menu-find-previous', () => dispatchEditorEvent('editor:find-previous')))
      unlisteners.push(await listen('menu-clear-format', () => dispatchEditorEvent('editor:clear-format')))

      // --- View 菜单 ---
      unlisteners.push(await listen('menu-command-palette', () => useUIStore.getState().toggleCommandPalette()))
      unlisteners.push(await listen('menu-toggle-ai-panel', () => {
        const aiStore = useAIStore.getState()
        aiStore.setOpen(!aiStore.isOpen)
      }))
      unlisteners.push(await listen('menu-toggle-sidebar', () => useUIStore.getState().toggleSidebar()))
      unlisteners.push(await listen('menu-toggle-outline', () => useUIStore.getState().setActiveSidebarPanel('outline')))
      unlisteners.push(await listen('menu-toggle-explorer', () => useUIStore.getState().setActiveSidebarPanel('explorer')))
      unlisteners.push(await listen('menu-show-line-numbers', () => dispatchEditorEvent('editor:toggle-line-numbers')))
      unlisteners.push(await listen('menu-show-minimap', () => dispatchEditorEvent('editor:toggle-minimap')))
      unlisteners.push(await listen('menu-word-wrap', () => dispatchEditorEvent('editor:toggle-word-wrap')))
      unlisteners.push(await listen('menu-zoom-in', () => useUIStore.getState().zoomIn()))
      unlisteners.push(await listen('menu-zoom-out', () => useUIStore.getState().zoomOut()))
      unlisteners.push(await listen('menu-reset-zoom', () => useUIStore.getState().setZoomLevel(14)))
      unlisteners.push(await listen('menu-view-editor-only', () => useUIStore.getState().setViewMode('editor-only')))
      unlisteners.push(await listen('menu-view-preview-only', () => useUIStore.getState().setViewMode('preview-only')))
      unlisteners.push(await listen('menu-view-split', () => useUIStore.getState().setViewMode('split')))
      unlisteners.push(await listen('menu-toggle-fullscreen', async () => {
        const win = getCurrentWindow()
        const isFullscreen = await win.isFullscreen()
        await win.setFullscreen(!isFullscreen)
      }))
      unlisteners.push(await listen('menu-next-tab', () => useFileStore.getState().switchToNextTab()))
      unlisteners.push(await listen('menu-prev-tab', () => useFileStore.getState().switchToPrevTab()))

      // --- Insert 菜单 ---
      for (const [event, detail] of Object.entries(INSERT_MAP)) {
        unlisteners.push(await listen(event, () => dispatchEditorEvent('editor:insert', detail)))
      }

      // --- Format 菜单 ---
      for (const [event, detail] of Object.entries(FORMAT_MAP)) {
        unlisteners.push(await listen(event, () => dispatchEditorEvent('editor:insert', detail)))
      }

      // --- Theme 菜单 ---
      unlisteners.push(await listen<string>('menu-theme-change', (event) => {
        useThemeStore.getState().setTheme(event.payload as ThemeId)
      }))

      // --- Help 菜单 ---
      unlisteners.push(await listen('menu-welcome', () => useUIStore.getState().setDialogType('welcome')))
      unlisteners.push(await listen('menu-markdown-guide', () => window.open('https://www.markdownguide.org/', '_blank')))
      unlisteners.push(await listen('menu-keyboard-shortcuts', () => useUIStore.getState().setDialogType('shortcut-reference')))
      unlisteners.push(await listen('menu-about', () => useUIStore.getState().setDialogType('about')))
      unlisteners.push(await listen('menu-check-update', async () => {
        const notify = refs.addNotificationRef.current
        try {
          notify({ type: 'info', message: '正在检查更新...', autoClose: false, duration: 0 })
          notify({ type: 'success', message: '当前已是最新版本 v0.1.0', autoClose: true, duration: 3000 })
        } catch (e) {
          notify({ type: 'error', message: `检查更新失败: ${e}`, autoClose: true, duration: 5000 })
        }
      }))

      // --- 全屏状态检测 ---
      const appWindow = getCurrentWindow()
      appWindow.isFullscreen().then((fs) => {
        useUIStore.getState().setIsFullscreen(fs)
      }).catch(() => {})

      unlisteners.push(await listen('tauri://resize', () => {
        setTimeout(() => {
          appWindow.isFullscreen().then((fs) => {
            useUIStore.getState().setIsFullscreen(fs)
          }).catch(() => {})
        }, 50)
      }))
    }

    setup()

    // 窗口初始化时读取 URL 参数，自动打开文件夹
    const urlParams = new URLSearchParams(window.location.search)
    const folderParam = urlParams.get('folder')
    if (folderParam) {
      const decodedPath = decodeURIComponent(folderParam)
      requestAnimationFrame(() => {
        useWorkspaceStore.getState().openFolderByPath(decodedPath)
      })
    }

    return () => {
      unlisteners.forEach((fn) => fn())
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
