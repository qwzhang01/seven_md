/**
 * permissionModel 单元测试
 * 验证 default permission map / session override / clear
 */

import { describe, it, expect, beforeEach } from 'vitest'
import {
  getEffectivePermission,
  setSessionPermissionOverride,
  clearSessionOverrides,
  _resetAllOverridesForTest,
} from './permissionModel'
// 触发工具注册（默认权限来源）
import './tools'

describe('permissionModel.getEffectivePermission — defaults', () => {
  beforeEach(() => {
    _resetAllOverridesForTest()
  })

  it('returns auto for read-only editor tools', () => {
    expect(getEffectivePermission('get_current_document', 'sess')).toBe('auto')
    expect(getEffectivePermission('get_selection', 'sess')).toBe('auto')
  })

  it('returns auto for safe workspace tools', () => {
    expect(getEffectivePermission('search_workspace', 'sess')).toBe('auto')
    expect(getEffectivePermission('list_workspace_files', 'sess')).toBe('auto')
  })

  it('returns confirm for write tools', () => {
    expect(getEffectivePermission('replace_selection', 'sess')).toBe('confirm')
    expect(getEffectivePermission('create_markdown_file', 'sess')).toBe('confirm')
    expect(getEffectivePermission('generate_mermaid', 'sess')).toBe('confirm')
  })

  it('returns auto fallback for unknown tools', () => {
    expect(getEffectivePermission('totally_unknown_tool', 'sess')).toBe('auto')
  })
})

describe('permissionModel session overrides', () => {
  beforeEach(() => {
    _resetAllOverridesForTest()
  })

  it('default permission applies when no override', () => {
    expect(getEffectivePermission('replace_selection', 's1')).toBe('confirm')
  })

  it('session override takes precedence', () => {
    setSessionPermissionOverride('s1', 'replace_selection', 'auto')
    expect(getEffectivePermission('replace_selection', 's1')).toBe('auto')
    // 其他 session 不受影响
    expect(getEffectivePermission('replace_selection', 's2')).toBe('confirm')
  })

  it('clearSessionOverrides removes overrides for one session only', () => {
    setSessionPermissionOverride('s1', 'replace_selection', 'auto')
    setSessionPermissionOverride('s2', 'replace_selection', 'deny')
    clearSessionOverrides('s1')
    expect(getEffectivePermission('replace_selection', 's1')).toBe('confirm')
    expect(getEffectivePermission('replace_selection', 's2')).toBe('deny')
  })

  it('overrides can deny a tool', () => {
    setSessionPermissionOverride('s1', 'get_selection', 'deny')
    expect(getEffectivePermission('get_selection', 's1')).toBe('deny')
  })
})
