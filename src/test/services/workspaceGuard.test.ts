/**
 * Tests for workspaceGuard.assertInsideWorkspace
 */

import { describe, it, expect, beforeEach } from 'vitest'
import {
  assertInsideWorkspace,
  WorkspaceBoundaryError,
  toWorkspaceRelative,
} from '../../services/ai/agent/tools/workspaceGuard'
import { useWorkspaceStore } from '../../stores/useWorkspaceStore'

function setWorkspace(path: string | null) {
  useWorkspaceStore.setState({ folderPath: path })
}

describe('workspaceGuard.assertInsideWorkspace', () => {
  beforeEach(() => {
    setWorkspace('/Users/test/workspace')
  })

  it('accepts an absolute path inside workspace', () => {
    const result = assertInsideWorkspace('/Users/test/workspace/foo.md')
    expect(result).toBe('/Users/test/workspace/foo.md')
  })

  it('accepts a nested absolute path inside workspace', () => {
    const result = assertInsideWorkspace('/Users/test/workspace/notes/sub/a.md')
    expect(result).toBe('/Users/test/workspace/notes/sub/a.md')
  })

  it('accepts a relative path and joins to workspace root', () => {
    const result = assertInsideWorkspace('notes/foo.md')
    expect(result).toBe('/Users/test/workspace/notes/foo.md')
  })

  it('accepts dot-prefixed relative path', () => {
    const result = assertInsideWorkspace('./notes/foo.md')
    expect(result).toBe('/Users/test/workspace/notes/foo.md')
  })

  it('rejects path traversal payload ../../etc/passwd', () => {
    expect(() => assertInsideWorkspace('../../etc/passwd')).toThrow(
      WorkspaceBoundaryError,
    )
  })

  it('rejects ./..//.. variants', () => {
    expect(() => assertInsideWorkspace('./..//../')).toThrow(WorkspaceBoundaryError)
  })

  it('rejects an absolute path outside workspace', () => {
    expect(() => assertInsideWorkspace('/etc/passwd')).toThrow(
      WorkspaceBoundaryError,
    )
  })

  it('rejects a sibling directory by prefix-attack', () => {
    // /Users/test/workspace2 starts with /Users/test/workspace but is NOT inside it
    expect(() => assertInsideWorkspace('/Users/test/workspace2/foo.md')).toThrow(
      WorkspaceBoundaryError,
    )
  })

  it('rejects empty string', () => {
    expect(() => assertInsideWorkspace('')).toThrow(WorkspaceBoundaryError)
  })

  it('throws when workspace not opened', () => {
    setWorkspace(null)
    expect(() => assertInsideWorkspace('foo.md')).toThrow(/未打开工作区/)
  })

  it('toWorkspaceRelative strips workspace prefix', () => {
    const rel = toWorkspaceRelative('/Users/test/workspace/notes/foo.md')
    expect(rel).toBe('notes/foo.md')
  })

  it('toWorkspaceRelative returns input unchanged when outside workspace', () => {
    const rel = toWorkspaceRelative('/etc/passwd')
    expect(rel).toBe('/etc/passwd')
  })
})
