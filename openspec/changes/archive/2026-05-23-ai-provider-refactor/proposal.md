## Why

当前 AI 服务层 (`src/services/aiService.ts`) 是一个简单的 `fetch` 封装，存在以下问题：

1. **不支持流式响应** — 所有 AI 调用都是非流式的，用户体验差（需等待完整响应）
2. **无法桥接 Pi** — Change 1 已将 Pi 源码迁入 `src/lib/pi/`，但应用层仍未使用它。现有 `aiService.ts` 直接 fetch，无法利用 Pi 的 streaming、tool calling、provider 注册等能力
3. **品牌残留** — localStorage key 为 `md-mate-ai-config`，系统提示词中仍为 "MD Mate AI 助手"
4. **无抽象层** — 后续 Agent 需要一个统一的 Provider 接口来切换不同后端（直连 OpenAI、通过 Pi stream、本地模型等），当前架构无法扩展

本次重构建立 `src/services/ai/` 目录作为新的 AI 服务层，定义 Provider 接口，迁移现有功能到新架构，并桥接 Pi 的 `openai-completions` Provider，为后续 Agent 集成奠定基础。

## What Changes

- **新增** `src/services/ai/` 目录，包含 Provider 接口定义、配置管理、具体 Provider 实现
- **新增** `OpenAICompatibleProvider` — 从现有 `aiService.ts` 重构而来，保持现有功能
- **新增** `PiProvider` — 桥接 `@pi/ai` 的 `stream()` 函数，支持流式响应和 tool calling
- **新增** `src/services/ai/legacy.ts` — 桥接层，将旧的 `aiChat/aiRewrite/aiTranslate/aiExplain` 函数重定向到新 Provider，确保现有 4 个 AI 功能零退化
- **修改** localStorage key: `md-mate-ai-config` → `seven-markdown-ai-config`（含自动迁移）
- **修改** 系统提示词中 "MD Mate" → "Seven Markdown"
- **修改** `src/services/aiService.ts` — 标记 deprecated，内部委托给新服务层
- **修改** `src/stores/useAIStore.ts` — 适配新的配置 key

## Capabilities

### New Capabilities
- `ai-provider-abstraction`: AI Provider 抽象接口层 — 定义统一的 Provider 接口，支持流式/非流式、tool calling，以及 Provider 注册管理
- `pi-provider-bridge`: Pi Provider 桥接 — 将 `@pi/ai` 的 `stream()`/`complete()` 封装为标准 Provider 接口

### Modified Capabilities
- `ai-service-layer`: 配置存储 key 从 `md-mate-ai-config` 迁移为 `seven-markdown-ai-config`；所有系统提示词品牌名统一为 "Seven Markdown"；现有 4 个功能（chat/rewrite/translate/explain）通过 legacy 桥接层委托给新 Provider

## Impact

- **代码**：`src/services/aiService.ts` 标记 deprecated，新增 `src/services/ai/` 整个目录（~8 个文件）
- **依赖**：无新增 npm 依赖（Pi 已在 Change 1 中引入）
- **数据**：localStorage key 变更，需要自动迁移逻辑（读旧 key 写新 key）
- **UI**：本次不改动 UI 组件，所有变更对用户透明
- **向后兼容**：旧的 `aiService.ts` 导出的函数签名不变，内部实现切换到新架构
