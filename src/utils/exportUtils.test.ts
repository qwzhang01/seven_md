import { describe, it, expect, vi, beforeEach } from 'vitest'
import { extractDocumentTitle, deriveExportFileName, serializePreviewToHtml } from './exportUtils'

// ---------------------------------------------------------------------------
// extractDocumentTitle
// ---------------------------------------------------------------------------
describe('extractDocumentTitle', () => {
  it('returns the first # heading text', () => {
    const md = '# My Document\n\nSome content'
    expect(extractDocumentTitle(md, 'Fallback')).toBe('My Document')
  })

  it('returns fallback when no heading is present', () => {
    const md = 'Just some text without a heading'
    expect(extractDocumentTitle(md, 'Untitled')).toBe('Untitled')
  })

  it('ignores ## and deeper headings', () => {
    const md = '## Section\n\nContent'
    expect(extractDocumentTitle(md, 'Fallback')).toBe('Fallback')
  })

  it('trims whitespace from heading text', () => {
    const md = '#   Spaced Title   \n\nContent'
    expect(extractDocumentTitle(md, 'Fallback')).toBe('Spaced Title')
  })

  it('returns fallback for empty markdown', () => {
    expect(extractDocumentTitle('', 'Empty')).toBe('Empty')
  })
})

// ---------------------------------------------------------------------------
// deriveExportFileName
// ---------------------------------------------------------------------------
describe('deriveExportFileName', () => {
  it('returns Untitled.html when filePath is null', () => {
    expect(deriveExportFileName(null, 'html')).toBe('Untitled.html')
  })

  it('returns Untitled.pdf when filePath is null', () => {
    expect(deriveExportFileName(null, 'pdf')).toBe('Untitled.pdf')
  })

  it('replaces .md extension with .html', () => {
    expect(deriveExportFileName('/home/user/docs/notes.md', 'html')).toBe('notes.html')
  })

  it('replaces .md extension with .pdf', () => {
    expect(deriveExportFileName('/home/user/docs/notes.md', 'pdf')).toBe('notes.pdf')
  })

  it('handles Windows-style paths', () => {
    expect(deriveExportFileName('C:\\Users\\user\\docs\\report.md', 'html')).toBe('report.html')
  })

  it('handles files without extension', () => {
    expect(deriveExportFileName('/home/user/README', 'html')).toBe('README.html')
  })

  it('handles files with multiple dots', () => {
    expect(deriveExportFileName('/home/user/my.doc.md', 'html')).toBe('my.doc.html')
  })
})

// ---------------------------------------------------------------------------
// serializePreviewToHtml
// ---------------------------------------------------------------------------
describe('serializePreviewToHtml', () => {
  beforeEach(() => {
    // Mock document.head.querySelectorAll for JSDOM environment
    vi.spyOn(document.head, 'querySelectorAll').mockReturnValue([] as any)
  })

  it('returns a valid HTML document string', () => {
    const result = serializePreviewToHtml('# Hello\n\nWorld', 'Hello')
    expect(result).toContain('<!DOCTYPE html>')
    expect(result).toContain('<html')
    expect(result).toContain('</html>')
  })

  it('includes the title in <title> tag', () => {
    const result = serializePreviewToHtml('# My Doc', 'My Doc')
    expect(result).toContain('<title>My Doc</title>')
  })

  it('escapes HTML special characters in title', () => {
    const result = serializePreviewToHtml('# Test', '<script>alert(1)</script>')
    expect(result).toContain('&lt;script&gt;')
    expect(result).not.toContain('<script>alert(1)</script>')
  })

  it('includes charset and viewport meta tags', () => {
    const result = serializePreviewToHtml('Hello', 'Test')
    expect(result).toContain('<meta charset="UTF-8"')
    expect(result).toContain('name="viewport"')
  })

  it('renders markdown content in the body', () => {
    const result = serializePreviewToHtml('# Heading\n\nParagraph text', 'Test')
    expect(result).toContain('<h1')
    expect(result).toContain('Heading')
    expect(result).toContain('Paragraph text')
  })

  it('includes markdown-body wrapper div', () => {
    const result = serializePreviewToHtml('Hello', 'Test')
    expect(result).toContain('class="markdown-body"')
  })
})

// ---------------------------------------------------------------------------
// Integration Tests (Task 8.5)
// ---------------------------------------------------------------------------
describe('serializePreviewToHtml - Integration Tests', () => {
  beforeEach(() => {
    // Mock document.head.querySelectorAll for JSDOM environment
    vi.spyOn(document.head, 'querySelectorAll').mockReturnValue([] as any)
  })

  it('outputs valid HTML document structure', () => {
    const markdown = '# Test Document\n\nThis is a paragraph.'
    const result = serializePreviewToHtml(markdown, 'Integration Test')

    // Check DOCTYPE
    expect(result).toMatch(/^<!DOCTYPE html>/)

    // Check html tag with lang
    expect(result).toContain('<html lang="en">')
    expect(result).toContain('</html>')

    // Check head section exists
    expect(result).toContain('<head>')
    expect(result).toContain('</head>')

    // Check body section exists
    expect(result).toContain('<body>')
    expect(result).toContain('</body>')
  })

  it('includes correct meta tags for charset and viewport', () => {
    const result = serializePreviewToHtml('Content', 'Meta Test')

    // Check charset meta
    expect(result).toContain('<meta charset="UTF-8"')

    // Check viewport meta
    expect(result).toMatch(/<meta\s+name="viewport"\s+content="width=device-width,\s*initial-scale=1"/)
  })

  it('has correct title element with escaped content', () => {
    const title = 'My Special Document & More'
    const result = serializePreviewToHtml('# Heading', title)

    // Title should be in the head
    expect(result).toContain('<title>')
    expect(result).toContain('</title>')

    // Check title content is HTML-escaped
    expect(result).toContain('My Special Document &amp; More')
  })

  it('includes embedded CSS styles in a style tag', () => {
    const result = serializePreviewToHtml('Test', 'Style Test')

    // Should have a style tag in the head
    expect(result).toContain('<style>')

    // Should include base/reset styles
    expect(result).toContain('body {')
    expect(result).toContain('.markdown-body {')

    // Should include font-family
    expect(result).toContain('font-family:')
  })

  it('renders markdown headings correctly', () => {
    const markdown = '# Heading 1\n## Heading 2\n### Heading 3'
    const result = serializePreviewToHtml(markdown, 'Heading Test')

    expect(result).toContain('<h1')
    expect(result).toContain('Heading 1')
    expect(result).toContain('<h2')
    expect(result).toContain('Heading 2')
    expect(result).toContain('<h3')
    expect(result).toContain('Heading 3')
  })

  it('renders markdown lists correctly', () => {
    const markdown = '- Item 1\n- Item 2\n- Item 3'
    const result = serializePreviewToHtml(markdown, 'List Test')

    expect(result).toContain('<ul')
    expect(result).toContain('<li')
    expect(result).toContain('Item 1')
    expect(result).toContain('Item 2')
    expect(result).toContain('Item 3')
  })

  it('renders code blocks with syntax highlighting classes', () => {
    const markdown = '```javascript\nconst x = 1;\n```'
    const result = serializePreviewToHtml(markdown, 'Code Test')

    // Should have pre and code tags
    expect(result).toContain('<pre')
    expect(result).toContain('<code')

    // Should include hljs (highlight.js) classes for syntax highlighting
    expect(result).toContain('hljs')

    // Should include the code content (syntax highlighted with spans)
    // rehype-highlight splits the code into spans, so check for 'const' keyword
    expect(result).toContain('const')
    expect(result).toContain('hljs-keyword')
  })

  it('renders inline code correctly', () => {
    const markdown = 'This has `inline code` in it.'
    const result = serializePreviewToHtml(markdown, 'Inline Code Test')

    expect(result).toContain('<code')
    expect(result).toContain('inline code')
  })

  it('renders links correctly', () => {
    const markdown = '[Click here](https://example.com)'
    const result = serializePreviewToHtml(markdown, 'Link Test')

    expect(result).toContain('<a')
    expect(result).toContain('href="https://example.com"')
    expect(result).toContain('Click here')
  })

  it('renders emphasis correctly', () => {
    const markdown = '**bold** and *italic* and ~~strikethrough~~'
    const result = serializePreviewToHtml(markdown, 'Emphasis Test')

    expect(result).toContain('<strong')
    expect(result).toContain('bold')
    expect(result).toContain('<em')
    expect(result).toContain('italic')
    expect(result).toContain('<del')
    expect(result).toContain('strikethrough')
  })

  it('renders tables correctly', () => {
    const markdown = '| A | B |\n|---|---|\n| 1 | 2 |'
    const result = serializePreviewToHtml(markdown, 'Table Test')

    expect(result).toContain('<table')
    expect(result).toContain('<thead')
    expect(result).toContain('<tbody')
    expect(result).toContain('<th')
    expect(result).toContain('<td')
  })

  it('renders blockquotes correctly', () => {
    const markdown = '> This is a quote\n> with multiple lines'
    const result = serializePreviewToHtml(markdown, 'Quote Test')

    expect(result).toContain('<blockquote')
    expect(result).toContain('This is a quote')
  })

  it('renders horizontal rules correctly', () => {
    const markdown = 'Above\n\n---\n\nBelow'
    const result = serializePreviewToHtml(markdown, 'HR Test')

    expect(result).toContain('<hr')
  })

  it('uses light color scheme regardless of app theme', () => {
    const result = serializePreviewToHtml('Content', 'Theme Test')

    // Background should be white
    expect(result).toContain('background: #fff') || expect(result).toContain('background: #ffffff')

    // Text color should be dark
    expect(result).toContain('color: #1a1a1a') || expect(result).toContain('color: #')
  })

  it('produces self-contained HTML without external dependencies', () => {
    const markdown = '# Self-Contained Test\n\nContent here.'
    const result = serializePreviewToHtml(markdown, 'Self-Contained')

    // Should not have any external stylesheet links (except potentially in comments)
    const linkMatches = result.match(/<link[^>]*rel=["']stylesheet["'][^>]*>/g)
    expect(linkMatches).toBeNull()

    // Should not have any external script tags
    const scriptMatches = result.match(/<script[^>]*src=["']/g)
    expect(scriptMatches).toBeNull()
  })

  it('handles empty markdown gracefully', () => {
    const result = serializePreviewToHtml('', 'Empty Doc')

    // Should still produce valid HTML structure
    expect(result).toContain('<!DOCTYPE html>')
    expect(result).toContain('<title>Empty Doc</title>')

    // Body should have the markdown-body wrapper
    expect(result).toContain('class="markdown-body"')
  })

  it('handles special characters in markdown content', () => {
    const markdown = '# Test <script>alert("xss")</script>\n\n& "quotes" and \'apostrophes\''
    const result = serializePreviewToHtml(markdown, 'Special Chars')

    // Script tags in content should be escaped (not treated as HTML)
    // Note: react-markdown escapes content by default
    expect(result).not.toMatch(/<script>alert/)
  })
})
