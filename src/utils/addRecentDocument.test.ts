/**
 * Unit tests for the addRecentDocument utility (extracted from AppV2.tsx).
 *
 * Because addRecentDocument is a module-level function inside AppV2.tsx,
 * we test its behaviour by replicating the same logic here and verifying
 * the localStorage contract it must satisfy.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { invoke } from '@tauri-apps/api/core'

const RECENT_DOCS_KEY = 'recent-documents'
const MAX_RECENT_DOCS = 10

interface RecentDoc {
  path: string
  name: string
  lastOpened: number
  type: 'file' | 'folder'
}

/** Mirrors the addRecentDocument function in AppV2.tsx (including invoke sync) */
function addRecentDocument(path: string, type: 'file' | 'folder') {
  try {
    const name = path.split('/').pop() || path
    const stored = localStorage.getItem(RECENT_DOCS_KEY)
    const existing: RecentDoc[] = stored ? JSON.parse(stored) : []
    const filtered = existing.filter((f) => f.path !== path)
    const updated = [{ path, name, lastOpened: Date.now(), type }, ...filtered].slice(0, MAX_RECENT_DOCS)
    localStorage.setItem(RECENT_DOCS_KEY, JSON.stringify(updated))
    // Sync paths to Rust backend so the native menu is updated on next launch
    const paths = updated.map((f) => f.path)
    invoke('update_recent_menu', { paths }).catch((e) => console.warn('update_recent_menu failed:', e))
  } catch (e) {
    console.error('Failed to save recent document', e)
  }
}

function getStored(): RecentDoc[] {
  const raw = localStorage.getItem(RECENT_DOCS_KEY)
  return raw ? JSON.parse(raw) : []
}

describe('addRecentDocument', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
    vi.mocked(invoke).mockResolvedValue(undefined)
  })

  it('writes a file entry to localStorage', () => {
    addRecentDocument('/docs/readme.md', 'file')
    const list = getStored()
    expect(list).toHaveLength(1)
    expect(list[0]).toMatchObject({ path: '/docs/readme.md', name: 'readme.md', type: 'file' })
  })

  it('writes a folder entry to localStorage', () => {
    addRecentDocument('/projects/my-app', 'folder')
    const list = getStored()
    expect(list[0]).toMatchObject({ path: '/projects/my-app', name: 'my-app', type: 'folder' })
  })

  it('places the newest entry at index 0', () => {
    addRecentDocument('/a.md', 'file')
    addRecentDocument('/b.md', 'file')
    const list = getStored()
    expect(list[0].path).toBe('/b.md')
    expect(list[1].path).toBe('/a.md')
  })

  it('deduplicates: re-adding an existing path moves it to the top', () => {
    addRecentDocument('/a.md', 'file')
    addRecentDocument('/b.md', 'file')
    addRecentDocument('/a.md', 'file')
    const list = getStored()
    expect(list).toHaveLength(2)
    expect(list[0].path).toBe('/a.md')
    expect(list[1].path).toBe('/b.md')
  })

  it('caps the list at 10 entries', () => {
    for (let i = 0; i < 15; i++) {
      addRecentDocument(`/file${i}.md`, 'file')
    }
    const list = getStored()
    expect(list).toHaveLength(10)
    // Most recent is file14
    expect(list[0].path).toBe('/file14.md')
    // Oldest kept is file5
    expect(list[9].path).toBe('/file5.md')
  })

  it('records a lastOpened timestamp close to now', () => {
    const before = Date.now()
    addRecentDocument('/ts-test.md', 'file')
    const after = Date.now()
    const { lastOpened } = getStored()[0]
    expect(lastOpened).toBeGreaterThanOrEqual(before)
    expect(lastOpened).toBeLessThanOrEqual(after)
  })

  it('uses the last path segment as the name', () => {
    addRecentDocument('/deep/nested/path/document.md', 'file')
    expect(getStored()[0].name).toBe('document.md')
  })

  it('handles a path with no slashes (uses full path as name)', () => {
    addRecentDocument('standalone.md', 'file')
    expect(getStored()[0].name).toBe('standalone.md')
  })

  it('calls invoke("update_recent_menu") with the current path list', () => {
    addRecentDocument('/docs/readme.md', 'file')
    expect(invoke).toHaveBeenCalledWith('update_recent_menu', {
      paths: ['/docs/readme.md'],
    })
  })

  it('calls invoke("update_recent_menu") with deduplicated, capped paths', () => {
    addRecentDocument('/a.md', 'file')
    addRecentDocument('/b.md', 'file')
    addRecentDocument('/a.md', 'file') // re-add → moves to top, deduped
    expect(invoke).toHaveBeenLastCalledWith('update_recent_menu', {
      paths: ['/a.md', '/b.md'],
    })
  })

  it('caps invoke paths at 10 entries', () => {
    for (let i = 0; i < 15; i++) {
      addRecentDocument(`/file${i}.md`, 'file')
    }
    const lastCall = vi.mocked(invoke).mock.calls.at(-1)!
    const { paths } = lastCall[1] as { paths: string[] }
    expect(paths).toHaveLength(10)
    expect(paths[0]).toBe('/file14.md')
  })
})
