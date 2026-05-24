import { useCallback } from 'react'
import { open } from '@tauri-apps/plugin-dialog'
import { invoke } from '@tauri-apps/api/core'
import { useAppState } from '../context/AppContext'
import {
  createFile,
  createDirectory,
  renamePath,
  deletePath,
} from '../tauriCommands'
import { createLogger } from '../utils/logger'
import type { FileTreeNode } from '../types'

const logger = createLogger('useAppState')

// ── useFolder ─────────────────────────────────────────────────────────────────

export function useFolder() {
  const { state, dispatch } = useAppState()

  const openFolder = useCallback(async (): Promise<string | null> => {
    try {
      const selected = await open({
        directory: true,
        multiple: false,
        title: 'Open Folder',
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
  }, [dispatch])

  const closeFolder = useCallback(() => {
    dispatch({ type: 'SET_FOLDER_PATH', payload: null })
    dispatch({ type: 'SET_FOLDER_TREE', payload: null })
  }, [dispatch])

  return {
    folderPath: state.folder.path,
    folderTree: state.folder.tree,
    openFolder,
    closeFolder,
  }
}

// ── useSidebarState ───────────────────────────────────────────────────────────

export function useSidebarState() {
  const { state, dispatch } = useAppState()

  const toggle = useCallback(() => {
    dispatch({ type: 'SET_SIDEBAR_COLLAPSED', payload: !state.ui.sidebarCollapsed })
  }, [state.ui.sidebarCollapsed, dispatch])

  const setCollapsed = useCallback((collapsed: boolean) => {
    dispatch({ type: 'SET_SIDEBAR_COLLAPSED', payload: collapsed })
  }, [dispatch])

  return {
    collapsed: state.ui.sidebarCollapsed,
    toggle,
    setCollapsed,
  }
}

// ── usePaneState ──────────────────────────────────────────────────────────────

export function usePaneState() {
  const { state, dispatch } = useAppState()

  const toggleEditor = useCallback(() => {
    dispatch({ type: 'SET_EDITOR_COLLAPSED', payload: !state.ui.editorCollapsed })
  }, [state.ui.editorCollapsed, dispatch])

  const togglePreview = useCallback(() => {
    dispatch({ type: 'SET_PREVIEW_COLLAPSED', payload: !state.ui.previewCollapsed })
  }, [state.ui.previewCollapsed, dispatch])

  const setEditorCollapsed = useCallback((collapsed: boolean) => {
    dispatch({ type: 'SET_EDITOR_COLLAPSED', payload: collapsed })
  }, [dispatch])

  const setPreviewCollapsed = useCallback((collapsed: boolean) => {
    dispatch({ type: 'SET_PREVIEW_COLLAPSED', payload: collapsed })
  }, [dispatch])

  return {
    editorCollapsed: state.ui.editorCollapsed,
    previewCollapsed: state.ui.previewCollapsed,
    toggleEditor,
    togglePreview,
    setEditorCollapsed,
    setPreviewCollapsed,
  }
}

// ── useFileTree ───────────────────────────────────────────────────────────────

export function useFileTree() {
  const { state, dispatch } = useAppState()

  const loadDirectory = useCallback(async (path: string): Promise<FileTreeNode[]> => {
    try {
      const nodes = await invoke<FileTreeNode[]>('read_directory', { path })
      return nodes
    } catch (error) {
      logger.error('Failed to load directory', { error: String(error), path })
      return []
    }
  }, [])

  const toggleDirectory = useCallback((path: string) => {
    const newExpanded = new Set(state.folder.expandedDirs)
    if (newExpanded.has(path)) {
      newExpanded.delete(path)
    } else {
      newExpanded.add(path)
    }
    dispatch({ type: 'SET_EXPANDED_DIRS', payload: newExpanded })
  }, [state.folder.expandedDirs, dispatch])

  const isExpanded = useCallback((path: string): boolean => {
    return state.folder.expandedDirs.has(path)
  }, [state.folder.expandedDirs])

  const createFileHelper = useCallback(async (folderPath: string, name: string): Promise<void> => {
    const fullPath = `${folderPath}/${name}`
    await createFile(fullPath)
  }, [])

  const createDirectoryHelper = useCallback(async (folderPath: string, name: string): Promise<void> => {
    const fullPath = `${folderPath}/${name}`
    await createDirectory(fullPath)
  }, [])

  const renamePathHelper = useCallback(async (oldPath: string, newPath: string): Promise<void> => {
    await renamePath(oldPath, newPath)
  }, [])

  const deletePathHelper = useCallback(async (path: string): Promise<void> => {
    await deletePath(path)
  }, [])

  return {
    tree: state.folder.tree,
    expandedDirs: state.folder.expandedDirs,
    loadDirectory,
    toggleDirectory,
    isExpanded,
    createFile: createFileHelper,
    createDirectory: createDirectoryHelper,
    renamePath: renamePathHelper,
    deletePath: deletePathHelper,
  }
}
