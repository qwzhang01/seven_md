## Why

Phase 2 的 AI Provider 抽象层（`ai-provider-refactor`）已完成，Seven Markdown 现在有了统一的 LLM 调用能力。但 Agent 还无法与编辑器交互——它不能读取当前文档、选区、标题大纲，也不能生成结构化 Patch 来修改文档内容。

本变更建立 **Editor Tool Adapter 层**：将编辑器状态和操作封装为符合 Pi `AgentTool` 接口的工具函数，并定义 Markdown Patch 协议，为 Phase 4 的 Markdown Agent 奠定工具基础。

## What Changes

- 创建 `src/services/ai/agent/` 目录，定义 Agent 工具层架构
- 实现 7 个 Editor Tools（4 个只读 + 3 个写操作），均符合 Pi `AgentTool` 接口（TypeBox schema + execute 函数）
- 创建 `toolRegistry.ts`：统一注册、查询、权限管理
- 定义 `MarkdownPatch` 协议：结构化描述文档修改（replace_selection / insert_at_cursor / replace_document / insert_after_heading / append_section）
- 创建 `src/utils/markdownUtils.ts`：Markdown 解析辅助（标题提取、位置计算等）
- 定义工具权限模型（auto / confirm / deny）

## Capabilities

### New Capabilities
- `editor-tool-adapter`: 编辑器工具适配层——将 useEditorStore / useFileStore 状态暴露为 AgentTool，并提供写操作工具（通过事件系统应用修改）
- `markdown-patch-protocol`: Markdown Patch 协议——定义结构化文档修改的类型、序列化格式和应用逻辑

### Modified Capabilities
（无现有 spec 需要修改）

## Impact

- **新增文件**：`src/services/ai/agent/types.ts`、`src/services/ai/agent/tools/editorTools.ts`、`src/services/ai/agent/tools/index.ts`、`src/services/ai/agent/toolRegistry.ts`、`src/services/ai/agent/patchProtocol.ts`、`src/utils/markdownUtils.ts`
- **依赖**：`@sinclair/typebox`（已安装）、`@pi/agent`（AgentTool 类型）
- **Store 读取**：`useEditorStore`（cursor/selection）、`useFileStore`（activeTab content/path）、`useAIStore`（selectedText）
- **事件系统**：写操作工具通过 `editor:replace-selection`、`editor:insert` 等已有事件应用修改
- **零 UI 变更**：本变更只建立工具层，不修改任何 UI 组件
