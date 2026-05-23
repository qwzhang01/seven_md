## Why

当前 Pi Agent 框架源码暂存于 `.ext/pi/` 临时目录（未纳入版本管理），后续 Agent 集成的所有 Phase 都依赖这些源码。需要将必要的 Pi 源码裁剪后迁移到 `src/lib/pi/` 作为项目自有模块，为后续 AI Provider 重构和 Agent 开发奠定基础。

迁移越早完成，越早能删除 `.ext/` 临时目录，减少仓库混乱度。

## What Changes

- **新增** `src/lib/pi/ai/` — 从 `.ext/pi/packages/ai/src/` 裁剪迁移 LLM 调用层源码（只保留 openai-completions Provider）
- **新增** `src/lib/pi/agent/` — 从 `.ext/pi/packages/agent/src/` 裁剪迁移 Agent 运行时源码（Agent 类、agentLoop、Session、Compaction）
- **新增** `src/lib/pi/ai/models-minimal.ts` — 替代 416KB 的 `models.generated.ts`，只定义实际用到的模型
- **新增** npm 依赖：`@sinclair/typebox`、`partial-json`、`yaml`
- **修改** `vite.config.ts` — 添加 `@pi/ai` 和 `@pi/agent` 路径别名
- **修改** `tsconfig.json` — 添加 paths 映射
- **删除** `.ext/pi/` 临时目录
- **删除** 不需要的 Provider（anthropic、bedrock、google、mistral、azure、cloudflare）
- **删除** Node-only 代码（env-api-keys、node-http-proxy、harness/env/nodejs 等）

## Capabilities

### New Capabilities
- `pi-vendor-ai`: Pi AI 层 vendor 源码（LLM 调用、流处理、Provider 注册、模型注册），裁剪为仅 openai-completions 的浏览器兼容版本
- `pi-vendor-agent`: Pi Agent 层 vendor 源码（Agent 类、agentLoop、InMemory Session、上下文压缩），裁剪为浏览器兼容版本

### Modified Capabilities
<!-- 无需修改现有 spec 的行为要求，本次只是引入源码基础设施 -->

## Impact

- **代码**：新增 `src/lib/pi/` 目录（约 25-30 个文件），删除 `.ext/pi/`（数百个文件）
- **依赖**：新增 3 个 npm 包（`@sinclair/typebox`、`partial-json`、`yaml`），总增量 ~40KB gzipped
- **构建**：Vite 需要正确解析 `@pi/*` alias，tsconfig 需要对应 paths
- **现有功能**：零影响 — 本次仅迁移源码并验证编译通过，不修改任何现有业务代码
- **后续依赖**：Change 2 (`ai-provider-refactor`) 将基于此 vendor 源码构建 Provider 层
