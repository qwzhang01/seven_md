import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DirtyTabDialog, BatchDirtyDialog } from './DirtyTabDialog'
import { TabState } from '../types'

const makeTab = (overrides = {}): TabState => ({
  id: 'tab-1',
  path: '/test.md',
  content: '# Hello',
  isDirty: true,
  cursorPosition: { line: 1, column: 1 },
  scrollPosition: { line: 0 },
  lastAccessed: Date.now(),
  ...overrides,
})

describe('DirtyTabDialog', () => {
  it('renders with file name', () => {
    const tab = makeTab({ path: '/folder/document.md' })
    render(
      <DirtyTabDialog
        tab={tab}
        onSave={vi.fn()}
        onDiscard={vi.fn()}
        onCancel={vi.fn()}
      />
    )
    expect(screen.getByText('document.md')).toBeInTheDocument()
    expect(screen.getByText('Unsaved Changes')).toBeInTheDocument()
  })

  it('renders with Untitled for tabs without path', () => {
    const tab = makeTab({ path: null })
    render(
      <DirtyTabDialog
        tab={tab}
        onSave={vi.fn()}
        onDiscard={vi.fn()}
        onCancel={vi.fn()}
      />
    )
    expect(screen.getByText('Untitled')).toBeInTheDocument()
  })

  it('calls onSave when Save button clicked', () => {
    const onSave = vi.fn()
    const tab = makeTab()
    render(
      <DirtyTabDialog
        tab={tab}
        onSave={onSave}
        onDiscard={vi.fn()}
        onCancel={vi.fn()}
      />
    )
    fireEvent.click(screen.getByText('Save'))
    expect(onSave).toHaveBeenCalledTimes(1)
  })

  it("calls onDiscard when Don't Save button clicked", () => {
    const onDiscard = vi.fn()
    const tab = makeTab()
    render(
      <DirtyTabDialog
        tab={tab}
        onSave={vi.fn()}
        onDiscard={onDiscard}
        onCancel={vi.fn()}
      />
    )
    fireEvent.click(screen.getByText("Don't Save"))
    expect(onDiscard).toHaveBeenCalledTimes(1)
  })

  it('calls onCancel when Cancel button clicked', () => {
    const onCancel = vi.fn()
    const tab = makeTab()
    render(
      <DirtyTabDialog
        tab={tab}
        onSave={vi.fn()}
        onDiscard={vi.fn()}
        onCancel={onCancel}
      />
    )
    fireEvent.click(screen.getByText('Cancel'))
    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('calls onCancel when Escape key pressed', () => {
    const onCancel = vi.fn()
    const tab = makeTab()
    render(
      <DirtyTabDialog
        tab={tab}
        onSave={vi.fn()}
        onDiscard={vi.fn()}
        onCancel={onCancel}
      />
    )
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('has correct ARIA attributes', () => {
    const tab = makeTab()
    render(
      <DirtyTabDialog
        tab={tab}
        onSave={vi.fn()}
        onDiscard={vi.fn()}
        onCancel={vi.fn()}
      />
    )
    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(dialog).toHaveAttribute('aria-labelledby', 'dirty-dialog-title')
  })
})

describe('BatchDirtyDialog', () => {
  const dirtyTabs = [
    makeTab({ id: 'tab-1', path: '/a.md' }),
    makeTab({ id: 'tab-2', path: '/b.md' }),
  ]

  it('renders list of dirty files', () => {
    render(
      <BatchDirtyDialog
        dirtyTabs={dirtyTabs}
        onSaveAll={vi.fn()}
        onDiscardAll={vi.fn()}
        onCancel={vi.fn()}
      />
    )
    expect(screen.getByText('a.md')).toBeInTheDocument()
    expect(screen.getByText('b.md')).toBeInTheDocument()
    expect(screen.getByText(/2 files have unsaved changes/i)).toBeInTheDocument()
  })

  it('calls onSaveAll when Save All clicked', () => {
    const onSaveAll = vi.fn()
    render(
      <BatchDirtyDialog
        dirtyTabs={dirtyTabs}
        onSaveAll={onSaveAll}
        onDiscardAll={vi.fn()}
        onCancel={vi.fn()}
      />
    )
    fireEvent.click(screen.getByText('Save All'))
    expect(onSaveAll).toHaveBeenCalledTimes(1)
  })

  it("calls onDiscardAll when Don't Save clicked", () => {
    const onDiscardAll = vi.fn()
    render(
      <BatchDirtyDialog
        dirtyTabs={dirtyTabs}
        onSaveAll={vi.fn()}
        onDiscardAll={onDiscardAll}
        onCancel={vi.fn()}
      />
    )
    fireEvent.click(screen.getByText("Don't Save"))
    expect(onDiscardAll).toHaveBeenCalledTimes(1)
  })
})
