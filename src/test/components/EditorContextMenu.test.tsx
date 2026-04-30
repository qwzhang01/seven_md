import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { EditorContextMenu } from '../../components/editor-v2/EditorContextMenu'

const defaultProps = {
  x: 100,
  y: 100,
  onClose: vi.fn(),
  onInsert: vi.fn(),
  onFind: vi.fn(),
  onAIRewrite: vi.fn(),
  onFormat: vi.fn(),
}

describe('EditorContextMenu — 剪贴板菜单项', () => {
  let dispatchedEvents: string[]

  beforeEach(() => {
    dispatchedEvents = []
    window.addEventListener('editor:cut', () => dispatchedEvents.push('editor:cut'))
    window.addEventListener('editor:copy', () => dispatchedEvents.push('editor:copy'))
    window.addEventListener('editor:paste', () => dispatchedEvents.push('editor:paste'))
  })

  afterEach(() => {
    // Remove all listeners added in beforeEach
    window.removeEventListener('editor:cut', () => {})
    window.removeEventListener('editor:copy', () => {})
    window.removeEventListener('editor:paste', () => {})
    dispatchedEvents = []
  })

  it('点击"剪切"派发 editor:cut CustomEvent', () => {
    const onClose = vi.fn()
    render(<EditorContextMenu {...defaultProps} onClose={onClose} />)

    const cutBtn = screen.getByRole('menuitem', { name: /剪切/ })
    fireEvent.click(cutBtn)

    expect(dispatchedEvents).toContain('editor:cut')
  })

  it('点击"复制"派发 editor:copy CustomEvent', () => {
    const onClose = vi.fn()
    render(<EditorContextMenu {...defaultProps} onClose={onClose} />)

    const copyBtn = screen.getByRole('menuitem', { name: /复制/ })
    fireEvent.click(copyBtn)

    expect(dispatchedEvents).toContain('editor:copy')
  })

  it('点击"粘贴"派发 editor:paste CustomEvent', () => {
    const onClose = vi.fn()
    render(<EditorContextMenu {...defaultProps} onClose={onClose} />)

    const pasteBtn = screen.getByRole('menuitem', { name: /粘贴/ })
    fireEvent.click(pasteBtn)

    expect(dispatchedEvents).toContain('editor:paste')
  })

  it('点击"剪切"不直接调用 document.execCommand', () => {
    if (!document.execCommand) document.execCommand = () => false
    const execCommandSpy = vi.spyOn(document, 'execCommand').mockReturnValue(true)
    render(<EditorContextMenu {...defaultProps} />)

    const cutBtn = screen.getByRole('menuitem', { name: /剪切/ })
    fireEvent.click(cutBtn)

    expect(execCommandSpy).not.toHaveBeenCalledWith('cut')
    execCommandSpy.mockRestore()
  })

  it('点击"复制"不直接调用 document.execCommand', () => {
    if (!document.execCommand) document.execCommand = () => false
    const execCommandSpy = vi.spyOn(document, 'execCommand').mockReturnValue(true)
    render(<EditorContextMenu {...defaultProps} />)

    const copyBtn = screen.getByRole('menuitem', { name: /复制/ })
    fireEvent.click(copyBtn)

    expect(execCommandSpy).not.toHaveBeenCalledWith('copy')
    execCommandSpy.mockRestore()
  })

  it('点击"粘贴"不直接调用 document.execCommand', () => {
    if (!document.execCommand) document.execCommand = () => false
    const execCommandSpy = vi.spyOn(document, 'execCommand').mockReturnValue(true)
    render(<EditorContextMenu {...defaultProps} />)

    const pasteBtn = screen.getByRole('menuitem', { name: /粘贴/ })
    fireEvent.click(pasteBtn)

    expect(execCommandSpy).not.toHaveBeenCalledWith('paste')
    execCommandSpy.mockRestore()
  })

  it('点击菜单项后调用 onClose', () => {
    const onClose = vi.fn()
    render(<EditorContextMenu {...defaultProps} onClose={onClose} />)

    fireEvent.click(screen.getByRole('menuitem', { name: /复制/ }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('快捷键提示显示正确', () => {
    render(<EditorContextMenu {...defaultProps} />)
    expect(screen.getByText('Ctrl+X')).toBeInTheDocument()
    expect(screen.getByText('Ctrl+C')).toBeInTheDocument()
    expect(screen.getByText('Ctrl+V')).toBeInTheDocument()
  })
})
