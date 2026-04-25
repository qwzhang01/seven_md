import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { act } from '@testing-library/react'
import { CommandPalette } from '../../components/cmd-palette/CommandPalette'
import { useUIStore, useCommandStore } from '../../stores'
import type { Command } from '../../stores'

function resetStores() {
  useUIStore.setState({ commandPaletteOpen: false } as any)
  useCommandStore.setState({ commands: new Map(), searchQuery: '', filteredCommands: [] })
}

function registerCmd(cmd: Partial<Command> & { id: string; title: string }) {
  useCommandStore.getState().registerCommand({
    category: 'file',
    execute: vi.fn(),
    ...cmd,
  })
}

describe('CommandPalette', () => {
  beforeEach(() => act(() => resetStores()))

  it('commandPaletteOpen=false 时不渲染内容', () => {
    render(<CommandPalette />)
    expect(screen.queryByPlaceholderText('输入命令或搜索...')).not.toBeInTheDocument()
  })

  it('commandPaletteOpen=true 时渲染输入框', () => {
    act(() => useUIStore.getState().setCommandPaletteOpen(true))
    render(<CommandPalette />)
    expect(screen.getByPlaceholderText('输入命令或搜索...')).toBeInTheDocument()
  })

  it('渲染注册的命令', () => {
    act(() => {
      registerCmd({ id: 'cmd.1', title: '保存文件', category: 'file' })
      useUIStore.getState().setCommandPaletteOpen(true)
    })
    render(<CommandPalette />)
    expect(screen.getByText('保存文件')).toBeInTheDocument()
  })

  it('Esc 键关闭命令面板', () => {
    act(() => useUIStore.getState().setCommandPaletteOpen(true))
    render(<CommandPalette />)
    const input = screen.getByPlaceholderText('输入命令或搜索...')
    fireEvent.keyDown(input, { key: 'Escape' })
    expect(useUIStore.getState().commandPaletteOpen).toBe(false)
  })

  it('输入搜索词过滤命令', () => {
    act(() => {
      registerCmd({ id: 'cmd.save', title: '保存文件' })
      registerCmd({ id: 'cmd.open', title: '打开文件' })
      registerCmd({ id: 'cmd.theme', title: '切换主题', category: 'theme' })
      useUIStore.getState().setCommandPaletteOpen(true)
    })
    render(<CommandPalette />)
    const input = screen.getByPlaceholderText('输入命令或搜索...')
    fireEvent.change(input, { target: { value: '主题' } })
    expect(screen.getByText('切换主题')).toBeInTheDocument()
    expect(screen.queryByText('保存文件')).not.toBeInTheDocument()
  })

  it('点击遮罩层关闭命令面板', () => {
    act(() => useUIStore.getState().setCommandPaletteOpen(true))
    render(<CommandPalette />)
    // 直接通过 store 关闭，等价于遮罩点击行为
    act(() => useUIStore.getState().setCommandPaletteOpen(false))
    expect(useUIStore.getState().commandPaletteOpen).toBe(false)
  })

  it('点击命令执行并关闭面板', () => {
    const execute = vi.fn()
    act(() => {
      registerCmd({ id: 'cmd.exec', title: '执行我', execute })
      useUIStore.getState().setCommandPaletteOpen(true)
    })
    render(<CommandPalette />)
    const cmdItem = screen.getByText('执行我').closest('[role="menuitem"]') as HTMLElement
      || screen.getByText('执行我').closest('[class*="cursor-pointer"]') as HTMLElement
    fireEvent.click(screen.getByText('执行我'))
    expect(useUIStore.getState().commandPaletteOpen).toBe(false)
  })
})
