## Why

`markdown-agent-mvp` 已交付端到端可用的 Markdown Writing Agent，但仍局限在「单文档 + 7 个编辑器工具」的范围内。要把 Seven Markdown 推向完整版 Agent 体验，还需要解决三类问题：(1) Agent 无法跨文件操作（搜索/读取/创建工作区文件）；(2) 长对话 token 溢出导致 Agent 半路失忆；(3) 缺少便捷入口（预设模板、快捷键、右键菜单）和模型切换能力。

本变更合并 Phase 5（工作区 Agent）和 Phase 6（高级 Agent 能力），一次性补齐工作区级工具、权限/安全模型、上下文压缩、预设模板、快捷入口、多模型切换六大块能力，让 Markdown Writing Agent 从 MVP 升级为完整版。

## What Changes

### 工作区工具（Phase 5）
- 新增 4 个工作区级 AgentTool：`search_workspace`、`read_workspace_file`、`create_markdown_file`、`list_workspace_files`，全部对接 Tauri 命令
- 扩展 `toolRegistry`，将工作区工具按风险等级注册（list/search 为 `auto`，read 为 `confirm`，create 为 `confirm` 且需展示预览）
- 扩展系统提示词（`MARKDOWN_AGENT_SYSTEM_PROMPT`），让 Agent 知道何时使用工作区工具
- 引入「工作区根目录」边界校验：所有路径必须在 `useWorkspaceStore.workspacePath` 下，否则工具直接报错

### Agent 权限模型（Phase 5）
- 引入显式的 `ToolPermission = 'auto' | 'confirm' | 'deny'` 模型，并在 `useAgentStore` 中实现 `pending tool calls` 状态，对 `confirm` 类工具弹出确认 UI
- 用户可在 Agent 设置中临时调整某个工具为 `auto`（仅当前会话有效）
- `deny` 工具直接被工具注册表拒绝，Agent 收到错误反馈

### 上下文压缩（Phase 6）
- 接入 Pi 的 `compaction` 模块：当 Agent transcript 超过阈值（默认 32K tokens 估算）时自动触发
- `useAgentStore` 暴露 `compactionInProgress` 状态，UI 在压缩时显示提示
- 失败时回退到只保留最近 N 条消息的截断策略（防止 Agent 卡死）

### 预设模板和快捷入口（Phase 6）
- 新增 `agentPresets.ts`：内置 6 个预设（整理结构 / 生成目录 / 扩写选区 / 草稿转正文 / 检查链接 / 生成 README），每个预设对应一段固定的 user prompt
- AgentMode UI 顶部新增「预设栏」（横向滚动，可点选预设直接发送）
- 集成到右键菜单（编辑器 + 资源管理器）和命令面板：通过新的 `agent:run-preset` 事件总线触发
- 选区相关预设默认会注入选中内容；非选区预设直接以预设 prompt 发送

### Markdown 专用工具（Phase 6）
- 新增 4 个 Markdown 工具：`generate_toc`、`format_markdown_table`、`validate_markdown_links`、`generate_mermaid`
- 这些工具都返回 `MarkdownPatch`（替换选区或插入），与现有写工具流程一致

### 多模型切换（Phase 6）
- AgentMode UI 顶部新增「模型选择器」下拉，列出已配置的 Provider/模型组合
- 切换后立即生效到下次 prompt（已运行中的 Agent 不受影响，由 Agent 实例隔离保障）
- `useAgentStore.activeModelId` 持久化到 localStorage，启动时恢复

### Agent 会话管理增强（Phase 6）
- `useAgentStore` 新增多会话支持：`sessions: Record<sessionId, AgentSession>`，每个会话有独立的 Agent 实例和消息历史
- AgentMode UI 增加「新建对话」「历史会话列表」入口（侧边小抽屉）
- 当前不持久化到磁盘（仍是内存态），仅在窗口生命周期内保留

## Capabilities

### New Capabilities
- `workspace-agent-tools`: 工作区级 AgentTool 集合（search/read/create/list），含工作区路径边界校验
- `agent-permission-model`: 工具权限模型与运行时确认流程（auto/confirm/deny + pending confirmations 状态机）
- `agent-compaction`: 长对话上下文压缩集成（接入 Pi compaction，失败回退到截断）
- `agent-presets`: Agent 预设模板（内置预设清单 + 注入选区上下文 + UI 入口）
- `agent-shortcuts`: Agent 快捷入口（右键菜单 / 命令面板 / `agent:run-preset` 事件总线）
- `markdown-agent-tools`: Markdown 专用 AgentTool（generate_toc / format_markdown_table / validate_markdown_links / generate_mermaid）
- `agent-model-switching`: Agent 运行时多模型切换（UI 选择器 + 持久化 + 会话隔离）
- `agent-session-management`: Agent 多会话管理（创建/切换/清除，内存态）

### Modified Capabilities
- `markdown-agent-runtime`: `createMarkdownAgent()` 新增 `modelId` 参数；接入 compaction；扩展系统提示词以涵盖工作区/Markdown 工具
- `agent-state-management`: `useAgentStore` 扩展多会话、pending confirmations、compaction 状态、activeModelId
- `agent-panel-ui`: AgentMode 新增预设栏、模型选择器、会话切换抽屉、确认面板
- `editor-tool-adapter`: `toolRegistry` 注册新工具（工作区 + Markdown 专用）；扩展权限分级；引入工作区路径校验工具

## Impact

- **新增文件**：
  - `src/services/ai/agent/tools/fileTools.ts`（工作区工具）
  - `src/services/ai/agent/tools/markdownTools.ts`（Markdown 专用工具）
  - `src/services/ai/agent/tools/workspaceGuard.ts`（路径边界校验）
  - `src/services/ai/agent/agentPresets.ts`（预设清单）
  - `src/services/ai/agent/compaction.ts`（接入 Pi compaction 的薄封装）
  - `src/services/ai/agent/permissionModel.ts`（权限模型常量与判定）
  - `src/components/ai-panel/AgentPresetBar.tsx`
  - `src/components/ai-panel/AgentModelSelector.tsx`
  - `src/components/ai-panel/AgentSessionDrawer.tsx`
  - `src/components/ai-panel/AgentConfirmPanel.tsx`
- **修改文件**：
  - `src/services/ai/agent/markdownAgent.ts`（注入 compaction、modelId）
  - `src/services/ai/agent/prompts.ts`（扩展工作区/Markdown 工具说明）
  - `src/services/ai/agent/toolRegistry.ts`（注册新工具 + 权限分级）
  - `src/services/ai/agent/eventMapper.ts`（新增 compaction、confirmation_required 事件映射）
  - `src/stores/useAgentStore.ts`（多会话 / pending confirmations / activeModelId / compaction 状态）
  - `src/components/ai-panel/AgentMode.tsx`（接入 PresetBar / ModelSelector / SessionDrawer / ConfirmPanel）
  - `src/components/CommandPalette.tsx`（新增 Agent 预设命令）
  - `src/components/context-menu/*`（编辑器和资源管理器右键菜单新增 "Run with Agent…" 子菜单）
- **依赖**：
  - 复用 `src/lib/pi/agent/harness/compaction/`（已 vendored）
  - 现有 Tauri 命令：`searchInFiles`、`readFile`、`createFile`、`readDirectory`
- **Store 交互**：
  - useAgentStore 读取 `useWorkspaceStore.workspacePath` 做边界校验
  - useAgentStore 通过 `useAIStore` 读取已配置的 Provider/模型清单
- **UI 变更**：
  - AI Panel 的 Agent Tab 增加 3 行新 UI：预设栏 / 模型选择器 / 会话抽屉触发
  - 命令面板新增 "Agent: 整理结构"、"Agent: 生成目录" 等命令
  - 右键菜单新增 "Run with Agent…" 二级菜单
- **风险**：
  - 工作区工具涉及文件 I/O，必须有严格的路径校验（防止 path traversal）
  - 多模型切换可能影响 token 计算，compaction 阈值要按模型动态调整
  - 多会话同时运行时的资源管理（abort 老会话以防泄漏）
