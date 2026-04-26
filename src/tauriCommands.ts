import { invoke } from '@tauri-apps/api/core'
import type { FileTreeNode, SearchResponse, SearchType } from './types'

export const readFile = async (path: string): Promise<string> => {
  return await invoke('read_file', { path })
}

export const saveFile = async (path: string, content: string): Promise<void> => {
  return await invoke('save_file', { path, content })
}

export const createFile = async (path: string): Promise<void> => {
  return await invoke('create_file', { path })
}

export const createDirectory = async (path: string): Promise<void> => {
  return await invoke('create_directory', { path })
}

export const renamePath = async (oldPath: string, newPath: string): Promise<void> => {
  return await invoke('rename_path', { oldPath, newPath })
}

export const deletePath = async (path: string): Promise<void> => {
  return await invoke('delete_path', { path })
}

export const startFsWatch = async (folderPath: string): Promise<void> => {
  return await invoke('start_fs_watch', { folderPath })
}

export const stopFsWatch = async (): Promise<void> => {
  return await invoke('stop_fs_watch')
}

/**
 * 读取目录内容（单层），返回文件树节点列表
 * 后端只返回 .md/.markdown 文件和子目录，按目录优先排序
 */
export const readDirectory = async (path: string): Promise<FileTreeNode[]> => {
  return await invoke('read_directory', { path })
}

/**
 * 打开系统文件夹选择对话框
 * 返回选中的文件夹路径，取消则返回 null
 */
export const openFolderDialog = async (): Promise<string | null> => {
  return await invoke('open_folder')
}

/**
 * 在指定文件夹中搜索文件（文件名搜索或全文搜索）
 * 后端限制最多返回 200 条结果
 */
export const searchInFiles = async (
  folderPath: string,
  query: string,
  searchType: SearchType
): Promise<SearchResponse> => {
  return await invoke('search_in_files', { folderPath, query, searchType })
}

/**
 * 获取指定目录的 Git 分支名
 * 非 Git 目录或命令失败时返回空字符串
 */
export const getGitBranch = async (dirPath: string): Promise<string> => {
  return await invoke('get_git_branch', { dirPath })
}