## 1. 目录结构和依赖准备

- [x] 1.1 创建 `src/lib/pi/ai/` 目录结构（含 `providers/`、`utils/` 子目录）
- [x] 1.2 创建 `src/lib/pi/agent/` 目录结构（含 `harness/session/`、`harness/compaction/`、`harness/utils/` 子目录）
- [x] 1.3 安装 npm 依赖：`openai`、`typebox`、`partial-json`、`yaml`（使用 Pi package.json 中的版本）
- [x] 1.4 检查 `openai` 包是否需要安装（确认 Pi 源码对它的引用是 type-only 还是运行时）

## 2. 迁移 Pi AI 核心文件

- [x] 2.1 复制 `packages/ai/src/types.ts` → `src/lib/pi/ai/types.ts`
- [x] 2.2 复制 `packages/ai/src/stream.ts` → `src/lib/pi/ai/stream.ts`
- [x] 2.3 复制 `packages/ai/src/api-registry.ts` → `src/lib/pi/ai/api-registry.ts`
- [x] 2.4 复制 `packages/ai/src/models.ts` → `src/lib/pi/ai/models.ts`
- [x] 2.5 复制 `packages/ai/src/session-resources.ts` → `src/lib/pi/ai/session-resources.ts`

## 3. 迁移 Pi AI Providers（仅 openai-completions）

- [x] 3.1 复制 `packages/ai/src/providers/openai-completions.ts` → `src/lib/pi/ai/providers/openai-completions.ts`，删除 `process.env.OPENAI_API_KEY` 兜底逻辑
- [x] 3.2 复制 `packages/ai/src/providers/transform-messages.ts` → `src/lib/pi/ai/providers/transform-messages.ts`
- [x] 3.3 复制 `packages/ai/src/providers/simple-options.ts` → `src/lib/pi/ai/providers/simple-options.ts`

## 4. 迁移 Pi AI Utils

- [x] 4.1 复制 `packages/ai/src/utils/event-stream.ts` → `src/lib/pi/ai/utils/event-stream.ts`
- [x] 4.2 复制 `packages/ai/src/utils/json-parse.ts` → `src/lib/pi/ai/utils/json-parse.ts`
- [x] 4.3 复制 `packages/ai/src/utils/validation.ts` → `src/lib/pi/ai/utils/validation.ts`
- [x] 4.4 复制 `packages/ai/src/utils/overflow.ts` → `src/lib/pi/ai/utils/overflow.ts`
- [x] 4.5 复制 `packages/ai/src/utils/sanitize-unicode.ts` → `src/lib/pi/ai/utils/sanitize-unicode.ts`
- [x] 4.6 复制 `packages/ai/src/utils/typebox-helpers.ts` → `src/lib/pi/ai/utils/typebox-helpers.ts`

## 5. 创建 Pi AI 裁剪文件

- [x] 5.1 创建 `src/lib/pi/ai/models-minimal.ts`：定义 gpt-4o、gpt-4o-mini、claude-sonnet-4、claude-3.5-haiku 等常用模型（<5KB）
- [x] 5.2 创建 `src/lib/pi/ai/index.ts`：裁剪版导出（删除 image、oauth、bedrock 相关导出，删除 register-builtins 引用）
- [x] 5.3 验证 AI 模块编译通过：`npx tsc --noEmit` 无 `src/lib/pi/ai/` 相关错误

## 6. 迁移 Pi Agent 核心文件

- [x] 6.1 复制 `packages/agent/src/types.ts` → `src/lib/pi/agent/types.ts`
- [x] 6.2 复制 `packages/agent/src/agent.ts` → `src/lib/pi/agent/agent.ts`
- [x] 6.3 复制 `packages/agent/src/agent-loop.ts` → `src/lib/pi/agent/agent-loop.ts`
- [x] 6.4 复制 `packages/agent/src/proxy.ts` → `src/lib/pi/agent/proxy.ts`（可选，用于中转场景）

## 7. 迁移 Pi Agent Harness

- [x] 7.1 复制 `packages/agent/src/harness/types.ts` → `src/lib/pi/agent/harness/types.ts`
- [x] 7.2 复制 `packages/agent/src/harness/agent-harness.ts` → `src/lib/pi/agent/harness/agent-harness.ts`，保留 skills 引用（提供 stub）
- [x] 7.3 复制 `packages/agent/src/harness/messages.ts` → `src/lib/pi/agent/harness/messages.ts`
- [x] 7.4 复制 `packages/agent/src/harness/prompt-templates.ts` → `src/lib/pi/agent/harness/prompt-templates.ts`
- [x] 7.5 复制 `packages/agent/src/harness/system-prompt.ts` → `src/lib/pi/agent/harness/system-prompt.ts`
- [x] 7.6 复制 `packages/agent/src/harness/session/memory-repo.ts` → `src/lib/pi/agent/harness/session/memory-repo.ts`
- [x] 7.7 复制 `packages/agent/src/harness/session/memory-storage.ts` → `src/lib/pi/agent/harness/session/memory-storage.ts`
- [x] 7.8 复制 `packages/agent/src/harness/session/session.ts` → `src/lib/pi/agent/harness/session/session.ts`
- [x] 7.9 复制 `packages/agent/src/harness/session/uuid.ts` → `src/lib/pi/agent/harness/session/uuid.ts`
- [x] 7.10 复制 `packages/agent/src/harness/compaction/compaction.ts` → `src/lib/pi/agent/harness/compaction/compaction.ts`
- [x] 7.11 复制 `packages/agent/src/harness/compaction/branch-summarization.ts` → `src/lib/pi/agent/harness/compaction/branch-summarization.ts`
- [x] 7.12 复制 `packages/agent/src/harness/compaction/utils.ts` → `src/lib/pi/agent/harness/compaction/utils.ts`
- [x] 7.13 复制 `packages/agent/src/harness/utils/truncate.ts` → `src/lib/pi/agent/harness/utils/truncate.ts`

## 8. 创建 Pi Agent 裁剪文件

- [x] 8.1 创建 `src/lib/pi/agent/index.ts`：裁剪版导出（删除 node 子路径导出、jsonl-repo、skills、shell-output 导出）
- [x] 8.2 验证 Agent 模块编译通过：`npx tsc --noEmit` 无 `src/lib/pi/agent/` 相关错误

## 9. 构建配置

- [x] 9.1 修改 `vite.config.ts`：添加 `resolve.alias` 配置 `@pi/ai` → `src/lib/pi/ai`、`@pi/agent` → `src/lib/pi/agent`
- [x] 9.2 修改 `tsconfig.json`：添加 `paths` 映射 `@pi/ai` 和 `@pi/agent`；升级 target/lib 到 ES2022
- [x] 9.3 修改 `vite.config.ts`：添加 `define: { 'process.env': '{}' }` 消除 process.env 引用
- [x] 9.4 运行 `npx vite build` 验证整体构建通过

## 10. 文档和清理

- [x] 10.1 创建 `src/lib/pi/README.md`：记录来源仓库、commit hash、裁剪内容、维护说明
- [x] 10.2 删除 `.ext/pi/` 目录
- [x] 10.3 更新 `.gitignore`：移除 `.ext/` 相关规则
- [x] 10.4 最终验证：`npx tsc --noEmit` + `npx vite build` 全部通过
