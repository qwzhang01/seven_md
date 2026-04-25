import { create } from 'zustand'

interface CursorPosition {
  line: number
  column: number
}

interface EditorState {
  content: string
  cursorPosition: CursorPosition
  selection: { from: number; to: number } | null
  isModified: boolean
  wordCount: number
  lineCount: number
  charCount: number
  fileEncoding: string
  lineEnding: 'LF' | 'CRLF'

  // Actions
  setContent: (content: string) => void
  setCursorPosition: (position: CursorPosition) => void
  setSelection: (selection: { from: number; to: number } | null) => void
  setModified: (modified: boolean) => void
  setFileEncoding: (encoding: string) => void
  setLineEnding: (ending: 'LF' | 'CRLF') => void
  updateStats: () => void
}

function countStats(content: string) {
  const lines = content.split('\n').length
  const chars = content.length
  const words = content.trim() ? content.trim().split(/\s+/).length : 0
  return { lines, chars, words }
}

export const useEditorStore = create<EditorState>()((set, get) => ({
  content: '',
  cursorPosition: { line: 1, column: 1 },
  selection: null,
  isModified: false,
  wordCount: 0,
  lineCount: 0,
  charCount: 0,
  fileEncoding: 'UTF-8',
  lineEnding: 'LF',

  setContent: (content) => {
    const stats = countStats(content)
    set({ content, isModified: true, ...stats })
  },

  setCursorPosition: (position) => set({ cursorPosition: position }),
  setSelection: (selection) => set({ selection }),
  setModified: (modified) => set({ isModified: modified }),
  setFileEncoding: (encoding) => set({ fileEncoding: encoding }),
  setLineEnding: (ending) => set({ lineEnding: ending }),

  updateStats: () => {
    const { content } = get()
    const { lines, chars, words } = countStats(content)
    set({ lineCount: lines, charCount: chars, wordCount: words })
  },
}))
