import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import SearchPanel from './SearchPanel'
import { AppProvider } from '../../context/AppContext'
import type { UseFileSearchReturn } from '../../hooks/useFileSearch'

// Mock Tauri invoke
vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(),
}))

// Mock useFileSearch hook
const mockSetQuery = vi.fn()
const mockSetSearchType = vi.fn()
const defaultSearchState: UseFileSearchReturn = {
  query: '',
  setQuery: mockSetQuery,
  searchType: 'filename',
  setSearchType: mockSetSearchType,
  fileResults: [],
  textResults: [],
  isLoading: false,
  error: null,
  truncated: false,
}
let mockSearchState: UseFileSearchReturn = { ...defaultSearchState }

vi.mock('../../hooks/useFileSearch', () => ({
  useFileSearch: () => mockSearchState,
}))

const renderPanel = (folderPath: string | null = '/test/folder') =>
  render(
    <AppProvider>
      <SearchPanel folderPath={folderPath} />
    </AppProvider>
  )

describe('SearchPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSearchState = { ...defaultSearchState }
  })

  it('renders without crashing', () => {
    const { container } = renderPanel()
    expect(container).toBeTruthy()
  })

  it('shows disabled state when no folder is open', () => {
    renderPanel(null)
    const input = screen.getByRole('textbox') as HTMLInputElement
    expect(input.disabled).toBe(true)
    // i18n key is returned as-is in test environment
    expect(screen.getByText('search.openFolderToSearch')).toBeTruthy()
  })

  it('shows loading spinner when isLoading is true', () => {
    mockSearchState = { ...defaultSearchState, isLoading: true }
    renderPanel()
    expect(screen.getByRole('status')).toBeTruthy()
  })

  it('shows empty state when no results and query is set', () => {
    mockSearchState = { ...defaultSearchState, query: 'xyz' }
    renderPanel()
    expect(screen.getByText('search.noResults')).toBeTruthy()
  })

  it('renders filename results', () => {
    mockSearchState = {
      ...defaultSearchState,
      query: 'readme',
      fileResults: [
        { path: '/folder/readme.md', relativePath: 'readme.md', name: 'readme.md' },
      ],
    }
    renderPanel()
    // Use getAllByText since name and relativePath both show 'readme.md'
    const matches = screen.getAllByText('readme.md')
    expect(matches.length).toBeGreaterThan(0)
  })

  it('renders full-text results with line number', () => {
    mockSearchState = {
      ...defaultSearchState,
      searchType: 'fulltext',
      query: 'hello',
      textResults: [
        {
          path: '/folder/doc.md',
          relativePath: 'doc.md',
          name: 'doc.md',
          lineNumber: 5,
          snippet: 'Hello World',
        },
      ],
    }
    renderPanel()
    expect(screen.getByText('doc.md')).toBeTruthy()
    expect(screen.getByText(':5')).toBeTruthy()
    expect(screen.getByText('Hello World')).toBeTruthy()
  })

  it('shows truncation notice when truncated is true', () => {
    mockSearchState = {
      ...defaultSearchState,
      query: 'test',
      truncated: true,
      fileResults: [{ path: '/f/a.md', relativePath: 'a.md', name: 'a.md' }],
    }
    renderPanel()
    expect(screen.getByText('search.truncated')).toBeTruthy()
  })

  it('calls setQuery when user types', () => {
    renderPanel()
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'test' } })
    expect(mockSetQuery).toHaveBeenCalledWith('test')
  })

  it('calls setSearchType when mode toggle is clicked', () => {
    renderPanel()
    const textButton = screen.getByRole('button', { name: /text/i })
    fireEvent.click(textButton)
    expect(mockSetSearchType).toHaveBeenCalledWith('fulltext')
  })

  it('dispatches open-file action when filename result is clicked', async () => {
    const { invoke } = await import('@tauri-apps/api/core')
    const mockInvoke = vi.mocked(invoke)
    mockInvoke.mockResolvedValue('# content')

    mockSearchState = {
      ...defaultSearchState,
      query: 'readme',
      fileResults: [{ path: '/folder/readme.md', relativePath: 'readme.md', name: 'readme.md' }],
    }
    renderPanel()

    const resultBtn = screen.getByTitle('/folder/readme.md')
    fireEvent.click(resultBtn)

    await waitFor(() => {
      expect(mockInvoke).toHaveBeenCalledWith('read_file', { path: '/folder/readme.md' })
    })
  })
})
