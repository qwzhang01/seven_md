## Context

当前 AI 服务通过 `src/services/aiService.ts` 提供，使用原始 `fetch` 调用 OpenAI Chat Completions API：
- 配置存于 `localStorage`（key: `md-mate-ai-config`）
- 4 个功能：`aiChat`、`aiRewrite`、`aiTranslate`、`aiExplain`
- 非流式、无 tool calling 支持
- 被 `ChatMode.tsx`、`RewriteMode.tsx`、`TranslateMode.tsx`、`ExplainMode.tsx` 直接引用

Change 1（`pi-source-migration`）已将 Pi AI SDK 迁入 `src/lib/pi/ai/`，提供了成熟的流式 streaming、provider 注册表、tool calling 基础设施，但应用层尚未使用。

本次重构需要：建立中间层（`src/services/ai/`），让现有功能平滑切换到新架构，同时为后续 Agent 集成提供统一接口。

**约束：**
- 现有 4 个 AI Tab 功能必须零退化（用户无感）
- localStorage 数据自动迁移（不丢失配置）
- 不引入新 UI 组件（本次只重构服务层）
- 不引入新 npm 依赖

## Goals / Non-Goals

**Goals:**
- 定义统一的 `AIProvider` 接口（支持流式、非流式、tool calling）
- 实现 `OpenAICompatibleProvider`（从 aiService.ts 重构，保持现有行为）
- 实现 `PiProvider`（桥接 `@pi/ai` 的 `stream()` / `complete()`）
- 品牌名统一：`md-mate-ai-config` → `seven-markdown-ai-config`，提示词中 "MD Mate" → "Seven Markdown"
- 提供 `legacy.ts` 桥接层确保旧导出继续工作
- Provider 可通过配置切换（localStorage 中记录当前激活的 provider）

**Non-Goals:**
- 不改动 UI 组件代码（ChatMode 等继续调用旧的 `aiChat` 等函数）
- 不实现 Agent 模式（Change 4 负责）
- 不添加新的 AI 功能（仅重构现有功能的底层）
- 不实现多 Provider 并行或 fallback（单一激活 Provider）

## Decisions

### 决策 1: Provider 接口设计

**选择**: 定义 `AIProvider` 接口，包含 `chat()`（非流式）和 `chatStream()`（流式）两个方法

**理由**: 
- 非流式方法保持现有功能兼容（改写/翻译/解释只需最终结果）
- 流式方法为 ChatMode 和后续 Agent 提供增量输出
- 不合并为一个方法（如通过 options 切换），因为返回类型不同，TypeScript 推断更清晰

**替代方案**: 只提供流式方法，非流式通过收集完整流实现 → 增加了简单场景的复杂度，且对 rewrite/translate 等只需一次性返回的场景是过度设计

### 决策 2: Provider 注册和切换

**选择**: `src/services/ai/config.ts` 管理配置和当前 Provider 选择，通过 `getActiveProvider()` 返回实例

**理由**:
- 简单的工厂模式，不需要 DI 容器
- 配置项增加一个 `provider: 'openai-compatible' | 'pi'` 字段
- 默认值为 `'openai-compatible'`（保持向后兼容）
- 用户切换 Provider 时只需修改 localStorage 中的配置

### 决策 3: PiProvider 桥接策略

**选择**: `PiProvider` 在内部调用 `@pi/ai` 的 `registerApiProvider` 注册 openai-completions provider，然后通过 Pi 的 `stream()` / `complete()` 发起调用

**理由**:
- 复用 Pi 已有的 openai-completions 实现（1158 行成熟代码）
- 自动获得 streaming、token 计费、thinking 模式等能力
- Pi 的 `stream()` 接收 `apiKey` 参数，配合我们的配置管理即可工作

**替代方案**: 直接从 `openai-completions.ts` 提取代码放到自己的 Provider 中 → 会丢失 Pi provider registry 的好处，且后续 Agent 还是需要 Pi 的完整 stream 接口

### 决策 4: Legacy 桥接层

**选择**: `src/services/ai/legacy.ts` 导出与 `aiService.ts` 相同签名的函数，内部调用新 Provider；同时修改 `aiService.ts` 为 re-export from legacy

**理由**:
- 现有组件（ChatMode 等）import path 不变
- 渐进式迁移：组件可以逐步改为直接引用新服务层
- `aiService.ts` 保留但标记 `@deprecated`

### 决策 5: 配置迁移策略

**选择**: 在 `config.ts` 的 `getConfig()` 中执行一次性迁移 — 读取旧 key，写入新 key，删除旧 key

**理由**:
- 迁移逻辑集中在一处
- 应用启动时自动执行（lazy，首次调用 `getConfig()` 时）
- 无需额外的 migration manager

## Risks / Trade-offs

| 风险 | 缓解措施 |
|------|----------|
| PiProvider 内部注册 openai-completions 可能与未来 Agent 的注册冲突 | Pi 的 registry 是全局单例，首次注册后不会重复注册（`registerApiProvider` 会覆盖） |
| 现有 ChatMode 硬编码了 `max_tokens: 2000` 和 `temperature: 0.7` | 新 Provider 接口允许传入 options 覆盖，但 legacy 桥接层保持原有默认值不变 |
| localStorage 迁移在多标签页情况下可能竞争 | 使用 check-then-act（检查新 key 是否存在再迁移），幂等操作，竞争只会导致重复写入相同值 |
| Provider 切换后配置项不同（如 Pi 不需要 endpoint） | 配置 UI 根据 provider 类型动态展示字段（但 UI 改动放到后续 Change） |

## Open Questions

- ChatMode 是否应该在本次 Change 中改为流式输出？（倾向 No — 功能不变，仅重构底层；流式 UI 放到 Change 4）
- `PiProvider` 是否需要支持 `complete()`（非流式）？（倾向 Yes — 通过内部收集 stream 实现，简化使用方）
