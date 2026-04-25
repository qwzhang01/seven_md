import { create } from 'zustand'

export type CommandCategory = 'file' | 'edit' | 'view' | 'insert' | 'format' | 'theme' | 'ai' | 'help'

export interface Command {
  id: string
  title: string
  category: CommandCategory
  icon?: string
  shortcut?: string
  when?: () => boolean
  execute: () => void | Promise<void>
}

interface CommandState {
  commands: Map<string, Command>
  searchQuery: string
  filteredCommands: Command[]

  // Actions
  registerCommand: (command: Command) => void
  unregisterCommand: (id: string) => void
  executeCommand: (id: string) => Promise<void>
  setSearchQuery: (query: string) => void
  getFilteredCommands: () => Command[]
  getCommandsByCategory: (category: CommandCategory) => Command[]
}

// Fuzzy match utility
function fuzzyMatch(query: string, text: string): boolean {
  const q = query.toLowerCase()
  const t = text.toLowerCase()
  if (t.includes(q)) return true
  let qi = 0
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) qi++
  }
  return qi === q.length
}

const CATEGORY_LABELS: Record<CommandCategory, string> = {
  file: '💾 文件',
  edit: '✏️ 编辑',
  view: '👁 视图',
  insert: '📝 插入',
  format: '🎨 格式',
  theme: '🌙 主题',
  ai: '🤖 AI',
  help: '❓ 帮助',
}

export { CATEGORY_LABELS }

export const useCommandStore = create<CommandState>()((set, get) => ({
  commands: new Map(),
  searchQuery: '',
  filteredCommands: [],

  registerCommand: (command) =>
    set((s) => {
      const newCommands = new Map(s.commands)
      newCommands.set(command.id, command)
      return { commands: newCommands }
    }),

  unregisterCommand: (id) =>
    set((s) => {
      const newCommands = new Map(s.commands)
      newCommands.delete(id)
      return { commands: newCommands }
    }),

  executeCommand: async (id) => {
    const command = get().commands.get(id)
    if (command) {
      if (command.when && !command.when()) return
      await command.execute()
    }
  },

  setSearchQuery: (query) =>
    set((s) => {
      const filtered = Array.from(s.commands.values())
        .filter((cmd) => !cmd.when || cmd.when())
        .filter((cmd) => !query || fuzzyMatch(query, `${cmd.category}: ${cmd.title}`))
        .sort((a, b) => {
          const order: CommandCategory[] = ['theme', 'view', 'edit', 'file', 'insert', 'ai', 'format', 'help']
          return order.indexOf(a.category) - order.indexOf(b.category)
        })
      return { searchQuery: query, filteredCommands: filtered }
    }),

  getFilteredCommands: () => {
    const state = get()
    const query = state.searchQuery
    return Array.from(state.commands.values())
      .filter((cmd) => !cmd.when || cmd.when())
      .filter((cmd) => !query || fuzzyMatch(query, `${cmd.category}: ${cmd.title}`))
      .sort((a, b) => {
        const order: CommandCategory[] = ['theme', 'view', 'edit', 'file', 'insert', 'ai', 'format', 'help']
        return order.indexOf(a.category) - order.indexOf(b.category)
      })
  },

  getCommandsByCategory: (category) =>
    Array.from(get().commands.values()).filter((cmd) => cmd.category === category),
}))
