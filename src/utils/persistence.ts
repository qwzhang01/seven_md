import { invoke } from '@tauri-apps/api/core'
import { PersistedState } from '../types'
import { createLogger } from './logger'

const logger = createLogger('Persistence')

/**
 * Load persisted state from storage
 */
export async function loadPersistedState(): Promise<PersistedState | null> {
  try {
    const storePath = await invoke<string>('get_store_path')
    const configPath = `${storePath}/config.json`
    
    const content = await invoke<string>('read_file', { path: configPath })
    return JSON.parse(content) as PersistedState
  } catch (error) {
    logger.debug('No persisted state found or failed to load', { error: String(error) })
    return null
  }
}

/**
 * Save persisted state to storage
 */
export async function savePersistedState(state: PersistedState): Promise<void> {
  try {
    const storePath = await invoke<string>('get_store_path')
    const configPath = `${storePath}/config.json`
    
    await invoke('save_file', { 
      path: configPath, 
      content: JSON.stringify(state, null, 2) 
    })
  } catch (error) {
    logger.error('Failed to save persisted state', { error: String(error) })
  }
}
