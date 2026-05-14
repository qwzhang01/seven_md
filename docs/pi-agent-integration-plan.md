# Seven Markdown × Pi Agent 集成方案

> **Write Markdown Like Code — with an AI Agent that understands your documents.**

---

## 1. 项目背景

### 1.1 Seven Markdown 现状

Seven Markdown 是一个基于 Tauri 2 + React + TypeScript + CodeMirror 6 的桌面 Markdown 编辑器，定位为"Markdown IDE"。

**已具备的能力：**

| 层级 | 能力 | 技术实现 |
|---|---|---|
| 编辑器 | CodeMirror 6 全功能编辑 | `EditorPaneV2.tsx`，支持主题、语法高亮、列表续行 |
| 预览 | 实时 Markdown 预览 | `PreviewPaneV2.tsx`，react-markdown + remark/rehype |
| 文件系统 | 读写/创建/删除/搜索 | Tauri commands (`commands.rs`) |
| AI 基础 | 对话/改写/翻译/解释 | `aiService.ts` + AI Panel（4 个 Tab） |
| 状态管理 | Zustand 多 Store 架构 | useFileStore / useEditorStore / useAIStore / useUIStore / useWorkspaceStore |
| 事件系统 | 自定义事件总线 | `editor:insert` / `editor:replace-selection` / `editor:find-*` 等 |
| 工作区 | 文件树/搜索/Git 分支 | useWorkspaceStore + Tauri 文件系统命令 |

**当前 AI 能力的局限：**

- 仅支持单轮 OpenAI-compatible API 调用，没有 streaming；
- 没有 Tool Calling / Function Calling 能力；
- Agent 不能感知编辑器上下文（文档结构、文件路径、工作区）；
- AI 改写/翻译只能作用于选区，不能跨段/跨文件；
- 没有 diff preview 和确认机制；
- 品牌名称仍残留 "MD Mate"（应统一为 "Seven Markdown"）。

### 1.2 Pi 是什么

[earendil-works/pi](https://github.com/earendil-works/pi) 是一个开源的 AI Agent 框架，采用 Monorepo 结构，核心包括：

| 包名 | 职责 |
|---|---|
| `@aspect-build/pi-ai` | 多模型 LLM 调用层（支持 OpenAI / Anthropic / 自定义） |
| `@aspect-build/pi-agent-core` | Agent 运行时：状态机、Tool Calling、上下文管理 |
| `@aspect-build/pi-web-ui` | AI Chat Web UI 组件 |
| `@aspect-build/pi-coding-agent` | 面向编码场景的 CLI Agent |
| `@aspect-build/pi-tui` | 终端 UI |

### 1.3 集成目标

> **Seven Markdown 继续负责 Markdown 编辑体验；Pi 负责 Agent 大脑；中间通过 Markdown Tool Registry 连接，让 Agent 可以安全地读文档、生成 patch、预览修改、确认后应用。**

最终形态：

```
Seven Markdown = Markdown IDE + Writing Agent Runtime
```

---

## 2. 架构设计

### 2.1 整体架构

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Seven Markdown App                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────────┐    ┌──────────────────────────────────────┐   │
│  │   Agent Panel     │    │         Editor Pane (CodeMirror 6)   │   │
│  │                   │    │                                      │   │
│  │  - 用户输入       │    │  - 文档编辑                          │   │
│  │  - 计划展示       │    │  - 选区同步                          │   │
│  │  - Tool Call 日志 │    │  - Diff Preview                     │   │
│  │  - Diff Preview   │◄──►│  - Apply/Reject                     │   │
│  │  - 应用/拒绝按钮  │    │                                      │   │
│  └────────┬─────────┘    └────────────────┬─────────────────────┘   │
│           │                                │                         │
│  ┌────────▼────────────────────────────────▼─────────────────────┐   │
│  │              Markdown Agent Runtime                            │   │
│  │                                                                │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐ │   │
│  │  │ Agent Core   │  │ LLM Provider │  │ Markdown Tool        │ │   │
│  │  │ (pi-agent    │  │ Layer        │  │ Registry             │ │   │
│  │  │  -core 或    │  │              │  │                      │ │   │
│  │  │  自研轻量)   │  │ - pi-ai      │  │ - Editor Tools       │ │   │
│  │  │              │  │ - OpenAI     │  │ - File Tools         │ │   │
│  │  │ - 状态机     │  │   compatible │  │ - Markdown Tools     │ │   │
│  │  │ - Tool Call  │  │   fallback   │  │ - Workspace Tools    │ │   │
│  │  │ - 上下文管理 │  │              │  │                      │ │   │
│  │  └──────────────┘  └──────────────┘  └──────────────────────┘ │   │
│  └────────────────────────────────────────────────────────────────┘   │
│                                │                                      │
│  ┌─────────────────────────────▼──────────────────────────────────┐   │
│  │                    Zustand Stores                               │   │
│  │  useFileStore │ useEditorStore │ useAIStore │ useWorkspaceStore │   │
│  └────────────────────────────────────────────────────────────────┘   │
│                                │                                      │
│  ┌─────────────────────────────▼──────────────────────────────────┐   │
│  │                    Tauri Commands (Rust)                        │   │
│  │  read_file │ save_file │ search_in_files │ create_file │ ...   │   │
│  └────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

### 2.2 核心设计原则

1. **Pi 不直接操作 CodeMirror** — 所有编辑动作通过 Editor Tool Adapter 中转
2. **所有修改先预览后应用** — Agent 生成 patch → UI 展示 diff → 用户确认 → 应用
3. **Provider 可替换** — 定义统一 Agent 接口，Pi 只是实现之一
4. **工具权限分级** — 低风险工具自动执行，高风险工具需要用户确认
5. **向后兼容** — 现有对话/改写/翻译/解释功能保持不变
6. **品牌统一** — 所有代码和提示词中统一使用 "Seven Markdown"

### 2.3 Agent 接口抽象

```typescript
// src/services/ai/types.ts

/** Agent 输入上下文 */
interface AgentInput {
  userMessage: string
  context: {
    currentDocument?: { content: string; path: string; title: string }
    selection?: { text: string; from: number; to: number }
    cursorPosition?: { line: number; column: number }
    outline?: HeadingNode[]
    workspacePath?: string
  }
  history?: AgentMessage[]
}

/** Agent 输出结果 */
interface AgentResult {
  status: 'success' | 'error' | 'cancelled'
  message: string
  toolCalls?: ToolCallRecord[]
  patches?: MarkdownPatch[]
}

/** 统一 Agent 接口 */
interface MarkdownAgent {
  run(input: AgentInput): AsyncGenerator<AgentEvent>
  cancel(taskId: string): Promise<void>
}

/** Agent 事件流 */
type AgentEvent =
  | { type: 'thinking'; content: string }
  | { type: 'plan'; steps: string[] }
  | { type: 'tool_call'; name: string; args: Record<string, unknown> }
  | { type: 'tool_result'; name: string; result: unknown }
  | { type: 'patch'; patch: MarkdownPatch }
  | { type: 'message'; content: string }
  | { type: 'error'; error: string }
  | { type: 'done'; summary: string }
```

### 2.4 Markdown Patch 协议

```typescript
// src/services/ai/agent/patchProtocol.ts

type MarkdownPatch =
  | {
      type: 'replace_selection'
      from: number
      to: number
      newText: string
      description?: string
    }
  | {
      type: 'insert_at_cursor'
      position: number
      text: string
      description?: string
    }
  | {
      type: 'replace_document'
      newContent: string
      description?: string
    }
  | {
      type: 'insert_after_heading'
      headingLevel: number
      headingText: string
      content: string
      description?: string
    }
  | {
      type: 'append_section'
      content: string
      description?: string
    }
```

---

## 3. 文件结构规划

### 3.1 新增目录

```
src/
├── services/
│   └── ai/                          # ← 新增：AI 服务层重构
│       ├── index.ts                 # 统一入口
│       ├── types.ts                 # 类型定义
│       ├── providers/
│       │   ├── types.ts             # Provider 接口
│       │   ├── openaiCompatible.ts  # 现有 OpenAI 兼容实现（从 aiService.ts 迁移）
│       │   └── piProvider.ts        # Pi AI Provider
│       ├── agent/
│       │   ├── types.ts             # Agent 接口和事件类型
│       │   ├── markdownAgent.ts     # Markdown Writing Agent 实现
│       │   ├── toolRegistry.ts      # 工具注册表
│       │   ├── tools/
│       │   │   ├── editorTools.ts   # 编辑器工具（读取/替换/插入）
│       │   │   ├── fileTools.ts     # 文件工具（读取/搜索/创建）
│       │   │   ├── markdownTools.ts # Markdown 工具（提取标题/生成目录/格式化）
│       │   │   └── index.ts
│       │   ├── prompts.ts           # Agent 系统提示词
│       │   └── patchProtocol.ts     # Patch 协议定义
│       └── legacy.ts               # 旧 aiService.ts 的桥接层（过渡期）
│
├── stores/
│   └── useAgentStore.ts             # ← 新增：Agent 状态管理
│
├── components/
│   └── ai-panel/
│       ├── AgentMode.tsx            # ← 新增：Agent 模式 UI
│       ├── AgentToolCallLog.tsx     # ← 新增：Tool Call 日志
│       ├── DiffPreview.tsx          # ← 新增：Diff 预览组件
│       └── PatchActions.tsx         # ← 新增：应用/拒绝按钮
│
└── utils/
    └── markdownUtils.ts             # ← 新增：Markdown 解析工具函数
```

### 3.2 现有文件修改清单

| 文件 | 修改内容 |
|---|---|
| `src/services/aiService.ts` | 保留但标记 deprecated，所有调用逐步迁移到 `src/services/ai/` |
| `src/stores/useAIStore.ts` | 扩展 `AIMode` 类型，新增 `'agent'` 模式 |
| `src/components/ai-panel/AIPanel.tsx` | 新增 Agent Tab，引入 `AgentMode` 组件 |
| `src/components/editor-v2/EditorPaneV2.tsx` | 新增 `editor:preview-patch` / `editor:apply-patch` 事件处理 |

---

## 4. 品牌名称统一

### 4.1 需要修改的位置

在集成 Pi Agent 的同时，统一将所有 "MD Mate" 引用更正为 "Seven Markdown"：

| 文件 | 当前内容 | 修改为 |
|---|---|---|
| `src/services/aiService.ts` L12 | `const CONFIG_KEY = 'md-mate-ai-config'` | `const CONFIG_KEY = 'seven-markdown-ai-config'`（同时需要做数据迁移） |
| `src/services/aiService.ts` L91 | `'你是 MD Mate AI 助手...'` | `'你是 Seven Markdown AI 助手...'` |
| 所有 Agent 提示词 | — | 统一使用 "Seven Markdown" |

### 4.2 数据迁移策略

```typescript
// localStorage key 迁移
const OLD_KEY = 'md-mate-ai-config'
const NEW_KEY = 'seven-markdown-ai-config'

function migrateConfigKey(): void {
  const old = localStorage.getItem(OLD_KEY)
  if (old && !localStorage.getItem(NEW_KEY)) {
    localStorage.setItem(NEW_KEY, old)
    localStorage.removeItem(OLD_KEY)
  }
}
```

---

## 5. Agent 工具清单

### 5.1 Phase 1 — 编辑器工具（Editor Tools）

| 工具名 | 描述 | 参数 | 风险等级 | 需要确认 |
|---|---|---|---|---|
| `get_current_document` | 获取当前文档全文、路径、标题 | 无 | 🟢 低 | 否 |
| `get_selection` | 获取当前选区文本和范围 | 无 | 🟢 低 | 否 |
| `get_cursor_position` | 获取当前光标位置 | 无 | 🟢 低 | 否 |
| `extract_headings` | 提取 Markdown 标题大纲 | 无 | 🟢 低 | 否 |
| `replace_selection` | 替换当前选区 | `newText: string` | 🟡 中 | 是（diff） |
| `insert_at_cursor` | 在光标处插入内容 | `text: string` | 🟡 中 | 是（预览） |
| `replace_document` | 替换整个文档 | `newContent: string` | 🔴 高 | 是（full diff） |

### 5.2 Phase 2 — Markdown 工具（Markdown Tools）

| 工具名 | 描述 | 参数 | 风险等级 |
|---|---|---|---|
| `generate_toc` | 生成目录 | `maxDepth?: number` | 🟢 低 |
| `format_markdown_table` | 格式化 Markdown 表格 | `tableText: string` | 🟢 低 |
| `validate_markdown_links` | 检查链接有效性 | 无 | 🟢 低 |
| `generate_markdown_patch` | 生成结构化 patch | `changes: PatchChange[]` | 🟡 中 |

### 5.3 Phase 3 — 工作区工具（Workspace Tools）

| 工具名 | 描述 | 参数 | 风险等级 |
|---|---|---|---|
| `search_workspace` | 搜索工作区 Markdown 文件 | `query: string, type: 'filename' \| 'content'` | 🟢 低 |
| `read_workspace_file` | 读取工作区文件 | `path: string` | 🟡 中 |
| `create_markdown_file` | 创建新 Markdown 文档 | `path: string, content: string` | 🔴 高 |
| `list_workspace_files` | 列出工作区文件树 | 无 | 🟢 低 |

---

## 6. Agent 执行协议

### 6.1 三段式执行流程

```
用户输入
    │
    ▼
┌─────────────┐
│  1. Plan    │  Agent 分析任务，输出执行计划
│             │  UI 展示：「我准备做以下修改：...」
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  2. Preview │  Agent 生成结构化 Patch
│             │  UI 展示：Diff 预览（绿色新增 / 红色删除）
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  3. Apply   │  用户点击「应用修改」
│             │  通过 editor 事件应用到 CodeMirror
│             │  或「拒绝」放弃修改
└─────────────┘
```

### 6.2 权限模型

```typescript
type ToolPermission = 'auto' | 'confirm' | 'deny'

const DEFAULT_PERMISSIONS: Record<string, ToolPermission> = {
  // 只读工具 — 自动执行
  get_current_document: 'auto',
  get_selection: 'auto',
  get_cursor_position: 'auto',
  extract_headings: 'auto',
  generate_toc: 'auto',
  search_workspace: 'auto',
  list_workspace_files: 'auto',

  // 修改工具 — 需要确认
  replace_selection: 'confirm',
  insert_at_cursor: 'confirm',
  replace_document: 'confirm',
  read_workspace_file: 'confirm',

  // 高风险工具 — 需要确认
  create_markdown_file: 'confirm',
}
```

---

## 7. Pi 集成路线

### 7.1 集成策略：先轻后重

```
Phase 0: Pi 可行性验证
    │
    ▼
Phase 1: AI Provider 抽象 + 品牌统一
    │
    ▼
Phase 2: Editor Tool Adapter
    │
    ▼
Phase 3: Agent Panel UI
    │
    ▼
Phase 4: Markdown Agent + Tool Calling
    │
    ▼
Phase 5: 工作区 Agent
    │
    ▼
Phase 6: 高级 Agent 能力
```

### 7.2 Pi 包集成优先级

| 优先级 | Pi 包 | 用途 | 集成方式 |
|---|---|---|---|
| **P0** | `pi-ai` | 多模型 LLM 调用层 | 直接 npm 引入，作为新 Provider |
| **P1** | `pi-agent-core` | Agent 运行时 / Tool Calling | 评估后引入，或参考自研轻量版 |
| **P2** | `pi-web-ui` | Chat UI 组件 | 参考设计，不直接使用（Seven Markdown 有自己的 UI 风格） |
| **P3** | `pi-coding-agent` | 编码 Agent 参考 | 仅参考架构，不集成 |
| **P4** | `pi-tui` | 终端 UI | 不集成 |

### 7.3 环境兼容性关键点

Seven Markdown 前端跑在 Tauri WebView 中，不是标准 Node.js 环境。需要确认：

- [ ] `pi-ai` 是否可 browser bundle（不依赖 `fs`/`path`/`process`）
- [ ] `pi-agent-core` 是否依赖 Node-only API
- [ ] 是否支持 ESM + Vite 5 打包
- [ ] streaming 是否基于标准 Web Streams API
- [ ] 包体积是否可接受（Tauri app 对包大小敏感）

**兜底方案**：如果 Pi 包强依赖 Node，则：

- 方案 A：只使用 `pi-ai` 的 API 协议定义，自实现调用层
- 方案 B：将 Pi Agent 放入 Tauri Sidecar（Node.js 子进程）
- 方案 C：先完全自研轻量 Agent Runtime，后续 Pi 成熟后再切换

---

## 8. 开发阶段详细规划

### Phase 0：Pi 可行性 Spike

**OpenSpec 变更名**：`spike-pi-compatibility`

**目标**：验证 Pi 包能否在 Tauri WebView 前端直接使用

**任务清单**：

1. 将 Pi 代码拉入工作区（作为 local dependency 或 git submodule）
2. 尝试在 Vite 5 环境中 import `pi-ai`
3. 检查 `pi-ai` 的依赖树是否有 Node-only 模块
4. 尝试用 `pi-ai` 调用一个 LLM API
5. 检查 `pi-agent-core` 的 tool calling API 设计
6. 评估 `pi-agent-core` 在 WebView 中的可行性
7. 输出兼容性报告，决定集成路线

**产出**：
- `docs/pi-compatibility-report.md` — 兼容性评估报告
- 明确走"前端直接集成"还是"Sidecar"还是"参考自研"

**预估工期**：1-2 天

---

### Phase 1：AI Provider 抽象 + 品牌统一

**OpenSpec 变更名**：`refactor-ai-provider-layer`

**目标**：将现有 `aiService.ts` 重构为 Provider 架构，统一品牌名称

**任务清单**：

1. 创建 `src/services/ai/` 目录结构
2. 定义 Provider 接口（`AIProvider`）
3. 将现有 `aiService.ts` 的逻辑迁移为 `OpenAICompatibleProvider`
4. 创建 `PiProvider`（如果 Phase 0 验证通过）
5. 实现 Provider 工厂和配置管理
6. 统一品牌名称：所有 "MD Mate" → "Seven Markdown"
7. localStorage key 数据迁移
8. 保持现有 4 个 AI 功能（对话/改写/翻译/解释）完全不变
9. 在 `src/services/ai/legacy.ts` 中做桥接，确保旧调用方不受影响

**Provider 接口设计**：

```typescript
interface AIProvider {
  readonly name: string
  readonly id: string

  chat(messages: ChatMessage[], options?: ChatOptions): Promise<string>
  stream?(messages: ChatMessage[], options?: ChatOptions): AsyncGenerator<string>
  
  // Tool calling 支持（Agent 需要）
  chatWithTools?(
    messages: ChatMessage[],
    tools: ToolDefinition[],
    options?: ChatOptions
  ): Promise<ChatWithToolsResult>
}

interface AIProviderRegistry {
  register(provider: AIProvider): void
  get(id: string): AIProvider | undefined
  getDefault(): AIProvider
  setDefault(id: string): void
  list(): AIProvider[]
}
```

**品牌修改清单**：

| 文件 | 修改 |
|---|---|
| `src/services/aiService.ts` | CONFIG_KEY: `md-mate-ai-config` → `seven-markdown-ai-config`（加迁移逻辑） |
| `src/services/aiService.ts` | system prompt: `MD Mate AI 助手` → `Seven Markdown AI 助手` |
| 所有新建文件 | 统一使用 "Seven Markdown" |

**产出**：
- `src/services/ai/` 完整目录
- 现有 AI 功能不受影响
- 品牌名称统一

**预估工期**：2-3 天

---

### Phase 2：Editor Tool Adapter

**OpenSpec 变更名**：`editor-tool-adapter`

**目标**：封装编辑器状态和操作为 Agent 可调用的工具函数

**任务清单**：

1. 创建 `src/services/ai/agent/tools/editorTools.ts`
2. 实现 `get_current_document` — 从 `useFileStore` 和 `useEditorStore` 读取
3. 实现 `get_selection` — 从 `useAIStore.selectedText` 和 editor ref 读取
4. 实现 `get_cursor_position` — 从 `useEditorStore.cursorPosition` 读取
5. 实现 `extract_headings` — 解析当前文档的标题层级
6. 实现 `replace_selection` — 通过 `editor:replace-selection` 事件
7. 实现 `insert_at_cursor` — 通过 `editor:insert` 事件
8. 实现 `replace_document` — 直接更新 editor state
9. 创建 `src/services/ai/agent/toolRegistry.ts` — 统一注册和调用
10. 创建 `src/utils/markdownUtils.ts` — Markdown 解析辅助函数

**工具注册协议**：

```typescript
interface ToolDefinition {
  name: string
  description: string
  parameters: JSONSchema
  permission: 'auto' | 'confirm'
  execute: (args: Record<string, unknown>) => Promise<ToolResult>
}

interface ToolResult {
  success: boolean
  data?: unknown
  error?: string
}
```

**与现有事件系统的对接**：

| 工具 | 对接的现有机制 |
|---|---|
| `get_current_document` | `useFileStore.activeFile` + `useFileStore.openFiles` |
| `get_selection` | `useAIStore.selectedText` |
| `get_cursor_position` | `useEditorStore.cursorPosition` |
| `replace_selection` | `window.dispatchEvent('editor:replace-selection')` |
| `insert_at_cursor` | `window.dispatchEvent('editor:insert')` |

**产出**：
- 完整的 Editor Tool Adapter
- Markdown 解析工具函数
- 统一的工具注册表

**预估工期**：2-3 天

---

### Phase 3：Agent Panel UI

**OpenSpec 变更名**：`agent-panel-ui`

**目标**：在 AI Panel 中新增 Agent Tab，实现 Agent 交互 UI

**任务清单**：

1. 扩展 `useAIStore` — 新增 `'agent'` 模式和相关状态
2. 创建 `useAgentStore.ts` — Agent 专用状态管理
3. 修改 `AIPanel.tsx` — 新增第 5 个 Tab：`Agent`
4. 创建 `AgentMode.tsx` — Agent 模式主组件
5. 创建 `AgentToolCallLog.tsx` — Tool Call 执行日志
6. 创建 `DiffPreview.tsx` — Markdown diff 预览组件
7. 创建 `PatchActions.tsx` — 应用/拒绝/撤销按钮

**Agent Store 设计**：

```typescript
interface AgentState {
  // Agent 任务状态
  isRunning: boolean
  currentTaskId: string | null
  
  // 执行记录
  plan: string[] | null
  toolCalls: ToolCallRecord[]
  
  // Patch 预览
  pendingPatches: MarkdownPatch[]
  patchPreviewVisible: boolean
  
  // 对话历史
  agentMessages: AgentMessage[]
  
  // Actions
  startAgent: (input: string) => void
  cancelAgent: () => void
  applyPatch: (patchId: string) => void
  rejectPatch: (patchId: string) => void
  applyAllPatches: () => void
  rejectAllPatches: () => void
  clearHistory: () => void
}
```

**AI Panel Tab 扩展**：

```typescript
// AIPanel.tsx 修改
const TABS = [
  { id: 'chat' as const, label: '对话', icon: <MessageCircle size={14} /> },
  { id: 'rewrite' as const, label: '改写', icon: <Wand2 size={14} /> },
  { id: 'translate' as const, label: '翻译', icon: <Languages size={14} /> },
  { id: 'explain' as const, label: '解释', icon: <Lightbulb size={14} /> },
  { id: 'agent' as const, label: 'Agent', icon: <Bot size={14} /> },  // ← 新增
]
```

**AgentMode UI 组件结构**：

```
AgentMode
├── 上下文信息栏（当前文件、选区长度）
├── Agent 对话区
│   ├── 用户消息
│   ├── Agent 思考过程
│   ├── 执行计划
│   ├── Tool Call 日志
│   └── Agent 回复
├── Diff 预览区（可折叠）
│   ├── 修改前 / 修改后对比
│   └── 应用 / 拒绝按钮
├── 输入区
│   ├── 文本输入框
│   ├── 发送按钮
│   └── 停止按钮
└── 底部状态栏（Agent 状态、工具调用计数）
```

**产出**：
- Agent Tab 和完整 UI
- Agent Store
- Diff 预览组件

**预估工期**：3-4 天

---

### Phase 4：Markdown Agent + Tool Calling

**OpenSpec 变更名**：`markdown-agent-runtime`

**目标**：实现 Markdown Writing Agent 的核心运行时，连通 LLM Provider 和 Tool Registry

**任务清单**：

1. 创建 `src/services/ai/agent/markdownAgent.ts` — Agent 主体
2. 实现 Agent 执行循环：User → LLM → Tool Call → LLM → ... → Done
3. 实现 streaming 输出（如果 Provider 支持）
4. 设计 Agent 系统提示词 (`prompts.ts`)
5. 连接 Tool Registry — 注册 Phase 2 的编辑器工具
6. 实现 Patch 生成和预览流程
7. 实现 Plan → Preview → Apply 三段式协议
8. 添加超时和错误处理
9. 连通 AgentMode UI — 将 Agent 事件流渲染到界面

**Agent 系统提示词**：

```typescript
const MARKDOWN_AGENT_SYSTEM_PROMPT = `
你是 Seven Markdown Writing Agent。

你的职责是帮助用户编写、整理、改写和优化 Markdown 文档。

## 核心原则

1. **保持 Markdown 结构** — 你的输出必须是合法的 Markdown
2. **不要直接覆盖** — 所有修改必须通过工具生成 patch，等待用户确认
3. **先计划后执行** — 复杂任务先输出计划，再逐步执行
4. **最小修改原则** — 只修改必要的部分，保留用户的原有内容和风格
5. **保留特殊块** — Mermaid、代码块、数学公式等特殊内容块不要随意修改

## 可用工具

你可以使用以下工具来完成任务：
- get_current_document: 获取当前文档全文、路径
- get_selection: 获取用户选中的文本
- extract_headings: 提取文档标题大纲
- replace_selection: 替换选中的文本
- insert_at_cursor: 在光标处插入内容
- replace_document: 替换整个文档内容（慎用，仅在全文重构时使用）

## 输出格式

对于修改任务：
1. 先说明你准备做什么
2. 调用工具读取当前内容
3. 生成修改后的内容
4. 通过工具应用修改

对于信息查询任务：
- 直接用文字回答，不需要调用修改工具
`
```

**Agent 执行循环伪代码**：

```typescript
async function* runAgent(input: AgentInput): AsyncGenerator<AgentEvent> {
  const messages = buildMessages(input)
  const tools = toolRegistry.getToolDefinitions()
  
  yield { type: 'thinking', content: '正在分析任务...' }
  
  let maxIterations = 10 // 防止无限循环
  
  while (maxIterations-- > 0) {
    const response = await provider.chatWithTools(messages, tools)
    
    if (response.toolCalls && response.toolCalls.length > 0) {
      for (const toolCall of response.toolCalls) {
        yield { type: 'tool_call', name: toolCall.name, args: toolCall.args }
        
        const tool = toolRegistry.get(toolCall.name)
        if (tool.permission === 'confirm') {
          // 等待用户确认（通过 UI 交互）
        }
        
        const result = await tool.execute(toolCall.args)
        yield { type: 'tool_result', name: toolCall.name, result }
        
        messages.push(/* tool call + result messages */)
      }
    } else {
      // 没有更多 tool call，Agent 完成
      yield { type: 'message', content: response.content }
      yield { type: 'done', summary: '任务完成' }
      break
    }
  }
}
```

**产出**：
- 完整的 Markdown Agent Runtime
- Tool Calling 闭环
- Agent ↔ UI 连通
- Plan → Preview → Apply 流程

**预估工期**：4-5 天

---

### Phase 5：工作区 Agent

**OpenSpec 变更名**：`workspace-agent-tools`

**目标**：扩展 Agent 能力到工作区级别，支持跨文件操作

**任务清单**：

1. 创建 `src/services/ai/agent/tools/fileTools.ts`
2. 实现 `search_workspace` — 对接 `searchInFiles` Tauri 命令
3. 实现 `read_workspace_file` — 对接 `readFile` Tauri 命令
4. 实现 `create_markdown_file` — 对接 `createFile` Tauri 命令
5. 实现 `list_workspace_files` — 对接 `readDirectory` Tauri 命令
6. 扩展权限模型 — 工作区操作需要更严格的确认
7. Agent 提示词扩展 — 支持工作区上下文
8. 实现工作区上下文注入 — 自动向 Agent 提供当前工作区信息

**安全约束**：

- 默认只能读当前打开的文件；
- 跨文件读取需要用户逐次授权；
- 写文件/创建文件必须预览确认；
- 批量修改需要展示完整修改列表；
- 所有文件操作限制在当前工作区目录内（不允许访问工作区外路径）。

**产出**：
- 工作区级别的 Agent 工具
- 跨文件操作能力
- 权限控制和安全约束

**预估工期**：3-4 天

---

### Phase 6：高级 Agent 能力

**OpenSpec 变更名**：`advanced-agent-features`

**目标**：增强 Agent 体验，提升实用性

**任务清单**：

1. **Streaming 输出** — Agent 回复和 Tool Call 实时流式展示
2. **Markdown 专用工具扩展**
   - `generate_toc` — 自动生成目录
   - `format_markdown_table` — 格式化表格
   - `validate_markdown_links` — 检查链接
   - `generate_mermaid` — 生成 Mermaid 图表
3. **Agent 会话管理** — 历史记录、任务恢复
4. **快捷 Agent 命令** — 右键菜单/快捷键直接触发 Agent 任务
5. **Agent 预设模板** — 常见写作任务一键执行
6. **多模型切换** — 在 Agent 中动态选择不同 LLM

**Agent 预设模板示例**：

| 预设名 | 触发方式 | 功能 |
|---|---|---|
| 📝 整理文章结构 | 右键菜单 / 命令 | 分析并优化当前文档的标题层级和段落组织 |
| 📋 生成目录 | 右键菜单 / 命令 | 根据标题自动生成 TOC |
| ✍️ 扩写选区 | 选中文本后右键 | 对选中内容进行扩展和丰富 |
| 📊 草稿转正文 | 右键菜单 / 命令 | 将草稿整理为正式文章 |
| 🔗 检查链接 | 右键菜单 / 命令 | 检查文档中所有链接的有效性 |
| 📖 生成 README | 命令 | 根据项目文件生成 README |
| 🌍 多语言版本 | 命令 | 将当前文档翻译为多语言版本 |

**产出**：
- 增强的 Agent 能力
- Streaming 支持
- Markdown 专用工具
- 快捷命令和预设

**预估工期**：5-7 天

---

## 9. Agent 使用场景示例

### 场景 1：局部改写

```
用户：选中一段文字 → 打开 Agent Tab → 输入"改成技术博客风格"

Agent：
  [Plan] 我准备对选中的文字进行风格改写：
    1. 读取选中文本
    2. 改写为技术博客风格
    3. 展示修改对比

  [Tool Call] get_selection() → "这个功能很好用..."
  [Tool Call] replace_selection("这一特性在实际生产环境中...")

  [Diff Preview]
  - 这个功能很好用，可以帮助我们做很多事情。
  + 这一特性在实际生产环境中表现出色，能够显著提升团队的文档协作效率。

  [Actions] [✅ 应用修改] [❌ 拒绝]
```

### 场景 2：整篇文章结构优化

```
用户：打开 Agent Tab → 输入"帮我优化这篇文章的结构，加上目录和总结"

Agent：
  [Plan] 我准备对整篇文章进行结构优化：
    1. 读取全文，分析当前结构
    2. 优化标题层级
    3. 生成目录
    4. 添加总结段落
    5. 展示完整修改预览

  [Tool Call] get_current_document() → { content: "...", path: "/docs/guide.md" }
  [Tool Call] extract_headings() → [{ level: 1, text: "..." }, ...]

  [Thinking] 当前文章有 3 个一级标题，建议调整为 1 个一级标题 + 多个二级标题...

  [Tool Call] replace_document("# 完整指南\n\n## 目录\n\n...")

  [Full Diff Preview]
  (展示完整的前后对比)

  [Actions] [✅ 应用全部修改] [❌ 拒绝]
```

### 场景 3：基于工作区文件生成文档

```
用户：打开 Agent Tab → 输入"根据 docs/ 目录下的文档，生成一篇 Seven Markdown 的介绍文档"

Agent：
  [Plan] 我准备基于工作区文件生成介绍文档：
    1. 搜索 docs/ 目录的所有 Markdown 文件
    2. 读取关键文件的内容
    3. 提取核心信息
    4. 生成介绍文档
    5. 创建新文件展示

  [Tool Call] list_workspace_files() → [...]
  [Tool Call] read_workspace_file("docs/ARCHITECTURE.md") → "..."
  [Tool Call] read_workspace_file("docs/USER-GUIDE.md") → "..."

  [Tool Call] create_markdown_file("docs/introduction.md", "# Seven Markdown\n\n...")

  [Preview]
  将创建新文件: docs/introduction.md
  (展示文件内容预览)

  [Actions] [✅ 创建文件] [❌ 取消]
```

---

## 10. 风险与应对

### 10.1 技术风险

| 风险 | 影响 | 应对措施 |
|---|---|---|
| Pi 包无法在 WebView 运行 | P0 阻塞 | Phase 0 验证；兜底自研轻量 Agent Runtime |
| Agent 修改不可控 | 用户数据安全 | 三段式执行 + diff preview + 确认机制 |
| 现有 AI 功能被重构破坏 | 功能退化 | Provider 桥接层 + 渐进迁移 + 完整测试 |
| Markdown patch 不稳定 | 文档损坏 | 优先 replace_selection；全文修改用完整替换 + diff |
| Tool Calling 延迟高 | 用户体验差 | streaming 输出 + 进度提示 + 取消按钮 |

### 10.2 产品风险

| 风险 | 影响 | 应对措施 |
|---|---|---|
| Agent 功能过于复杂 | 用户不会用 | 提供预设模板；简单场景用快捷命令 |
| AI 功能喧宾夺主 | 偏离编辑器定位 | Agent 作为可选增强，不影响核心编辑体验 |
| API Key 安全 | 密钥泄漏 | 短期：localStorage；中期：迁移到 Tauri 安全存储 |

---

## 11. 技术债和后续规划

### 11.1 当前技术债（集成时一并处理）

- [ ] "MD Mate" 品牌名称残留
- [ ] `aiService.ts` 缺少 streaming 支持
- [ ] API Key 存储在 localStorage 不安全
- [ ] AI 面板没有错误恢复机制
- [ ] 没有 AI 调用的日志和监控

### 11.2 后续演进方向

```
近期 (Phase 0-4)          中期 (Phase 5-6)         远期
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

文档内 Agent              工作区 Agent              知识库 Agent
单文件读写                跨文件操作                RAG 检索增强
基础 Tool Calling         完整工具链                自定义工具
Diff Preview              Streaming                 协作编辑
OpenAI Compatible         多模型切换                本地模型
                          Sidecar 架构              插件系统
                          Agent 预设模板            多 Agent 协作
                          快捷键 Agent              Agent Marketplace
```

### 11.3 API Key 安全升级路线

```
Phase 1: localStorage (当前，MVP 可接受)
    ↓
Phase 4+: Tauri 安全存储 (正式版必须)
    ↓
    ├── macOS: Keychain Services (via tauri-plugin-keyring 或类似)
    ├── Windows: Credential Manager
    └── Linux: libsecret
```

---

## 12. OpenSpec 变更清单

以下是按开发顺序排列的所有 OpenSpec 变更：

| 序号 | OpenSpec 变更名 | Phase | 核心目标 | 预估工期 |
|---|---|---|---|---|
| 0 | `spike-pi-compatibility` | Phase 0 | Pi 包可行性验证 | 1-2 天 |
| 1 | `refactor-ai-provider-layer` | Phase 1 | AI Provider 抽象 + 品牌统一 | 2-3 天 |
| 2 | `editor-tool-adapter` | Phase 2 | 编辑器工具适配层 | 2-3 天 |
| 3 | `agent-panel-ui` | Phase 3 | Agent Panel UI | 3-4 天 |
| 4 | `markdown-agent-runtime` | Phase 4 | Markdown Agent 核心运行时 | 4-5 天 |
| 5 | `workspace-agent-tools` | Phase 5 | 工作区 Agent 工具 | 3-4 天 |
| 6 | `advanced-agent-features` | Phase 6 | 高级 Agent 能力 | 5-7 天 |

**总预估工期**：20-28 天（实际开发，不含设计评审时间）

---

## 13. 成功标准

### MVP 完成标准（Phase 0-4 完成后）

- [ ] Pi 可行性验证完成，明确集成路线
- [ ] AI Provider 层重构完成，现有功能不退化
- [ ] 品牌名称 "MD Mate" 全部更正为 "Seven Markdown"
- [ ] Agent Tab 在 AI Panel 中可用
- [ ] Agent 能读取当前文档、选区、标题大纲
- [ ] Agent 能执行替换选区、插入内容操作
- [ ] 所有修改有 diff preview
- [ ] 用户可以确认或拒绝修改
- [ ] Agent 有取消/停止按钮
- [ ] 至少支持一个 LLM Provider（OpenAI Compatible 或 Pi AI）

### 完整版标准（Phase 0-6 完成后）

- [ ] 支持工作区级别的 Agent 操作
- [ ] 支持 Streaming 输出
- [ ] 有 Agent 预设模板
- [ ] 有快捷键/右键菜单触发 Agent
- [ ] 支持多模型切换
- [ ] 所有工具有权限控制
- [ ] 有完整的错误处理和恢复机制

---

## 14. 参考资料

- [Seven Markdown 项目架构](./ARCHITECTURE.md)
- [earendil-works/pi GitHub](https://github.com/earendil-works/pi)
- [CodeMirror 6 文档](https://codemirror.net/docs/)
- [Tauri 2 文档](https://v2.tauri.app/)
- [OpenAI Function Calling](https://platform.openai.com/docs/guides/function-calling)
- [Vercel AI SDK](https://sdk.vercel.ai/) — Agent 模式参考
- [Cursor](https://cursor.sh/) — 编辑器 + AI Agent 产品参考

---

把 Pi 代码拉到工作区后，从 Phase 0 spike-pi-compatibility 开始，用 OpenSpec 的方式逐阶段推进。


> **本文档版本**：v1.0
> **最后更新**：2025-05-14
> **作者**：Seven Markdown Team
> **状态**：待评审
