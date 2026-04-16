import { useState, useCallback } from 'react'
import { invoke } from '@tauri-apps/api/core'
import { serializePreviewToHtml, buildPrintableHtml, extractDocumentTitle, deriveExportFileName } from '../utils/exportUtils'

// ---------------------------------------------------------------------------
// Export status event — used to notify the StatusBar of export results.
// The StatusBar listens for 'export-status' CustomEvents on the window.
// ---------------------------------------------------------------------------
export const EXPORT_STATUS_EVENT = 'export-status'

export interface ExportStatusDetail {
  type: 'success' | 'error'
  message: string
}

function emitExportStatus(detail: ExportStatusDetail) {
  window.dispatchEvent(new CustomEvent<ExportStatusDetail>(EXPORT_STATUS_EVENT, { detail }))
}

// ---------------------------------------------------------------------------
// useExport hook
// Exposes exportPdf(), exportHtml(), isExporting, and exportError.
// ---------------------------------------------------------------------------
export interface UseExportReturn {
  exportPdf: () => Promise<void>
  exportHtml: () => Promise<void>
  isExporting: boolean
  exportError: string | null
}

export function useExport(
  content: string,
  filePath: string | null
): UseExportReturn {
  const [isExporting, setIsExporting] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)

  // ---------------------------------------------------------------------------
  // exportHtml
  // Serializes the current preview to a self-contained HTML file and writes
  // it to disk via the export_html Tauri command.
  // ---------------------------------------------------------------------------
  const exportHtml = useCallback(async () => {
    console.log('[useExport] exportHtml called, content length:', content?.length, 'filePath:', filePath);
    
    // Guard: no content to export
    if (!content || content.trim() === '') {
      console.log('[useExport] exportHtml: no content, returning early');
      return;
    }

    setIsExporting(true)
    setExportError(null)

    try {
      const title = extractDocumentTitle(content, filePath ? deriveExportFileName(filePath, 'html').replace('.html', '') : 'Untitled')
      const suggestedName = deriveExportFileName(filePath, 'html')
      const html = serializePreviewToHtml(content, title)
      console.log('[useExport] exportHtml: HTML generated, length:', html.length, 'suggestedName:', suggestedName);

      // Invoke Rust command — returns the saved path or null if cancelled
      console.log('[useExport] exportHtml: invoking Tauri command...');
      const savedPath = await invoke<string | null>('export_html', {
        html,
        suggestedName,
      })
      console.log('[useExport] exportHtml: Tauri command returned:', savedPath);

      if (savedPath) {
        emitExportStatus({ type: 'success', message: `Exported to ${savedPath}` })
      }
      // If null, user cancelled — no feedback needed
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      console.error('[useExport] exportHtml error:', message);
      setExportError(message)
      emitExportStatus({ type: 'error', message: `Export failed: ${message}` })
    } finally {
      setIsExporting(false)
    }
  }, [content, filePath])

  // ---------------------------------------------------------------------------
  // exportPdf
  // Renders the Markdown content to a self-contained HTML document (with
  // print-optimised CSS) and injects it into a hidden <iframe>.  The iframe's
  // contentWindow.print() is then called so the OS print/save-as-PDF dialog
  // shows only the rendered Markdown — not the application UI.
  //
  // Flow:
  //   1. Build printable HTML from the current Markdown content.
  //   2. Create a hidden <iframe> and append it to <body>.
  //   3. Write the HTML into the iframe's document.
  //   4. Wait for the iframe to finish loading (onload).
  //   5. Call iframe.contentWindow.print().
  //   6. Remove the iframe after a short delay (allows the print dialog to
  //      open before the DOM node disappears).
  // ---------------------------------------------------------------------------
  const exportPdf = useCallback(async () => {
    console.log('[useExport] exportPdf called, content length:', content?.length);

    // Guard: no content to export
    if (!content || content.trim() === '') {
      console.log('[useExport] exportPdf: no content, returning early');
      return;
    }

    setIsExporting(true)
    setExportError(null)

    try {
      const title = extractDocumentTitle(
        content,
        filePath ? deriveExportFileName(filePath, 'pdf').replace('.pdf', '') : 'Untitled'
      )
      const html = buildPrintableHtml(content, title)
      console.log('[useExport] exportPdf: printable HTML built, length:', html.length);

      await new Promise<void>((resolve, reject) => {
        // Create a hidden iframe
        const iframe = document.createElement('iframe')
        iframe.style.position = 'fixed'
        iframe.style.top = '-9999px'
        iframe.style.left = '-9999px'
        iframe.style.width = '1px'
        iframe.style.height = '1px'
        iframe.style.border = 'none'
        iframe.setAttribute('aria-hidden', 'true')

        // Helper to clean up the iframe after the print dialog opens
        const cleanup = () => {
          setTimeout(() => {
            if (iframe.parentNode) {
              iframe.parentNode.removeChild(iframe)
            }
          }, 2000)
        }

        // onload must be set BEFORE srcdoc is assigned (or before appendChild)
        // so the event is not missed.
        iframe.onload = () => {
          try {
            const win = iframe.contentWindow
            if (!win) {
              reject(new Error('iframe contentWindow is not available'))
              cleanup()
              return
            }
            console.log('[useExport] exportPdf: iframe loaded, calling print()');
            win.focus()
            win.print()
            console.log('[useExport] exportPdf: print() called on iframe');
            resolve()
          } catch (printErr) {
            reject(printErr)
          } finally {
            cleanup()
          }
        }

        iframe.onerror = () => {
          reject(new Error('Failed to load print iframe'))
          cleanup()
        }

        // Use srcdoc to inject HTML — this reliably fires onload in both
        // browser and Tauri WebView environments.
        // doc.write() is synchronous and can fire onload before the listener
        // is attached, causing the print dialog to never open.
        iframe.srcdoc = html

        document.body.appendChild(iframe)
      })

      emitExportStatus({ type: 'success', message: 'Print dialog opened — choose "Save as PDF"' })
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      console.error('[useExport] exportPdf error:', message, err);
      setExportError(message)
      emitExportStatus({ type: 'error', message: `PDF export failed: ${message}` })
    } finally {
      setIsExporting(false)
    }
  }, [content, filePath])

  return { exportPdf, exportHtml, isExporting, exportError }
}
