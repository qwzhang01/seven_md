import { invoke } from '@tauri-apps/api/core'

const RECENT_DOCS_KEY = 'recent-documents'
const MAX_RECENT_DOCS = 10

export interface RecentDoc {
  path: string
  name: string
  lastOpened: number
  type: 'file' | 'folder'
}

export function addRecentDocument(path: string, type: 'file' | 'folder') {
  try {
    const name = path.split('/').pop() || path
    const stored = localStorage.getItem(RECENT_DOCS_KEY)
    const existing: RecentDoc[] = stored ? JSON.parse(stored) : []
    const filtered = existing.filter((f) => f.path !== path)
    const updated = [{ path, name, lastOpened: Date.now(), type }, ...filtered].slice(0, MAX_RECENT_DOCS)
    localStorage.setItem(RECENT_DOCS_KEY, JSON.stringify(updated))
    const paths = updated.map((f) => f.path)
    invoke('update_recent_menu', { paths }).catch((e) => console.warn('update_recent_menu failed:', e))
  } catch (e) {
    console.error('Failed to save recent document', e)
  }
}

export function clearRecentDocuments() {
  localStorage.removeItem(RECENT_DOCS_KEY)
  invoke('update_recent_menu', { paths: [] }).catch(() => {})
}

export function getRecentDocType(path: string): 'file' | 'folder' {
  try {
    const stored = localStorage.getItem(RECENT_DOCS_KEY)
    if (stored) {
      const docs = JSON.parse(stored) as Array<{ path: string; type?: 'file' | 'folder' }>
      const found = docs.find((d) => d.path === path)
      if (found?.type === 'folder') return 'folder'
    }
  } catch {
    // ignore parse errors, default to 'file'
  }
  return 'file'
}
