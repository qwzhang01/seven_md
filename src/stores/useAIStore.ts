import { create } from 'zustand'

export type AIMode = 'chat' | 'rewrite' | 'translate' | 'explain'
export type RewriteStyle = 'professional' | 'casual' | 'concise' | 'expansive'
export type TranslateDirection = 'zh-en' | 'en-zh' | 'zh-ja'

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

  // Rewrite mode
  rewriteStyle: RewriteStyle
  rewriteResult: string | null

  // Translate mode
  translateDirection: TranslateDirection
  translateResult: string | null

  // Explain mode
  explainResult: string | null

  // Selected text (shared across modes)
  selectedText: string | null

  // Actions
  setOpen: (open: boolean) => void
  setMode: (mode: AIMode) => void
  addMessage: (role: 'user' | 'assistant', content: string) => void
  clearMessages: () => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setRewriteStyle: (style: RewriteStyle) => void
  setRewriteResult: (result: string | null) => void
  setTranslateDirection: (direction: TranslateDirection) => void
  setTranslateResult: (result: string | null) => void
  setExplainResult: (result: string | null) => void
  setSelectedText: (text: string | null) => void
}

let messageIdCounter = 0

export const useAIStore = create<AIState>()((set) => ({
  isOpen: false,
  mode: 'chat',
  messages: [],
  isLoading: false,
  error: null,
  rewriteStyle: 'professional',
  rewriteResult: null,
  translateDirection: 'zh-en',
  translateResult: null,
  explainResult: null,
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
  setRewriteStyle: (style) => set({ rewriteStyle: style }),
  setRewriteResult: (result) => set({ rewriteResult: result }),
  setTranslateDirection: (direction) => set({ translateDirection: direction }),
  setTranslateResult: (result) => set({ translateResult: result }),
  setExplainResult: (result) => set({ explainResult: result }),
  setSelectedText: (text) => set({ selectedText: text }),
}))
