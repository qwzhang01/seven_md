import { useState, useCallback } from 'react'
import { invoke } from '@tauri-apps/api/core'
import {
  buildPrintableHtml,
  extractDocumentTitle,
  deriveExportFileName,
} from '../utils/exportUtils'

// ── Event types ───────────────────────────────────────────────────────────────

export const EXPORT_STATUS_EVENT = 'export-status'

export interface ExportStatusDetail {
  type: 'success' | 'error'
  message: string
}

function dispatchExportEvent(detail: ExportStatusDetail) {
  window.dispatchEvent(new CustomEvent<ExportStatusDetail>(EXPORT_STATUS_EVENT, { detail }))
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useExport(content: string, filePath: string | null) {
  const [isExporting, setIsExporting] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)

  // ── exportHtml ──────────────────────────────────────────────────────────────

  const exportHtml = useCallback(async () => {
    if (!content) return

    setIsExporting(true)
    setExportError(null)

    try {
      const title = extractDocumentTitle(content, deriveExportFileName(filePath, 'html').replace('.html', ''))
      const suggestedName = deriveExportFileName(filePath, 'html')

      // Build HTML using the same pipeline as the preview pane
      const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${title}</title></head><body>${content}</body></html>`

      const savedPath = await invoke<string | null>('export_html', { html, suggestedName })

      if (savedPath) {
        dispatchExportEvent({ type: 'success', message: `Exported to ${savedPath}` })
      }
      // If null, user cancelled — no event
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      setExportError(message)
      dispatchExportEvent({ type: 'error', message })
    } finally {
      setIsExporting(false)
    }
  }, [content, filePath])

  // ── exportPdf ───────────────────────────────────────────────────────────────

  const exportPdf = useCallback(async () => {
    if (!content) return

    setIsExporting(true)
    setExportError(null)

    try {
      const title = extractDocumentTitle(content, deriveExportFileName(filePath, 'pdf').replace('.pdf', ''))
      const printableHtml = buildPrintableHtml(content, title)

      await new Promise<void>((resolve, reject) => {
        const iframe = document.createElement('iframe')
        iframe.style.position = 'fixed'
        iframe.style.top = '-9999px'
        iframe.style.left = '-9999px'
        iframe.style.width = '0'
        iframe.style.height = '0'
        iframe.style.border = 'none'

        iframe.onload = () => {
          try {
            if (!iframe.contentWindow) {
              reject(new Error('iframe contentWindow is not available'))
              return
            }
            iframe.contentWindow.focus()
            iframe.contentWindow.print()
            if (iframe.parentNode) {
              iframe.parentNode.removeChild(iframe)
            }
            resolve()
          } catch (err) {
            if (iframe.parentNode) {
              iframe.parentNode.removeChild(iframe)
            }
            reject(err)
          }
        }

        iframe.onerror = () => {
          if (iframe.parentNode) {
            iframe.parentNode.removeChild(iframe)
          }
          reject(new Error('Failed to load iframe'))
        }

        document.body.appendChild(iframe)
        // Use srcdoc to inject HTML — fires onload reliably in Tauri WebView
        ;(iframe as any).srcdoc = printableHtml
      })

      dispatchExportEvent({ type: 'success', message: 'Save as PDF dialog opened' })
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      setExportError(message)
      dispatchExportEvent({ type: 'error', message })
    } finally {
      setIsExporting(false)
    }
  }, [content, filePath])

  return {
    exportHtml,
    exportPdf,
    isExporting,
    exportError,
  }
}
