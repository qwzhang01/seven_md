基于文档中的 Phase 划分和实际开发依赖关系，我建议分成 **5 个 OpenSpec Change** 来实施：

---

## Change 拆分方案

### Change 1: `pi-source-migration`
**范围**：第 2 节（源码迁移）+ Vite/TS 配置

**任务**：
- 创建 `src/lib/pi/` 目录结构
- 按映射表复制+裁剪文件
- 创建 `models-minimal.ts`
- 安装依赖（typebox、partial-json、yaml）
- 配置 Vite alias + tsconfig paths
- 验证编译通过
- 删除 `.ext/pi/`

**产出**：Pi 源码可在项目中正常 import

**预估**：1.5-2 天

---

### Change 2: `ai-provider-refactor`
**范围**：Phase 1 剩余部分（Provider 层 + 品牌统一）

**任务**：
- 创建 `src/services/ai/` 目录
- 定义 Provider 接口
- 迁移现有 `aiService.ts` → `OpenAICompatibleProvider`
- 创建 `PiProvider`（桥接 Pi openai-completions）
- 品牌名 "MD Mate" → "Seven Markdown"
- localStorage key 迁移
- `legacy.ts` 桥接层（确保现有功能不退化）

**产出**：AI 服务层重构完成，现有 4 个 AI 功能照常工作

**预估**：2 天

---

### Change 3: `editor-tool-adapter`
**范围**：Phase 2 完整内容

**任务**：
- 实现 7 个 Editor Tools（get_document / get_selection / replace_selection 等）
- 创建 `toolRegistry.ts`
- 创建 `markdownUtils.ts`
- 定义 Patch 协议

**产出**：工具层就绪，可被 Agent 调用

**预估**：2 天

---

### Change 4: `markdown-agent-mvp`
**范围**：Phase 3 + Phase 4 合并（UI + Agent Runtime）

**合并理由**：Agent Panel 和 Agent Runtime 强耦合——UI 需要消费 Agent 事件流，单独做 UI 没有数据源可联调。合在一起可以端到端验证。

**任务**：
- `useAgentStore.ts`
- `AgentMode.tsx` / `AgentToolCallLog.tsx` / `DiffPreview.tsx` / `PatchActions.tsx`
- `markdownAgent.ts`（对接 Pi agentLoop）
- Agent 系统提示词
- 事件映射（Pi → AgentEvent）
- Plan → Preview → Apply 完整流程
- 取消/超时机制

**产出**：MVP 可用——用户能在 Agent Tab 中对话，Agent 能读写文档并 diff 预览

**预估**：5-6 天

---

### Change 5: `workspace-and-advanced-agent`
**范围**：Phase 5 + Phase 6（可按需再拆）

**任务**：
- 工作区工具（search/read/create/list）
- 权限模型完善
- Compaction 接入
- Agent 预设模板
- 快捷键/右键菜单集成
- 多模型切换

**产出**：完整版 Agent 体验

**预估**：7-10 天（如果觉得太大，可以 5/6 分开）

---

## 总览

| # | Change 名 | 依赖 | 核心产出 | 工期 |
|---|---|---|---|---|
| 1 | `pi-source-migration` | 无 | Pi 源码可 import | 1.5-2d |
| 2 | `ai-provider-refactor` | ← 1 | Provider 层 + 品牌统一 | 2d |
| 3 | `editor-tool-adapter` | ← 2 | 工具层就绪 | 2d |
| 4 | `markdown-agent-mvp` | ← 3 | Agent 端到端可用 | 5-6d |
| 5 | `workspace-and-advanced-agent` | ← 4 | 完整版 | 7-10d |

**总计**：17-22 天，5 个 Change，每个都有明确可验证的交付物。

---

**建议**：先从 Change 1 开始，要不要我用 openspec-propose 生成第一个 Change 的完整提案？
