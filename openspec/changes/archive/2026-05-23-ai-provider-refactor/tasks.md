## 1. 目录结构和类型定义

- [x] 1.1 创建 `src/services/ai/` 目录结构（`providers/`）
- [x] 1.2 创建 `src/services/ai/providers/types.ts`：定义 `AIProvider` 接口（`name`、`chat()`、`chatStream()`）和 `ChatOptions` 类型
- [x] 1.3 创建 `src/services/ai/types.ts`：定义 `AIServiceConfig` 扩展类型（新增 `provider` 字段）

## 2. 配置管理

- [x] 2.1 创建 `src/services/ai/config.ts`：实现 `getAIConfig()`、`setAIConfig()`、`isAIConfigured()` 函数，使用新 key `seven-markdown-ai-config`
- [x] 2.2 在 `config.ts` 中实现 `migrateConfigKey()`：从 `md-mate-ai-config` 迁移到 `seven-markdown-ai-config`，在首次 `getAIConfig()` 时自动执行
- [x] 2.3 验证配置迁移逻辑：旧 key 存在时自动迁移、新 key 已存在时不覆盖、迁移后删除旧 key

## 3. OpenAICompatibleProvider 实现

- [x] 3.1 创建 `src/services/ai/providers/openaiCompatible.ts`：实现 `OpenAICompatibleProvider` 类
- [x] 3.2 实现 `chat()` 方法：从 `aiService.ts` 的 `callAI()` 重构而来，保持相同的 fetch 逻辑
- [x] 3.3 实现 `chatStream()` 方法：使用 `fetch` + `stream: true` + SSE 解析，yield text delta
- [x] 3.4 实现错误处理：HTTP 错误抛出含 status 的描述性错误；未配置 apiKey 时抛出中文错误提示

## 4. PiProvider 实现

- [x] 4.1 创建 `src/services/ai/providers/piProvider.ts`：实现 `PiProvider` 类
- [x] 4.2 在构造函数中调用 `@pi/ai` 的 `registerApiProvider` 注册 openai-completions provider
- [x] 4.3 实现 `chatStream()` 方法：将 messages 和 config 传入 Pi 的 `stream()` 函数，yield text delta
- [x] 4.4 实现 `chat()` 方法：内部调用 `chatStream()` 收集完整响应返回
- [x] 4.5 实现 apiKey 和 baseURL 透传：从 AI 配置读取并传给 Pi stream options

## 5. Provider 注册表

- [x] 5.1 创建 `src/services/ai/providers/index.ts`：实现 `registerProvider()`、`getProvider()`、`getActiveProvider()` 函数
- [x] 5.2 在模块初始化时自动注册 `OpenAICompatibleProvider` 和 `PiProvider`
- [x] 5.3 `getActiveProvider()` 根据 `config.provider` 字段返回对应实例

## 6. Legacy 桥接层

- [x] 6.1 创建 `src/services/ai/legacy.ts`：导出 `aiChat`、`aiRewrite`、`aiTranslate`、`aiExplain` 函数，内部委托给 `getActiveProvider().chat()`
- [x] 6.2 修改系统提示词：所有 "MD Mate" → "Seven Markdown"
- [x] 6.3 保持旧函数签名完全不变（参数类型、返回类型）

## 7. 入口和迁移旧文件

- [x] 7.1 创建 `src/services/ai/index.ts`：统一导出 config、providers、legacy 函数
- [x] 7.2 修改 `src/services/aiService.ts`：改为从 `./ai/legacy` re-export 所有函数，添加 `@deprecated` 注释
- [x] 7.3 确保现有组件（ChatMode、RewriteMode、TranslateMode、ExplainMode）import 路径无需修改

## 8. 验证

- [x] 8.1 TypeScript 编译通过：`npx tsc --noEmit` 无 `src/services/ai/` 相关新增错误
- [x] 8.2 Vite 构建通过：`npx vite build` 成功
- [x] 8.3 手动验证 localStorage 迁移逻辑（模拟旧 key 存在场景）
- [x] 8.4 确认现有 4 个 AI 功能的调用链路不断裂（import 能解析、类型正确）
