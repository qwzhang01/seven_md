# 把 Pi 的 Agent 能力搬进你自己的系统：一次完整的工程实践

> 本文基于 Seven Markdown 编辑器的真实集成经验，手把手带你把 Pi（`@earendil-works/pi-ai` + `@earendil-works/pi-agent-core`）的 Agent 运行时嵌入到任意前端/全栈项目中。读完本文，你应该能独立完成从"零依赖"到"跑起来一个带工具调用的 AI Agent"的全过程。

---

## 一、为什么选 Pi？

市面上的 AI SDK 不少，LangChain、Vercel AI SDK、OpenAI SDK……为什么要专门折腾 Pi？

Pi 是 [earendil-works](https://github.com/earendil-works) 开源的一套 **TypeScript-first** AI 基础设施，它的核心价值在于：

1. **分层清晰**：`@pi/ai` 负责 LLM 调用（流式/非流式），`@pi/agent` 负责 Agent 运行时（工具调用循环、事件总线、消息队列）。两层完全解耦，可以只用其中一层。
2. **事件驱动**：Agent 运行时通过 `subscribe()` 暴露完整的生命周期事件（`agent_start` → `turn_start` → `message_update` → `tool_execution_start` → `tool_execution_end` → `turn_end` → `agent_end`），UI 层只需订阅事件，不需要关心内部状态机。
3. **工具系统完备**：内置并行/顺序执行模式、`beforeToolCall`/`afterToolCall` 钩子、工具参数校验（基于 TypeBox）。
4. **OpenAI 兼容**：内置 `openai-completions` provider，任何兼容 OpenAI 格式的 API（DeepSeek、Qwen、本地 Ollama 等）都能直接接入。

---

## 二、整体架构

集成后的代码分两层：

```
src/
├── lib/pi/                    ← Vendor 层（Pi 源码，不修改）
│   ├── ai/                    ← LLM 调用层
│   │   ├── stream.ts          ← stream() / streamSimple()
│   │   ├── api-registry.ts    ← registerApiProvider()
│   │   └── providers/
│   │       └── openai-completions.ts
│   └── agent/                 ← Agent 运行时
│       ├── agent.ts           ← Agent 类（状态机 + 事件总线）
│       ├── agent-loop.ts      ← 核心循环（工具调用 + 流式响应）
│       └── types.ts           ← AgentTool / AgentEvent 等类型
│
└── services/ai/               ← 业务层（你自己写的）
    ├── config.ts              ← API Key / endpoint 配置
    ├── providers/
    │   ├── piProvider.ts      ← 简单对话 Provider（封装 Pi stream）
    │   └── openaiCompatible.ts
    ├── agent/
    │   ├── markdownAgent.ts   ← Agent 工厂（注入工具 + 系统提示词）
    │   ├── toolRegistry.ts    ← 工具注册表（权限门控）
    │   ├── permissionModel.ts ← 权限模型（auto/confirm/deny）
    │   ├── eventMapper.ts     ← Pi 事件 → 业务事件
    │   ├── compaction.ts      ← 上下文压缩（防 token 溢出）
    │   ├── prompts.ts         ← 系统提示词
    │   └── tools/
    │       ├── editorTools.ts ← 编辑器工具（读/写文档）
    │       ├── fileTools.ts   ← 文件系统工具
    │       └── markdownTools.ts
    └── index.ts               ← 统一导出
```

**核心思路**：Pi 的源码以 Vendor 形式放在 `src/lib/pi/`，通过 `tsconfig.json` 的 `paths` 别名映射为 `@pi/ai` 和 `@pi/agent`，业务层完全不感知 Pi 的物理路径。

---

## 三、Step 1：Vendor Pi 源码

### 3.1 为什么 Vendor 而不是 npm install？

Pi 目前没有发布到 npm（或者你需要锁定特定版本、做定制修改），最稳妥的方式是把源码直接放进项目。

从 Pi 仓库拷贝以下目录：

```
pi-mono/packages/pi-ai/src/     → src/lib/pi/ai/
pi-mono/packages/pi-agent-core/src/ → src/lib/pi/agent/
```

### 3.2 裁剪不需要的部分

Pi 的完整源码包含很多我们用不到的东西，按需裁剪：

| 裁剪内容 | 原因 |
|---|---|
| `models.generated.ts`（416KB） | 替换为只包含常用模型的 `models-minimal.ts` |
| Anthropic / Google / Azure 等 provider | 只保留 `openai-completions` |
| Node.js 专属代码（`env-api-keys.ts`、`node-http-proxy.ts`） | 浏览器环境不需要 |
| JSONL 文件存储 | 用内存存储替代 |
| CLI 工具、OAuth、图片生成 | 不需要 |

裁剪后需要做几处小修改：

```typescript
// ai/stream.ts — 删除这两行
// import "./providers/register-builtins.ts"  ← 删除（我们手动注册）
// export { getEnvApiKey }                    ← 删除（浏览器无 process.env）

// ai/providers/openai-completions.ts — 修改 API Key 获取方式
// 原来：apiKey = apiKey ?? process.env.OPENAI_API_KEY
// 改为：必须显式传入 apiKey（浏览器环境无 process.env）
```

### 3.3 配置路径别名

在 `tsconfig.json` 中添加：

```json
{
  "compilerOptions": {
    "paths": {
      "@pi/ai": ["./src/lib/pi/ai/index.ts"],
      "@pi/ai/*": ["./src/lib/pi/ai/*"],
      "@pi/agent": ["./src/lib/pi/agent/index.ts"],
      "@pi/agent/*": ["./src/lib/pi/agent/*"]
    }
  }
}
```

如果用 Vite，还需要在 `vite.config.ts` 中同步配置 `resolve.alias`。

### 3.4 安装依赖

Pi 依赖以下 npm 包：

```bash
npm install openai@^6.26.0 typebox@^1.1.38 partial-json@^0.1.7 yaml@^2.9.0
```

---

## 四、Step 2：注册 Provider

Pi 使用一个全局 registry 管理 LLM provider。在应用启动时（或首次调用前），需要注册 `openai-completions` provider：

```typescript
// src/services/ai/agent/markdownAgent.ts（节选）
import { registerApiProvider } from '@pi/ai'
import { streamOpenAICompletions, streamSimpleOpenAICompletions } from '@pi/ai/providers/openai-completions.ts'

let providerRegistered = false

function ensureProviderRegistered(): void {
  if (providerRegistered) return
  providerRegistered = true
  registerApiProvider({
    api: 'openai-completions' as const,
    stream: streamOpenAICompletions,
    streamSimple: streamSimpleOpenAICompletions,
  })
}
```

**注意**：`registerApiProvider` 是全局单例操作，整个应用生命周期只需调用一次。用 `providerRegistered` 标志做幂等保护。

---

## 五、Step 3：定义 Model 对象

Pi 的 `stream()` 函数需要一个 `Model` 对象，描述要调用的模型及其 API 配置：

```typescript
// src/services/ai/agent/markdownAgent.ts（节选）
import type { Api, Model } from '@pi/ai'

function buildAgentModel(modelId: string): Model<Api> {
  const config = getAIConfig()  // 从 localStorage 读取用户配置
  return {
    id: modelId,                              // 模型 ID，如 "gpt-4o"
    name: modelId,
    api: 'openai-completions',               // 固定使用 openai-completions
    provider: 'openai',
    baseUrl: config.endpoint.replace(/\/$/, ''),  // API 端点，如 "https://api.openai.com/v1"
    reasoning: false,                         // 是否为推理模型（o1/o3 系列）
    input: ['text'],                          // 支持的输入类型
    cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
    contextWindow: 128000,
    maxTokens: 4096,
  }
}
```

这个对象是 Pi 内部路由 API 调用的关键，`api` 字段决定使用哪个已注册的 provider，`baseUrl` 决定请求发往哪里。

---

## 六、Step 4：定义工具（AgentTool）

这是集成中最核心的部分。Pi 的工具系统基于 **TypeBox** 做参数校验，每个工具是一个实现了 `AgentTool` 接口的对象。

### 6.1 工具接口

```typescript
interface AgentTool<TParameters extends TSchema, TDetails = any> {
  name: string           // 工具名（LLM 调用时使用）
  label: string          // 人类可读标签（UI 展示）
  description: string    // 工具描述（注入到 LLM 的 system prompt）
  parameters: TParameters  // TypeBox schema（自动生成 JSON Schema）
  execute: (
    toolCallId: string,
    params: Static<TParameters>,
    signal?: AbortSignal,
    onUpdate?: AgentToolUpdateCallback,
  ) => Promise<AgentToolResult<TDetails>>
}
```

### 6.2 一个完整的工具示例

以"获取当前文档"工具为例：

```typescript
// src/services/ai/agent/tools/editorTools.ts（节选）
import type { AgentTool, AgentToolResult } from '@pi/agent'
import { Type, type Static } from 'typebox'

const GetCurrentDocumentSchema = Type.Object({})  // 无参数
type GetCurrentDocumentParams = Static<typeof GetCurrentDocumentSchema>

export const getCurrentDocumentTool: AgentTool<typeof GetCurrentDocumentSchema> = {
  name: 'get_current_document',
  label: '获取当前文档',
  description: '获取当前编辑器中打开的文档内容、路径和标题',
  parameters: GetCurrentDocumentSchema,
  async execute(_toolCallId, _params): Promise<AgentToolResult<unknown>> {
    // 从应用状态中读取当前文档
    const activeTab = useFileStore.getState().getActiveTab()
    if (!activeTab) {
      return {
        content: [{ type: 'text', text: JSON.stringify({ content: '', path: null }) }],
        details: { content: '', path: null },
      }
    }
    const result = {
      content: activeTab.content,
      path: activeTab.path,
      title: extractTitle(activeTab.content),
    }
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      details: result,
    }
  },
}
```

**关键点**：
- `content` 字段是返回给 LLM 的内容（文本或图片），LLM 会读取这里的信息
- `details` 字段是返回给 UI 层的结构化数据，不发给 LLM，用于渲染工具调用结果
- 工具内部可以访问任何应用状态（Zustand store、DOM API 等）

### 6.3 带参数的写工具示例

```typescript
const ReplaceDocumentSchema = Type.Object({
  newContent: Type.String({ description: '替换整个文档的新内容' }),
})

export const replaceDocumentTool: AgentTool<typeof ReplaceDocumentSchema> = {
  name: 'replace_document',
  label: '替换整个文档',
  description: '用新内容替换当前文档的全部内容（需确认）',
  parameters: ReplaceDocumentSchema,
  async execute(_toolCallId, params) {
    // params.newContent 已经过 TypeBox 校验
    const patch = createPatch({ type: 'replace_document', newContent: params.newContent })
    return {
      content: [{ type: 'text', text: JSON.stringify(patch, null, 2) }],
      details: patch,
    }
  },
}
```

---

## 七、Step 5：工具注册表与权限门控

直接把工具塞给 Agent 太粗暴，我们需要一个注册表来统一管理工具的权限：

```typescript
// src/services/ai/agent/toolRegistry.ts（核心逻辑）
type ToolPermission = 'auto' | 'confirm' | 'deny'

const registry = new Map<string, { tool: AgentTool; permission: ToolPermission }>()

// 注册时自动包装权限门控
export function registerTool(tool: AgentTool, permission: ToolPermission): void {
  const wrapped = wrapToolWithPermission(tool)
  registry.set(tool.name, { tool: wrapped, permission })
}

function wrapToolWithPermission(tool: AgentTool): AgentTool {
  const originalExecute = tool.execute.bind(tool)
  return {
    ...tool,
    async execute(toolCallId, params) {
      const permission = getEffectivePermission(tool.name, activeSessionProvider())

      if (permission === 'deny') throw new Error('工具已被禁用')

      if (permission === 'confirm') {
        // 向 UI 层发起确认请求，等待用户决定
        const approved = await confirmationHandler?.({
          toolName: tool.name,
          args: params as Record<string, unknown>,
          sessionId: activeSessionProvider(),
        })
        if (!approved) throw new Error('用户拒绝执行此操作')
      }

      return originalExecute(toolCallId, params)
    },
  }
}
```

注册工具时指定权限级别：

```typescript
// src/services/ai/agent/tools/index.ts
// 读工具：自动执行
registerTool(getCurrentDocumentTool, 'auto')
registerTool(getSelectionTool, 'auto')

// 写工具：需要用户确认
registerTool(replaceSelectionTool, 'confirm')
registerTool(replaceDocumentTool, 'confirm')
registerTool(createMarkdownFileTool, 'confirm')
```

**权限语义**：
- `auto`：Agent 可以直接调用，无需用户介入（适合只读操作）
- `confirm`：调用前弹出确认对话框，用户同意才执行（适合写操作）
- `deny`：完全禁用（适合危险操作或临时关闭某工具）

---

## 八、Step 6：创建 Agent 实例

有了工具和 Model，就可以创建 Agent 了：

```typescript
// src/services/ai/agent/markdownAgent.ts（核心部分）
import { Agent } from '@pi/agent'
import type { AgentOptions } from '@pi/agent'

export function createMarkdownAgent(options: CreateMarkdownAgentOptions = {}): Agent {
  ensureProviderRegistered()

  const config = getAIConfig()
  if (!config.apiKey) throw new Error('请先配置 API Key')

  const model = buildAgentModel(options.modelId ?? config.model)
  const tools = getAllTools()  // 从注册表获取所有工具

  const agentOptions: AgentOptions = {
    initialState: {
      systemPrompt: MARKDOWN_AGENT_SYSTEM_PROMPT,  // 系统提示词
      model,
      tools,
      thinkingLevel: 'off',  // 关闭 CoT（o1/o3 系列才需要开启）
    },
    getApiKey: () => config.apiKey,   // 动态获取 API Key（支持热更新）
    toolExecution: 'sequential',       // 工具顺序执行（避免并发写冲突）
  }

  const agent = new Agent(agentOptions)

  // 包装 prompt 方法，注入上下文压缩
  const originalPrompt = agent.prompt.bind(agent)
  agent.prompt = (async (...args) => {
    await maybeCompact(agent, { modelId: options.modelId })  // 超阈值自动压缩
    return originalPrompt(...args)
  }) as typeof originalPrompt

  return agent
}
```

`Agent` 类的关键配置项：

| 配置项 | 说明 |
|---|---|
| `initialState.systemPrompt` | 系统提示词，告诉 LLM 它是谁、有哪些工具、怎么用 |
| `initialState.model` | 使用的模型（可在运行时通过 `agent.state.model = newModel` 切换）|
| `initialState.tools` | 可用工具列表 |
| `getApiKey` | 动态获取 API Key 的函数（每次 LLM 调用前都会调用，支持 token 热刷新）|
| `toolExecution` | `'sequential'`（顺序）或 `'parallel'`（并行）|
| `beforeToolCall` | 工具执行前的钩子（可用于权限检查、日志记录）|
| `afterToolCall` | 工具执行后的钩子（可用于结果转换、审计）|

---

## 九、Step 7：订阅事件，驱动 UI

Agent 通过 `subscribe()` 暴露完整的生命周期事件。这是连接 Agent 运行时和 UI 层的桥梁：

```typescript
// 在 React 组件或 Store 中使用
const agent = createMarkdownAgent()

const unsubscribe = agent.subscribe(async (event, signal) => {
  switch (event.type) {
    case 'agent_start':
      setIsStreaming(true)
      break

    case 'message_update':
      // 流式更新：实时显示 LLM 正在输出的文字
      const text = extractText(event.message)
      setStreamingText(text)
      break

    case 'tool_execution_start':
      // 工具开始执行：在 UI 上显示"正在调用工具 xxx"
      addToolCallIndicator(event.toolName, event.args)
      break

    case 'tool_execution_end':
      // 工具执行完毕：显示结果
      if (event.result?.details?.type === 'replace_document') {
        applyPatchToEditor(event.result.details)
      }
      break

    case 'agent_end':
      setIsStreaming(false)
      break
  }
})

// 发送消息
await agent.prompt('请帮我整理这篇文章的结构')

// 清理
unsubscribe()
```

### 事件映射层

为了让业务代码不直接依赖 Pi 的事件类型，我们封装了一个事件映射器：

```typescript
// src/services/ai/agent/eventMapper.ts（节选）
export function mapPiEvent(event: AgentEvent): MarkdownAgentEvent | null {
  switch (event.type) {
    case 'message_update': {
      const fullText = extractTextFromMessage(event.message)
      const delta = fullText.slice(lastMessageText.length)
      lastMessageText = fullText
      return delta ? { type: 'message', content: fullText, delta } : null
    }

    case 'tool_execution_end': {
      // 如果工具结果是 Patch（文档修改操作），发出 patch 事件
      if (isPatchResult(event.result)) {
        return { type: 'patch', patch: event.result.details, toolCallId: event.toolCallId }
      }
      return { type: 'tool_result', name: event.toolName, result: event.result, toolCallId: event.toolCallId }
    }

    case 'agent_end':
      return { type: 'done' }

    default:
      return null
  }
}
```

---

## 十、Step 8：上下文压缩（防 token 溢出）

长对话会导致 token 超出模型的 context window。在每次 `prompt()` 前检查并压缩：

```typescript
// src/services/ai/agent/compaction.ts（核心逻辑）

// 估算 token 数（保守上界，不依赖 tokenizer）
export function estimateTokens(messages: AgentMessage[]): number {
  let totalChars = 0
  for (const m of messages) totalChars += charsOfMessage(m)
  return Math.ceil(totalChars / 4) + messages.length * 4
}

// 获取模型的 token 阈值（context window × 0.8）
export function tokenThresholdFor(modelId: string | undefined): number {
  const MODEL_CONTEXT_WINDOWS: Record<string, number> = {
    'gpt-4o': 128_000,
    'claude-3-5-sonnet': 200_000,
    'deepseek-chat': 64_000,
    // ...
  }
  const cw = MODEL_CONTEXT_WINDOWS[modelId ?? '']
  return cw ? Math.floor(cw * 0.8) : 25_000  // 默认阈值 25k
}

// 超阈值时截断到最近 20 条消息
export async function maybeCompact(agent: Agent, options: CompactionOptions = {}): Promise<void> {
  const tokens = estimateTokens(agent.state.messages)
  const threshold = tokenThresholdFor(options.modelId)

  if (tokens < threshold) return  // 不需要压缩

  const before = agent.state.messages.length
  // 保留最近 20 条消息（systemPrompt 单独存储，不在 messages 里）
  agent.state.messages = agent.state.messages.slice(-20)
  const removed = before - agent.state.messages.length

  options.onEvent?.({ type: 'compaction_done', removedMessages: removed })
}
```

**注意**：Pi 的 `systemPrompt` 存储在 `agent.state.systemPrompt` 中，不在 `messages` 数组里，所以截断 `messages` 不会丢失系统提示词。

---

## 十一、Step 9：系统提示词工程

系统提示词是 Agent 能力的核心。一个好的系统提示词需要：

1. **明确身份**：告诉 LLM 它是什么角色
2. **列出工具**：每个工具的名称、参数、使用场景
3. **规定工作流**：先读后写、最小修改原则等
4. **约束边界**：不能做什么（如不能访问工作区外的文件）

```
You are the **Seven Markdown Writing Agent** — an AI assistant that edits
Markdown documents by calling tools.

## CRITICAL: You MUST use tools to perform actions
**NEVER say "I will do X" without immediately calling the tool to do it.**

## Workflow
1. FIRST: Call `get_current_document` to gather context.
2. THEN: Call a write tool to make changes.
3. FINALLY: Briefly explain what you changed.

## Available Tools
### Read Tools (no confirmation needed)
- `get_current_document`: Get the full content of the currently open document.
- `get_selection`: Get the currently selected text.
...

## Rules
1. Always call tools — never just describe actions.
2. Minimal changes — only modify what the user asks for.
3. Preserve special blocks — never break code blocks or frontmatter.
```

---

## 十二、完整调用流程图

```
用户输入
    │
    ▼
agent.prompt("整理文章结构")
    │
    ▼
maybeCompact()  ← 检查 token 是否超阈值
    │
    ▼
runAgentLoop()
    │
    ├─► emit(agent_start)
    ├─► emit(turn_start)
    │
    ├─► streamAssistantResponse()  ← 调用 LLM
    │       │
    │       ├─► emit(message_start)
    │       ├─► emit(message_update) × N  ← 流式 token
    │       └─► emit(message_end)
    │
    ├─► [LLM 决定调用工具]
    │       │
    │       ├─► emit(tool_execution_start)
    │       ├─► 权限检查（auto/confirm/deny）
    │       ├─► tool.execute()  ← 实际执行工具
    │       └─► emit(tool_execution_end)
    │
    ├─► emit(turn_end)
    │
    ├─► [还有工具调用？] → 继续循环
    │
    └─► emit(agent_end)  ← Agent 结束
```

---

## 十三、常见问题与踩坑记录

### Q1：工具调用后 LLM 没有继续响应？

检查工具的 `content` 字段是否返回了有意义的内容。LLM 需要读取工具结果才能决定下一步。如果 `content` 为空或格式不对，LLM 可能会困惑。

### Q2：并发写操作导致文档状态混乱？

将 `toolExecution` 设置为 `'sequential'`，确保写工具一个接一个执行：

```typescript
const agent = new Agent({ ..., toolExecution: 'sequential' })
```

### Q3：如何在运行时切换模型？

直接修改 `agent.state.model`：

```typescript
agent.state.model = buildAgentModel('claude-3-5-sonnet-20241022')
```

下一次 `prompt()` 就会使用新模型。

### Q4：如何中断正在运行的 Agent？

```typescript
agent.abort()
await agent.waitForIdle()  // 等待 Agent 完全停止
```

### Q5：如何向正在运行的 Agent 注入消息（Steering）？

```typescript
// Agent 运行中，注入一条引导消息
agent.steer({ role: 'user', content: [{ type: 'text', text: '请简短一点' }], timestamp: Date.now() })
```

Steering 消息会在当前 turn 结束后、下一次 LLM 调用前注入。

---

## 十四、总结

整个集成的核心步骤可以归纳为：

| 步骤 | 工作内容 | 关键文件 |
|---|---|---|
| 1 | Vendor Pi 源码，配置路径别名 | `tsconfig.json`, `src/lib/pi/` |
| 2 | 注册 openai-completions provider | `markdownAgent.ts` |
| 3 | 定义 Model 对象 | `markdownAgent.ts` |
| 4 | 用 TypeBox 定义工具 | `tools/editorTools.ts` |
| 5 | 工具注册表 + 权限门控 | `toolRegistry.ts` |
| 6 | 创建 Agent 实例 | `markdownAgent.ts` |
| 7 | 订阅事件驱动 UI | `eventMapper.ts` |
| 8 | 上下文压缩 | `compaction.ts` |
| 9 | 系统提示词工程 | `prompts.ts` |

Pi 的设计非常工程化，每一层都有清晰的接口和职责边界。一旦理解了 `AgentTool` → `Agent` → `AgentEvent` 这条主线，扩展新工具、接入新模型都非常自然。

如果你在集成过程中遇到问题，欢迎在评论区交流。

---

*本文基于 `@earendil-works/pi-ai` v0.75.4 + `@earendil-works/pi-agent-core` v0.75.4，集成于 [Seven Markdown](https://github.com/your-repo/seven-md) 编辑器项目。*
