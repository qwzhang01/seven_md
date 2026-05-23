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

[earendil-works/pi](https://github.com/earendil-works/pi) 是一个开源的 AI Agent 框架，采用 Monorepo 结构。

**实际包名和结构**（基于源码确认）：

| 包名 | npm 包名 | 职责 |
|---|---|---|
| `pi-ai` | `@earendil-works/pi-ai` | 多模型 LLM 调用层（OpenAI / Anthropic / Google / Bedrock / Mistral） |
| `pi-agent-core` | `@earendil-works/pi-agent-core` | Agent 运行时：Agent Loop、Tool Calling、Session 管理、上下文压缩 |
| `pi-coding-agent` | `@earendil-works/pi-coding-agent` | 面向编码场景的完整 Agent 应用（CLI + TUI） |
| `pi-tui` | `@earendil-works/pi-tui` | 终端 UI 框架 |

> **注意**：不存在 `pi-web-ui` 包。Pi 没有提供 Web UI 组件。

### 1.3 可行性验证结论（Phase 0 已完成）

通过源码分析确认：

| 评估项 | 结论 |
|---|---|
| `pi-ai` 在 Tauri WebView 可用？ | **可行**。官方有 `browser-smoke-entry.ts` 验证 |
| `pi-agent-core` 在 WebView 可用？ | **可行**。主入口不包含 Node-only 代码 |
| Node 依赖如何隔离？ | 运行时检测 `typeof process`；Node 环境通过子路径 `./node` 单独导出 |
| Streaming 兼容？ | 基于标准 `fetch` + `ReadableStream`，WebView 完全支持 |
| 集成方式？ | **源码级 vendor**（不走 npm），直接裁剪复制到项目中 |

**决定：前端直接集成，不用 Sidecar，不自研 Agent Runtime。直接使用 Pi 的 `Agent` 类 + `agentLoop()`。**

### 1.4 集成目标

> **Seven Markdown 继续负责 Markdown 编辑体验；Pi 负责 Agent 大脑；中间通过 Markdown Tool Registry 连接，让 Agent 可以安全地读文档、生成 patch、预览修改、确认后应用。**

最终形态：

```
Seven Markdown = Markdown IDE + Writing Agent Runtime (powered by Pi)
```

---

## 2. 源码迁移规划

### 2.1 迁移策略

**当前状态**：Pi 源码暂存于 `.ext/pi/`（临时过渡目录，后续删除）。

**目标**：将需要的代码裁剪后复制到 `src/lib/pi/` 作为项目自有模块，纳入版本管理。`.ext/` 目录完成迁移后删除。

**原则**：
1. **只迁移需要的文件** — 不搬运整个 monorepo
2. **删除不需要的 Provider** — 只保留 `openai-completions`（兼容所有 OpenAI API 格式的服务）
3. **删除 Node-only 代码** — `env-api-keys.ts`、`node-http-proxy.ts`、`harness/env/nodejs.ts` 等
4. **删除超大生成文件** — `models.generated.ts`（416KB）替换为轻量版
5. **保持内部 import 关系不变** — 方便后续同步上游更新（如需要）

### 2.2 目标目录结构

```
src/lib/pi/                              # Pi 源码 vendor（从 .ext/pi 迁移）
├── ai/                                  # 来自 packages/ai/src/
│   ├── index.ts                        # 裁剪后的公共导出
│   ├── types.ts                        # 核心类型（Model/Message/Context/Tool/Stream）
│   ├── stream.ts                       # complete/stream/streamSimple 统一入口
│   ├── api-registry.ts                 # Provider 注册表
│   ├── models.ts                       # 模型注册表（getModel/getModels）
│   ├── models-minimal.ts              # ★ 新建：只包含实际用到的模型定义（替代 416KB 的 generated）
│   ├── session-resources.ts            # Session 资源清理
│   ├── providers/
│   │   ├── openai-completions.ts      # ★ 唯一保留的 Provider（兼容所有 OpenAI 格式 API）
│   │   ├── transform-messages.ts      # 消息格式转换
│   │   └── simple-options.ts          # SimpleStreamOptions 处理
│   └── utils/
│       ├── event-stream.ts            # EventStream 基类
│       ├── json-parse.ts              # 流式 JSON 解析
│       ├── validation.ts              # 工具参数校验（TypeBox）
│       ├── overflow.ts                # 上下文溢出处理
│       ├── sanitize-unicode.ts        # Unicode 清理
│       └── typebox-helpers.ts         # TypeBox 工具
│
├── agent/                              # 来自 packages/agent/src/
│   ├── index.ts                       # 裁剪后的公共导出
│   ├── types.ts                       # Agent 类型（StreamFn/AgentTool/AgentEvent 等）
│   ├── agent.ts                       # Agent 类
│   ├── agent-loop.ts                  # Agent 消息循环（核心！）
│   ├── proxy.ts                       # 代理流函数（可选，用于中转场景）
│   └── harness/
│       ├── types.ts                   # Harness 类型
│       ├── agent-harness.ts           # AgentHarness 上层封装
│       ├── messages.ts                # 消息构造工具
│       ├── prompt-templates.ts        # Prompt 模板系统
│       ├── system-prompt.ts           # 系统提示词构建
│       ├── session/
│       │   ├── memory-repo.ts         # ★ 只保留内存存储（WebView 不需要 JSONL 文件存储）
│       │   ├── memory-storage.ts
│       │   ├── session.ts
│       │   └── uuid.ts
│       ├── compaction/
│       │   ├── compaction.ts          # 上下文压缩（重要！长对话必需）
│       │   ├── branch-summarization.ts
│       │   └── utils.ts
│       └── utils/
│           └── truncate.ts            # 文本截断工具
│
└── README.md                           # 说明迁移来源、版本、裁剪内容
```

### 2.3 迁移文件映射表

| 源文件 (.ext/pi/) | 目标文件 (src/lib/pi/) | 操作 |
|---|---|---|
| `packages/ai/src/types.ts` | `ai/types.ts` | 原样复制 |
| `packages/ai/src/stream.ts` | `ai/stream.ts` | 原样复制 |
| `packages/ai/src/api-registry.ts` | `ai/api-registry.ts` | 原样复制 |
| `packages/ai/src/models.ts` | `ai/models.ts` | 原样复制 |
| `packages/ai/src/models.generated.ts` | **删除** | 替换为 `models-minimal.ts` |
| `packages/ai/src/session-resources.ts` | `ai/session-resources.ts` | 原样复制 |
| `packages/ai/src/index.ts` | `ai/index.ts` | 裁剪导出 |
| `packages/ai/src/providers/openai-completions.ts` | `ai/providers/openai-completions.ts` | 裁剪 `process.env` 引用 |
| `packages/ai/src/providers/transform-messages.ts` | `ai/providers/transform-messages.ts` | 原样复制 |
| `packages/ai/src/providers/simple-options.ts` | `ai/providers/simple-options.ts` | 原样复制 |
| `packages/ai/src/utils/event-stream.ts` | `ai/utils/event-stream.ts` | 原样复制 |
| `packages/ai/src/utils/json-parse.ts` | `ai/utils/json-parse.ts` | 原样复制 |
| `packages/ai/src/utils/validation.ts` | `ai/utils/validation.ts` | 原样复制 |
| `packages/ai/src/utils/overflow.ts` | `ai/utils/overflow.ts` | 原样复制 |
| `packages/ai/src/utils/sanitize-unicode.ts` | `ai/utils/sanitize-unicode.ts` | 原样复制 |
| `packages/ai/src/utils/typebox-helpers.ts` | `ai/utils/typebox-helpers.ts` | 原样复制 |
| `packages/agent/src/types.ts` | `agent/types.ts` | 原样复制 |
| `packages/agent/src/agent.ts` | `agent/agent.ts` | 原样复制 |
| `packages/agent/src/agent-loop.ts` | `agent/agent-loop.ts` | 原样复制 |
| `packages/agent/src/proxy.ts` | `agent/proxy.ts` | 原样复制 |
| `packages/agent/src/index.ts` | `agent/index.ts` | 裁剪导出（去掉 node 导出） |
| `packages/agent/src/harness/*.ts` | `agent/harness/*.ts` | 选择性复制 |
| `packages/agent/src/harness/session/memory-*.ts` | `agent/harness/session/memory-*.ts` | 原样复制 |
| `packages/agent/src/harness/session/session.ts` | `agent/harness/session/session.ts` | 原样复制 |
| `packages/agent/src/harness/session/uuid.ts` | `agent/harness/session/uuid.ts` | 原样复制 |
| `packages/agent/src/harness/compaction/*.ts` | `agent/harness/compaction/*.ts` | 原样复制 |
| `packages/agent/src/harness/utils/truncate.ts` | `agent/harness/utils/truncate.ts` | 原样复制 |

### 2.4 明确不迁移的文件

| 文件/目录 | 原因 |
|---|---|
| `packages/ai/src/env-api-keys.ts` | 依赖 `node:fs`/`node:os`/`node:path`，WebView 不可用 |
| `packages/ai/src/utils/node-http-proxy.ts` | 依赖 `node:http`/`node:https` |
| `packages/ai/src/cli.ts` | CLI 工具，不需要 |
| `packages/ai/src/oauth.ts` + `utils/oauth/` | OAuth 流程，桌面 App 不需要 |
| `packages/ai/src/providers/anthropic.ts` | 不需要独立 Anthropic Provider（OpenAI 格式可代理） |
| `packages/ai/src/providers/amazon-bedrock.ts` | 不需要 |
| `packages/ai/src/providers/google*.ts` | 不需要 |
| `packages/ai/src/providers/mistral.ts` | 不需要 |
| `packages/ai/src/providers/azure-*.ts` | 不需要 |
| `packages/ai/src/providers/cloudflare.ts` | 不需要 |
| `packages/ai/src/providers/openai-codex-responses.ts` | Codex WebSocket，不需要 |
| `packages/ai/src/providers/openai-responses*.ts` | Responses API，暂不需要 |
| `packages/ai/src/providers/faux.ts` | 测试 mock，不需要 |
| `packages/ai/src/providers/register-builtins.ts` | 注册所有 Provider，不需要（我们手动注册） |
| `packages/ai/src/image-*.ts` + `providers/images/` | 图片生成，不需要 |
| `packages/ai/src/bedrock-provider.ts` | 不需要 |
| `packages/agent/src/node.ts` | Node.js 入口 |
| `packages/agent/src/harness/env/nodejs.ts` | Node 执行环境（spawn/fs 等） |
| `packages/agent/src/harness/session/jsonl-*.ts` | JSONL 文件存储，需要 `node:fs` |
| `packages/agent/src/harness/skills.ts` | Skill 加载器（依赖文件系统） |
| `packages/agent/src/harness/utils/shell-output.ts` | Shell 输出格式化，不需要 |
| `packages/coding-agent/` 整个包 | 编码 Agent 应用，仅参考不迁移 |
| `packages/tui/` 整个包 | 终端 UI，完全不需要 |

### 2.5 需要修改的文件（迁移时调整）

| 文件 | 修改内容 |
|---|---|
| `ai/index.ts` | 删除 image、oauth、bedrock 相关导出；删除 `register-builtins` 引用 |
| `ai/providers/openai-completions.ts` | 删除 `process.env.OPENAI_API_KEY` 兜底逻辑；API Key 改为必传参数 |
| `ai/models-minimal.ts` | 新建，只定义 `gpt-4o`/`gpt-4o-mini`/`claude-*` 等常用模型（<5KB） |
| `agent/index.ts` | 删除 `node` 子路径导出 |
| `agent/harness/agent-harness.ts` | 删除 `skills` 相关逻辑（或置空） |

### 2.6 依赖处理

Pi 源码依赖以下 npm 包，需添加到项目 `package.json`：

| 包名 | 版本 | 用途 | 大小(gzipped) |
|---|---|---|---|
| `openai` | `^6.26.0` | OpenAI SDK（仅 type 层面使用） | ~50KB |
| `@sinclair/typebox` | `^0.34.0` | JSON Schema 定义/校验 | ~15KB |
| `partial-json` | `^0.1.7` | 流式 JSON 不完整解析 | ~3KB |
| `yaml` | `^2.4.0` | YAML 解析（prompt template） | ~20KB |

**不需要安装的**（已通过只保留 openai-completions Provider 移除）：
- `@anthropic-ai/sdk`（~200KB）
- `@google/genai`（~100KB）
- `@aws-sdk/client-bedrock-runtime`（~300KB）
- `ignore`（文件 ignore 规则）

### 2.7 Vite 配置调整

```typescript
// vite.config.ts 新增
export default defineConfig({
  resolve: {
    alias: {
      '@pi/ai': path.resolve(__dirname, 'src/lib/pi/ai'),
      '@pi/agent': path.resolve(__dirname, 'src/lib/pi/agent'),
    },
  },
  define: {
    // 消除 process.env 引用
    'process.env': '{}',
  },
})
```

### 2.8 迁移执行清单

```
□ Step 1: 创建 src/lib/pi/ 目录结构
□ Step 2: 复制 ai/ 核心文件（types, stream, api-registry, models）
□ Step 3: 复制 ai/providers/openai-completions.ts 并裁剪
□ Step 4: 复制 ai/utils/ 工具文件
□ Step 5: 创建 ai/models-minimal.ts（替代 generated）
□ Step 6: 创建 ai/index.ts（裁剪版导出）
□ Step 7: 复制 agent/ 核心文件（types, agent, agent-loop）
□ Step 8: 复制 agent/harness/ 选择性文件
□ Step 9: 创建 agent/index.ts（裁剪版导出）
□ Step 10: 安装新增 npm 依赖
□ Step 11: 配置 Vite alias
□ Step 12: 验证编译通过
□ Step 13: 创建 src/lib/pi/README.md（记录来源版本和裁剪说明）
□ Step 14: 删除 .ext/pi/ 目录
□ Step 15: 更新 .gitignore（移除 .ext 相关规则）
```

---

## 3. 架构设计

### 3.1 整体架构（更新版）

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Seven Markdown App                           │
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
│  │           Seven Markdown Agent 服务层                          │   │
│  │                                                                │   │
│  │  ┌───────────────────┐  ┌──────────────────────────────────┐  │   │
│  │  │ src/services/ai/   │  │ Markdown Tool Registry            │  │   │
│  │  │                    │  │                                    │  │   │
│  │  │ - Provider 抽象    │  │ - Editor Tools                    │  │   │
│  │  │ - Agent 配置       │  │ - File Tools                      │  │   │
│  │  │ - 会话管理         │  │ - Markdown Tools                  │  │   │
│  │  └─────────┬──────────┘  │ - Workspace Tools                 │  │   │
│  │            │              └──────────────────┬─────────────────┘  │   │
│  │            │                                 │                    │   │
│  │  ┌─────────▼─────────────────────────────────▼─────────────────┐  │   │
│  │  │         src/lib/pi/ (Pi 源码 Vendor)                        │  │   │
│  │  │                                                              │  │   │
│  │  │  ┌─────────────┐  ┌─────────────────────────────────────┐   │  │   │
│  │  │  │ pi/ai       │  │ pi/agent                             │   │  │   │
│  │  │  │             │  │                                      │   │  │   │
│  │  │  │ - stream()  │  │ - Agent 类                           │   │  │   │
│  │  │  │ - complete()│  │ - agentLoop()                        │   │  │   │
│  │  │  │ - Provider  │  │ - AgentHarness                       │   │  │   │
│  │  │  │   Registry  │  │ - Session (InMemory)                 │   │  │   │
│  │  │  │ - OpenAI    │  │ - Compaction (上下文压缩)            │   │  │   │
│  │  │  │   Completions│  │                                      │   │  │   │
│  │  │  └─────────────┘  └─────────────────────────────────────┘   │  │   │
│  │  └──────────────────────────────────────────────────────────────┘  │   │
│  └────────────────────────────────────────────────────────────────────┘   │
│                                │                                          │
│  ┌─────────────────────────────▼──────────────────────────────────┐       │
│  │                    Zustand Stores                               │       │
│  │  useFileStore │ useEditorStore │ useAIStore │ useAgentStore     │       │
│  └────────────────────────────────────────────────────────────────┘       │
│                                │                                          │
│  ┌─────────────────────────────▼──────────────────────────────────┐       │
│  │                    Tauri Commands (Rust)                        │       │
│  │  read_file │ save_file │ search_in_files │ create_file │ ...   │       │
│  └────────────────────────────────────────────────────────────────┘       │
└───────────────────────────────────────────────────────────────────────────┘
```

### 3.2 三层代码关系

```
┌─────────────────────────────────────────────┐
│ 应用层: src/services/ai/ + src/stores/      │  ← 我们写的代码
│   - Provider 配置管理                        │
│   - Tool 注册和实现                          │
│   - Agent 会话管理                           │
│   - UI 状态绑定                              │
├─────────────────────────────────────────────┤
│ 基础层: src/lib/pi/                          │  ← 从 Pi vendor 的代码
│   - LLM 调用/流处理                          │
│   - Agent Loop / Tool Calling               │
│   - Session / Compaction                     │
├─────────────────────────────────────────────┤
│ 平台层: Tauri Commands (Rust)               │  ← 已有代码
│   - 文件 I/O                                 │
│   - 安全存储                                 │
└─────────────────────────────────────────────┘
```

### 3.3 核心设计原则

1. **直接使用 Pi 的 Agent + agentLoop** — 不自研 Agent Runtime
2. **Pi 不直接操作 CodeMirror** — 所有编辑动作通过 Editor Tool Adapter 中转
3. **所有修改先预览后应用** — Agent 生成 patch → UI 展示 diff → 用户确认 → 应用
4. **只保留 openai-completions Provider** — 所有 OpenAI 兼容 API（含第三方代理）统一走这一个
5. **工具权限分级** — 低风险工具自动执行，高风险工具需要用户确认
6. **向后兼容** — 现有对话/改写/翻译/解释功能保持不变
7. **品牌统一** — 所有代码和提示词中统一使用 "Seven Markdown"

### 3.4 Agent 接口抽象

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

/** 统一 Agent 接口（对 Pi Agent 类的适配封装） */
interface MarkdownAgent {
  run(input: AgentInput): AsyncGenerator<AgentEvent>
  cancel(taskId: string): Promise<void>
}

/** Agent 事件流（映射自 Pi 的 AgentEvent） */
type AgentEvent =
  | { type: 'thinking'; content: string }
  | { type: 'plan'; steps: string[] }
  | { type: 'tool_call'; name: string; args: Record<string, unknown> }
  | { type: 'tool_result'; name: string; result: unknown }
  | { type: 'patch'; patch: MarkdownPatch }
  | { type: 'message'; content: string; delta?: string }
  | { type: 'error'; error: string }
  | { type: 'done'; summary: string }
```

### 3.5 Pi Agent 事件映射

Pi 原生事件需要映射为我们的 `AgentEvent`：

| Pi 原生事件 | 映射为 |
|---|---|
| `agent_start` | — (内部状态) |
| `turn_start` | `{ type: 'thinking' }` |
| `message_start` | `{ type: 'message' }` |
| `text_delta` | `{ type: 'message', delta }` |
| `thinking_delta` | `{ type: 'thinking', content }` |
| `tool_execution_start` | `{ type: 'tool_call' }` |
| `tool_execution_end` | `{ type: 'tool_result' }` |
| `turn_end` | `{ type: 'done' }` |

### 3.6 Markdown Patch 协议

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

## 4. 文件结构规划（完整）

### 4.1 新增目录总览

```
src/
├── lib/
│   └── pi/                              # Pi 源码 Vendor（见第 2 节详细说明）
│       ├── ai/                          # LLM 调用层
│       ├── agent/                       # Agent 运行时
│       └── README.md
│
├── services/
│   └── ai/                              # ← 新增：AI 服务层
│       ├── index.ts                     # 统一入口
│       ├── types.ts                     # 类型定义（AgentInput/Event/Patch 等）
│       ├── config.ts                    # AI 配置管理（替代旧 aiService 的配置部分）
│       ├── providers/
│       │   ├── types.ts                 # Provider 接口
│       │   ├── openaiCompatible.ts      # 现有 OpenAI 兼容实现（从 aiService.ts 迁移）
│       │   └── piProvider.ts            # 桥接 Pi 的 openai-completions Provider
│       ├── agent/
│       │   ├── types.ts                 # Agent 接口和事件类型
│       │   ├── markdownAgent.ts         # Markdown Writing Agent（封装 Pi Agent 类）
│       │   ├── toolRegistry.ts          # 工具注册表
│       │   ├── tools/
│       │   │   ├── editorTools.ts       # 编辑器工具（读取/替换/插入）
│       │   │   ├── fileTools.ts         # 文件工具（读取/搜索/创建）
│       │   │   ├── markdownTools.ts     # Markdown 工具（提取标题/生成目录/格式化）
│       │   │   └── index.ts
│       │   ├── prompts.ts              # Agent 系统提示词
│       │   └── patchProtocol.ts        # Patch 协议定义
│       └── legacy.ts                    # 旧 aiService.ts 的桥接层（过渡期）
│
├── stores/
│   └── useAgentStore.ts                 # ← 新增：Agent 状态管理
│
├── components/
│   └── ai-panel/
│       ├── AgentMode.tsx                # ← 新增：Agent 模式 UI
│       ├── AgentToolCallLog.tsx         # ← 新增：Tool Call 日志
│       ├── DiffPreview.tsx              # ← 新增：Diff 预览组件
│       └── PatchActions.tsx             # ← 新增：应用/拒绝按钮
│
└── utils/
    └── markdownUtils.ts                 # ← 新增：Markdown 解析工具函数
```

### 4.2 现有文件修改清单

| 文件 | 修改内容 |
|---|---|
| `src/services/aiService.ts` | 保留但标记 deprecated，所有调用逐步迁移到 `src/services/ai/` |
| `src/stores/useAIStore.ts` | 扩展 `AIMode` 类型，新增 `'agent'` 模式 |
| `src/components/ai-panel/AIPanel.tsx` | 新增 Agent Tab，引入 `AgentMode` 组件 |
| `src/components/editor-v2/EditorPaneV2.tsx` | 新增 `editor:preview-patch` / `editor:apply-patch` 事件处理 |
| `vite.config.ts` | 添加 `@pi/ai`、`@pi/agent` 路径别名 |
| `package.json` | 添加 `@sinclair/typebox`、`partial-json`、`yaml` 依赖 |
| `tsconfig.json` | 添加 paths 映射 |

---

## 5. 品牌名称统一

### 5.1 需要修改的位置

| 文件 | 当前内容 | 修改为 |
|---|---|---|
| `src/services/aiService.ts` L12 | `const CONFIG_KEY = 'md-mate-ai-config'` | `const CONFIG_KEY = 'seven-markdown-ai-config'`（同时做数据迁移） |
| `src/services/aiService.ts` L91 | `'你是 MD Mate AI 助手...'` | `'你是 Seven Markdown AI 助手...'` |
| 所有 Agent 提示词 | — | 统一使用 "Seven Markdown" |

### 5.2 数据迁移策略

```typescript
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

## 6. Agent 工具清单

### 6.1 Phase 1 — 编辑器工具（Editor Tools）

| 工具名 | 描述 | 参数 | 风险等级 | 需要确认 |
|---|---|---|---|---|
| `get_current_document` | 获取当前文档全文、路径、标题 | 无 | 🟢 低 | 否 |
| `get_selection` | 获取当前选区文本和范围 | 无 | 🟢 低 | 否 |
| `get_cursor_position` | 获取当前光标位置 | 无 | 🟢 低 | 否 |
| `extract_headings` | 提取 Markdown 标题大纲 | 无 | 🟢 低 | 否 |
| `replace_selection` | 替换当前选区 | `newText: string` | 🟡 中 | 是（diff） |
| `insert_at_cursor` | 在光标处插入内容 | `text: string` | 🟡 中 | 是（预览） |
| `replace_document` | 替换整个文档 | `newContent: string` | 🔴 高 | 是（full diff） |

### 6.2 Phase 2 — Markdown 工具（Markdown Tools）

| 工具名 | 描述 | 参数 | 风险等级 |
|---|---|---|---|
| `generate_toc` | 生成目录 | `maxDepth?: number` | 🟢 低 |
| `format_markdown_table` | 格式化 Markdown 表格 | `tableText: string` | 🟢 低 |
| `validate_markdown_links` | 检查链接有效性 | 无 | 🟢 低 |
| `generate_markdown_patch` | 生成结构化 patch | `changes: PatchChange[]` | 🟡 中 |

### 6.3 Phase 3 — 工作区工具（Workspace Tools）

| 工具名 | 描述 | 参数 | 风险等级 |
|---|---|---|---|
| `search_workspace` | 搜索工作区 Markdown 文件 | `query: string, type: 'filename' \| 'content'` | 🟢 低 |
| `read_workspace_file` | 读取工作区文件 | `path: string` | 🟡 中 |
| `create_markdown_file` | 创建新 Markdown 文档 | `path: string, content: string` | 🔴 高 |
| `list_workspace_files` | 列出工作区文件树 | 无 | 🟢 低 |

---

## 7. Agent 执行协议

### 7.1 三段式执行流程

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

### 7.2 权限模型

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

### 7.3 与 Pi agentLoop 的对接

```typescript
// src/services/ai/agent/markdownAgent.ts
import { Agent, agentLoop } from '@pi/agent'
import { stream } from '@pi/ai'

// 创建 Agent 实例
const agent = new Agent({
  stream: (context) => stream(context, { model, apiKey, baseURL }),
  tools: markdownToolRegistry.getAllTools(),
  maxTurns: 10,
  toolExecutionMode: 'sequential', // Markdown 修改需要顺序执行
})

// 运行 Agent Loop
async function* runMarkdownAgent(input: AgentInput): AsyncGenerator<AgentEvent> {
  const session = agent.createSession()
  
  for await (const event of agentLoop(session, input.userMessage)) {
    yield mapPiEventToAgentEvent(event)
  }
}
```

---

## 8. Pi 集成路线（更新版）

### 8.1 集成策略

```
Phase 0: ✅ 可行性验证（已完成）
    │
    ▼
Phase 1: 源码迁移 + AI Provider 抽象 + 品牌统一
    │
    ▼
Phase 2: Editor Tool Adapter
    │
    ▼
Phase 3: Agent Panel UI
    │
    ▼
Phase 4: Markdown Agent（对接 Pi agentLoop）
    │
    ▼
Phase 5: 工作区 Agent
    │
    ▼
Phase 6: 高级 Agent 能力
```

### 8.2 Pi 代码使用优先级

| 优先级 | 来源 | 用途 | 集成方式 |
|---|---|---|---|
| **P0** | `pi-ai` (openai-completions) | LLM 调用 + 流处理 | 源码 vendor 到 `src/lib/pi/ai/` |
| **P0** | `pi-agent-core` (Agent + agentLoop) | Agent 循环 + Tool Calling | 源码 vendor 到 `src/lib/pi/agent/` |
| **P1** | `pi-agent-core` (harness/compaction) | 长对话上下文压缩 | 源码 vendor |
| **P1** | `pi-agent-core` (harness/session) | InMemory Session 管理 | 源码 vendor |
| **参考** | `pi-coding-agent` (core/tools) | 工具定义模式参考 | 不迁移，只参考 |
| **不用** | `pi-tui` | 终端 UI | 完全不集成 |

---

## 9. 开发阶段详细规划

### Phase 1：源码迁移 + AI Provider 抽象 + 品牌统一

**OpenSpec 变更名**：`pi-source-migration-and-provider-layer`

**目标**：
1. 将 Pi 源码从 `.ext/pi/` 裁剪迁移到 `src/lib/pi/`
2. 将现有 `aiService.ts` 重构为 Provider 架构
3. 统一品牌名称
4. 删除 `.ext/pi/` 目录

**任务清单**：

1. 按照第 2 节迁移执行清单完成源码迁移
2. 验证 `src/lib/pi/` 编译通过
3. 创建 `src/services/ai/` 目录结构
4. 定义 Provider 接口（`AIProvider`）
5. 将现有 `aiService.ts` 的逻辑迁移为 `OpenAICompatibleProvider`
6. 创建 `PiProvider`（桥接 Pi 的 openai-completions）
7. 实现 Provider 工厂和配置管理
8. 统一品牌名称：所有 "MD Mate" → "Seven Markdown"
9. localStorage key 数据迁移
10. 保持现有 4 个 AI 功能完全不变
11. 在 `src/services/ai/legacy.ts` 中做桥接
12. 删除 `.ext/pi/` 目录

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

**产出**：
- `src/lib/pi/` 完整目录（裁剪后的 Pi 源码）
- `src/services/ai/` Provider 架构
- 现有 AI 功能不受影响
- 品牌名称统一
- `.ext/pi/` 已删除

**预估工期**：3-4 天

---

### Phase 2：Editor Tool Adapter

**OpenSpec 变更名**：`editor-tool-adapter`

**目标**：封装编辑器状态和操作为 Pi Agent 可调用的工具函数（符合 Pi 的 `AgentTool` 接口）

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

**工具定义需符合 Pi 的 AgentTool 接口**：

```typescript
// Pi 的 AgentTool 类型
import type { AgentTool } from '@pi/agent'

const getDocumentTool: AgentTool = {
  name: 'get_current_document',
  description: '获取当前编辑器中打开的 Markdown 文档全文、路径和标题',
  schema: Type.Object({}), // TypeBox schema
  async execute(args, context) {
    const fileStore = useFileStore.getState()
    return {
      content: fileStore.currentContent,
      path: fileStore.activeFile,
      title: extractTitle(fileStore.currentContent),
    }
  },
}
```

**产出**：
- 完整的 Editor Tool Adapter（符合 Pi AgentTool 接口）
- Markdown 解析工具函数
- 统一的工具注册表

**预估工期**：2-3 天

---

### Phase 3：Agent Panel UI

**OpenSpec 变更名**：`agent-panel-ui`

**目标**：在 AI Panel 中新增 Agent Tab，实现 Agent 交互 UI

**任务清单**：

1. 扩展 `useAIStore` — 新增 `'agent'` 模式
2. 创建 `useAgentStore.ts` — Agent 专用状态管理
3. 修改 `AIPanel.tsx` — 新增第 5 个 Tab：`Agent`
4. 创建 `AgentMode.tsx` — Agent 模式主组件
5. 创建 `AgentToolCallLog.tsx` — Tool Call 执行日志
6. 创建 `DiffPreview.tsx` — Markdown diff 预览组件
7. 创建 `PatchActions.tsx` — 应用/拒绝/撤销按钮

**Agent Store 设计**：

```typescript
interface AgentState {
  isRunning: boolean
  currentTaskId: string | null
  plan: string[] | null
  toolCalls: ToolCallRecord[]
  pendingPatches: MarkdownPatch[]
  patchPreviewVisible: boolean
  agentMessages: AgentMessage[]
  
  startAgent: (input: string) => void
  cancelAgent: () => void
  applyPatch: (patchId: string) => void
  rejectPatch: (patchId: string) => void
  applyAllPatches: () => void
  rejectAllPatches: () => void
  clearHistory: () => void
}
```

**产出**：
- Agent Tab 和完整 UI
- Agent Store
- Diff 预览组件

**预估工期**：3-4 天

---

### Phase 4：Markdown Agent（对接 Pi agentLoop）

**OpenSpec 变更名**：`markdown-agent-runtime`

**目标**：使用 Pi 的 `Agent` 类 + `agentLoop()` 实现 Markdown Writing Agent

**关键变化（相比旧方案）**：不自研 Agent Runtime，直接使用 Pi 原生的循环机制。

**任务清单**：

1. 创建 `src/services/ai/agent/markdownAgent.ts`
2. 实例化 Pi `Agent` 类，注入 stream 函数和工具列表
3. 使用 `agentLoop()` 处理 Agent 消息循环
4. 实现事件映射（Pi 原生事件 → 我们的 AgentEvent）
5. 设计 Agent 系统提示词 (`prompts.ts`)
6. 连接 Tool Registry — 注册 Phase 2 的编辑器工具
7. 实现 Patch 生成和预览流程
8. 添加超时和取消机制
9. 连通 AgentMode UI — 将事件流渲染到界面
10. 利用 Pi 的 InMemorySession 管理对话历史

**Agent 初始化代码示例**：

```typescript
import { Agent } from '@pi/agent'
import { stream as piStream, registerApiProvider } from '@pi/ai'
import type { AgentTool } from '@pi/agent'

// 注册 OpenAI Completions Provider
registerApiProvider('openai', openaiCompletionsProvider)

// 创建 Agent
export function createMarkdownAgent(config: AgentConfig) {
  return new Agent({
    stream: (context) => piStream(context, {
      model: config.model,
      apiKey: config.apiKey,
      baseURL: config.endpoint,
    }),
    tools: getMarkdownTools(),
    maxTurns: 10,
    toolExecutionMode: 'sequential',
  })
}
```

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

**产出**：
- 基于 Pi Agent 的 Markdown Agent
- Tool Calling 闭环
- Agent ↔ UI 连通
- Plan → Preview → Apply 流程

**预估工期**：3-4 天

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
8. 利用 Pi Compaction 处理长上下文 — 多文件读取后自动压缩

**安全约束**：

- 默认只能读当前打开的文件；
- 跨文件读取需要用户逐次授权；
- 写文件/创建文件必须预览确认；
- 批量修改需要展示完整修改列表；
- 所有文件操作限制在当前工作区目录内。

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

1. **Streaming 输出** — 利用 Pi 原生 streaming，实时展示文字和 Tool Call
2. **上下文压缩** — 长对话自动触发 Pi Compaction，避免 token 溢出
3. **Markdown 专用工具扩展**
   - `generate_toc` — 自动生成目录
   - `format_markdown_table` — 格式化表格
   - `validate_markdown_links` — 检查链接
   - `generate_mermaid` — 生成 Mermaid 图表
4. **Agent 会话管理** — 基于 InMemorySession，支持历史回溯
5. **快捷 Agent 命令** — 右键菜单/快捷键直接触发 Agent 任务
6. **Agent 预设模板** — 常见写作任务一键执行
7. **多模型切换** — 动态切换模型（通过 Pi 的 model 参数）

**Agent 预设模板示例**：

| 预设名 | 触发方式 | 功能 |
|---|---|---|
| 整理文章结构 | 右键菜单 / 命令 | 分析并优化当前文档的标题层级和段落组织 |
| 生成目录 | 右键菜单 / 命令 | 根据标题自动生成 TOC |
| 扩写选区 | 选中文本后右键 | 对选中内容进行扩展和丰富 |
| 草稿转正文 | 右键菜单 / 命令 | 将草稿整理为正式文章 |
| 检查链接 | 右键菜单 / 命令 | 检查文档中所有链接的有效性 |
| 生成 README | 命令 | 根据项目文件生成 README |
| 多语言版本 | 命令 | 将当前文档翻译为多语言版本 |

**产出**：
- 增强的 Agent 能力
- Streaming + Compaction
- Markdown 专用工具
- 快捷命令和预设

**预估工期**：5-7 天

---

## 10. Agent 使用场景示例

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

## 11. 风险与应对

### 11.1 技术风险

| 风险 | 影响 | 应对措施 |
|---|---|---|
| Pi 源码裁剪后编译失败 | Phase 1 阻塞 | 保留 `.ext/pi/` 作为参考；逐文件迁移验证 |
| Pi 上游更新难同步 | 功能落后 | `src/lib/pi/README.md` 记录版本；必要时手动 cherry-pick |
| openai-completions Provider 体积大（39KB 源码） | 包体积 | 评估是否需要进一步裁剪未使用的代码路径 |
| Agent 修改不可控 | 用户数据安全 | 三段式执行 + diff preview + 确认机制 |
| 现有 AI 功能被重构破坏 | 功能退化 | Provider 桥接层 + 渐进迁移 + 完整测试 |
| Tool Calling 延迟高 | 用户体验差 | Pi 原生 streaming + 进度提示 + 取消按钮 |
| 长对话 token 溢出 | Agent 失效 | 利用 Pi Compaction 自动压缩上下文 |

### 11.2 产品风险

| 风险 | 影响 | 应对措施 |
|---|---|---|
| Agent 功能过于复杂 | 用户不会用 | 提供预设模板；简单场景用快捷命令 |
| AI 功能喧宾夺主 | 偏离编辑器定位 | Agent 作为可选增强，不影响核心编辑体验 |
| API Key 安全 | 密钥泄漏 | 短期：localStorage；中期：迁移到 Tauri 安全存储 |

---

## 12. 技术债和后续规划

### 12.1 当前技术债（集成时一并处理）

- [ ] "MD Mate" 品牌名称残留
- [ ] `aiService.ts` 缺少 streaming 支持
- [ ] API Key 存储在 localStorage 不安全
- [ ] AI 面板没有错误恢复机制
- [ ] 没有 AI 调用的日志和监控

### 12.2 后续演进方向

```
近期 (Phase 1-4)          中期 (Phase 5-6)         远期
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Pi 源码迁移               工作区 Agent              知识库 Agent
文档内 Agent              跨文件操作                RAG 检索增强
Pi agentLoop              完整工具链                自定义工具
Streaming (Pi 原生)       Compaction 优化           协作编辑
OpenAI Completions        多模型切换                本地模型
                          Agent 预设模板            插件系统
                          快捷键 Agent              多 Agent 协作
```

### 12.3 Pi 源码同步策略

```
当前: vendor 到 src/lib/pi/（Pin 到特定 commit）
    ↓
需要更新时: 手动对比 diff，选择性合入
    ↓
    ├── 关注 openai-completions.ts 的 bug fix
    ├── 关注 agent-loop.ts 的新特性
    └── 忽略新增 Provider（除非有需求）
```

### 12.4 API Key 安全升级路线

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

## 13. OpenSpec 变更清单

| 序号 | OpenSpec 变更名 | Phase | 核心目标 | 预估工期 |
|---|---|---|---|---|
| 0 | `spike-pi-compatibility` | Phase 0 | ✅ 已完成 | — |
| 1 | `pi-source-migration-and-provider-layer` | Phase 1 | 源码迁移 + Provider 抽象 + 品牌统一 | 3-4 天 |
| 2 | `editor-tool-adapter` | Phase 2 | 编辑器工具适配层 | 2-3 天 |
| 3 | `agent-panel-ui` | Phase 3 | Agent Panel UI | 3-4 天 |
| 4 | `markdown-agent-runtime` | Phase 4 | 对接 Pi agentLoop 的 Markdown Agent | 3-4 天 |
| 5 | `workspace-agent-tools` | Phase 5 | 工作区 Agent 工具 | 3-4 天 |
| 6 | `advanced-agent-features` | Phase 6 | 高级 Agent 能力 | 5-7 天 |

**总预估工期**：19-26 天（实际开发，不含设计评审时间）

---

## 14. 成功标准

### MVP 完成标准（Phase 1-4 完成后）

- [ ] Pi 源码成功迁移到 `src/lib/pi/`，`.ext/pi/` 已删除
- [ ] Vite 编译通过，Pi 模块可正常 import
- [ ] AI Provider 层重构完成，现有功能不退化
- [ ] 品牌名称 "MD Mate" 全部更正为 "Seven Markdown"
- [ ] Agent Tab 在 AI Panel 中可用
- [ ] Agent 使用 Pi 的 `agentLoop()` 运行
- [ ] Agent 能读取当前文档、选区、标题大纲
- [ ] Agent 能执行替换选区、插入内容操作
- [ ] 所有修改有 diff preview
- [ ] 用户可以确认或拒绝修改
- [ ] Agent 有取消/停止按钮
- [ ] Streaming 输出正常工作

### 完整版标准（Phase 1-6 完成后）

- [ ] 支持工作区级别的 Agent 操作
- [ ] 长对话有上下文压缩（Compaction）
- [ ] 有 Agent 预设模板
- [ ] 有快捷键/右键菜单触发 Agent
- [ ] 支持多模型切换
- [ ] 所有工具有权限控制
- [ ] 有完整的错误处理和恢复机制

---

## 15. 参考资料

- [Seven Markdown 项目架构](./ARCHITECTURE.md)
- [earendil-works/pi GitHub](https://github.com/earendil-works/pi)
- [Pi browser-smoke-entry.ts](../.ext/pi/scripts/browser-smoke-entry.ts) — 浏览器兼容性验证
- [CodeMirror 6 文档](https://codemirror.net/docs/)
- [Tauri 2 文档](https://v2.tauri.app/)
- [OpenAI Function Calling](https://platform.openai.com/docs/guides/function-calling)
- [Vercel AI SDK](https://sdk.vercel.ai/) — Agent 模式参考
- [Cursor](https://cursor.sh/) — 编辑器 + AI Agent 产品参考

---

## 附录 A：Pi 源码关键 API 速查

### pi-ai 核心 API

```typescript
// 流式调用
import { stream, complete } from '@pi/ai'

const result = stream(context, options)  // 返回 AsyncIterable<AssistantMessageEvent>
const text = await complete(context, options)  // 返回 string

// Provider 注册
import { registerApiProvider, getApiProvider } from '@pi/ai'
registerApiProvider('openai', openaiCompletionsProvider)

// 模型查询
import { getModel, getModels } from '@pi/ai'
const model = getModel('gpt-4o')
```

### pi-agent-core 核心 API

```typescript
// Agent 创建
import { Agent, agentLoop } from '@pi/agent'

const agent = new Agent({
  stream: streamFn,         // (context) => AsyncIterable<AssistantMessageEvent>
  tools: AgentTool[],       // 工具列表
  maxTurns: 10,             // 最大循环轮数
  toolExecutionMode: 'sequential' | 'parallel',
})

// 运行循环
for await (const event of agentLoop(session, userMessage)) {
  // event: AgentEvent
}

// Session 管理
import { InMemorySessionRepo } from '@pi/agent'
const repo = new InMemorySessionRepo()
```

### AgentTool 定义模式

```typescript
import { Type } from '@sinclair/typebox'
import type { AgentTool } from '@pi/agent'

const myTool: AgentTool = {
  name: 'tool_name',
  description: '工具描述',
  schema: Type.Object({
    param1: Type.String({ description: '参数1' }),
    param2: Type.Optional(Type.Number()),
  }),
  async execute(args, context) {
    // 实现
    return { result: '...' }
  },
}
```

---

> **本文档版本**：v2.0
> **最后更新**：2026-05-23
> **作者**：Seven Markdown Team
> **状态**：已验证（Phase 0 完成），准备执行 Phase 1
