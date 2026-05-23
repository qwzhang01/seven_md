## Context

Seven Markdown 已完成 AI Provider 抽象层（`ai-provider-refactor`）和编辑器工具适配层（`editor-tool-adapter`）。Pi 源码已 vendor 到 `src/lib/pi/`，提供完整的 Agent 运行时（`Agent` 类、`agentLoop()`、事件系统、Session 管理）。

**当前状态：**
- `src/lib/pi/agent/` 导出 `Agent` 类：支持 `prompt()`、`abort()`、`subscribe()` 和完整的 `AgentEvent` 事件流
- `src/services/ai/agent/` 已有 7 个 EditorTool + toolRegistry + patchProtocol
- `src/services/ai/providers/piProvider.ts` 提供 Pi 兼容的 stream 函数
- `useAIStore` 当前 `AIMode = 'chat' | 'rewrite' | 'translate' | 'explain'`
- AI Panel 有 4 个 Tab 组件（ChatMode / RewriteMode / TranslateMode / ExplainMode）
- 事件系统已有 `editor:replace-selection`、`editor:insert` 可用于 Patch 应用

**约束：**
- Pi `Agent` 是有状态的：一个 Agent 实例管理自己的 transcript + tool 执行
- Agent 的 `subscribe()` 是推送式事件监听，不是 pull-based generator
- 写操作 Patch 需要用户确认后才能通过事件系统应用到 CodeMirror
- 现有 4 个 AI 模式（chat/rewrite/translate/explain）不能被影响

## Goals / Non-Goals

**Goals:**
- 创建 Markdown Agent 运行时：封装 Pi Agent 类，配置 stream 函数和工具
- 创建 useAgentStore：管理 Agent 生命周期、消息流、pending patches
- 实现事件映射：Pi AgentEvent → 应用层 MarkdownAgentEvent（便于 UI 消费）
- 构建 Agent Panel UI：对话输入、消息列表、工具调用日志、Diff 预览、应用/拒绝
- 实现 Patch 应用流程：用户确认 → 通过事件系统应用到 CodeMirror
- 支持 Agent 取消和超时
- 设计 Agent 系统提示词（Markdown 写作专用）

**Non-Goals:**
- 不实现工作区级别工具（search_workspace 等是 Phase 5）
- 不实现上下文压缩/Compaction（Phase 6）
- 不实现 Agent 预设模板/快捷命令（Phase 6）
- 不实现多模型动态切换 UI（Phase 6）
- 不实现会话持久化（Phase 6，本阶段只用内存）
- 不修改现有 4 个 AI 模式的实现

## Decisions

### Decision 1: 直接使用 Pi Agent 类的 subscribe 事件模型

**选择**：使用 `agent.subscribe((event) => {...})` 监听事件，将事件 dispatch 到 useAgentStore。

**替代方案**：
- 使用 `agentLoop()` 的 EventStream API → 需要手动管理更多底层细节（context 构建等）
- 自研事件循环 → 重复造轮子

**理由**：Pi `Agent` 类已经封装了完整的生命周期管理（prompt → loop → tool execution → abort），subscribe 模式与 React/Zustand 的事件驱动 UI 天然适配。Agent 类内部使用 `agentLoop()`，我们不需要直接调用。

### Decision 2: useAgentStore 独立于 useAIStore

**选择**：创建独立的 `useAgentStore`，不在 useAIStore 中混入 Agent 状态。

**替代方案**：
- 在 useAIStore 中扩展 Agent 字段 → 职责混乱，Store 过大
- 合并为统一 AI Store → 不利于未来拆分

**理由**：Agent 模式的状态（运行状态、tool call 日志、pending patches、消息历史）比现有 4 个模式复杂得多。独立 Store 职责清晰，且允许 Agent 和普通 AI 模式共存（例如切换回 chat 模式时 Agent 状态不丢失）。

### Decision 3: Agent 事件映射为扁平化 MarkdownAgentEvent

**选择**：定义应用层 `MarkdownAgentEvent` 类型，从 Pi 的 `AgentEvent` 映射。UI 组件只消费 `MarkdownAgentEvent`。

**替代方案**：
- UI 直接消费 Pi AgentEvent → 强耦合 Pi 内部类型，UI 需要了解 Pi 的 Message 结构
- 只存储最终结果 → 丢失中间状态（thinking、tool progress）

**理由**：解耦。未来如果替换 Agent 框架，只需修改 eventMapper。且 MarkdownAgentEvent 可以包含应用层独有的事件（如 `patch_ready`），不受 Pi 类型限制。

### Decision 4: Patch 确认流程放在 useAgentStore 中管理

**选择**：写操作工具返回 MarkdownPatch 后，Agent 事件映射层将其存入 `useAgentStore.pendingPatches`。UI 展示 Diff 预览，用户点击「应用」后从 Store 取出 Patch，dispatch 编辑器事件执行。

**替代方案**：
- 在 Tool 的 `execute` 中直接弹确认对话框 → 阻塞 Agent 循环，体验差
- Pi 的 `beforeToolCall` hook 拦截 → 将确认逻辑和 Agent 循环耦合

**理由**：Agent 循环应该快速完成（生成 Patch 描述），Patch 确认是异步的 UI 交互。将 Patch 暂存到 Store，Agent 继续运行（可能生成多个 Patch），用户在 Agent 完成后统一审阅和应用。

### Decision 5: Agent 通过 AI 配置获取 stream 函数

**选择**：`markdownAgent.ts` 读取 `src/services/ai/config.ts` 的配置（model/apiKey/baseURL），构造 Pi 的 `streamSimple` 调用作为 Agent 的 streamFn。

**替代方案**：
- 硬编码模型配置 → 不灵活
- 从 UI 每次传入 → 增加调用复杂度

**理由**：复用已有的 AI 配置管理（用户在设置页面配置的模型/API Key），Agent 只需读取即可。后续 Phase 6 支持多模型切换时，只需更新配置。

### Decision 6: Agent Panel 作为 AIPanel 的第 5 个 Tab

**选择**：在现有 AIPanel 的 Tab 系统中新增 `Agent` Tab，对应 `AIMode = 'agent'`。

**替代方案**：
- 独立的侧边栏面板 → 额外的布局复杂度
- 替换整个 AIPanel → 破坏现有功能

**理由**：保持 UI 一致性，用户在同一面板中切换 AI 模式。Agent 模式的输入区域和现有 Chat 模式类似（文本输入 + 发送），但展示区域更丰富（含 tool log + diff preview）。

## Risks / Trade-offs

| 风险 | 缓解措施 |
|---|---|
| Agent 循环可能超时（model 响应慢、多轮 tool call） | 设置 maxTurns=10 + AbortController 超时 60s；UI 提供取消按钮 |
| Patch 应用后 undo/redo 不连贯 | 本阶段通过 CodeMirror transaction 应用，天然支持 undo。标记好 annotation |
| Agent 生成的 Patch offset 与当前文档不匹配（用户在 Agent 运行时编辑了文档） | 应用 Patch 前校验 content hash；如果不匹配，提示用户重新生成 |
| Pi Agent 的 AgentMessage 类型与现有 AIMessage 不兼容 | Agent 模式使用独立的 useAgentStore.messages（Pi AgentMessage 类型），不与 useAIStore.messages 混用 |
| Diff 预览渲染大文档性能问题 | 对 replace_document 类型 Patch，只展示 diff 片段而非全文对比 |
| streaming 文字更新频繁导致 UI 卡顿 | 使用 requestAnimationFrame 节流 message_update 事件的 Store 更新 |
