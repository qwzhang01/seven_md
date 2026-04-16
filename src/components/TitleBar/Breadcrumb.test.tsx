import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Breadcrumb } from './Breadcrumb'

describe('Breadcrumb', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders null when no file path', () => {
    const { container } = render(<Breadcrumb folderPath={null} filePath={null} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders null when no folder path', () => {
    const { container } = render(<Breadcrumb folderPath={null} filePath="/test/file.md" />)
    expect(container.firstChild).toBeNull()
  })

  it('renders file path segments', () => {
    render(<Breadcrumb folderPath="/Users/test/documents" filePath="/Users/test/documents/note.md" />)
    expect(screen.getByText('documents')).toBeInTheDocument()
    expect(screen.getByText('note.md')).toBeInTheDocument()
  })

  it('renders nested path segments', () => {
    render(<Breadcrumb folderPath="/Users/test" filePath="/Users/test/documents/note.md" />)
    expect(screen.getByText('test')).toBeInTheDocument()
    expect(screen.getByText('documents')).toBeInTheDocument()
    expect(screen.getByText('note.md')).toBeInTheDocument()
  })

  it('truncates long paths', () => {
    render(<Breadcrumb 
      folderPath="/Users/test" 
      filePath="/Users/test/a/b/c/d/note.md" 
    />)
    expect(screen.getByText('...')).toBeInTheDocument()
    expect(screen.getByText('test')).toBeInTheDocument()
    expect(screen.getByText('note.md')).toBeInTheDocument()
  })

  it('renders chevron separators', () => {
    const { container } = render(<Breadcrumb folderPath="/Users/test" filePath="/Users/test/note.md" />)
    const chevrons = container.querySelectorAll('svg')
    expect(chevrons.length).toBeGreaterThan(0)
  })

  it('file button is disabled', () => {
    render(<Breadcrumb folderPath="/Users/test" filePath="/Users/test/note.md" />)
    const fileButton = screen.getByText('note.md').closest('button')
    expect(fileButton).toBeDisabled()
  })

  it('folder buttons are not disabled', () => {
    render(<Breadcrumb folderPath="/Users/test" filePath="/Users/test/note.md" />)
    const folderButton = screen.getByText('test').closest('button')
    expect(folderButton).not.toBeDisabled()
  })
})
