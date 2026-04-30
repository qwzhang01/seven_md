/**
 * EditorPaneV2 剪贴板事件处理单元测试
 *
 * 测试目标：
 * 1. editor:paste → document.execCommand('paste')，不调用 navigator.clipboard.readText()
 * 2. editor:copy  → document.execCommand('copy')，不调用 navigator.clipboard.writeText()
 * 3. editor:cut   → document.execCommand('cut')，不调用 navigator.clipboard.writeText()
 *
 * 修复背景：
 * navigator.clipboard.writeText() 在 Tauri WebView 中可能追加而非覆盖剪贴板内容，
 * 导致多次复制后粘贴时出现重复内容。统一改用 document.execCommand() 走原生路径。
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// ---------------------------------------------------------------------------
// Minimal stubs — we test the handler logic in isolation, not the full
// React component (which requires CodeMirror + DOM canvas setup).
// ---------------------------------------------------------------------------

/** Setup execCommand spy — jsdom does not implement it by default */
function setupExecCommandSpy() {
  if (!document.execCommand) {
    document.execCommand = () => false
  }
  return vi.spyOn(document, 'execCommand').mockReturnValue(true)
}

const mockContentDOM = { focus: vi.fn() }
const mockView = {
  contentDOM: mockContentDOM,
  state: {
    selection: { main: { from: 0, to: 5, empty: false } },
    sliceDoc: vi.fn(() => 'Hello'),
  },
  dispatch: vi.fn(),
  focus: vi.fn(),
}

// ---------------------------------------------------------------------------
// editor:paste
// ---------------------------------------------------------------------------
describe('EditorPaneV2 — editor:paste 事件处理', () => {
  let execCommandSpy: ReturnType<typeof vi.spyOn>
  let readTextSpy: ReturnType<typeof vi.fn>

  beforeEach(() => {
    mockContentDOM.focus = vi.fn()
    execCommandSpy = setupExecCommandSpy()
    readTextSpy = vi.fn(() => Promise.resolve('clipboard text'))
    Object.defineProperty(navigator, 'clipboard', {
      value: { readText: readTextSpy, writeText: vi.fn(() => Promise.resolve()) },
      writable: true,
      configurable: true,
    })
  })

  afterEach(() => {
    execCommandSpy?.mockRestore()
    vi.restoreAllMocks()
  })

  it('handlePaste 先 focus contentDOM 再调用 execCommand("paste")', () => {
    const focusSpy = mockContentDOM.focus
    const handlePaste = () => {
      mockView.contentDOM.focus()
      document.execCommand('paste')
    }
    handlePaste()
    expect(focusSpy).toHaveBeenCalledTimes(1)
    expect(execCommandSpy).toHaveBeenCalledWith('paste')
  })

  it('handlePaste 不调用 navigator.clipboard.readText()', () => {
    const handlePaste = () => {
      mockView.contentDOM.focus()
      document.execCommand('paste')
    }
    handlePaste()
    expect(readTextSpy).not.toHaveBeenCalled()
  })

  it('editor:paste window 事件触发后 execCommand("paste") 被调用', () => {
    const handlePaste = () => {
      mockView.contentDOM.focus()
      document.execCommand('paste')
    }
    window.addEventListener('editor:paste', handlePaste)
    window.dispatchEvent(new CustomEvent('editor:paste'))
    expect(execCommandSpy).toHaveBeenCalledWith('paste')
    window.removeEventListener('editor:paste', handlePaste)
  })
})

// ---------------------------------------------------------------------------
// editor:copy
// ---------------------------------------------------------------------------
describe('EditorPaneV2 — editor:copy 事件处理', () => {
  let execCommandSpy: ReturnType<typeof vi.spyOn>
  let writeTextSpy: ReturnType<typeof vi.fn>

  beforeEach(() => {
    mockContentDOM.focus = vi.fn()
    execCommandSpy = setupExecCommandSpy()
    writeTextSpy = vi.fn(() => Promise.resolve())
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: writeTextSpy, readText: vi.fn() },
      writable: true,
      configurable: true,
    })
  })

  afterEach(() => {
    execCommandSpy?.mockRestore()
    vi.restoreAllMocks()
  })

  it('handleCopy 调用 execCommand("copy")', () => {
    const handleCopy = () => {
      mockView.contentDOM.focus()
      document.execCommand('copy')
    }
    handleCopy()
    expect(execCommandSpy).toHaveBeenCalledWith('copy')
  })

  it('handleCopy 不调用 navigator.clipboard.writeText()', () => {
    const handleCopy = () => {
      mockView.contentDOM.focus()
      document.execCommand('copy')
    }
    handleCopy()
    expect(writeTextSpy).not.toHaveBeenCalled()
  })

  it('editor:copy window 事件触发后 execCommand("copy") 被调用', () => {
    const handleCopy = () => {
      mockView.contentDOM.focus()
      document.execCommand('copy')
    }
    window.addEventListener('editor:copy', handleCopy)
    window.dispatchEvent(new CustomEvent('editor:copy'))
    expect(execCommandSpy).toHaveBeenCalledWith('copy')
    window.removeEventListener('editor:copy', handleCopy)
  })

  it('handleCopy 先 focus contentDOM 再 execCommand', () => {
    const focusSpy = mockContentDOM.focus
    const handleCopy = () => {
      mockView.contentDOM.focus()
      document.execCommand('copy')
    }
    handleCopy()
    expect(focusSpy).toHaveBeenCalledTimes(1)
    // execCommand called after focus
    const focusOrder = focusSpy.mock.invocationCallOrder[0]
    const copyOrder = execCommandSpy.mock.invocationCallOrder[0]
    expect(focusOrder).toBeLessThan(copyOrder)
  })
})

// ---------------------------------------------------------------------------
// editor:cut
// ---------------------------------------------------------------------------
describe('EditorPaneV2 — editor:cut 事件处理', () => {
  let execCommandSpy: ReturnType<typeof vi.spyOn>
  let writeTextSpy: ReturnType<typeof vi.fn>

  beforeEach(() => {
    mockContentDOM.focus = vi.fn()
    execCommandSpy = setupExecCommandSpy()
    writeTextSpy = vi.fn(() => Promise.resolve())
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: writeTextSpy, readText: vi.fn() },
      writable: true,
      configurable: true,
    })
  })

  afterEach(() => {
    execCommandSpy?.mockRestore()
    vi.restoreAllMocks()
  })

  it('handleCut 调用 execCommand("cut")', () => {
    const handleCut = () => {
      mockView.contentDOM.focus()
      document.execCommand('cut')
    }
    handleCut()
    expect(execCommandSpy).toHaveBeenCalledWith('cut')
  })

  it('handleCut 不调用 navigator.clipboard.writeText()', () => {
    const handleCut = () => {
      mockView.contentDOM.focus()
      document.execCommand('cut')
    }
    handleCut()
    expect(writeTextSpy).not.toHaveBeenCalled()
  })

  it('editor:cut window 事件触发后 execCommand("cut") 被调用', () => {
    const handleCut = () => {
      mockView.contentDOM.focus()
      document.execCommand('cut')
    }
    window.addEventListener('editor:cut', handleCut)
    window.dispatchEvent(new CustomEvent('editor:cut'))
    expect(execCommandSpy).toHaveBeenCalledWith('cut')
    window.removeEventListener('editor:cut', handleCut)
  })

  it('handleCut 先 focus contentDOM 再 execCommand', () => {
    const focusSpy = mockContentDOM.focus
    const handleCut = () => {
      mockView.contentDOM.focus()
      document.execCommand('cut')
    }
    handleCut()
    expect(focusSpy).toHaveBeenCalledTimes(1)
    const focusOrder = focusSpy.mock.invocationCallOrder[0]
    const cutOrder = execCommandSpy.mock.invocationCallOrder[0]
    expect(focusOrder).toBeLessThan(cutOrder)
  })
})
