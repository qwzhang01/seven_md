/**
 * markdownTools 单元测试
 * 验证 generate_toc / format_markdown_table 在脱机环境下生成正确的 patch
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { generateTocTool, formatMarkdownTableTool } from './markdownTools'
import { useFileStore } from '../../../../stores/useFileStore'
import { useEditorStore } from '../../../../stores/useEditorStore'

describe('markdownTools', () => {
  beforeEach(() => {
    // 准备一个内存文档
    useFileStore.setState({
      tabs: [
        {
          id: 't1',
          path: '/tmp/test.md',
          name: 'test.md',
          content: '# Title\n\n## Section A\n\nbody\n\n## Section B\n',
          isDirty: false,
        } as never,
      ],
      activeTabId: 't1',
    })

    useEditorStore.setState({
      cursorPosition: { line: 1, column: 1 },
      selection: { from: 0, to: 0 },
    } as never)
  })

  it('generate_toc returns insert_at_cursor patch with bullet TOC', async () => {
    const result = await generateTocTool.execute('call-1', {} as never, undefined as never, vi.fn() as never)
    const details = (result as { details: Record<string, unknown> }).details
    expect(details.type).toBe('insert_at_cursor')
    expect(typeof details.text).toBe('string')
    expect(details.text as string).toContain('Title')
    expect(details.text as string).toContain('Section A')
    expect(details.text as string).toContain('Section B')
    expect(details.text as string).toContain('- [Title]')
  })

  it('generate_toc errors when document has no headings', async () => {
    useFileStore.setState({
      tabs: [{ id: 't2', path: '/tmp/empty.md', name: 'empty.md', content: 'plain text', isDirty: false } as never],
      activeTabId: 't2',
    })
    const result = await generateTocTool.execute('call-2', {} as never, undefined as never, vi.fn() as never)
    expect((result as { details: Record<string, unknown> }).details.error).toContain('没有可用标题')
  })

  it('format_markdown_table aligns columns', async () => {
    const tableText = '| name | age |\n|---|---|\n| Alice | 1 |\n| Bob | 200 |'
    const result = await formatMarkdownTableTool.execute(
      'call-3',
      { tableText } as never,
      undefined as never,
      vi.fn() as never,
    )
    const details = (result as { details: Record<string, unknown> }).details
    expect(details.type).toBe('replace_selection')
    expect(typeof details.newText).toBe('string')
    // 两个数据行的列宽应一致
    const lines = (details.newText as string).split('\n')
    expect(lines.length).toBe(4)
    // 表头列与数据列宽度相等（都以 | 开头/结尾）
    const widths = lines.map((l) => l.length)
    expect(widths[0]).toBe(widths[2])
    expect(widths[0]).toBe(widths[3])
  })

  it('format_markdown_table rejects invalid input', async () => {
    const result = await formatMarkdownTableTool.execute(
      'call-4',
      { tableText: 'not a table' } as never,
      undefined as never,
      vi.fn() as never,
    )
    expect((result as { details: Record<string, unknown> }).details.error).toContain('不是有效的')
  })
})
