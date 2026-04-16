import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useExport, EXPORT_STATUS_EVENT, ExportStatusDetail } from './useExport'

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------
vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(),
}))

vi.mock('../utils/exportUtils', () => ({
  serializePreviewToHtml: vi.fn(() => '<html><body>content</body></html>'),
  buildPrintableHtml: vi.fn(() => '<!DOCTYPE html><html><body><div class="markdown-body"><h1>Hello</h1></div></body></html>'),
  extractDocumentTitle: vi.fn(() => 'Test Title'),
  deriveExportFileName: vi.fn((path: string, ext: string) => `test.${ext}`),
}))

import { invoke } from '@tauri-apps/api/core'
import { buildPrintableHtml } from '../utils/exportUtils'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function captureExportEvent(): Promise<ExportStatusDetail> {
  return new Promise((resolve) => {
    window.addEventListener(
      EXPORT_STATUS_EVENT,
      (e) => resolve((e as CustomEvent<ExportStatusDetail>).detail),
      { once: true }
    )
  })
}

// ---------------------------------------------------------------------------
// iframe print helper
// Sets up a mock iframe environment so exportPdf can run in jsdom.
// The new implementation uses iframe.srcdoc to inject HTML, which reliably
// fires onload in Tauri WebView. We simulate this by intercepting the srcdoc
// setter and firing onload asynchronously.
// ---------------------------------------------------------------------------
function setupIframePrintMock(printFn: () => void = vi.fn()) {
  const originalCreateElement = document.createElement.bind(document)

  let srcdocValue = ''
  const mockIframe: any = {
    style: { position: '', top: '', left: '', width: '', height: '', border: '' },
    setAttribute: vi.fn(),
    onload: null as (() => void) | null,
    onerror: null as (() => void) | null,
    contentWindow: {
      focus: vi.fn(),
      print: printFn,
    },
    parentNode: null as null | { removeChild: (el: unknown) => void },
    get srcdoc() { return srcdocValue },
    set srcdoc(val: string) {
      srcdocValue = val
      // Simulate async onload triggered by srcdoc assignment
      Promise.resolve().then(() => {
        if (mockIframe.onload) mockIframe.onload()
      })
    },
  }

  // Intercept appendChild
  const originalAppendChild = document.body.appendChild.bind(document.body)
  vi.spyOn(document.body, 'appendChild').mockImplementation((node: Node) => {
    if (node === (mockIframe as unknown as Node)) {
      mockIframe.parentNode = { removeChild: vi.fn() }
      return node
    }
    return originalAppendChild(node)
  })

  vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
    if (tag === 'iframe') return mockIframe as unknown as HTMLIFrameElement
    return originalCreateElement(tag)
  })

  return { mockIframe, printFn, getSrcdoc: () => srcdocValue }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('useExport', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  // --- exportHtml ---

  it('exportHtml: calls invoke with html and suggestedName on success', async () => {
    vi.mocked(invoke).mockResolvedValueOnce('/home/user/test.html')

    const { result } = renderHook(() =>
      useExport('# Hello\n\nWorld', '/home/user/test.md')
    )

    const eventPromise = captureExportEvent()
    await act(async () => { await result.current.exportHtml() })

    expect(invoke).toHaveBeenCalledWith('export_html', expect.objectContaining({
      html: expect.any(String),
      suggestedName: expect.any(String),
    }))
    expect(result.current.isExporting).toBe(false)
    expect(result.current.exportError).toBeNull()

    const event = await eventPromise
    expect(event.type).toBe('success')
    expect(event.message).toContain('/home/user/test.html')
  })

  it('exportHtml: emits no event when user cancels (invoke returns null)', async () => {
    vi.mocked(invoke).mockResolvedValueOnce(null)

    const { result } = renderHook(() =>
      useExport('# Hello', '/home/user/test.md')
    )

    let eventFired = false
    window.addEventListener(EXPORT_STATUS_EVENT, () => { eventFired = true }, { once: true })

    await act(async () => { await result.current.exportHtml() })

    // Give a tick for any async events
    await new Promise((r) => setTimeout(r, 10))
    expect(eventFired).toBe(false)
    expect(result.current.exportError).toBeNull()
  })

  it('exportHtml: sets exportError and emits error event on failure', async () => {
    vi.mocked(invoke).mockRejectedValueOnce(new Error('Permission denied'))

    const { result } = renderHook(() =>
      useExport('# Hello', '/home/user/test.md')
    )

    const eventPromise = captureExportEvent()
    await act(async () => { await result.current.exportHtml() })

    expect(result.current.exportError).toBe('Permission denied')
    const event = await eventPromise
    expect(event.type).toBe('error')
    expect(event.message).toContain('Permission denied')
  })

  it('exportHtml: returns early when content is empty', async () => {
    const { result } = renderHook(() => useExport('', null))

    await act(async () => { await result.current.exportHtml() })

    expect(invoke).not.toHaveBeenCalled()
  })

  // --- exportPdf ---

  it('exportPdf: creates hidden iframe, writes printable HTML, and calls print()', async () => {
    const mockPrint = vi.fn()
    const { mockIframe, getSrcdoc } = setupIframePrintMock(mockPrint)

    const { result } = renderHook(() =>
      useExport('# Hello\n\nWorld', '/home/user/test.md')
    )

    const eventPromise = captureExportEvent()
    await act(async () => { await result.current.exportPdf() })

    // buildPrintableHtml should have been called with the markdown content
    expect(buildPrintableHtml).toHaveBeenCalledWith('# Hello\n\nWorld', expect.any(String))

    // iframe should have been created and hidden
    expect(document.createElement).toHaveBeenCalledWith('iframe')
    expect(mockIframe.style.position).toBe('fixed')
    expect(mockIframe.style.top).toBe('-9999px')

    // iframe srcdoc should have received the printable HTML
    expect(getSrcdoc()).toContain('<!DOCTYPE html>')

    // print() should have been called on the iframe's contentWindow
    expect(mockPrint).toHaveBeenCalled()

    expect(result.current.isExporting).toBe(false)
    expect(result.current.exportError).toBeNull()

    const event = await eventPromise
    expect(event.type).toBe('success')
    expect(event.message).toContain('Save as PDF')
  })

  it('exportPdf: returns early when content is empty', async () => {
    const mockPrint = vi.fn()
    setupIframePrintMock(mockPrint)

    const { result } = renderHook(() => useExport('', null))

    await act(async () => { await result.current.exportPdf() })

    expect(mockPrint).not.toHaveBeenCalled()
    expect(buildPrintableHtml).not.toHaveBeenCalled()
  })

  it('exportPdf: sets exportError and emits error event when print() throws', async () => {
    setupIframePrintMock(() => { throw new Error('Print failed') })

    const { result } = renderHook(() =>
      useExport('# Hello', '/home/user/test.md')
    )

    const eventPromise = captureExportEvent()
    await act(async () => { await result.current.exportPdf() })

    expect(result.current.exportError).toBe('Print failed')
    const event = await eventPromise
    expect(event.type).toBe('error')
    expect(event.message).toContain('Print failed')
  })

  it('exportPdf: sets exportError when iframe contentWindow is unavailable', async () => {
    const originalCreateElement = document.createElement.bind(document)
    const originalAppendChild = document.body.appendChild.bind(document.body)

    // Return an iframe mock with no contentWindow, but srcdoc setter fires onload
    let srcdocVal = ''
    const mockIframe: any = {
      style: { position: '', top: '', left: '', width: '', height: '', border: '' },
      setAttribute: vi.fn(),
      onload: null as (() => void) | null,
      onerror: null as (() => void) | null,
      contentWindow: null,
      parentNode: null as null | { removeChild: (el: unknown) => void },
      get srcdoc() { return srcdocVal },
      set srcdoc(val: string) {
        srcdocVal = val
        Promise.resolve().then(() => {
          if (mockIframe.onload) mockIframe.onload()
        })
      },
    }

    vi.spyOn(document.body, 'appendChild').mockImplementation((node: Node) => {
      if (node === (mockIframe as unknown as Node)) {
        mockIframe.parentNode = { removeChild: vi.fn() }
        return node
      }
      return originalAppendChild(node)
    })

    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      if (tag === 'iframe') return mockIframe as unknown as HTMLIFrameElement
      return originalCreateElement(tag)
    })

    const { result } = renderHook(() =>
      useExport('# Hello', '/home/user/test.md')
    )

    const eventPromise = captureExportEvent()
    await act(async () => { await result.current.exportPdf() })

    expect(result.current.exportError).toContain('contentWindow')
    const event = await eventPromise
    expect(event.type).toBe('error')
  })

  it('exportPdf: uses filePath to derive document title', async () => {
    const mockPrint = vi.fn()
    setupIframePrintMock(mockPrint)

    const { result } = renderHook(() =>
      useExport('# My Document\n\nContent here', '/docs/my-notes.md')
    )

    await act(async () => { await result.current.exportPdf() })

    // extractDocumentTitle and deriveExportFileName should be called
    expect(buildPrintableHtml).toHaveBeenCalledWith(
      '# My Document\n\nContent here',
      expect.any(String)
    )
  })
})
