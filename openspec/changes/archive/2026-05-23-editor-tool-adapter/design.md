## Context

Seven Markdown 的 AI 服务层已完成 Provider 抽象重构（`ai-provider-refactor`），Pi 源码也已 vendor 到 `src/lib/pi/`。下一步是让 Agent 能够感知和操作编辑器——这需要一个「工具适配层」将编辑器状态和操作封装为 Pi `AgentTool` 接口。

**当前状态：**
- `useEditorStore` 暴露 `content`、`cursorPosition`、`selection` 等编辑状态
- `useFileStore` 使用多标签页架构，通过 `getActiveTab()` 获取当前文件的 path/content
- `useAIStore` 暴露 `selectedText`
- 已有事件系统：`editor:replace-selection`、`editor:insert` 等
- `@pi/agent` 已 vendor 在 `src/lib/pi/agent/`，导出 `AgentTool` 类型
- `@sinclair/typebox` 已安装（用于 AgentTool schema 定义）

**约束：**
- 写操作工具不能直接操作 CodeMirror，必须通过事件系统中转
- 工具 execute 函数中可同步读取 Zustand Store（`getState()`）
- 所有修改类操作必须先生成 Patch 描述，等待 Phase 4 的确认机制

## Goals / Non-Goals

**Goals:**
- 定义符合 Pi `AgentTool` 接口的 7 个编辑器工具
- 定义 Markdown Patch 协议（结构化描述文档修改）
- 创建工具注册表（注册、查询、权限标记）
- 提供 Markdown 解析辅助函数（标题提取等）
- 为 Phase 4 Markdown Agent 提供完整的工具集

**Non-Goals:**
- 不实现 Agent 运行时或 agentLoop 对接（Phase 4）
- 不创建 UI 组件（AgentMode / DiffPreview 等是 Phase 4）
- 不实现工具确认弹窗（Phase 4 UI 层负责）
- 不实现工作区级别工具（search_workspace 等是 Phase 5）
- 不实现 Patch 的 apply/reject 逻辑（Phase 4）

## Decisions

### Decision 1: 工具 execute 通过 Zustand `getState()` 同步读取 Store

**选择**：在 AgentTool execute 函数中直接调用 `useFileStore.getState()` 等获取编辑器状态。

**替代方案**：
- 将状态作为 context 参数传入 → 增加调用方复杂度，且状态可能不是最新
- 通过事件请求/响应模式 → 过度工程化

**理由**：Zustand 的 `getState()` 是同步调用，不依赖 React 渲染周期，可在任意位置安全读取最新状态。这是最简洁的方式。

### Decision 2: 写操作工具生成 Patch 对象，不直接执行

**选择**：写操作工具（replace_selection、insert_at_cursor、replace_document）的 execute 返回 `MarkdownPatch` 对象，而非立即应用修改。

**替代方案**：
- 直接在 execute 中 dispatch 事件应用修改 → 绕过用户确认，不安全
- 返回布尔值表示成功/失败 → 丢失修改内容信息

**理由**：架构设计要求「所有修改先预览后应用」。工具层只负责生成 Patch 描述，Phase 4 的 Agent UI 负责展示 diff 并获取用户确认后再通过事件系统应用。

### Decision 3: 使用 TypeBox 定义工具参数 Schema

**选择**：使用 `@sinclair/typebox` 的 `Type.Object()` 定义每个工具的参数 schema。

**理由**：这是 Pi `AgentTool` 接口的标准要求。TypeBox 提供类型安全的 JSON Schema 生成，Pi 内部使用它做参数校验。

### Decision 4: 工具注册表采用简单 Map + 权限标记

**选择**：`toolRegistry.ts` 使用 `Map<string, RegisteredTool>` 存储工具，每个条目包含工具定义 + 权限级别。

**替代方案**：
- 使用 Pi 原生的工具注册（如果有） → Pi Agent 类直接接受 tools 数组，没有 registry 概念
- 基于装饰器注册 → 过度设计

**理由**：Phase 4 的 Agent 需要一个中心位置获取所有工具列表和权限信息。Map 足够简洁，后续 Phase 5 扩展工作区工具时也只需 `register()` 即可。

### Decision 5: Markdown 标题提取用正则而非 AST

**选择**：`markdownUtils.ts` 中的标题提取使用正则匹配（`/^(#{1,6})\s+(.+)$/gm`）。

**替代方案**：
- 使用 remark/unified 解析为 AST → 引入额外依赖，提取标题过于重量级
- 使用 CodeMirror 的语法树 → 需要 editor 实例引用，不适合在 service 层调用

**理由**：标题提取是简单需求，正则方案零依赖、性能好、易测试。对于 Markdown 标题的标准格式（ATX style）正则完全够用。

## Risks / Trade-offs

| 风险 | 缓解措施 |
|---|---|
| 写操作工具只返回 Patch 而不执行，Agent 可能误以为修改已生效 | 工具返回值中明确标记 `applied: false, requiresConfirmation: true` |
| `getState()` 在 Agent 多轮循环中可能读到过时状态 | Agent 每次需要最新状态时应重新调用 `get_current_document`，而非缓存 |
| 正则标题提取不覆盖 Setext 风格标题（`===`/`---`） | Phase 1 只支持 ATX 标题，后续按需扩展 |
| 工具权限模型在本阶段只是标记，真正的拦截在 Phase 4 | 标记好权限等级，Phase 4 读取后决定是否弹确认 |
