/**
 * 集成测试：标签页管理
 * 验证打开、切换、关闭、恢复标签页的完整流程
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { act } from '@testing-library/react'
import { useFileStore } from '../../stores/useFileStore'
import { useNotificationStore } from '../../stores/useNotificationStore'

function resetStores() {
  useFileStore.setState({ tabs: [], activeTabId: null, recentlyClosed: [] })
  useNotificationStore.setState({ notifications: [], unreadCount: 0 })
}

describe('标签页管理集成测试', () => {
  beforeEach(() => act(() => resetStores()))

  it('完整流程：打开→编辑→保存→关闭', () => {
    // 1. 打开新文件
    let tabId!: string
    act(() => {
      tabId = useFileStore.getState().openTab(null, '')
    })
    expect(useFileStore.getState().tabs[0].isDirty).toBe(false)

    // 2. 编辑内容，isDirty 变为 true
    act(() => {
      useFileStore.getState().updateTabContent(tabId, '# Hello World')
    })
    expect(useFileStore.getState().tabs[0].isDirty).toBe(true)
    expect(useFileStore.getState().tabs[0].content).toBe('# Hello World')

    // 3. 模拟保存（setTabDirty → false）
    act(() => {
      useFileStore.getState().setTabDirty(tabId, false)
    })
    expect(useFileStore.getState().tabs[0].isDirty).toBe(false)

    // 4. 关闭
    act(() => {
      useFileStore.getState().closeTab(tabId)
    })
    expect(useFileStore.getState().tabs).toHaveLength(0)
    expect(useFileStore.getState().recentlyClosed).toHaveLength(1)
  })

  it('多标签切换：激活标签页 ID 正确变化', () => {
    let id1!: string, id2!: string, id3!: string
    act(() => {
      id1 = useFileStore.getState().openTab(null, 'a')
      id2 = useFileStore.getState().openTab(null, 'b')
      id3 = useFileStore.getState().openTab(null, 'c')
    })

    expect(useFileStore.getState().activeTabId).toBe(id3)
    act(() => useFileStore.getState().switchTab(id1))
    expect(useFileStore.getState().activeTabId).toBe(id1)
    act(() => useFileStore.getState().switchTab(id2))
    expect(useFileStore.getState().activeTabId).toBe(id2)
  })

  it('关闭中间标签页，激活相邻标签页', () => {
    let id1!: string, id2!: string, id3!: string
    act(() => {
      id1 = useFileStore.getState().openTab(null, 'a')
      id2 = useFileStore.getState().openTab(null, 'b')
      id3 = useFileStore.getState().openTab(null, 'c')
    })

    act(() => useFileStore.getState().switchTab(id2))
    act(() => useFileStore.getState().closeTab(id2))

    const active = useFileStore.getState().activeTabId
    expect(active === id1 || active === id3).toBe(true)
  })

  it('关闭最后一个标签页后 activeTabId 为 null', () => {
    let id!: string
    act(() => { id = useFileStore.getState().openTab(null, 'only') })
    act(() => useFileStore.getState().closeTab(id))
    expect(useFileStore.getState().activeTabId).toBeNull()
  })

  it('恢复最近关闭的标签页内容不变', () => {
    let id!: string
    act(() => {
      id = useFileStore.getState().openTab('/some/file.md', '# Restored Content')
    })
    act(() => useFileStore.getState().closeTab(id))
    act(() => useFileStore.getState().reopenClosedTab())

    const restored = useFileStore.getState().tabs[0]
    expect(restored.content).toBe('# Restored Content')
  })

  it('拖拽排序后顺序正确', () => {
    act(() => {
      useFileStore.getState().openTab(null, 'first')
      useFileStore.getState().openTab(null, 'second')
      useFileStore.getState().openTab(null, 'third')
    })

    act(() => useFileStore.getState().reorderTabs(2, 0))
    const tabs = useFileStore.getState().tabs
    expect(tabs[0].content).toBe('third')
    expect(tabs[1].content).toBe('first')
    expect(tabs[2].content).toBe('second')
  })
})
