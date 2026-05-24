import { create } from 'zustand'

export type AIMode = 'chat' | 'agent'

export interface AIMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

interface AIState {
  isOpen: boolean
  mode: AIMode
  messages: AIMessage[]
  isLoading: boolean
  error: string | null

  // Selected text (used by Agent mode)
  selectedText: string | null

  // Actions
  setOpen: (open: boolean) => void
  setMode: (mode: AIMode) => void
  addMessage: (role: 'user' | 'assistant', content: string) => void
  clearMessages: () => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setSelectedText: (text: string | null) => void
}

let messageIdCounter = 0

export const useAIStore = create<AIState>()((set) => ({
  isOpen: false,
  mode: 'chat',
  messages: [],
  isLoading: false,
  error: null,
  selectedText: null,

  setOpen: (open) => set({ isOpen: open }),
  setMode: (mode) => set({ mode }),
  addMessage: (role, content) =>
    set((s) => ({
      messages: [
        ...s.messages,
        {
          id: `msg-${++messageIdCounter}`,
          role,
          content,
          timestamp: Date.now(),
        },
      ],
    })),
  clearMessages: () => set({ messages: [] }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  setSelectedText: (text) => set({ selectedText: text }),
}))
