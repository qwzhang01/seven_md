/**
 * useAgentStore 多会话与模型切换测试
 * 仅覆盖纯状态层（不实际启动 Agent）
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'

// 在 import store 前 mock：避免实际 createMarkdownAgent 触发 ai 配置校验
vi.mock('../../services/ai/agent/markdownAgent', () => ({
  createMarkdownAgent: vi.fn(() => ({
    state: { messages: [] },
    prompt: vi.fn(),
    abort: vi.fn(),
    subscribe: vi.fn(() => () => {}),
  })),
  setActiveModelProvider: vi.fn(),
}))

vi.mock('../../services/ai/agent/eventMapper', () => ({
  mapPiEvent: vi.fn(() => null),
  resetEventMapper: vi.fn(),
}))

vi.mock('../../services/ai/agent/toolRegistry', () => ({
  setConfirmationHandler: vi.fn(),
  setActiveSessionProvider: vi.fn(),
}))

vi.mock('../../services/ai/agent/permissionModel', () => ({
  clearSessionOverrides: vi.fn(),
}))

import { useAgentStore } from '../../stores/useAgentStore'

describe('useAgentStore — 多会话', () => {
  beforeEach(() => {
    // 重置到一个干净的 default session
    const state = useAgentStore.getState()
    const defaultId = Object.keys(state.sessions)[0]
    useAgentStore.setState({
      sessions: { [defaultId]: state.sessions[defaultId] },
      activeSessionId: defaultId,
    })
    // 同步计算字段
    useAgentStore.getState().setActiveSession(defaultId)
  })

  it('default session is auto-bootstrapped', () => {
    const state = useAgentStore.getState()
    expect(Object.keys(state.sessions).length).toBeGreaterThanOrEqual(1)
    expect(state.activeSessionId).toBeTruthy()
    expect(state.sessions[state.activeSessionId]).toBeDefined()
  })

  it('createSession creates and activates a new session', () => {
    const before = Object.keys(useAgentStore.getState().sessions).length
    const id = useAgentStore.getState().createSession('My new session')
    const after = useAgentStore.getState()
    expect(Object.keys(after.sessions).length).toBe(before + 1)
    expect(after.activeSessionId).toBe(id)
    expect(after.sessions[id].title).toBe('My new session')
  })

  it('setActiveSession switches active', () => {
    const newId = useAgentStore.getState().createSession()
    const firstId = Object.keys(useAgentStore.getState().sessions).find((k) => k !== newId)!
    useAgentStore.getState().setActiveSession(firstId)
    expect(useAgentStore.getState().activeSessionId).toBe(firstId)
  })

  it('setActiveSession ignores unknown id', () => {
    const before = useAgentStore.getState().activeSessionId
    useAgentStore.getState().setActiveSession('does-not-exist')
    expect(useAgentStore.getState().activeSessionId).toBe(before)
  })

  it('deleteSession removes and falls back to remaining session', () => {
    const newId = useAgentStore.getState().createSession()
    expect(useAgentStore.getState().activeSessionId).toBe(newId)
    useAgentStore.getState().deleteSession(newId)
    const after = useAgentStore.getState()
    expect(after.sessions[newId]).toBeUndefined()
    expect(after.activeSessionId).not.toBe(newId)
  })

  it('deleteSession on last remaining session auto-creates a fresh one', () => {
    const id = useAgentStore.getState().activeSessionId
    useAgentStore.getState().deleteSession(id)
    const after = useAgentStore.getState()
    expect(Object.keys(after.sessions).length).toBe(1)
    expect(after.sessions[id]).toBeUndefined()
  })
})

describe('useAgentStore — 模型切换', () => {
  it('setActiveModel updates state and persists to localStorage', () => {
    useAgentStore.getState().setActiveModel('gpt-4o-mini')
    expect(useAgentStore.getState().activeModelId).toBe('gpt-4o-mini')
    expect(localStorage.getItem('seven-markdown-agent-active-model')).toBe('gpt-4o-mini')
  })

  it('new sessions inherit current activeModelId', () => {
    useAgentStore.getState().setActiveModel('claude-3-5-sonnet-20241022')
    const id = useAgentStore.getState().createSession('with-claude')
    expect(useAgentStore.getState().sessions[id].modelId).toBe('claude-3-5-sonnet-20241022')
  })
})

describe('useAgentStore — 确认机制', () => {
  it('approveConfirmation / rejectConfirmation are functions', () => {
    expect(typeof useAgentStore.getState().approveConfirmation).toBe('function')
    expect(typeof useAgentStore.getState().rejectConfirmation).toBe('function')
  })
})
