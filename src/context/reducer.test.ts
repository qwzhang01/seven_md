import { describe, it, expect } from 'vitest'
import { appReducer as reducer } from '../reducers/appReducer'
import { initialState, AppAction } from '../context/AppContext'
import { AppState } from '../types'

describe('reducer', () => {
  describe('SET_FILE_PATH', () => {
    it('sets file path', () => {
      const state = reducer(initialState, { type: 'SET_FILE_PATH', payload: '/test/file.md' })
      expect(state.file.path).toBe('/test/file.md')
    })

    it('preserves other state', () => {
      const state = reducer(initialState, { type: 'SET_FILE_PATH', payload: '/test/file.md' })
      expect(state.ui.theme).toBe(initialState.ui.theme)
      expect(state.ui.sidebarCollapsed).toBe(initialState.ui.sidebarCollapsed)
    })
  })

  describe('SET_FILE_CONTENT', () => {
    it('sets file content', () => {
      const content = '# Hello World'
      const state = reducer(initialState, { type: 'SET_FILE_CONTENT', payload: content })
      expect(state.file.content).toBe(content)
    })
  })

  describe('SET_FILE_DIRTY', () => {
    it('sets dirty flag to true', () => {
      const state = reducer(initialState, { type: 'SET_FILE_DIRTY', payload: true })
      expect(state.file.isDirty).toBe(true)
    })

    it('sets dirty flag to false', () => {
      const dirtyState = { ...initialState, file: { ...initialState.file, isDirty: true } }
      const state = reducer(dirtyState, { type: 'SET_FILE_DIRTY', payload: false })
      expect(state.file.isDirty).toBe(false)
    })
  })

  describe('SET_THEME', () => {
    it('sets theme to dark', () => {
      const state = reducer(initialState, { type: 'SET_THEME', payload: 'dark' })
      expect(state.ui.theme).toBe('dark')
    })

    it('sets theme to light', () => {
      const darkState = { ...initialState, ui: { ...initialState.ui, theme: 'dark' as const } }
      const state = reducer(darkState, { type: 'SET_THEME', payload: 'light' })
      expect(state.ui.theme).toBe('light')
    })
  })

  describe('TOGGLE_SIDEBAR', () => {
    it('toggles sidebar from expanded to collapsed', () => {
      const state = reducer(initialState, { type: 'TOGGLE_SIDEBAR' })
      expect(state.ui.sidebarCollapsed).toBe(!initialState.ui.sidebarCollapsed)
    })

    it('toggles sidebar from collapsed to expanded', () => {
      const collapsedState = { ...initialState, ui: { ...initialState.ui, sidebarCollapsed: true } }
      const state = reducer(collapsedState, { type: 'TOGGLE_SIDEBAR' })
      expect(state.ui.sidebarCollapsed).toBe(false)
    })
  })

  describe('TOGGLE_EDITOR', () => {
    it('toggles editor pane', () => {
      const state = reducer(initialState, { type: 'TOGGLE_EDITOR' })
      expect(state.ui.editorCollapsed).toBe(!initialState.ui.editorCollapsed)
    })
  })

  describe('TOGGLE_PREVIEW', () => {
    it('toggles preview pane', () => {
      const state = reducer(initialState, { type: 'TOGGLE_PREVIEW' })
      expect(state.ui.previewCollapsed).toBe(!initialState.ui.previewCollapsed)
    })
  })

  describe('SET_FOLDER_PATH', () => {
    it('sets folder path', () => {
      const state = reducer(initialState, { type: 'SET_FOLDER_PATH', payload: '/test/folder' })
      expect(state.folder.path).toBe('/test/folder')
    })

    it('clears folder path when null', () => {
      const folderState = { ...initialState, folder: { ...initialState.folder, path: '/test/folder' } }
      const state = reducer(folderState, { type: 'SET_FOLDER_PATH', payload: null })
      expect(state.folder.path).toBeNull()
    })
  })

  describe('SET_FOLDER_TREE', () => {
    it('sets folder tree', () => {
      const tree = [{ name: 'test.md', path: '/test/test.md', node_type: 'file', extension: 'md', children: null, is_loaded: true }]
      const state = reducer(initialState, { type: 'SET_FOLDER_TREE', payload: tree })
      expect(state.folder.tree).toEqual(tree)
    })
  })

  describe('TOGGLE_DIR_EXPANDED', () => {
    it('adds directory to expanded set', () => {
      const state = reducer(initialState, { type: 'TOGGLE_DIR_EXPANDED', payload: '/test/folder' })
      expect(state.folder.expandedDirs.has('/test/folder')).toBe(true)
    })

    it('removes directory from expanded set if already expanded', () => {
      const stateWithExpanded = {
        ...initialState,
        folder: { ...initialState.folder, expandedDirs: new Set(['/test/folder']) }
      }
      const state = reducer(stateWithExpanded, { type: 'TOGGLE_DIR_EXPANDED', payload: '/test/folder' })
      expect(state.folder.expandedDirs.has('/test/folder')).toBe(false)
    })
  })

  describe('UPDATE_CURSOR_POSITION', () => {
    it('updates cursor position', () => {
      const state = reducer(initialState, { type: 'UPDATE_CURSOR_POSITION', payload: { line: 5, column: 10 } })
      expect(state.editor.cursorPosition.line).toBe(5)
      expect(state.editor.cursorPosition.column).toBe(10)
    })
  })

  describe('UPDATE_DOCUMENT_STATS', () => {
    it('updates document stats', () => {
      const state = reducer(initialState, { 
        type: 'UPDATE_DOCUMENT_STATS', 
        payload: { characters: 100, words: 20, lines: 5 } 
      })
      expect(state.editor.documentStats.characters).toBe(100)
      expect(state.editor.documentStats.words).toBe(20)
      expect(state.editor.documentStats.lines).toBe(5)
    })
  })

  describe('unknown action', () => {
    it('returns state unchanged for unknown action', () => {
      const state = reducer(initialState, { type: 'UNKNOWN_ACTION' as any, payload: null })
      expect(state).toEqual(initialState)
    })
  })

  describe('SET_ZOOM_LEVEL', () => {
    it('sets zoom level', () => {
      const state = reducer(initialState, { type: 'SET_ZOOM_LEVEL', payload: 18 })
      expect(state.ui.zoomLevel).toBe(18)
    })
  })

  describe('SET_SIDEBAR_COLLAPSED', () => {
    it('sets sidebar collapsed to true', () => {
      const state = reducer(initialState, { type: 'SET_SIDEBAR_COLLAPSED', payload: true })
      expect(state.ui.sidebarCollapsed).toBe(true)
    })

    it('sets sidebar collapsed to false', () => {
      const collapsedState = { ...initialState, ui: { ...initialState.ui, sidebarCollapsed: true } }
      const state = reducer(collapsedState, { type: 'SET_SIDEBAR_COLLAPSED', payload: false })
      expect(state.ui.sidebarCollapsed).toBe(false)
    })
  })

  describe('SET_EDITOR_COLLAPSED', () => {
    it('sets editor collapsed to true when preview is not collapsed', () => {
      const state = reducer(initialState, { type: 'SET_EDITOR_COLLAPSED', payload: true })
      expect(state.ui.editorCollapsed).toBe(true)
    })

    it('prevents collapsing both editor and preview', () => {
      const previewCollapsedState = { 
        ...initialState, 
        ui: { ...initialState.ui, previewCollapsed: true } 
      }
      const state = reducer(previewCollapsedState, { type: 'SET_EDITOR_COLLAPSED', payload: true })
      // State should remain unchanged since both cannot be collapsed
      expect(state.ui.editorCollapsed).toBe(false)
    })
  })

  describe('SET_PREVIEW_COLLAPSED', () => {
    it('sets preview collapsed to true when editor is not collapsed', () => {
      const state = reducer(initialState, { type: 'SET_PREVIEW_COLLAPSED', payload: true })
      expect(state.ui.previewCollapsed).toBe(true)
    })

    it('prevents collapsing both preview and editor', () => {
      const editorCollapsedState = { 
        ...initialState, 
        ui: { ...initialState.ui, editorCollapsed: true } 
      }
      const state = reducer(editorCollapsedState, { type: 'SET_PREVIEW_COLLAPSED', payload: true })
      // State should remain unchanged since both cannot be collapsed
      expect(state.ui.previewCollapsed).toBe(false)
    })
  })

  describe('TOGGLE_EDITOR', () => {
    it('toggles editor when preview is not collapsed', () => {
      const state = reducer(initialState, { type: 'TOGGLE_EDITOR' })
      expect(state.ui.editorCollapsed).toBe(!initialState.ui.editorCollapsed)
    })

    it('prevents toggling editor when preview is collapsed', () => {
      const previewCollapsedState = { 
        ...initialState, 
        ui: { ...initialState.ui, previewCollapsed: true, editorCollapsed: false } 
      }
      const state = reducer(previewCollapsedState, { type: 'TOGGLE_EDITOR' })
      // State should remain unchanged
      expect(state.ui.editorCollapsed).toBe(false)
    })
  })

  describe('TOGGLE_PREVIEW', () => {
    it('toggles preview when editor is not collapsed', () => {
      const state = reducer(initialState, { type: 'TOGGLE_PREVIEW' })
      expect(state.ui.previewCollapsed).toBe(!initialState.ui.previewCollapsed)
    })

    it('prevents toggling preview when editor is collapsed', () => {
      const editorCollapsedState = { 
        ...initialState, 
        ui: { ...initialState.ui, editorCollapsed: true, previewCollapsed: false } 
      }
      const state = reducer(editorCollapsedState, { type: 'TOGGLE_PREVIEW' })
      // State should remain unchanged
      expect(state.ui.previewCollapsed).toBe(false)
    })
  })

  describe('RESTORE_STATE', () => {
    it('restores state from payload', () => {
      const restoredState = {
        ...initialState,
        file: {
          ...initialState.file,
          path: '/restored/file.md',
          content: '# Restored Content',
          isDirty: true
        }
      }
      const state = reducer(initialState, { type: 'RESTORE_STATE', payload: restoredState })
      expect(state.file.path).toBe('/restored/file.md')
      expect(state.file.content).toBe('# Restored Content')
      expect(state.file.isDirty).toBe(true)
    })
  })
})
