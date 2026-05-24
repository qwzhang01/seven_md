## Why

Phase 3 的 Editor Tool Adapter（`editor-tool-adapter`）已完成，Seven Markdown 现在拥有 7 个符合 Pi `AgentTool` 接口的编辑器工具和 MarkdownPatch 协议。但这些工具还没有「大脑」驱动——没有 Agent 运行时来调度工具、管理对话上下文、流式输出回复，也没有 UI 让用户与 Agent 交互。

本变更实现 **Markdown Agent MVP**：将 Pi 的 `Agent` 类 + 事件系统与 Seven Markdown 对接，创建 `useAgentStore` 管理 Agent 生命周期，并构建 Agent Panel UI（对话、工具调用日志、Diff 预览、应用/拒绝），实现端到端的 Plan → Preview → Apply 写作 Agent 体验。

## What Changes

- 创建 `src/services/ai/agent/markdownAgent.ts`：封装 Pi `Agent` 类，注入 stream 函数和工具列表，暴露 prompt/abort/subscribe 方法
- 创建 `src/services/ai/agent/prompts.ts`：Markdown Writing Agent 系统提示词
- 创建 `src/services/ai/agent/eventMapper.ts`：将 Pi 原生 `AgentEvent` 映射为应用层 `MarkdownAgentEvent`
- 创建 `src/stores/useAgentStore.ts`：Agent 专用 Zustand Store（运行状态、消息历史、pending patches、tool call 日志）
- 扩展 `useAIStore`：`AIMode` 新增 `'agent'` 选项
- 创建 Agent Panel UI 组件：`AgentMode.tsx`、`AgentToolCallLog.tsx`、`DiffPreview.tsx`、`PatchActions.tsx`
- 修改 `AIPanel.tsx`：新增 Agent Tab
- 实现 Patch 应用逻辑：通过 `editor:replace-selection` / `editor:insert` 事件将确认后的 Patch 应用到 CodeMirror
- 支持 Agent 取消（`agent.abort()`）和超时机制

## Capabilities

### New Capabilities
- `markdown-agent-runtime`: Markdown Agent 运行时——封装 Pi Agent 类，管理 Agent 生命周期（创建、prompt、abort、事件订阅），提供 stream 函数配置和工具注入
- `agent-panel-ui`: Agent Panel 交互界面——Agent Tab UI 组件（对话输入、消息列表、工具调用日志、Diff 预览、应用/拒绝操作）
- `agent-state-management`: Agent 状态管理——useAgentStore（运行状态、消息历史、pending patches、tool call 记录），以及 Patch 应用/拒绝流程

### Modified Capabilities
（无现有 spec 需要修改）

## Impact

- **新增文件**：
  - `src/services/ai/agent/markdownAgent.ts`（Agent 封装）
  - `src/services/ai/agent/prompts.ts`（系统提示词）
  - `src/services/ai/agent/eventMapper.ts`（事件映射）
  - `src/stores/useAgentStore.ts`（Agent Store）
  - `src/components/ai-panel/AgentMode.tsx`（Agent 模式主组件）
  - `src/components/ai-panel/AgentToolCallLog.tsx`（工具调用日志）
  - `src/components/ai-panel/DiffPreview.tsx`（Diff 预览）
  - `src/components/ai-panel/PatchActions.tsx`（应用/拒绝按钮）
- **修改文件**：
  - `src/stores/useAIStore.ts`（AIMode 扩展）
  - `src/components/ai-panel/AIPanel.tsx`（新增 Agent Tab）
  - `src/services/ai/agent/index.ts`（导出新模块）
- **依赖**：`@pi/agent`（Agent 类、AgentEvent）、`@pi/ai`（stream/streamSimple）、已有 `src/services/ai/agent/` 工具层
- **Store 交互**：useAgentStore 读取 useFileStore/useEditorStore 获取上下文；通过事件系统应用 Patch 到 CodeMirror
- **UI 变更**：AI Panel 新增第 5 个 Tab「Agent」
