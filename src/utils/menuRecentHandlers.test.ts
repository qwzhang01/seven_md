/**
 * Unit tests for the native-menu recent-document event handlers.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { invoke } from '@tauri-apps/api/core'
import { readFile } from '../tauriCommands'
import { addRecentDocument, clearRecentDocuments, type RecentDoc } from './recentDocuments'

const RECENT_DOCS_KEY = 'recent-documents'

// ---- Extracted handler logic (mirrors useTauriMenuListeners.ts) ----

/** Mirrors the menu-clear-recent handler */
function handleClearRecent(
  addNotification: (n: { type: string; message: string }) => void
) {
  clearRecentDocuments()
  addNotification({ type: 'info', message: '已清除最近文档' })
}

/** Mirrors the menu-open-recent-doc handler */
async function handleOpenRecentDoc(
  path: string,
  openTab: (path: string, content: string) => void,
  addNotification: (n: { type: string; message: string }) => void
) {
  if (!path) return
  try {
    const content = await readFile(path)
    openTab(path, content)
    addRecentDocument(path, 'file')
  } catch (err) {
    addNotification({ type: 'error', message: `打开最近文档失败: ${err}` })
  }
}

// ---- Tests ----

describe('menu-clear-recent handler', () => {
  const addNotification = vi.fn()

  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
    vi.mocked(invoke).mockResolvedValue(undefined)
  })

  it('removes the recent-documents key from localStorage', () => {
    localStorage.setItem(RECENT_DOCS_KEY, JSON.stringify([{ path: '/a.md' }]))
    handleClearRecent(addNotification)
    expect(localStorage.getItem(RECENT_DOCS_KEY)).toBeNull()
  })

  it('calls invoke("update_recent_menu") with an empty paths array', () => {
    handleClearRecent(addNotification)
    expect(invoke).toHaveBeenCalledWith('update_recent_menu', { paths: [] })
  })

  it('calls addNotification with type "info"', () => {
    handleClearRecent(addNotification)
    expect(addNotification).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'info', message: '已清除最近文档' })
    )
  })

  it('does not throw when localStorage is already empty', () => {
    expect(() => handleClearRecent(addNotification)).not.toThrow()
  })
})

describe('menu-open-recent-doc handler', () => {
  const openTab = vi.fn()
  const addNotification = vi.fn()

  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
    vi.mocked(invoke).mockResolvedValue(undefined)
  })

  it('reads the file and opens a tab with its content', async () => {
    vi.mocked(readFile).mockResolvedValueOnce('# Hello')
    await handleOpenRecentDoc('/docs/hello.md', openTab, addNotification)
    expect(readFile).toHaveBeenCalledWith('/docs/hello.md')
    expect(openTab).toHaveBeenCalledWith('/docs/hello.md', '# Hello')
  })

  it('adds the opened path to recent documents in localStorage', async () => {
    vi.mocked(readFile).mockResolvedValueOnce('content')
    await handleOpenRecentDoc('/docs/hello.md', openTab, addNotification)
    const stored: RecentDoc[] = JSON.parse(localStorage.getItem(RECENT_DOCS_KEY)!)
    expect(stored[0]).toMatchObject({ path: '/docs/hello.md', type: 'file' })
  })

  it('calls invoke("update_recent_menu") after opening the file', async () => {
    vi.mocked(readFile).mockResolvedValueOnce('content')
    await handleOpenRecentDoc('/docs/hello.md', openTab, addNotification)
    expect(invoke).toHaveBeenCalledWith('update_recent_menu', {
      paths: ['/docs/hello.md'],
    })
  })

  it('does nothing when path is empty string', async () => {
    await handleOpenRecentDoc('', openTab, addNotification)
    expect(readFile).not.toHaveBeenCalled()
    expect(openTab).not.toHaveBeenCalled()
  })

  it('shows an error notification when readFile throws', async () => {
    vi.mocked(readFile).mockRejectedValueOnce(new Error('file not found'))
    await handleOpenRecentDoc('/missing.md', openTab, addNotification)
    expect(openTab).not.toHaveBeenCalled()
    expect(addNotification).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'error' })
    )
  })

  it('does not add to recent documents when readFile fails', async () => {
    vi.mocked(readFile).mockRejectedValueOnce(new Error('fail'))
    await handleOpenRecentDoc('/missing.md', openTab, addNotification)
    expect(localStorage.getItem(RECENT_DOCS_KEY)).toBeNull()
  })
})
