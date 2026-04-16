import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MenuBar } from './MenuBar'
import { MenuStateProvider } from '../../hooks/useMenuState'

// Mock all menu components
vi.mock('./FileMenu', () => ({
  FileMenu: () => <div data-testid="file-menu">File Menu</div>,
}))

vi.mock('./EditMenu', () => ({
  EditMenu: () => <div data-testid="edit-menu">Edit Menu</div>,
}))

vi.mock('./ViewMenu', () => ({
  ViewMenu: () => <div data-testid="view-menu">View Menu</div>,
}))

vi.mock('./HelpMenu', () => ({
  HelpMenu: () => <div data-testid="help-menu">Help Menu</div>,
}))

describe('MenuBar', () => {
  const renderMenuBar = () => {
    return render(
      <MenuStateProvider>
        <MenuBar />
      </MenuStateProvider>
    )
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render all menu components', () => {
    renderMenuBar()

    expect(screen.getByTestId('file-menu')).toBeInTheDocument()
    expect(screen.getByTestId('edit-menu')).toBeInTheDocument()
    expect(screen.getByTestId('view-menu')).toBeInTheDocument()
    expect(screen.getByTestId('help-menu')).toBeInTheDocument()
  })

  it('should have correct ARIA attributes', () => {
    renderMenuBar()

    const menubar = screen.getByRole('menubar')
    expect(menubar).toHaveAttribute('aria-label', 'Application menu')
  })

  it('should have correct CSS classes', () => {
    renderMenuBar()

    const menubar = screen.getByRole('menubar')
    expect(menubar).toHaveClass('flex', 'items-center', 'h-full')
  })
})
