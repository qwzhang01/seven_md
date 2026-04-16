import { renderToStaticMarkup } from 'react-dom/server'
import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import rehypeHighlight from 'rehype-highlight'

// ---------------------------------------------------------------------------
// Path helpers (inline — avoids Node.js 'path' module in browser context)
// ---------------------------------------------------------------------------
function basename(filePath: string): string {
  return filePath.replace(/\\/g, '/').split('/').pop() ?? filePath
}

function extname(fileName: string): string {
  const idx = fileName.lastIndexOf('.')
  return idx > 0 ? fileName.slice(idx) : ''
}

// ---------------------------------------------------------------------------
// CSS collection
// Collects all <style> and <link rel="stylesheet"> elements from document.head
// and returns their content as a single inlined <style> block.
// This captures Tailwind utilities, KaTeX, and highlight.js without any
// build-time bundling step.
// ---------------------------------------------------------------------------
function collectInlineStyles(): string {
  if (typeof document === 'undefined') return ''

  const parts: string[] = []

  document.head.querySelectorAll<HTMLElement>('style, link[rel="stylesheet"]').forEach((el) => {
    if (el.tagName === 'STYLE') {
      parts.push(el.textContent ?? '')
    } else if (el.tagName === 'LINK') {
      // For <link> elements we can only inline if the sheet is already loaded
      // and accessible (same-origin). Cross-origin sheets are skipped.
      try {
        const sheet = Array.from(document.styleSheets).find(
          (s) => s.ownerNode === el
        )
        if (sheet) {
          const rules = Array.from(sheet.cssRules ?? [])
            .map((r) => r.cssText)
            .join('\n')
          parts.push(rules)
        }
      } catch {
        // Cross-origin stylesheet — skip silently
      }
    }
  })

  return parts.join('\n')
}

// ---------------------------------------------------------------------------
// extractDocumentTitle
// Returns the text of the first # heading in the Markdown, or the fallback.
// ---------------------------------------------------------------------------
export function extractDocumentTitle(markdown: string, fallback: string): string {
  const match = markdown.match(/^#\s+(.+)$/m)
  return match ? match[1].trim() : fallback
}

// ---------------------------------------------------------------------------
// deriveExportFileName
// Returns "<basename>.<ext>" from a file path, or "Untitled.<ext>" if null.
// ---------------------------------------------------------------------------
export function deriveExportFileName(
  filePath: string | null,
  extension: 'pdf' | 'html'
): string {
  if (!filePath) return `Untitled.${extension}`
  const base = basename(filePath)
  const ext = extname(base)
  const name = ext ? base.slice(0, -ext.length) : base
  return `${name}.${extension}`
}

// ---------------------------------------------------------------------------
// serializePreviewToHtml
// Renders the Markdown to a self-contained HTML string using the same
// react-markdown pipeline as the preview pane, with all CSS inlined.
// Always uses the light color scheme for portability.
// ---------------------------------------------------------------------------
export function serializePreviewToHtml(markdown: string, title: string): string {
  // Render Markdown → HTML string via React server rendering
  const bodyHtml = renderToStaticMarkup(
    React.createElement(
      'div',
      { className: 'markdown-body' },
      React.createElement(
        ReactMarkdown as any,
        {
          remarkPlugins: [remarkGfm, remarkMath],
          rehypePlugins: [rehypeKatex, rehypeHighlight],
        },
        markdown
      )
    )
  )

  // Collect all active stylesheets from the live document
  const inlinedCss = collectInlineStyles()

  // Assemble the final self-contained HTML document
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <style>
    /* Reset & base */
    body { margin: 0; padding: 2rem; background: #fff; color: #1a1a1a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; }
    .markdown-body { max-width: 860px; margin: 0 auto; }
    /* Collected app styles */
    ${inlinedCss}
  </style>
</head>
<body>
  ${bodyHtml}
</body>
</html>`
}

// ---------------------------------------------------------------------------
// buildPrintableHtml
// Generates a self-contained HTML document optimised for print/PDF export.
// Unlike serializePreviewToHtml (which targets screen viewing), this version:
//   - Strips all UI chrome — only the rendered Markdown body is included.
//   - Injects @media print rules for proper page layout (margins, page breaks).
//   - Forces a white background and black text for reliable PDF output.
// The resulting HTML is loaded into a hidden <iframe> and printed via
// iframe.contentWindow.print(), so the user only sees the Markdown content
// in the OS print/save-as-PDF dialog.
// ---------------------------------------------------------------------------
export function buildPrintableHtml(markdown: string, title: string): string {
  const bodyHtml = renderToStaticMarkup(
    React.createElement(
      'div',
      { className: 'markdown-body prose prose-slate max-w-none' },
      React.createElement(
        ReactMarkdown as any,
        {
          remarkPlugins: [remarkGfm, remarkMath],
          rehypePlugins: [rehypeKatex, rehypeHighlight],
        },
        markdown
      )
    )
  )

  const inlinedCss = collectInlineStyles()

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${escapeHtml(title)}</title>
  <style>
    /* ---- Screen base ---- */
    *, *::before, *::after { box-sizing: border-box; }
    html, body {
      margin: 0;
      padding: 0;
      background: #fff;
      color: #1a1a1a;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
                   'Helvetica Neue', Arial, sans-serif;
      font-size: 16px;
      line-height: 1.7;
    }
    .markdown-body {
      max-width: 860px;
      margin: 0 auto;
      padding: 2rem;
    }
    /* ---- Collected app styles (Tailwind, KaTeX, highlight.js) ---- */
    ${inlinedCss}
    /* ---- Print / PDF layout ---- */
    @media print {
      html, body {
        background: #fff !important;
        color: #000 !important;
        font-size: 12pt;
      }
      .markdown-body {
        max-width: 100%;
        padding: 0;
        margin: 0;
      }
      /* Avoid breaking inside code blocks, tables, and blockquotes */
      pre, table, blockquote, figure {
        page-break-inside: avoid;
      }
      /* Keep headings with the following paragraph */
      h1, h2, h3, h4, h5, h6 {
        page-break-after: avoid;
      }
      /* Ensure links show their URL in print */
      a[href]::after {
        content: ' (' attr(href) ')';
        font-size: 0.85em;
        color: #555;
      }
      /* Hide anchor-only links (e.g. heading anchors) */
      a[href^='#']::after {
        content: '';
      }
    }
  </style>
</head>
<body>
  ${bodyHtml}
</body>
</html>`
}

// ---------------------------------------------------------------------------
// escapeHtml — minimal HTML entity escaping for use in attributes/text
// ---------------------------------------------------------------------------
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
