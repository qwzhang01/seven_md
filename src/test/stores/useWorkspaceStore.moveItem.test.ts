import { describe, it, expect, beforeEach, vi } from 'vitest'
import { act } from '@testing-library/react'
import { useWorkspaceStore } from '../../stores/useWorkspaceStore'
import { useFileStore } from '../../stores/useFileStore'
import { useNotificationStore } from '../../stores/useNotificationStore'

// ── Mock tauriCommands ────────────────────────────────────────────────────────
vi.mock('../../tauriCommands', () => ({
  readFile: vi.fn(() => Promise.resolve('')),
  saveFile: vi.fn(() => Promise.resolve()),
  readDirectory: vi.fn(() => Promise.resolve([])),
  openFolderDialog: vi.fn(() => Promise.resolve(null)),
  startFsWatch: vi.fn(() => Promise.resolve()),
  stopFsWatch: vi.fn(() => Promise.resolve()),
  createFile: vi.fn(() => Promise.resolve()),
  createDirectory: vi.fn(() => Promise.resolve()),
  renamePath: vi.fn(() => Promise.resolve()),
  deletePath: vi.fn(() => Promise.resolve()),
}))

import {
  readDirectory,
  renamePath,
} from '../../tauriCommands'

const mockReadDirectory = readDirectory as ReturnType<typeof vi.fn>
const mockRenamePath = renamePath as ReturnType<typeof vi.fn>

// ── Helpers ───────────────────────────────────────────────────────────────────

function resetStores() {
  useWorkspaceStore.setState({
    folderPath: '/root',
    folderTree: new Map([
      ['/root', [
        { name: 'docs', path: '/root/docs', type: 'directory' },
        { name: 'notes', path: '/root/notes', type: 'directory' },
        { name: 'readme.md', path: '/root/readme.md', type: 'file' },
      ]],
      ['/root/docs', [
        { name: 'guide.md', path: '/root/docs/guide.md', type: 'file' },
      ]],
      ['/root/notes', []],
    ]),
    expandedDirs: new Set(['/root/docs']),
    isLoading: false,
    rootNodes: [
      { name: 'docs', path: '/root/docs', type: 'directory' },
      { name: 'notes', path: '/root/notes', type: 'directory' },
      { name: 'readme.md', path: '/root/readme.md', type: 'file' },
    ],
  })
  useFileStore.setState({ tabs: [], activeTabId: null, recentlyClosed: [] })
  useNotificationStore.setState({ notifications: [], unreadCount: 0 })
  mockReadDirectory.mockResolvedValue([])
  mockRenamePath.mockResolvedValue(undefined)
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('useWorkspaceStore — moveItem', () => {
  beforeEach(() => {
    act(() => resetStores())
    vi.clearAllMocks()
    mockReadDirectory.mockResolvedValue([])
    mockRenamePath.mockResolvedValue(undefined)
  })

  // ── 正常移动 ────────────────────────────────────────────────────────────────

  it('移动文件到另一个文件夹：调用 renamePath 并刷新目录', async () => {
    await act(async () => {
      await useWorkspaceStore.getState().moveItem('/root/readme.md', '/root/docs')
    })

    expect(mockRenamePath).toHaveBeenCalledWith('/root/readme.md', '/root/docs/readme.md')
    // 刷新源目录（/root）和目标目录（/root/docs）
    expect(mockReadDirectory).toHaveBeenCalledWith('/root')
    expect(mockReadDirectory).toHaveBeenCalledWith('/root/docs')
  })

  it('移动文件夹到另一个文件夹：调用 renamePath 并刷新目录', async () => {
    await act(async () => {
      await useWorkspaceStore.getState().moveItem('/root/docs', '/root/notes')
    })

    expect(mockRenamePath).toHaveBeenCalledWith('/root/docs', '/root/notes/docs')
    expect(mockReadDirectory).toHaveBeenCalledWith('/root')
    expect(mockReadDirectory).toHaveBeenCalledWith('/root/notes')
  })

  it('目标路径末尾有斜杠时，destPath 不产生双斜杠', async () => {
    await act(async () => {
      await useWorkspaceStore.getState().moveItem('/root/readme.md', '/root/docs/')
    })

    expect(mockRenamePath).toHaveBeenCalledWith('/root/readme.md', '/root/docs/readme.md')
  })

  // ── 校验：禁止移动到自身 ────────────────────────────────────────────────────

  it('移动文件夹到自身：拒绝操作，不调用 renamePath', async () => {
    await act(async () => {
      await useWorkspaceStore.getState().moveItem('/root/docs', '/root/docs')
    })

    expect(mockRenamePath).not.toHaveBeenCalled()
    const { notifications } = useNotificationStore.getState()
    expect(notifications).toHaveLength(1)
    expect(notifications[0].type).toBe('error')
  })

  it('移动文件夹到其子孙目录：拒绝操作，不调用 renamePath', async () => {
    await act(async () => {
      await useWorkspaceStore.getState().moveItem('/root/docs', '/root/docs/sub')
    })

    expect(mockRenamePath).not.toHaveBeenCalled()
    const { notifications } = useNotificationStore.getState()
    expect(notifications).toHaveLength(1)
    expect(notifications[0].type).toBe('error')
  })

  // ── 校验：源父目录与目标相同时跳过 ─────────────────────────────────────────

  it('源文件已在目标文件夹中：跳过操作，不调用 renamePath', async () => {
    await act(async () => {
      // guide.md 的父目录就是 /root/docs，destPath 与 sourcePath 相同，直接拒绝
      await useWorkspaceStore.getState().moveItem('/root/docs/guide.md', '/root/docs')
    })

    expect(mockRenamePath).not.toHaveBeenCalled()
  })

  it('源文件夹的父目录与目标相同时：destPath 等于 sourcePath，拒绝操作', async () => {
    // docs 的父目录是 /root，目标也是 /root，destPath=/root/docs === sourcePath=/root/docs
    // 触发第一个校验（destPath === sourcePath），显示 error 通知
    await act(async () => {
      await useWorkspaceStore.getState().moveItem('/root/docs', '/root')
    })

    expect(mockRenamePath).not.toHaveBeenCalled()
    const { notifications } = useNotificationStore.getState()
    expect(notifications).toHaveLength(1)
    expect(notifications[0].type).toBe('error')
  })

  // ── 失败处理 ────────────────────────────────────────────────────────────────

  it('renamePath 抛出错误时：显示 error 通知，不崩溃', async () => {
    mockRenamePath.mockRejectedValueOnce(new Error('Permission denied'))

    await act(async () => {
      await useWorkspaceStore.getState().moveItem('/root/readme.md', '/root/docs')
    })

    const { notifications } = useNotificationStore.getState()
    expect(notifications).toHaveLength(1)
    expect(notifications[0].type).toBe('error')
    expect(notifications[0].message).toContain('readme.md')
  })

  // ── Tab 路径更新 ────────────────────────────────────────────────────────────

  it('移动已打开的文件后，对应 Tab 路径更新为新路径', async () => {
    // 先打开一个 tab
    act(() => {
      useFileStore.getState().openTab('/root/readme.md', '# Hello')
    })

    await act(async () => {
      await useWorkspaceStore.getState().moveItem('/root/readme.md', '/root/docs')
    })

    const { tabs } = useFileStore.getState()
    expect(tabs[0].path).toBe('/root/docs/readme.md')
  })

  it('移动文件夹后，文件夹内已打开的所有 Tab 路径批量更新', async () => {
    // 打开 docs 文件夹内的文件
    act(() => {
      useFileStore.getState().openTab('/root/docs/guide.md', '# Guide')
    })

    await act(async () => {
      await useWorkspaceStore.getState().moveItem('/root/docs', '/root/notes')
    })

    const { tabs } = useFileStore.getState()
    expect(tabs[0].path).toBe('/root/notes/docs/guide.md')
  })

  it('移动未打开的文件时，Tab 列表不受影响', async () => {
    act(() => {
      useFileStore.getState().openTab('/root/docs/guide.md', '# Guide')
    })

    await act(async () => {
      // 移动 readme.md（未打开），不影响 guide.md 的 tab
      await useWorkspaceStore.getState().moveItem('/root/readme.md', '/root/docs')
    })

    const { tabs } = useFileStore.getState()
    expect(tabs[0].path).toBe('/root/docs/guide.md')
  })

  // ── 根目录刷新 ──────────────────────────────────────────────────────────────

  it('源目录是根目录时，rootNodes 同步刷新', async () => {
    const refreshedNodes = [
      { name: 'notes', path: '/root/notes', type: 'directory' as const },
    ]
    mockReadDirectory.mockImplementation((path: string) => {
      if (path === '/root') return Promise.resolve(refreshedNodes)
      return Promise.resolve([])
    })

    await act(async () => {
      await useWorkspaceStore.getState().moveItem('/root/readme.md', '/root/docs')
    })

    // loadDirectory('/root') 被调用后 rootNodes 应更新
    expect(useWorkspaceStore.getState().rootNodes).toEqual(refreshedNodes)
  })
})
