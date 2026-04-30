import { describe, it, expect, beforeEach } from 'vitest'
import { act } from '@testing-library/react'
import { useFileStore } from '../../stores/useFileStore'

function resetStore() {
  useFileStore.setState({ tabs: [], activeTabId: null, recentlyClosed: [] })
}

describe('useFileStore', () => {
  beforeEach(() => {
    act(() => resetStore())
  })

  it('初始状态：没有标签页', () => {
    const { tabs, activeTabId } = useFileStore.getState()
    expect(tabs).toHaveLength(0)
    expect(activeTabId).toBeNull()
  })

  it('openTab 创建新标签页并激活', () => {
    let tabId!: string
    act(() => {
      tabId = useFileStore.getState().openTab(null, '# Hello')
    })
    const { tabs, activeTabId } = useFileStore.getState()
    expect(tabs).toHaveLength(1)
    expect(tabs[0].content).toBe('# Hello')
    expect(activeTabId).toBe(tabId)
    expect(tabs[0].name).toBe('Untitled')
  })

  it('openTab 同一路径不重复打开，直接激活', () => {
    let id1!: string
    let id2!: string
    act(() => {
      id1 = useFileStore.getState().openTab('/a/test.md', 'content')
      id2 = useFileStore.getState().openTab('/a/test.md', 'content')
    })
    expect(useFileStore.getState().tabs).toHaveLength(1)
    expect(id1).toBe(id2)
  })

  it('closeTab 关闭标签页并移入 recentlyClosed', () => {
    let tabId!: string
    act(() => { tabId = useFileStore.getState().openTab(null, '') })
    act(() => { useFileStore.getState().closeTab(tabId) })
    const { tabs, recentlyClosed } = useFileStore.getState()
    expect(tabs).toHaveLength(0)
    expect(recentlyClosed).toHaveLength(1)
  })

  it('closeTab 关闭后激活临近标签页', () => {
    act(() => {
      useFileStore.getState().openTab(null, 'a')
      useFileStore.getState().openTab(null, 'b')
    })
    const { tabs } = useFileStore.getState()
    act(() => { useFileStore.getState().closeTab(tabs[1].id) })
    expect(useFileStore.getState().activeTabId).toBe(tabs[0].id)
  })

  it('updateTabContent 更新内容并标记 isDirty', () => {
    let tabId!: string
    act(() => { tabId = useFileStore.getState().openTab(null, '') })
    act(() => { useFileStore.getState().updateTabContent(tabId, 'new content') })
    const tab = useFileStore.getState().tabs[0]
    expect(tab.content).toBe('new content')
    expect(tab.isDirty).toBe(true)
  })

  it('setTabDirty 清除 dirty 状态', () => {
    let tabId!: string
    act(() => { tabId = useFileStore.getState().openTab(null, '') })
    act(() => { useFileStore.getState().updateTabContent(tabId, 'changed') })
    act(() => { useFileStore.getState().setTabDirty(tabId, false) })
    expect(useFileStore.getState().tabs[0].isDirty).toBe(false)
  })

  it('reorderTabs 调整标签页顺序', () => {
    act(() => {
      useFileStore.getState().openTab(null, 'a')
      useFileStore.getState().openTab(null, 'b')
      useFileStore.getState().openTab(null, 'c')
    })
    act(() => { useFileStore.getState().reorderTabs(0, 2) })
    const names = useFileStore.getState().tabs.map((t) => t.content)
    expect(names[2]).toBe('a')
  })

  it('reopenClosedTab 恢复最近关闭的标签页', () => {
    let tabId!: string
    act(() => { tabId = useFileStore.getState().openTab(null, 'restored') })
    act(() => { useFileStore.getState().closeTab(tabId) })
    act(() => { useFileStore.getState().reopenClosedTab() })
    const { tabs } = useFileStore.getState()
    expect(tabs).toHaveLength(1)
    expect(tabs[0].content).toBe('restored')
  })

  it('closeAllTabs 清空所有标签页并移入 recentlyClosed', () => {
    act(() => {
      useFileStore.getState().openTab(null, 'a')
      useFileStore.getState().openTab(null, 'b')
    })
    act(() => { useFileStore.getState().closeAllTabs() })
    expect(useFileStore.getState().tabs).toHaveLength(0)
    expect(useFileStore.getState().activeTabId).toBeNull()
    expect(useFileStore.getState().recentlyClosed).toHaveLength(2)
  })

  it('closeAllTabs 含脏标签时脏标签也被移入 recentlyClosed', () => {
    const ids: string[] = []
    act(() => {
      ids.push(useFileStore.getState().openTab(null, 'a'))
      ids.push(useFileStore.getState().openTab(null, 'b'))
      useFileStore.getState().setTabDirty(ids[0], true)
    })
    act(() => { useFileStore.getState().closeAllTabs() })
    const { tabs, recentlyClosed } = useFileStore.getState()
    expect(tabs).toHaveLength(0)
    expect(recentlyClosed).toHaveLength(2)
  })

  it('getActiveTab 返回当前活跃标签页', () => {
    act(() => { useFileStore.getState().openTab('/path/file.md', '# content') })
    const tab = useFileStore.getState().getActiveTab()
    expect(tab).not.toBeNull()
    expect(tab!.path).toBe('/path/file.md')
  })

  // ── Batch close actions ──────────────────────────────────────────────────

  describe('closeOtherTabs', () => {
    it('关闭除指定标签外的所有标签', () => {
      let idA!: string, idB!: string, idC!: string
      act(() => {
        idA = useFileStore.getState().openTab(null, 'a')
        idB = useFileStore.getState().openTab(null, 'b')
        idC = useFileStore.getState().openTab(null, 'c')
      })
      act(() => { useFileStore.getState().closeOtherTabs(idB) })
      const { tabs } = useFileStore.getState()
      expect(tabs).toHaveLength(1)
      expect(tabs[0].id).toBe(idB)
      // idA and idC should be in recentlyClosed
      expect(useFileStore.getState().recentlyClosed.map((t) => t.id)).toContain(idA)
      expect(useFileStore.getState().recentlyClosed.map((t) => t.id)).toContain(idC)
    })

    it('仅一个标签时无操作', () => {
      let idA!: string
      act(() => { idA = useFileStore.getState().openTab(null, 'a') })
      act(() => { useFileStore.getState().closeOtherTabs(idA) })
      expect(useFileStore.getState().tabs).toHaveLength(1)
    })

    it('含脏标签时仍能关闭（脏标签被移入 recentlyClosed）', () => {
    const ids: string[] = []
      act(() => {
        ids.push(useFileStore.getState().openTab(null, 'a'))
        ids.push(useFileStore.getState().openTab(null, 'b'))
        ids.push(useFileStore.getState().openTab(null, 'c'))
        useFileStore.getState().setTabDirty(ids[0], true)
        useFileStore.getState().setTabDirty(ids[2], true)
      })
      act(() => { useFileStore.getState().closeOtherTabs(ids[1]) })
      const { tabs, recentlyClosed } = useFileStore.getState()
      expect(tabs).toHaveLength(1)
      expect(tabs[0].id).toBe(ids[1])
      expect(recentlyClosed).toHaveLength(2)
    })
  })

  describe('closeTabsToLeft', () => {
    it('关闭指定标签左侧的所有标签', () => {
      let idA!: string, idB!: string, idC!: string
      act(() => {
        idA = useFileStore.getState().openTab(null, 'a')
        idB = useFileStore.getState().openTab(null, 'b')
        idC = useFileStore.getState().openTab(null, 'c')
      })
      act(() => { useFileStore.getState().closeTabsToLeft(idC) })
      const { tabs } = useFileStore.getState()
      expect(tabs.map((t) => t.id)).not.toContain(idA)
      expect(tabs.map((t) => t.id)).not.toContain(idB)
      expect(tabs.map((t) => t.id)).toContain(idC)
    })

    it('最左侧标签时无操作', () => {
      let idA!: string
      act(() => {
        idA = useFileStore.getState().openTab(null, 'a')
        useFileStore.getState().openTab(null, 'b')
      })
      act(() => { useFileStore.getState().closeTabsToLeft(idA) })
      expect(useFileStore.getState().tabs).toHaveLength(2)
    })

    it('含脏标签时左侧脏标签被移入 recentlyClosed', () => {
    const ids: string[] = []
      act(() => {
        ids.push(useFileStore.getState().openTab(null, 'a'))
        ids.push(useFileStore.getState().openTab(null, 'b'))
        ids.push(useFileStore.getState().openTab(null, 'c'))
        useFileStore.getState().setTabDirty(ids[0], true)
      })
      act(() => { useFileStore.getState().closeTabsToLeft(ids[2]) })
      const { tabs, recentlyClosed } = useFileStore.getState()
      expect(tabs).toHaveLength(1)
      expect(recentlyClosed.some((t) => t.id === ids[0])).toBe(true)
    })
  })

  describe('closeTabsToRight', () => {
    it('关闭指定标签右侧的所有标签', () => {
      let idA!: string, idB!: string, idC!: string
      act(() => {
        idA = useFileStore.getState().openTab(null, 'a')
        idB = useFileStore.getState().openTab(null, 'b')
        idC = useFileStore.getState().openTab(null, 'c')
      })
      act(() => { useFileStore.getState().closeTabsToRight(idA) })
      const { tabs } = useFileStore.getState()
      expect(tabs.map((t) => t.id)).toContain(idA)
      expect(tabs.map((t) => t.id)).not.toContain(idB)
      expect(tabs.map((t) => t.id)).not.toContain(idC)
    })

    it('最右侧标签时无操作', () => {
      let idB!: string
      act(() => {
        useFileStore.getState().openTab(null, 'a')
        idB = useFileStore.getState().openTab(null, 'b')
      })
      act(() => { useFileStore.getState().closeTabsToRight(idB) })
      expect(useFileStore.getState().tabs).toHaveLength(2)
    })

    it('含脏标签时右侧脏标签被移入 recentlyClosed', () => {
    const ids: string[] = []
      act(() => {
        ids.push(useFileStore.getState().openTab(null, 'a'))
        ids.push(useFileStore.getState().openTab(null, 'b'))
        ids.push(useFileStore.getState().openTab(null, 'c'))
        useFileStore.getState().setTabDirty(ids[2], true)
      })
      act(() => { useFileStore.getState().closeTabsToRight(ids[0]) })
      const { tabs, recentlyClosed } = useFileStore.getState()
      expect(tabs).toHaveLength(1)
      expect(recentlyClosed.some((t) => t.id === ids[2])).toBe(true)
    })
  })

})
