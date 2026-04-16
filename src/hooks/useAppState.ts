import { useAppState } from '../context/AppContext'
import { FileTreeNode } from '../types'
import { invoke } from '@tauri-apps/api/core'
import {
  createFile as tauriCreateFile,
  createDirectory as tauriCreateDirectory,
  renamePath as tauriRenamePath,
  deletePath as tauriDeletePath,
} from '../tauriCommands'
import { createLogger } from '../utils/logger'

const logger = createLogger('useAppState')

/**
 * Hook for folder operations
 */
export function useFolder() {
  const { state, dispatch } = useAppState()

  const openFolder = async () => {
    try {
      const { open } = await import('@tauri-apps/plugin-dialog')
      const selected = await open({
        directory: true,
        multiple: false,
        title: 'Open Folder'
      })
      
      if (selected && typeof selected === 'string') {
        dispatch({ type: 'SET_FOLDER_PATH', payload: selected })
        return selected
      }
      return null
    } catch (error) {
      logger.error('Failed to open folder', { error: String(error) })
      return null
    }
  }

  const closeFolder = () => {
    dispatch({ type: 'SET_FOLDER_PATH', payload: null })
  }

  return {
    folderPath: state.folder.path,
    folderTree: state.folder.tree,
    openFolder,
    closeFolder
  }
}

/**
 * Hook for file tree operations
 */
export function useFileTree() {
  const { state, dispatch } = useAppState()

  const loadDirectory = async (path: string): Promise<FileTreeNode[]> => {
    try {
      const nodes = await invoke<FileTreeNode[]>('read_directory', { path })
      return nodes
    } catch (error) {
      logger.error('Failed to load directory', { error: String(error), path })
      return []
    }
  }

  const toggleDirectory = (path: string) => {
    dispatch({ type: 'TOGGLE_DIR_EXPANDED', payload: path })
  }

  const isExpanded = (path: string) => {
    return state.folder.expandedDirs.has(path)
  }

  return {
    tree: state.folder.tree,
    expandedDirs: state.folder.expandedDirs,
    loadDirectory,
    toggleDirectory,
    isExpanded,
    createFile: async (parentDir: string, name: string) => {
      const path = `${parentDir}/${name}`
      await tauriCreateFile(path)
      const nodes = await loadDirectory(state.folder.path!)
      dispatch({ type: 'SET_FOLDER_TREE', payload: nodes })
    },
    createDirectory: async (parentDir: string, name: string) => {
      const path = `${parentDir}/${name}`
      await tauriCreateDirectory(path)
      const nodes = await loadDirectory(state.folder.path!)
      dispatch({ type: 'SET_FOLDER_TREE', payload: nodes })
    },
    renamePath: async (oldPath: string, newPath: string) => {
      await tauriRenamePath(oldPath, newPath)
      // Update any open tab whose path matches the old path
      const matchingTab = state.tabs.tabs.find(t => t.path === oldPath)
      if (matchingTab) {
        dispatch({ type: 'UPDATE_TAB_PATH', payload: { tabId: matchingTab.id, path: newPath } })
      }
      const nodes = await loadDirectory(state.folder.path!)
      dispatch({ type: 'SET_FOLDER_TREE', payload: nodes })
    },
    deletePath: async (path: string) => {
      await tauriDeletePath(path)
      // Close any open tab whose path matches the deleted path
      const matchingTab = state.tabs.tabs.find(t => t.path === path)
      if (matchingTab) {
        dispatch({ type: 'CLOSE_TAB', payload: matchingTab.id })
      }
      const nodes = await loadDirectory(state.folder.path!)
      dispatch({ type: 'SET_FOLDER_TREE', payload: nodes })
    },
  }
}

/**
 * Hook for sidebar state
 */
export function useSidebarState() {
  const { state, dispatch } = useAppState()

  const toggle = () => {
    dispatch({ type: 'TOGGLE_SIDEBAR' })
  }

  const setCollapsed = (collapsed: boolean) => {
    dispatch({ type: 'SET_SIDEBAR_COLLAPSED', payload: collapsed })
  }

  return {
    collapsed: state.ui.sidebarCollapsed,
    toggle,
    setCollapsed
  }
}

/**
 * Hook for pane states (editor and preview)
 */
export function usePaneState() {
  const { state, dispatch } = useAppState()

  const toggleEditor = () => {
    dispatch({ type: 'TOGGLE_EDITOR' })
  }

  const togglePreview = () => {
    dispatch({ type: 'TOGGLE_PREVIEW' })
  }

  const setEditorCollapsed = (collapsed: boolean) => {
    dispatch({ type: 'SET_EDITOR_COLLAPSED', payload: collapsed })
  }

  const setPreviewCollapsed = (collapsed: boolean) => {
    dispatch({ type: 'SET_PREVIEW_COLLAPSED', payload: collapsed })
  }

  return {
    editorCollapsed: state.ui.editorCollapsed,
    previewCollapsed: state.ui.previewCollapsed,
    toggleEditor,
    togglePreview,
    setEditorCollapsed,
    setPreviewCollapsed
  }
}
