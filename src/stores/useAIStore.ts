import { create } from 'zustand'

interface AIState {
  isOpen: boolean

  // Selected text (used by Agent mode)
  selectedText: string | null

  // Actions
  setOpen: (open: boolean) => void
  setSelectedText: (text: string | null) => void
}

export const useAIStore = create<AIState>()((set) => ({
  isOpen: false,
  selectedText: null,

  setOpen: (open) => set({ isOpen: open }),
  setSelectedText: (text) => set({ selectedText: text }),
}))
