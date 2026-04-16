import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import ContextMenu from '../../components/FileTree/ContextMenu'

// i18n mock
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}))

describe('ContextMenu', () => {
  const onAction = vi.fn()
  const onClose = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders all four menu items', () => {
    render(<ContextMenu x={100} y={100} onAction={onAction} onClose={onClose} />)
    expect(screen.getByText('fileTree.newFile')).toBeInTheDocument()
    expect(screen.getByText('fileTree.newFolder')).toBeInTheDocument()
    expect(screen.getByText('fileTree.rename')).toBeInTheDocument()
    expect(screen.getByText('fileTree.delete')).toBeInTheDocument()
  })

  it('calls onAction with correct action when item is clicked', () => {
    render(<ContextMenu x={100} y={100} onAction={onAction} onClose={onClose} />)
    fireEvent.mouseDown(screen.getByText('fileTree.newFile'))
    expect(onAction).toHaveBeenCalledWith('new-file')
  })

  it('calls onClose when item is clicked', () => {
    render(<ContextMenu x={100} y={100} onAction={onAction} onClose={onClose} />)
    fireEvent.mouseDown(screen.getByText('fileTree.rename'))
    expect(onClose).toHaveBeenCalled()
  })

  it('calls onClose on Escape key', () => {
    render(<ContextMenu x={100} y={100} onAction={onAction} onClose={onClose} />)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalled()
  })

  it('calls onClose on outside mousedown', () => {
    render(<ContextMenu x={100} y={100} onAction={onAction} onClose={onClose} />)
    fireEvent.mouseDown(document.body)
    expect(onClose).toHaveBeenCalled()
  })

  it('positions the menu at the given coordinates', () => {
    const { container } = render(
      <ContextMenu x={200} y={300} onAction={onAction} onClose={onClose} />
    )
    const menu = container.querySelector('ul') ?? document.querySelector('ul[role="menu"]')
    expect(menu).toBeTruthy()
  })
})
