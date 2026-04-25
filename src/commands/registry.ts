import type { Command, CommandCategory } from '../stores/useCommandStore'

/**
 * 命令注册表 — 集中管理所有可执行命令
 * 命令面板、菜单栏、工具栏、快捷键共享同一套命令
 */
class CommandRegistryImpl {
  private commands = new Map<string, Command>()

  register(command: Command): void {
    if (this.commands.has(command.id)) {
      console.warn(`[CommandRegistry] Command "${command.id}" already registered, overwriting.`)
    }
    this.commands.set(command.id, command)
  }

  unregister(id: string): void {
    this.commands.delete(id)
  }

  async execute(id: string): Promise<void> {
    const command = this.commands.get(id)
    if (!command) {
      console.warn(`[CommandRegistry] Command "${id}" not found.`)
      return
    }
    if (command.when && !command.when()) {
      console.warn(`[CommandRegistry] Command "${id}" condition not met.`)
      return
    }
    await command.execute()
  }

  get(id: string): Command | undefined {
    return this.commands.get(id)
  }

  getAll(): Command[] {
    return Array.from(this.commands.values())
  }

  getByCategory(category: CommandCategory): Command[] {
    return this.getAll().filter((c) => c.category === category)
  }

  query(search: string): Command[] {
    if (!search) return this.getAll().filter((c) => !c.when || c.when())
    const q = search.toLowerCase()
    return this.getAll()
      .filter((c) => !c.when || c.when())
      .filter((c) => {
        const text = `${c.category}: ${c.title}`.toLowerCase()
        return text.includes(q) || fuzzyMatch(q, text)
      })
  }
}

function fuzzyMatch(query: string, text: string): boolean {
  let qi = 0
  for (let ti = 0; ti < text.length && qi < query.length; ti++) {
    if (text[ti] === query[qi]) qi++
  }
  return qi === query.length
}

// Singleton instance
export const commandRegistry = new CommandRegistryImpl()
