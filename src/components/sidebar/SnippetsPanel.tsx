import { useState, useCallback, useMemo } from 'react'
import { Table, FileCode, ListChecks, StickyNote, Image, Footprints, ChevronDown, ChevronRight, Plus } from 'lucide-react'
import { useNotificationStore } from '../../stores'
import type { ReactNode } from 'react'

interface SnippetItem {
  id: string
  name: string
  preview: string
  template: string
  icon: ReactNode
  category: string
}

const SNIPPETS: SnippetItem[] = [
  {
    id: 'table',
    name: 'Markdown 表格',
    preview: '| 列1 | 列2 | 列3 |\n| --- | --- | --- |',
    template: '| 列1 | 列2 | 列3 |\n| --- | --- | --- |\n| 内容 | 内容 | 内容 |',
    icon: <Table size={14} />,
    category: '基础格式',
  },
  {
    id: 'codeblock',
    name: '代码块',
    preview: '```语言\n// 代码\n```',
    template: '```javascript\n// 代码\n```',
    icon: <FileCode size={14} />,
    category: '基础格式',
  },
  {
    id: 'tasklist',
    name: '任务列表',
    preview: '- [x] 已完成\n- [ ] 未完成',
    template: '- [x] 已完成\n- [ ] 未完成',
    icon: <ListChecks size={14} />,
    category: '基础格式',
  },
  {
    id: 'note',
    name: '注释框',
    preview: '> 📌 **注意**: ...',
    template: '> 📌 **注意**: 此处需要特别注意',
    icon: <StickyNote size={14} />,
    category: '基础格式',
  },
  {
    id: 'image',
    name: '图片',
    preview: '![描述](url)',
    template: '![描述](url)',
    icon: <Image size={14} />,
    category: '高级模板',
  },
  {
    id: 'footnote',
    name: '脚注',
    preview: '[^1] 脚注内容',
    template: '[^1] 脚注内容\n\n[^1]: 完整的脚注说明写在这里',
    icon: <Footprints size={14} />,
    category: '高级模板',
  },
  {
    id: 'details',
    name: '折叠区块',
    preview: '<details>...</details>',
    template: '<details>\n<summary>点击展开</summary>\n\n这里是折叠的内容\n\n</details>',
    icon: <ChevronDown size={14} />,
    category: '高级模板',
  },
  {
    id: 'mermaid',
    name: 'Mermaid 流程图',
    preview: '```mermaid\ngraph TD\n  A --> B',
    template: '```mermaid\ngraph TD\n    A[开始] --> B{判断}\n    B -->|是| C[处理]\n    B -->|否| D[结束]\n    C --> D\n```',
    icon: <FileCode size={14} />,
    category: '高级模板',
  },
  {
    id: 'apidoc',
    name: 'API 文档',
    preview: '## GET /api/xxx\n### 请求\n### 响应',
    template: '## GET /api/endpoint\n\n### 请求\n\n| 参数 | 类型 | 必填 | 说明 |\n|------|------|------|------|\n| id | string | 是 | 唯一标识 |\n\n### 响应\n\n```json\n{\n  "code": 200,\n  "message": "success",\n  "data": {}\n}\n```\n\n### 错误码\n\n| 错误码 | 说明 |\n|--------|------|\n| 400 | 参数错误 |\n| 404 | 资源不存在 |',
    icon: <FileCode size={14} />,
    category: '高级模板',
  },
  {
    id: 'prdtpl',
    name: 'PRD 需求模板',
    preview: '## 需求背景\n## 目标\n## 功能描述',
    template: '## 需求背景\n\n描述需求的来源和背景。\n\n## 目标\n\n- 目标1\n- 目标2\n\n## 功能描述\n\n### 功能点1\n\n**用户故事**: 作为xxx，我希望xxx，以便xxx。\n\n**验收标准**:\n1. 条件1\n2. 条件2',
    icon: <FileCode size={14} />,
    category: 'Spec 模板',
  },
  {
    id: 'readmetpl',
    name: 'README 模板',
    preview: '# 项目名称\n## 简介\n## 安装',
    template: '# 项目名称\n\n> 一句话描述项目\n\n## 简介\n\n项目的详细描述。\n\n## 安装\n\n```bash\nnpm install project-name\n```\n\n## 使用\n\n```javascript\nimport project from \'project-name\'\n```',
    icon: <FileCode size={14} />,
    category: 'Spec 模板',
  },
]

const CATEGORIES = ['基础格式', '高级模板', 'Spec 模板']

export function SnippetsPanel() {
  const [filter, setFilter] = useState('')
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set())
  const { addNotification } = useNotificationStore()

  const filteredSnippets = useMemo(() => {
    if (!filter) return SNIPPETS
    const q = filter.toLowerCase()
    return SNIPPETS.filter(
      (s) => s.name.toLowerCase().includes(q) || s.preview.toLowerCase().includes(q)
    )
  }, [filter])

  const handleInsert = useCallback(
    (snippet: SnippetItem) => {
      window.dispatchEvent(new CustomEvent('editor:insert', { detail: '\n' + snippet.template + '\n' }))
      addNotification({
        type: 'success',
        message: `片段 "${snippet.name}" 已插入`,
        autoClose: true,
        duration: 2000,
      })
    },
    [addNotification]
  )

  const toggleCategory = (cat: string) => {
    setCollapsedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(cat)) next.delete(cat)
      else next.add(cat)
      return next
    })
  }

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ background: 'var(--bg-secondary)' }}>
      {/* Filter input */}
      <div
        className="px-3 py-2"
        style={{ borderBottom: '1px solid var(--border-primary)' }}
      >
        <input
          className="w-full text-xs outline-none px-2 py-1 rounded border"
          style={{
            color: 'var(--text-primary)',
            borderColor: 'var(--border-primary)',
            background: 'var(--bg-input, var(--bg-primary))',
          }}
          placeholder="搜索片段..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>

      {/* Snippets list */}
      <div className="flex-1 overflow-y-auto">
        {filter ? (
          // Flat search results
          filteredSnippets.length === 0 ? (
            <div className="py-10 text-center text-xs" style={{ color: 'var(--text-tertiary)' }}>
              未找到匹配的片段
            </div>
          ) : (
            filteredSnippets.map((snippet) => (
              <SnippetRow key={snippet.id} snippet={snippet} onInsert={handleInsert} />
            ))
          )
        ) : (
          // Grouped by category
          CATEGORIES.map((cat) => {
            const items = SNIPPETS.filter((s) => s.category === cat)
            const collapsed = collapsedCategories.has(cat)
            return (
              <div key={cat}>
                {/* Category header */}
                <div
                  className="flex items-center gap-1 px-3 py-1.5 cursor-pointer font-semibold uppercase tracking-wide"
                  style={{
                    fontSize: 11,
                    color: 'var(--text-secondary)',
                    letterSpacing: '0.5px',
                  }}
                  onClick={() => toggleCategory(cat)}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <span style={{ fontSize: 10 }}>
                    {collapsed ? <ChevronRight size={10} /> : <ChevronDown size={10} />}
                  </span>
                  {cat}
                </div>
                {!collapsed && items.map((snippet) => (
                  <SnippetRow key={snippet.id} snippet={snippet} onInsert={handleInsert} />
                ))}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

function SnippetRow({ snippet, onInsert }: { snippet: SnippetItem; onInsert: (s: SnippetItem) => void }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      className="flex items-start gap-2 px-3 py-2 cursor-pointer group"
      style={{ background: hovered ? 'var(--bg-hover)' : 'transparent' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onInsert(snippet)}
    >
      {/* Icon */}
      <div
        className="flex items-center justify-center flex-shrink-0 rounded"
        style={{
          width: 28,
          height: 28,
          marginTop: 2,
          background: hovered ? 'var(--accent)' : 'var(--bg-active)',
          color: hovered ? '#fff' : 'var(--accent)',
          transition: 'all 0.1s ease',
        }}
      >
        {snippet.icon}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)', marginBottom: 2 }}>
          {snippet.name}
        </div>
        <div
          className="text-xs whitespace-pre-wrap break-all leading-relaxed"
          style={{
            color: 'var(--text-tertiary)',
            fontFamily: 'var(--font-mono, monospace)',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical' as const,
            overflow: 'hidden',
          }}
        >
          {snippet.preview}
        </div>
      </div>

      {/* Insert button */}
      <button
        className="flex-shrink-0 flex items-center justify-center rounded transition-all mt-1"
        style={{
          width: 26,
          height: 26,
          opacity: hovered ? 1 : 0,
          background: hovered ? 'var(--accent)' : 'transparent',
          color: '#fff',
          border: 'none',
        }}
        onClick={(e) => { e.stopPropagation(); onInsert(snippet) }}
        title="插入"
      >
        <Plus size={14} />
      </button>
    </div>
  )
}
