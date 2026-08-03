/**
 * Agent Store — 管理 Markdown Agent 多会话生命周期
 *
 * 多会话设计：
 * - sessions: Record<sessionId, AgentSession>
 * - activeSessionId: 当前激活会话
 * - 默认在首次访问时自动创建 'default' 会话
 *
 * 兼容旧 API：startAgent/cancelAgent/applyPatch 等顶层方法操作 active session。
 *
 * 新增能力：
 * - activeModelId（持久化到 localStorage）
 * - pendingConfirmations（confirm 工具等待用户决定）
 * - compactionInProgress（UI 压缩指示器）
 * - 会话级权限覆盖
 */

import { create } from 'zustand'
import type { Agent } from '@pi/agent'
import {
  createMarkdownAgent,
  setActiveModelProvider,
} from '../services/ai/agent/markdownAgent'
import { EventMapper } from '../services/ai/agent/eventMapper'
import type { MarkdownAgentEvent } from '../services/ai/agent/eventMapper'
import type { MarkdownPatch } from '../services/ai/agent/patchProtocol'
import {
  setConfirmationHandler,
  setActiveSessionProvider,
  type ConfirmationRequest,
} from '../services/ai/agent/toolRegistry'
import { clearSessionOverrides } from '../services/ai/agent/permissionModel'
import { dispatch } from '../lib/eventBus'
import { useFileStore } from './useFileStore'
import { getAIConfig } from '../services/ai/config'
import type {
  AgentStoreMessage,
  ToolCallRecord,
  PendingConfirmation,
} from '../types'

export type { AgentStoreMessage, ToolCallRecord, PendingConfirmation }

// ─── Types ──────────────────────────────────────────────────────────

export interface AgentSession {
  id: string
  title: string
  createdAt: number
  modelId: string
  isRunning: boolean
  messages: AgentStoreMessage[]
  toolCalls: ToolCallRecord[]
  pendingPatches: MarkdownPatch[]
  pendingConfirmations: PendingConfirmation[]
  compactionInProgress: boolean
  error: string | null
}

interface AgentState {
  // 多会话
  sessions: Record<string, AgentSession>
  activeSessionId: string

  // 全局：模型选择
  activeModelId: string

  // 当前 session 的便捷访问字段（计算自 sessions[activeSessionId]）— 兼容现有 UI
  isRunning: boolean
  messages: AgentStoreMessage[]
  toolCalls: ToolCallRecord[]
  pendingPatches: MarkdownPatch[]
  pendingConfirmations: PendingConfirmation[]
  compactionInProgress: boolean
  error: string | null

  // ─ Actions（兼容原 markdown-agent-mvp）
  startAgent: (userMessage: string) => void
  cancelAgent: () => void
  applyPatch: (patchId: string) => void
  rejectPatch: (patchId: string) => void
  applyAllPatches: () => void
  rejectAllPatches: () => void
  clearHistory: () => void

  // ─ 多会话 Actions
  createSession: (title?: string) => string
  setActiveSession: (id: string) => void
  deleteSession: (id: string) => void

  // ─ 模型切换
  setActiveModel: (modelId: string) => void

  // ─ 权限确认
  approveConfirmation: (id: string) => void
  rejectConfirmation: (id: string) => void

  // ─ 重试
  retryLastPrompt: () => void
}

// ─── Constants ──────────────────────────────────────────────────────

const ACTIVE_MODEL_KEY = 'seven-markdown-agent-active-model'
const CONFIRMATION_TIMEOUT_MS = 5 * 60 * 1000 // 5 min

// ─── Helpers ────────────────────────────────────────────────────────

let messageIdCounter = 0
function nextMessageId(): string {
  return `agent-msg-${++messageIdCounter}`
}

let confirmationIdCounter = 0
function nextConfirmationId(): string {
  return `confirm-${++confirmationIdCounter}-${Date.now()}`
}

function createEmptySession(modelId: string, title = '对话 1'): AgentSession {
  return {
    id: typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `sess-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    title,
    createdAt: Date.now(),
    modelId,
    isRunning: false,
    messages: [],
    toolCalls: [],
    pendingPatches: [],
    pendingConfirmations: [],
    compactionInProgress: false,
    error: null,
  }
}

// ─── Per-session runtime state（不放入 store 以避免序列化问题）──────────

interface SessionRuntime {
  agent: Agent | null
  unsubscribe: (() => void) | null
  eventMapper: EventMapper
}

const runtimes = new Map<string, SessionRuntime>()

function getRuntime(sessionId: string): SessionRuntime {
  let rt = runtimes.get(sessionId)
  if (!rt) {
    rt = { agent: null, unsubscribe: null, eventMapper: new EventMapper() }
    runtimes.set(sessionId, rt)
  }
  return rt
}

// 等待用户决定的 Promise 解析器
const confirmationResolvers = new Map<string, { resolve: (approved: boolean) => void; timer: number }>()

// ─── 初始 active model 解析 ─────────────────────────────────────────

function loadActiveModelId(): string {
  try {
    const stored = localStorage.getItem(ACTIVE_MODEL_KEY)
    if (stored) return stored
  } catch { /* ignore */ }
  return getAIConfig().model
}

function persistActiveModelId(id: string): void {
  try {
    localStorage.setItem(ACTIVE_MODEL_KEY, id)
  } catch { /* ignore */ }
}

// ─── Store ──────────────────────────────────────────────────────────

const initialModelId = loadActiveModelId()
const defaultSession = createEmptySession(initialModelId, '对话 1')

export const useAgentStore = create<AgentState>()((set, get) => ({
  sessions: { [defaultSession.id]: defaultSession },
  activeSessionId: defaultSession.id,
  activeModelId: initialModelId,

  // 计算字段初始值
  isRunning: false,
  messages: [],
  toolCalls: [],
  pendingPatches: [],
  pendingConfirmations: [],
  compactionInProgress: false,
  error: null,

  startAgent: (userMessage: string) => {
    const state = get()
    const session = state.sessions[state.activeSessionId]
    if (!session || session.isRunning) return

    // 添加用户消息
    const userMsg: AgentStoreMessage = {
      id: nextMessageId(),
      role: 'user',
      content: userMessage,
      timestamp: Date.now(),
    }

    updateSession(state.activeSessionId, (s) => ({
      ...s,
      isRunning: true,
      error: null,
      messages: [...s.messages, userMsg],
    }))

    // 创建或复用 Agent 实例
    const runtime = getRuntime(state.activeSessionId)
    if (!runtime.agent) {
      try {
        runtime.agent = createMarkdownAgent({
          modelId: session.modelId,
          onCompactionBegin: () => {
            updateSession(state.activeSessionId, (s) => ({ ...s, compactionInProgress: true }))
          },
          onCompactionEvent: (e) => {
            if (e.type === 'compaction_done') {
              dispatchEvent({ type: 'compaction_done', removedMessages: e.removedMessages }, state.activeSessionId, '')
            } else {
              dispatchEvent({ type: 'compaction_failed', error: e.error }, state.activeSessionId, '')
            }
          },
        })
      } catch (err) {
        updateSession(state.activeSessionId, (s) => ({
          ...s,
          isRunning: false,
          error: err instanceof Error ? err.message : '创建 Agent 失败',
        }))
        return
      }
    }

    runtime.eventMapper.reset()

    // assistant 消息占位
    const assistantMsg: AgentStoreMessage = {
      id: nextMessageId(),
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
    }
    updateSession(state.activeSessionId, (s) => ({
      ...s,
      messages: [...s.messages, assistantMsg],
    }))
    const assistantMsgId = assistantMsg.id

    // 订阅事件
    if (runtime.unsubscribe) runtime.unsubscribe()
    const sessionId = state.activeSessionId
    const mapper = runtime.eventMapper
    runtime.unsubscribe = runtime.agent.subscribe((event) => {
      const mapped = mapper.map(event)
      if (!mapped) return
      dispatchEvent(mapped, sessionId, assistantMsgId)
    })

    runtime.agent
      .prompt(userMessage)
      .then(() => {
        updateSession(sessionId, (s) => ({ ...s, isRunning: false }))
      })
      .catch((err) => {
        updateSession(sessionId, (s) => ({
          ...s,
          isRunning: false,
          error: err instanceof Error ? err.message : 'Agent 运行出错',
        }))
      })
  },

  cancelAgent: () => {
    const state = get()
    const runtime = getRuntime(state.activeSessionId)
    runtime.agent?.abort()
    updateSession(state.activeSessionId, (s) => ({ ...s, isRunning: false }))
  },

  applyPatch: (patchId: string) => {
    const state = get()
    const session = state.sessions[state.activeSessionId]
    const patch = session?.pendingPatches.find((p) => p.id === patchId)
    if (!patch) return
    try {
      executePatch(patch)
      updateSession(state.activeSessionId, (s) => ({
        ...s,
        pendingPatches: s.pendingPatches.filter((p) => p.id !== patchId),
      }))
    } catch (err) {
      updateSession(state.activeSessionId, (s) => ({
        ...s,
        error: `补丁应用失败：${err instanceof Error ? err.message : String(err)}`,
      }))
    }
  },

  rejectPatch: (patchId: string) => {
    const state = get()
    updateSession(state.activeSessionId, (s) => ({
      ...s,
      pendingPatches: s.pendingPatches.filter((p) => p.id !== patchId),
    }))
    void state // satisfy linter
  },

  applyAllPatches: () => {
    const state = get()
    const session = state.sessions[state.activeSessionId]
    if (!session) return
    const sorted = [...session.pendingPatches].sort((a, b) => a.createdAt - b.createdAt)
    const appliedIds = new Set<string>()
    const errors: string[] = []
    for (const patch of sorted) {
      try {
        executePatch(patch)
        appliedIds.add(patch.id)
      } catch (err) {
        errors.push(`${patch.id}: ${err instanceof Error ? err.message : String(err)}`)
      }
    }
    updateSession(state.activeSessionId, (s) => ({
      ...s,
      pendingPatches: s.pendingPatches.filter((p) => !appliedIds.has(p.id)),
      error: errors.length > 0 ? `部分补丁应用失败：\n${errors.join('\n')}` : s.error,
    }))
  },

  rejectAllPatches: () => {
    const state = get()
    updateSession(state.activeSessionId, (s) => ({ ...s, pendingPatches: [] }))
    void state
  },

  clearHistory: () => {
    const state = get()
    updateSession(state.activeSessionId, (s) => ({
      ...s,
      messages: [],
      toolCalls: [],
      pendingPatches: [],
      pendingConfirmations: [],
      error: null,
    }))
    void state
  },

  // ─── Multi-session ────────────────────────────────────────────────

  createSession: (title?: string) => {
    const state = get()
    const sessionList = Object.values(state.sessions)
    const idx = sessionList.length + 1
    const newSession = createEmptySession(state.activeModelId, title ?? `对话 ${idx}`)
    set({
      sessions: { ...state.sessions, [newSession.id]: newSession },
      activeSessionId: newSession.id,
    })
    syncComputedFields(newSession.id)
    return newSession.id
  },

  setActiveSession: (id: string) => {
    const state = get()
    if (!state.sessions[id]) {
      console.warn(`[useAgentStore] setActiveSession: 未知 session ${id}`)
      return
    }
    set({ activeSessionId: id })
    syncComputedFields(id)
  },

  deleteSession: (id: string) => {
    const state = get()
    if (!state.sessions[id]) return

    // abort 运行中的 agent
    const runtime = runtimes.get(id)
    if (runtime) {
      runtime.agent?.abort()
      runtime.unsubscribe?.()
      runtimes.delete(id)
    }
    clearSessionOverrides(id)

    const remaining = { ...state.sessions }
    delete remaining[id]
    let nextActive = state.activeSessionId
    if (id === state.activeSessionId) {
      const sorted = Object.values(remaining).sort((a, b) => b.createdAt - a.createdAt)
      if (sorted.length > 0) {
        nextActive = sorted[0].id
      } else {
        // 若全部被删除，自动创建一个新的 default
        const fresh = createEmptySession(state.activeModelId, '对话 1')
        remaining[fresh.id] = fresh
        nextActive = fresh.id
      }
    }
    set({ sessions: remaining, activeSessionId: nextActive })
    syncComputedFields(nextActive)
  },

  // ─── Model switch ────────────────────────────────────────────────

  setActiveModel: (modelId: string) => {
    const state = get()
    set({ activeModelId: modelId })
    persistActiveModelId(modelId)

    // 更新当前活跃会话的 modelId，并销毁旧 Agent 以便下次重建
    const sessionId = state.activeSessionId
    const runtime = runtimes.get(sessionId)
    if (runtime) {
      runtime.agent?.abort()
      runtime.unsubscribe?.()
      runtimes.delete(sessionId)
    }
    updateSession(sessionId, (s) => ({ ...s, modelId }))
  },

  // ─── Confirmation ────────────────────────────────────────────────

  approveConfirmation: (id: string) => {
    resolveConfirmation(id, true)
  },

  rejectConfirmation: (id: string) => {
    resolveConfirmation(id, false)
  },

  retryLastPrompt: () => {
    const state = get()
    const session = state.sessions[state.activeSessionId]
    if (!session || session.isRunning) return

    // 找到最后一条用户消息
    const lastUserMsg = [...session.messages].reverse().find((m) => m.role === 'user')
    if (!lastUserMsg) return

    // 移除最后的 assistant 消息和 error
    updateSession(state.activeSessionId, (s) => {
      const msgs = [...s.messages]
      // 移除最后的 assistant 占位
      if (msgs.length > 0 && msgs[msgs.length - 1].role === 'assistant') {
        msgs.pop()
      }
      return { ...s, messages: msgs, error: null }
    })

    // 重新启动 Agent（不添加新的用户消息）
    const runtime = getRuntime(state.activeSessionId)
    if (!runtime.agent) return

    runtime.eventMapper.reset()

    const assistantMsg: AgentStoreMessage = {
      id: nextMessageId(),
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
    }
    updateSession(state.activeSessionId, (s) => ({
      ...s,
      isRunning: true,
      messages: [...s.messages, assistantMsg],
    }))
    const assistantMsgId = assistantMsg.id

    const sessionId = state.activeSessionId
    const mapper = runtime.eventMapper
    if (runtime.unsubscribe) runtime.unsubscribe()
    runtime.unsubscribe = runtime.agent.subscribe((event) => {
      const mapped = mapper.map(event)
      if (!mapped) return
      dispatchEvent(mapped, sessionId, assistantMsgId)
    })

    runtime.agent
      .prompt(lastUserMsg.content)
      .then(() => {
        updateSession(sessionId, (s) => ({ ...s, isRunning: false }))
      })
      .catch((err) => {
        updateSession(sessionId, (s) => ({
          ...s,
          isRunning: false,
          error: err instanceof Error ? err.message : 'Agent 运行出错',
        }))
      })
  },
}))

// ─── 内部：会话更新与计算字段同步 ────────────────────────────────────

function updateSession(
  sessionId: string,
  updater: (s: AgentSession) => AgentSession,
): void {
  const state = useAgentStore.getState()
  const session = state.sessions[sessionId]
  if (!session) return
  const updated = updater(session)
  useAgentStore.setState({
    sessions: { ...state.sessions, [sessionId]: updated },
  })
  if (sessionId === state.activeSessionId) {
    syncComputedFields(sessionId)
  }
}

function syncComputedFields(sessionId: string): void {
  const session = useAgentStore.getState().sessions[sessionId]
  if (!session) return
  useAgentStore.setState({
    isRunning: session.isRunning,
    messages: session.messages,
    toolCalls: session.toolCalls,
    pendingPatches: session.pendingPatches,
    pendingConfirmations: session.pendingConfirmations,
    compactionInProgress: session.compactionInProgress,
    error: session.error,
  })
}

// ─── 内部：confirmation 解析 ─────────────────────────────────────────

function resolveConfirmation(id: string, approved: boolean): void {
  const entry = confirmationResolvers.get(id)
  if (!entry) return
  clearTimeout(entry.timer)
  confirmationResolvers.delete(id)
  entry.resolve(approved)

  // 从所有会话的 pendingConfirmations 中移除
  const state = useAgentStore.getState()
  for (const sid of Object.keys(state.sessions)) {
    const session = state.sessions[sid]
    if (session.pendingConfirmations.some((c) => c.id === id)) {
      updateSession(sid, (s) => ({
        ...s,
        pendingConfirmations: s.pendingConfirmations.filter((c) => c.id !== id),
      }))
    }
  }
}

// ─── 内部：confirmationHandler ───────────────────────────────────────

const confirmationHandler = (req: ConfirmationRequest): Promise<boolean> => {
  return new Promise<boolean>((resolve) => {
    const id = nextConfirmationId()
    const entry: PendingConfirmation = {
      id,
      toolName: req.toolName,
      args: req.args,
      preview: req.preview,
      sessionId: req.sessionId,
      createdAt: Date.now(),
    }
    updateSession(req.sessionId, (s) => ({
      ...s,
      pendingConfirmations: [...s.pendingConfirmations, entry],
    }))
    const timer = window.setTimeout(() => {
      // 超时自动拒绝
      resolveConfirmation(id, false)
    }, CONFIRMATION_TIMEOUT_MS)
    confirmationResolvers.set(id, { resolve, timer })
  })
}

// ─── 注入 toolRegistry 与 markdownAgent 钩子 ────────────────────────

setConfirmationHandler(confirmationHandler)
setActiveSessionProvider(() => useAgentStore.getState().activeSessionId)
setActiveModelProvider(() => useAgentStore.getState().activeModelId)

// ─── beforeunload：abort 所有 running agents ─────────────────────────

if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    for (const rt of runtimes.values()) {
      try { rt.agent?.abort() } catch { /* ignore */ }
      try { rt.unsubscribe?.() } catch { /* ignore */ }
    }
  })
}

// ─── Event Dispatch ─────────────────────────────────────────────────

function dispatchEvent(
  event: MarkdownAgentEvent,
  sessionId: string,
  assistantMsgId: string,
): void {
  switch (event.type) {
    case 'thinking':
      // 当 thinking 事件携带实际内容时（如 reasoning model 的思考过程），追加显示
      if (event.content) {
        updateSession(sessionId, (s) => ({
          ...s,
          messages: s.messages.map((m) =>
            m.id === assistantMsgId
              ? { ...m, content: m.content ? `${m.content}\n\n> ${event.content}` : `> ${event.content}` }
              : m,
          ),
        }))
      }
      break

    case 'message':
      updateSession(sessionId, (s) => ({
        ...s,
        messages: s.messages.map((m) =>
          m.id === assistantMsgId ? { ...m, content: event.content } : m,
        ),
      }))
      break

    case 'tool_call':
      updateSession(sessionId, (s) => ({
        ...s,
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
      updateSession(sessionId, (s) => ({
        ...s,
        toolCalls: s.toolCalls.map((tc) =>
          tc.id === event.toolCallId
            ? { ...tc, status: 'completed' as const, result: event.result }
            : tc,
        ),
      }))
      break

    case 'patch':
      updateSession(sessionId, (s) => ({
        ...s,
        pendingPatches: [...s.pendingPatches, event.patch],
        toolCalls: s.toolCalls.map((tc) =>
          tc.id === event.toolCallId
            ? { ...tc, status: 'completed' as const, result: event.patch }
            : tc,
        ),
      }))
      break

    case 'confirmation_required':
      // 已在 confirmationHandler 中加入 store；此分支保留以备未来直传
      break

    case 'compaction_done':
      updateSession(sessionId, (s) => ({ ...s, compactionInProgress: false }))
      break

    case 'compaction_failed':
      updateSession(sessionId, (s) => ({ ...s, compactionInProgress: false, error: `压缩失败：${event.error}` }))
      break

    case 'error':
      updateSession(sessionId, (s) => ({ ...s, isRunning: false, error: event.error }))
      break

    case 'done':
      updateSession(sessionId, (s) => ({ ...s, isRunning: false }))
      break
  }
}

// ─── Patch Execution ────────────────────────────────────────────────

function executePatch(patch: MarkdownPatch): void {
  switch (patch.type) {
    case 'replace_selection': {
      dispatch('editor:replace-selection', patch.newText)
      break
    }
    case 'insert_at_cursor': {
      dispatch('editor:insert', patch.text)
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
