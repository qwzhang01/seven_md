/**
 * Agent Store — 管理 Markdown Agent 生命周期、消息、工具调用、Patch 确认
 */

import { create } from 'zustand'
import type { Agent } from '@pi/agent'
import { createMarkdownAgent } from '../services/ai/agent/markdownAgent'
import { mapPiEvent, resetEventMapper } from '../services/ai/agent/eventMapper'
import type { MarkdownAgentEvent } from '../services/ai/agent/eventMapper'
import type { MarkdownPatch } from '../services/ai/agent/patchProtocol'
import { useFileStore } from './useFileStore'

// ─── Types ──────────────────────────────────────────────────────────

export interface AgentStoreMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

export interface ToolCallRecord {
  id: string
  name: string
  args: Record<string, unknown>
  status: 'running' | 'completed' | 'error'
  result: unknown | null
}

interface AgentState {
  isRunning: boolean
  messages: AgentStoreMessage[]
  toolCalls: ToolCallRecord[]
  pendingPatches: MarkdownPatch[]
  error: string | null

  // Actions
  startAgent: (userMessage: string) => void
  cancelAgent: () => void
  applyPatch: (patchId: string) => void
  rejectPatch: (patchId: string) => void
  applyAllPatches: () => void
  rejectAllPatches: () => void
  clearHistory: () => void
}

// ─── Agent Instance Management ──────────────────────────────────────

let agentInstance: Agent | null = null
let unsubscribe: (() => void) | null = null
let messageIdCounter = 0

function getNextMessageId(): string {
  return `agent-msg-${++messageIdCounter}`
}

// ─── Store ──────────────────────────────────────────────────────────

export const useAgentStore = create<AgentState>()((set, get) => ({
  isRunning: false,
  messages: [],
  toolCalls: [],
  pendingPatches: [],
  error: null,

  startAgent: (userMessage: string) => {
    const state = get()
    if (state.isRunning) return

    // 添加用户消息
    const userMsg: AgentStoreMessage = {
      id: getNextMessageId(),
      role: 'user',
      content: userMessage,
      timestamp: Date.now(),
    }

    set({
      isRunning: true,
      error: null,
      messages: [...state.messages, userMsg],
    })

    // 创建或复用 Agent 实例
    try {
      if (!agentInstance) {
        agentInstance = createMarkdownAgent()
      }
    } catch (err) {
      set({
        isRunning: false,
        error: err instanceof Error ? err.message : '创建 Agent 失败',
      })
      return
    }

    // 重置事件映射器内部状态
    resetEventMapper()

    // 准备 assistant 消息占位
    const assistantMsg: AgentStoreMessage = {
      id: getNextMessageId(),
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
    }
    set((s) => ({ messages: [...s.messages, assistantMsg] }))
    const assistantMsgId = assistantMsg.id

    // 订阅事件
    if (unsubscribe) {
      unsubscribe()
    }
    unsubscribe = agentInstance.subscribe((event) => {
      const mapped = mapPiEvent(event)
      if (!mapped) return
      dispatchEvent(mapped, assistantMsgId)
    })

    // 启动 Agent
    agentInstance.prompt(userMessage).then(() => {
      // prompt 完成后确保 isRunning 重置（兜底 done 事件可能未触发）
      set({ isRunning: false })
    }).catch((err) => {
      set({
        isRunning: false,
        error: err instanceof Error ? err.message : 'Agent 运行出错',
      })
    })
  },

  cancelAgent: () => {
    if (agentInstance) {
      agentInstance.abort()
    }
    set({ isRunning: false })
  },

  applyPatch: (patchId: string) => {
    const state = get()
    const patch = state.pendingPatches.find((p) => p.id === patchId)
    if (!patch) return

    executePatch(patch)

    set({
      pendingPatches: state.pendingPatches.filter((p) => p.id !== patchId),
    })
  },

  rejectPatch: (patchId: string) => {
    set((s) => ({
      pendingPatches: s.pendingPatches.filter((p) => p.id !== patchId),
    }))
  },

  applyAllPatches: () => {
    const state = get()
    const sorted = [...state.pendingPatches].sort((a, b) => a.createdAt - b.createdAt)
    for (const patch of sorted) {
      executePatch(patch)
    }
    set({ pendingPatches: [] })
  },

  rejectAllPatches: () => {
    set({ pendingPatches: [] })
  },

  clearHistory: () => {
    // 清除所有状态但保留 Agent 实例
    set({
      messages: [],
      toolCalls: [],
      pendingPatches: [],
      error: null,
    })
  },
}))

// ─── Event Dispatch ─────────────────────────────────────────────────

function dispatchEvent(event: MarkdownAgentEvent, assistantMsgId: string): void {
  const store = useAgentStore

  switch (event.type) {
    case 'thinking':
      // 可选：用于展示 thinking indicator
      break

    case 'message':
      store.setState((s) => ({
        messages: s.messages.map((m) =>
          m.id === assistantMsgId ? { ...m, content: event.content } : m,
        ),
      }))
      break

    case 'tool_call':
      store.setState((s) => ({
        toolCalls: [
          ...s.toolCalls,
          {
            id: event.toolCallId,
            name: event.name,
            args: event.args,
            status: 'running' as const,
            result: null,
          },
        ],
      }))
      break

    case 'tool_result':
      store.setState((s) => ({
        toolCalls: s.toolCalls.map((tc) =>
          tc.id === event.toolCallId
            ? { ...tc, status: 'completed' as const, result: event.result }
            : tc,
        ),
      }))
      break

    case 'patch':
      store.setState((s) => ({
        pendingPatches: [...s.pendingPatches, event.patch],
        toolCalls: s.toolCalls.map((tc) =>
          tc.id === event.toolCallId
            ? { ...tc, status: 'completed' as const, result: event.patch }
            : tc,
        ),
      }))
      break

    case 'error':
      store.setState({ isRunning: false, error: event.error })
      break

    case 'done':
      store.setState({ isRunning: false })
      break
  }
}

// ─── Patch Execution ────────────────────────────────────────────────

function executePatch(patch: MarkdownPatch): void {
  switch (patch.type) {
    case 'replace_selection': {
      document.dispatchEvent(
        new CustomEvent('editor:replace-selection', { detail: { text: patch.newText } }),
      )
      break
    }
    case 'insert_at_cursor': {
      document.dispatchEvent(
        new CustomEvent('editor:insert', { detail: { text: patch.text, position: patch.position } }),
      )
      break
    }
    case 'replace_document': {
      const fileStore = useFileStore.getState()
      const activeTab = fileStore.getActiveTab()
      if (activeTab) {
        fileStore.updateTabContent(activeTab.id, patch.newContent)
      }
      break
    }
    case 'insert_after_heading': {
      // 通过 replace_document 实现：找到标题位置后插入
      const fileStore = useFileStore.getState()
      const activeTab = fileStore.getActiveTab()
      if (activeTab) {
        const lines = activeTab.content.split('\n')
        const headingPrefix = '#'.repeat(patch.headingLevel) + ' '
        const idx = lines.findIndex(
          (l) => l.startsWith(headingPrefix) && l.slice(headingPrefix.length).trim() === patch.headingText.trim(),
        )
        if (idx >= 0) {
          lines.splice(idx + 1, 0, patch.content)
          fileStore.updateTabContent(activeTab.id, lines.join('\n'))
        }
      }
      break
    }
    case 'append_section': {
      const fileStore = useFileStore.getState()
      const activeTab = fileStore.getActiveTab()
      if (activeTab) {
        const newContent = activeTab.content.endsWith('\n')
          ? activeTab.content + '\n' + patch.content
          : activeTab.content + '\n\n' + patch.content
        fileStore.updateTabContent(activeTab.id, newContent)
      }
      break
    }
  }
}
