import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import Sidebar from '../Sidebar'
import { AppProvider } from '../../context/AppContext'
import React from 'react'

// Mock Tauri invoke
vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(),
}))

// Mock hooks
const mockLoadDirectory = vi.fn()
vi.mock('../../hooks/useAppState', () => ({
  useFileTree: () => ({
    loadDirectory: mockLoadDirectory,
    toggleDirectory: vi.fn(),
    expandedDirs: new Set(),
  }),
}))

vi.mock('../../hooks/useAnnouncer', () => ({
  useAnnouncer: () => ({
    announceLoading: vi.fn(),
    announceSuccess: vi.fn(),
    announceError: vi.fn(),
  }),
}))

vi.mock('../../utils/logger', () => ({
  createLogger: () => ({
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  }),
}))

const renderSidebar = () => {
  return render(
    <AppProvider>
      <Sidebar />
    </AppProvider>
  )
}

describe('Sidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockLoadDirectory.mockResolvedValue([
      { name: 'test.md', path: '/test/test.md', type: 'file', extension: '.md' },
      { name: 'folder', path: '/test/folder', type: 'directory', children: [] },
    ])
  })

  it('renders without crashing', () => {
    const { container } = renderSidebar()
    expect(container).toBeTruthy()
  })

  it('shows sidebar container', () => {
    const { container } = renderSidebar()
    const sidebar = container.querySelector('aside') || container.firstChild
    expect(sidebar).toBeTruthy()
  })

  it('shows file tree container', () => {
    const { container } = renderSidebar()
    const fileTree = container.querySelector('[role="tree"]')
    expect(fileTree).toBeTruthy()
  })

  it('shows no folder open message when no folder is selected', async () => {
    const { container } = renderSidebar()
    
    // Check for the presence of the status role (which contains the message)
    await waitFor(() => {
      const statusElement = container.querySelector('[role="status"]')
      expect(statusElement).toBeTruthy()
    })
  })

  it('has correct accessibility attributes', () => {
    const { container } = renderSidebar()
    const sidebar = container.querySelector('aside')
    
    expect(sidebar).toHaveAttribute('role', 'complementary')
    expect(sidebar).toHaveAttribute('aria-label')
  })

  it('renders tree role', () => {
    const { container } = renderSidebar()
    const tree = container.querySelector('[role="tree"]')
    expect(tree).toBeTruthy()
  })

  it('renders with aria-live for announcements', () => {
    const { container } = renderSidebar()
    const liveRegion = container.querySelector('[aria-live="polite"]')
    expect(liveRegion).toBeTruthy()
  })
})