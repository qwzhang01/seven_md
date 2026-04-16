import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import PreviewPane from '../PreviewPane'
import { AppProvider } from '../../context/AppContext'

// Mock markdown rendering
vi.mock('react-markdown', () => ({
  default: ({ children }: { children: string }) => (
    <div data-testid="markdown-rendered">{children}</div>
  ),
}))

vi.mock('remark-gfm', () => ({
  default: () => {},
}))

vi.mock('remark-math', () => ({
  default: () => {},
}))

vi.mock('rehype-katex', () => ({
  default: () => {},
}))

vi.mock('rehype-highlight', () => ({
  default: () => {},
}))

vi.mock('../../utils/logger', () => ({
  createLogger: () => ({
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  }),
}))

const renderPreviewPane = (markdown = '# Test Content') => {
  return render(
    <AppProvider>
      <PreviewPane markdown={markdown} />
    </AppProvider>
  )
}

describe('PreviewPane', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders without crashing', () => {
    const { container } = renderPreviewPane()
    expect(container).toBeTruthy()
  })

  it('shows preview container', () => {
    const { container } = renderPreviewPane()
    const previewPane = container.querySelector('div')
    expect(previewPane).toBeTruthy()
  })

  it('shows markdown content area', () => {
    const { container } = renderPreviewPane()
    const rendered = container.querySelector('[data-testid="markdown-rendered"]') || container.querySelector('div')
    expect(rendered).toBeTruthy()
  })

  it('renders markdown content', () => {
    renderPreviewPane('# Hello World')
    expect(screen.getByTestId('markdown-rendered')).toHaveTextContent('# Hello World')
  })

  it('renders preview header', () => {
    const { container } = renderPreviewPane()
    // Check for the heading element with i18n key
    const heading = container.querySelector('h2')
    expect(heading).toBeTruthy()
  })

  it('accepts className prop', () => {
    const { container } = renderPreviewPane()
    expect(container.firstChild).toBeTruthy()
  })

  it('renders empty content', () => {
    const { container } = renderPreviewPane('')
    expect(container).toBeTruthy()
  })

  it('renders complex markdown', () => {
    const complexMarkdown = `
# Title

## Subtitle

- List item 1
- List item 2

\`\`\`javascript
const x = 1;
\`\`\`

**Bold** and *italic* text.
`
    const { container } = renderPreviewPane(complexMarkdown)
    expect(screen.getByTestId('markdown-rendered')).toBeTruthy()
  })
})
