## Context

`markdown-agent-mvp`（Phase 4）已落地，现状：
- `src/services/ai/agent/markdownAgent.ts` 封装 Pi `Agent` 类，使用 `streamSimple` 作为 streamFn，sequential tool execution
- `src/services/ai/agent/toolRegistry.ts` 注册 7 个编辑器工具（4 read + 3 write）并维护 permission map（auto / confirm）
- `src/services/ai/agent/eventMapper.ts` 把 Pi `AgentEvent` 翻译为 `MarkdownAgentEvent`（thinking/message/tool_call/tool_result/patch/error/done）
- `useAgentStore` 管理单一会话：`messages`、`toolCalls`、`pendingPatches`、`isRunning`、`error`
- AgentMode UI 提供输入框、消息列表、工具调用日志、Diff 预览、应用/拒绝按钮

Pi 源码层（`src/lib/pi/`）已具备：
- `agent/harness/compaction/`：上下文压缩（branch summarization + truncate）
- `agent/harness/session/`：InMemorySessionRepo
- 工作区相关 Tauri 命令（`searchInFiles`/`readFile`/`createFile`/`readDirectory`）已存在并被 `useWorkspaceStore` 使用

**主要约束：**
1. 所有文件 I/O 必须通过 Tauri commands；Agent 不能直接走浏览器 fs API
2. 工作区路径校验必须严格防止 path traversal（`../../etc/passwd` 等）
3. Pi `Agent` 实例是有状态的：单实例不能跨会话复用，多会话必须各自创建
4. 现有 markdown-agent-mvp 的 4 个交付物（runtime、event mapper、store、UI）都不能 breaking change，只能扩展
5. compaction 在 WebView 中只能用 in-memory 实现（不能使用 node:fs）

## Goals / Non-Goals

**Goals:**
- 工作区级 Agent 能力：跨文件搜索 / 读取 / 创建，所有路径限制在工作区根目录
- 通用权限模型：明确 `auto/confirm/deny`，对 `confirm` 类工具在执行前阻塞并请求用户确认
- 长对话不再 token 溢出：transcript 超过阈值时自动 compaction，失败回退到 truncate
- 提供便捷入口：6 个内置预设、命令面板命令、右键菜单二级菜单
- Markdown 专用工具：generate_toc / format_table / validate_links / generate_mermaid
- 多模型切换：UI 选择器 + 持久化 + 切换不影响进行中会话
- 多会话管理：内存态多 session，每个 session 独立 Agent + transcript

**Non-Goals:**
- 不实现会话持久化到磁盘（窗口关闭清空，留给后续 phase）
- 不实现跨工作区 Agent（必须有 workspace 才能用工作区工具）
- 不实现 Agent skill 加载器（Pi 的 skills.ts 不迁移）
- 不引入新的远端 Provider（仍走已有 `ai-provider-refactor` 的 Provider）
- 不实现 Agent 协作 / 多 Agent 调度（v1 单 Agent）
- 不重写现有 7 个编辑器工具，只扩展工具集

## Decisions

### Decision 1: 工作区工具走 Tauri commands，不直接读 store

**选择**：每个工作区工具直接 `invoke('search_in_files', ...)` / `invoke('read_file', ...)`，路径参数做边界校验后才进入 invoke。

**替代方案**：
- 通过 `useWorkspaceStore` 间接读取 → store 是 UI 缓存，不是数据源，跨 session 调用容易拿到陈旧数据
- 直接走 `@tauri-apps/plugin-fs` → 绕过我们已有的命令封装，权限模型不一致

**理由**：保持与现有文件读写路径一致，复用已经过测试的命令；workspace 边界校验集中在 `workspaceGuard.ts`，逻辑可被任何工具复用。

### Decision 2: 工作区路径校验作为独立 module（workspaceGuard）

**选择**：实现 `assertInsideWorkspace(path: string): string`，返回规范化后的绝对路径，越界时抛出 Error。所有写/读工作区文件的工具开头都调用它。

**算法**：
1. 解析输入路径（如果是相对路径，相对于 `useWorkspaceStore.workspacePath`）
2. 规范化（去除 `..` / `.`）
3. 检查规范化后的路径是否以 workspace 根目录为前缀
4. 检查路径中是否包含符号链接逃逸（仅做警告，Tauri 命令本身有权限白名单兜底）

**理由**：path traversal 是工作区工具最大的安全风险，必须在工具入口（而非 Tauri 后端）就拦截，给出友好错误；同时方便测试。

### Decision 3: 权限模型用 pending confirmation 队列而不是 Pi beforeToolCall hook

**选择**：在工具的 `execute` 内部实现确认逻辑——当工具被注册为 `confirm` 时，向 `useAgentStore.pendingConfirmations` 推入一个 entry 并 await Promise，UI 上点击「同意」/「拒绝」时 resolve 该 Promise。

**替代方案**：
- 利用 Pi 的 `beforeToolCall` hook → Pi 当前接口未稳定暴露此 hook，且会阻塞整个 agent loop
- 直接在 toolRegistry 包装 → 注册期才决定的逻辑不便随会话变化

**理由**：
- 把确认放在 tool execute 内部，能精确等待用户决定
- pendingConfirmations 是 Store 状态，UI 完全靠状态驱动，无需额外事件通道
- 用户拒绝时，工具直接 `throw new Error('用户拒绝执行此操作')`，Pi Agent 会作为 tool error 反馈给模型，模型可以决策下一步

**示意流程**：
```
Tool.execute(args)
  → 检查 permission === 'confirm'
  → store.requestConfirmation({toolName, args, patchPreview?})
  → await user response (Promise)
  → 同意：执行真实逻辑；拒绝：throw
```

### Decision 4: Compaction 触发时机基于 token 估算 + Agent 事件钩子

**选择**：在 `markdownAgent.ts` 包装 streamFn，每次 prompt 前估算 transcript token 数，超过阈值（按模型 context window 80%）调用 Pi 的 `compactTranscript()`，把压缩后结果写回 Pi Agent 的 transcript。

**替代方案**：
- 等 Pi 自动溢出 → 当前 Pi vendored 版本未默认启用 compaction，需要手动接入
- 每轮都 compact → 性能浪费

**理由**：阈值触发既能保住大部分上下文，又避免每轮都跑压缩。token 估算用简化算法（字符数 / 4 + 消息开销），不需要精确 tokenizer。

**回退**：compaction 失败 / 报错时，截断到最近 20 条消息 + 系统提示词，避免 Agent 完全卡死。

### Decision 5: 预设模板纯 prompt 注入，不引入 DSL

**选择**：每个预设是 `{ id, label, icon, prompt: string, requiresSelection: boolean }`，触发时直接 `useAgentStore.startAgent(prompt)`。如果 `requiresSelection` 为 true 且当前无选区，UI 给出提示而不发送。

**替代方案**：
- 预设带固定 tool 调用顺序（DSL）→ 限制了 LLM 的灵活性，且后续维护成本高
- 预设是模板字符串 + 占位符 → 暂时不需要，简化为静态 prompt + 选区上下文由 `get_selection` 工具自取

**理由**：保持预设系统简单（数据驱动），让 Agent 用 prompt + 工具自行规划；后续如需更复杂的可再升级。

### Decision 6: 多会话用 sessions Map + activeSessionId

**选择**：`useAgentStore` 重构为：
```ts
sessions: Record<string, AgentSession>
activeSessionId: string
```
每个 `AgentSession` 内嵌 `agentInstance`、`messages`、`toolCalls`、`pendingPatches`、`pendingConfirmations`、`error`、`isRunning`。

**替代方案**：
- 仅一个全局 Agent，切换会话时 swap transcript → 与 Pi Agent 状态语义不符（subscribers 会丢失）
- 完全独立的 store-per-session → React 中难以管理生命周期

**理由**：Map 结构清晰，UI 只需 `useAgentStore(s => s.sessions[s.activeSessionId])` 即可获取当前会话状态；切换时不影响其他会话的 streaming。

**会话生命周期**：
- 新建：`createSession()` 返回新 sessionId 并设为 active
- 切换：`setActiveSession(id)`
- 删除：`deleteSession(id)` 同时 abort 该会话 Agent
- 默认：第一次使用时自动创建一个 default session

### Decision 7: 多模型切换通过 createMarkdownAgent 工厂参数注入

**选择**：`createMarkdownAgent({ modelId? })`，未指定时使用 `useAgentStore.activeModelId` → 不指定时使用 `aiConfig.activeProvider` 的默认模型。每个会话 Agent 在创建时绑定 modelId，切换 activeModelId 仅影响后续新会话/手动重建。

**替代方案**：
- 运行时切换并立即影响当前 Agent → 实现复杂（需要替换 streamFn 并保留 transcript）
- 完全在 UI 层硬切 → 状态不一致

**理由**：会话级别的模型绑定语义清晰；用户可通过「新建会话」感受切换效果，避免热切换带来的歧义。

### Decision 8: 右键菜单 / 命令面板通过事件总线触发预设

**选择**：定义 `agent:run-preset` CustomEvent，payload `{ presetId: string }`。AgentMode 组件监听该事件，自动切换到 Agent Tab + 注入预设 + 启动。命令面板和右键菜单通过 `dispatchEvent(new CustomEvent('agent:run-preset', { detail: { presetId: 'generate-toc' } }))` 触发。

**替代方案**：
- 直接 import `useAgentStore` → 命令面板 / context-menu 与 store 紧耦合，扩展性差
- 通过 props 传递 → React 树跨度大

**理由**：项目已有事件总线模式（`editor:insert` / `editor:replace-selection`），保持一致；解耦预设触发器与 Agent UI。

### Decision 9: Markdown 专用工具复用 patchProtocol，不直接修改文档

**选择**：`generate_toc` 等工具返回 MarkdownPatch（通常是 `insert_at_cursor` 或 `replace_selection` 类型），交给现有 Patch 流程预览/应用。

**理由**：与现有写工具语义一致，UI 不需新增组件；用户能在应用前看到效果。

## Risks / Trade-offs

| 风险 | 影响 | 缓解 |
|---|---|---|
| 工作区路径校验绕过（path traversal） | 高 — 可能读取/写入工作区外文件 | `workspaceGuard.assertInsideWorkspace` 强制通过；Tauri 后端权限白名单兜底；单元测试覆盖典型 traversal payload |
| 大文件读取导致 token 爆炸 | 中 — 一次读 1MB markdown 直接吃满 context | `read_workspace_file` 强制限制 200KB，超限提示 Agent 用 `search_workspace` 代替 |
| Compaction 失败破坏会话 | 中 — Agent 无法继续 | 失败回退到 truncate（保留最近 20 条 + 系统提示）；UI 提示用户压缩结果 |
| 多会话 Agent 实例泄漏 | 低 — 内存增长 | deleteSession 时调用 `agent.abort()` 并解除 subscriber；window unload 时 abort 全部 |
| 多模型切换与 Compaction 阈值不匹配 | 低 — 不同模型 context window 不同 | `tokenThresholdFor(modelId)` 函数按模型 context window × 0.8 计算 |
| 预设模板触发位置（编辑器/资源管理器/命令面板）行为不一致 | 中 — 用户困惑 | 预设触发统一通过 `agent:run-preset` 事件；AgentMode 是唯一处理者 |
| `confirm` 类工具阻塞 Agent 循环导致超时 | 中 — 用户离开屏幕 | pendingConfirmations 设 5 分钟超时，超时自动 reject；Pi Agent 整体也有 60s 单轮超时 |
| 工作区工具与 useWorkspaceStore 状态不一致（用户切换工作区） | 低 — 工具仍指向旧路径 | 每次工具执行时实时读取 `useWorkspaceStore.getState().workspacePath`，不缓存 |
| Markdown 工具（generate_toc 等）对极长文档性能 | 低 — 解析慢 | 工具内部限制最大处理长度 100KB，超出提示 Agent 分段处理 |
| 命令面板新增条目过多导致界面拥挤 | 低 — 用户难找 | 预设命令统一加 `Agent:` 前缀，并归到独立分组 |

## Migration Plan

本变更是 additive，迁移分两步：

1. **Phase A — 数据迁移**：
   - `useAgentStore` 旧字段（messages / toolCalls / pendingPatches / isRunning / error）仍兼容，但内部包装到 `sessions['default']` 中
   - 启动时如果检测到旧 store shape，自动迁移到 default session（用户无感知）
   - localStorage 不存储 store，故无需持久化迁移

2. **Phase B — UI 灰度**：
   - 新 UI（PresetBar / ModelSelector / SessionDrawer / ConfirmPanel）默认开启
   - 提供 `agent.experimentalFeatures` flag，用户可临时关闭（仅命令面板可控）

**回滚策略**：所有新代码集中在新文件 / 新函数中；如需回滚，恢复 `useAgentStore` 单会话版本即可，旧的 markdown-agent-mvp 行为保持不变。

## Open Questions

1. **会话持久化是否本阶段实现？** 当前定为 Non-Goal（内存态）。如果用户反馈强烈，下一阶段补充。
2. **预设模板是否允许用户自定义？** v1 内置 6 个；自定义留待后续，需要先确定存储格式（YAML/JSON）。
3. **多模型切换后是否同步切换默认 Provider 用于其他 AI 模式（chat/rewrite）？** 当前决定独立（避免 Agent 模式影响其他模式），后续可加联动开关。
4. **工作区工具是否要支持非 Markdown 文件读取（如配置文件）？** v1 限制为 `.md` / `.markdown`；如有需求再放开。
