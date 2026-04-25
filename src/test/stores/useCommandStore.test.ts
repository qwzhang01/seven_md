import { describe, it, expect, beforeEach, vi } from 'vitest'
import { act } from '@testing-library/react'
import { useCommandStore } from '../../stores/useCommandStore'
import type { Command } from '../../stores/useCommandStore'

function reset() {
  useCommandStore.setState({ commands: new Map(), searchQuery: '', filteredCommands: [] })
}

const makeCmd = (id: string, title: string, category: Command['category'] = 'file'): Command => ({
  id,
  title,
  category,
  execute: vi.fn(),
})

describe('useCommandStore', () => {
  beforeEach(() => act(() => reset()))

  it('registerCommand 注册命令', () => {
    act(() => { useCommandStore.getState().registerCommand(makeCmd('cmd.1', '保存文件')) })
    expect(useCommandStore.getState().commands.size).toBe(1)
  })

  it('unregisterCommand 注销命令', () => {
    act(() => { useCommandStore.getState().registerCommand(makeCmd('cmd.1', '保存文件')) })
    act(() => { useCommandStore.getState().unregisterCommand('cmd.1') })
    expect(useCommandStore.getState().commands.size).toBe(0)
  })

  it('executeCommand 调用对应 execute 函数', () => {
    const cmd = makeCmd('cmd.exec', '执行命令')
    act(() => { useCommandStore.getState().registerCommand(cmd) })
    act(() => { useCommandStore.getState().executeCommand('cmd.exec') })
    expect(cmd.execute).toHaveBeenCalledOnce()
  })

  it('executeCommand 命令不存在时不抛出', () => {
    expect(() => {
      act(() => { useCommandStore.getState().executeCommand('nonexistent') })
    }).not.toThrow()
  })

  it('when 条件为 false 时跳过执行', () => {
    const cmd = { ...makeCmd('cmd.cond', '条件命令'), when: () => false }
    act(() => { useCommandStore.getState().registerCommand(cmd) })
    act(() => { useCommandStore.getState().executeCommand('cmd.cond') })
    expect(cmd.execute).not.toHaveBeenCalled()
  })

  it('setSearchQuery 模糊过滤命令', () => {
    act(() => {
      useCommandStore.getState().registerCommand(makeCmd('file.save', '保存文件', 'file'))
      useCommandStore.getState().registerCommand(makeCmd('view.split', '分栏视图', 'view'))
      useCommandStore.getState().registerCommand(makeCmd('file.open', '打开文件', 'file'))
    })

    act(() => { useCommandStore.getState().setSearchQuery('文件') })
    const filtered = useCommandStore.getState().filteredCommands
    expect(filtered.some((c) => c.id === 'file.save')).toBe(true)
    expect(filtered.some((c) => c.id === 'file.open')).toBe(true)
    expect(filtered.some((c) => c.id === 'view.split')).toBe(false)
  })

  it('getFilteredCommands 空查询返回全部命令', () => {
    act(() => {
      for (let i = 0; i < 5; i++) {
        useCommandStore.getState().registerCommand(makeCmd(`cmd.${i}`, `命令${i}`))
      }
    })
    const all = useCommandStore.getState().getFilteredCommands()
    expect(all).toHaveLength(5)
  })
})
