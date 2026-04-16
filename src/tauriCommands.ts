import { invoke } from '@tauri-apps/api/core'

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