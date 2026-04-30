import { create } from 'zustand'
import type { FileTreeNode } from '../types'
import {
  readDirectory,
  openFolderDialog,
  startFsWatch,
  stopFsWatch,
  createFile as tauriCreateFile,
  createDirectory as tauriCreateDirectory,
  renamePath,
} from '../tauriCommands'
import { useNotificationStore } from './useNotificationStore'
import { useFileStore } from './useFileStore'

interface WorkspaceState {
  /** 当前打开的文件夹根路径 */
  folderPath: string | null
  /** 目录树缓存：key 为目录路径，value 为该目录下的子节点列表 */
  folderTree: Map<string, FileTreeNode[]>
  /** 已展开的目录路径集合 */
  expandedDirs: Set<string>
  /** 是否正在加载 */
  isLoading: boolean
  /** 根目录节点列表（folderTree.get(folderPath) 的快捷引用） */
  rootNodes: FileTreeNode[]

  // Actions
  openFolder: () => Promise<void>
  closeFolder: () => Promise<void>
  loadDirectory: (path: string) => Promise<void>
  toggleDirectory: (path: string) => Promise<void>
  refreshTree: () => Promise<void>
  createFile: (parentDir: string, fileName: string) => Promise<void>
  createDirectory: (parentDir: string, dirName: string) => Promise<void>
  moveItem: (sourcePath: string, targetFolderPath: string) => Promise<void>
  collapseAll: () => void
}

export const useWorkspaceStore = create<WorkspaceState>()((set, get) => ({
  folderPath: null,
  folderTree: new Map(),
  expandedDirs: new Set(),
  isLoading: false,
  rootNodes: [],

  openFolder: async () => {
    try {
      const selectedPath = await openFolderDialog()
      if (!selectedPath) return

      set({ isLoading: true })

      // 加载根目录内容
      const nodes = await readDirectory(selectedPath)
      const newTree = new Map<string, FileTreeNode[]>()
      newTree.set(selectedPath, nodes)

      set({
        folderPath: selectedPath,
        folderTree: newTree,
        expandedDirs: new Set(),
        rootNodes: nodes,
        isLoading: false,
      })

      // 启动文件系统监控
      await startFsWatch(selectedPath)
    } catch (error) {
      console.error('打开文件夹失败:', error)
      set({ isLoading: false })
    }
  },

  closeFolder: async () => {
    try {
      await stopFsWatch()
    } catch {
      // 忽略停止监控的错误（可能本来就没在监控）
    }

    set({
      folderPath: null,
      folderTree: new Map(),
      expandedDirs: new Set(),
      rootNodes: [],
      isLoading: false,
    })
  },

  loadDirectory: async (path: string) => {
    try {
      const nodes = await readDirectory(path)
      const state = get()
      const newTree = new Map(state.folderTree)
      newTree.set(path, nodes)

      // 如果加载的是根目录，同步更新 rootNodes
      const updates: Partial<WorkspaceState> = { folderTree: newTree }
      if (path === state.folderPath) {
        updates.rootNodes = nodes
      }

      set(updates)
    } catch (error) {
      console.error(`加载目录失败 [${path}]:`, error)
    }
  },

  toggleDirectory: async (path: string) => {
    const state = get()
    const newExpanded = new Set(state.expandedDirs)

    if (newExpanded.has(path)) {
      // 折叠目录
      newExpanded.delete(path)
      set({ expandedDirs: newExpanded })
    } else {
      // 展开目录
      newExpanded.add(path)
      set({ expandedDirs: newExpanded })

      // 按需加载：如果该目录还没有缓存内容，则加载
      if (!state.folderTree.has(path)) {
        await get().loadDirectory(path)
      }
    }
  },

  refreshTree: async () => {
    const state = get()
    if (!state.folderPath) return

    set({ isLoading: true })

    try {
      // 重新加载根目录
      await get().loadDirectory(state.folderPath)

      // 重新加载所有已展开的子目录
      const expandedPaths = Array.from(state.expandedDirs)
      await Promise.all(
        expandedPaths.map((dirPath) => get().loadDirectory(dirPath))
      )
    } finally {
      set({ isLoading: false })
    }
  },

  createFile: async (parentDir: string, fileName: string) => {
    const separator = parentDir.endsWith('/') ? '' : '/'
    const fullPath = `${parentDir}${separator}${fileName}`

    try {
      await tauriCreateFile(fullPath)
      // 刷新父目录以显示新文件
      await get().loadDirectory(parentDir)
    } catch (error) {
      console.error(`创建文件失败 [${fullPath}]:`, error)
      throw error
    }
  },

  createDirectory: async (parentDir: string, dirName: string) => {
    const separator = parentDir.endsWith('/') ? '' : '/'
    const fullPath = `${parentDir}${separator}${dirName}`

    try {
      await tauriCreateDirectory(fullPath)
      // 刷新父目录以显示新目录
      await get().loadDirectory(parentDir)
    } catch (error) {
      console.error(`创建目录失败 [${fullPath}]:`, error)
      throw error
    }
  },

  moveItem: async (sourcePath: string, targetFolderPath: string) => {
    const state = get()

    // 获取源文件/文件夹名称
    const sourceName = sourcePath.split('/').pop() || ''
    const separator = targetFolderPath.endsWith('/') ? '' : '/'
    const destPath = `${targetFolderPath}${separator}${sourceName}`

    // 校验：不能移动到自身或子孙目录
    if (destPath === sourcePath || targetFolderPath.startsWith(sourcePath + '/') || targetFolderPath === sourcePath) {
      useNotificationStore.getState().addNotification({
        type: 'error',
        message: '不能将文件夹移动到自身或其子文件夹中',
        autoClose: true,
        duration: 3000,
      })
      return
    }

    // 校验：源文件的父目录与目标目录相同，无需移动
    const sourceParent = sourcePath.substring(0, sourcePath.lastIndexOf('/'))
    if (sourceParent === targetFolderPath) return

    try {
      await renamePath(sourcePath, destPath)

      // 刷新源目录和目标目录
      await get().loadDirectory(sourceParent)
      await get().loadDirectory(targetFolderPath)

      // 如果根目录是受影响的目录之一，同步 rootNodes
      if (state.folderPath) {
        if (sourceParent === state.folderPath || targetFolderPath === state.folderPath) {
          await get().loadDirectory(state.folderPath)
        }
      }

      // 更新已打开 Tab 中匹配旧路径的条目
      const fileStore = useFileStore.getState()
      fileStore.tabs.forEach((tab) => {
        if (tab.path && (tab.path === sourcePath || tab.path.startsWith(sourcePath + '/'))) {
          const newTabPath = tab.path.replace(sourcePath, destPath)
          fileStore.updateTabPath(tab.id, newTabPath)
        }
      })
    } catch (error) {
      console.error(`移动失败 [${sourcePath} -> ${destPath}]:`, error)
      useNotificationStore.getState().addNotification({
        type: 'error',
        message: `移动失败：${sourceName}`,
        autoClose: true,
        duration: 3000,
      })
    }
  },

  collapseAll: () => {
    set({ expandedDirs: new Set() })
  },
}))
