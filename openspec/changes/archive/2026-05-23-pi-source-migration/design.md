## Context

Seven Markdown 正在集成 Pi Agent 框架以获得 Agent 能力（Tool Calling、agentLoop、上下文压缩等）。Pi 源码当前存放在 `.ext/pi/` 临时目录中（通过 vendor 方式复制），采用 monorepo 结构包含 4 个包（pi-ai、pi-agent-core、pi-coding-agent、pi-tui）。

我们只需要其中两个包的部分源码：`pi-ai`（LLM 调用层）和 `pi-agent-core`（Agent 运行时）。大量 Provider（anthropic/bedrock/google/mistral/azure）、Node-only 代码、CLI 工具、TUI 框架均不需要。

项目运行在 Tauri WebView（浏览器环境），不能使用 `node:fs`、`node:http` 等 Node API。

## Goals / Non-Goals

**Goals:**
- 将 Pi 必要源码裁剪迁移到 `src/lib/pi/`，纳入版本管理
- 仅保留 `openai-completions` Provider（兼容所有 OpenAI 格式 API）
- 移除所有 Node-only 依赖，确保在浏览器环境编译通过
- 配置 Vite alias 和 tsconfig paths，使 `@pi/ai` 和 `@pi/agent` 可正常 import
- 安装必要的第三方依赖（typebox、partial-json、yaml）
- 创建 `models-minimal.ts` 替代 416KB 的 `models.generated.ts`
- 删除 `.ext/pi/` 临时目录

**Non-Goals:**
- 不修改任何现有业务代码（aiService.ts、ChatMode.tsx 等保持不变）
- 不构建 Provider 层抽象（那是 Change 2 的事）
- 不实现 Agent 功能（那是 Change 3-4 的事）
- 不做运行时验证（只需编译通过 + 基本 import 测试）
- 不同步 Pi 上游最新代码（Pin 到当前 .ext/ 中的版本）

## Decisions

### Decision 1: 目标目录选择 `src/lib/pi/`

**选择**：`src/lib/pi/` 而非 `src/vendor/pi/` 或独立包

**理由**：
- `lib/` 语义明确表示"第三方库源码，由我们维护"
- 放在 `src/` 下可直接被 Vite 处理（TS 编译、tree-shaking）
- 不需要独立 `package.json`，减少构建复杂度

**备选**：
- `src/vendor/pi/` — 语义也可以，但 "vendor" 暗示不修改，而我们会裁剪
- 独立 workspace package — 过度工程，增加构建配置负担

### Decision 2: 只保留 openai-completions Provider

**选择**：从 15+ 个 Provider 中只保留 `openai-completions.ts`

**理由**：
- 所有 OpenAI 兼容 API（包括 DeepSeek、通义千问、Moonshot 等国产模型代理）都走 completions 接口
- Anthropic/Google/Bedrock 等可通过 API 代理网关以 OpenAI 格式访问
- 减少 ~90% 的 Provider 代码量和对应依赖（省去 @anthropic-ai/sdk、@aws-sdk 等）

**备选**：
- 保留 anthropic.ts — 需要额外安装 `@anthropic-ai/sdk`（~200KB），且用代理可替代
- 保留所有 Provider — 体积暴增，大量无用代码

### Decision 3: 用 models-minimal.ts 替代 models.generated.ts

**选择**：手写 <5KB 的精简模型定义

**理由**：
- `models.generated.ts` 有 416KB，包含数百个模型定义，大多数用不到
- 只需定义用户实际可能使用的模型（gpt-4o、gpt-4o-mini、claude-3.5-sonnet 等 ~10 个）
- 后续可通过用户自定义模型配置扩展

**备选**：
- 保留完整 generated 文件 — 416KB 源码，编译后仍然很大
- 动态加载 — 过度工程，模型定义本身就很简单

### Decision 4: 通过 Vite alias 引用而非相对路径

**选择**：配置 `@pi/ai` 和 `@pi/agent` 路径别名

**理由**：
- 应用层代码可以写 `import { stream } from '@pi/ai'`，清晰表达依赖关系
- 如果未来切换为 npm 包安装，只需改 alias 配置
- 避免 `../../lib/pi/ai/` 这样的深层相对路径

### Decision 5: process.env 通过 Vite define 消除

**选择**：在 `vite.config.ts` 中 `define: { 'process.env': '{}' }`

**理由**：
- Pi 源码中 `openai-completions.ts` 有 `process.env.OPENAI_API_KEY` 兜底逻辑
- 浏览器环境没有 `process`，需要在编译时替换为空对象
- 这样无需修改 Pi 源码中每一处 `process.env` 引用

**备选**：
- 逐个删除 process.env 引用 — 修改点多，后续同步上游更困难
- Vite 插件注入 polyfill — 过重

## Risks / Trade-offs

| 风险 | 影响 | 缓解措施 |
|---|---|---|
| Pi 源码裁剪后存在隐式依赖，编译报错 | 阻塞迁移 | 逐文件迁移，每添加一个文件就验证编译；保留 `.ext/pi/` 作为参考直到全部通过 |
| `openai-completions.ts` 内部引用了被删除的模块 | 运行时错误 | 仔细检查 import graph；裁剪后跑 `tsc --noEmit` 验证 |
| typebox 版本与 Pi 使用的不兼容 | 类型错误 | 使用 Pi package.json 中声明的确切版本 |
| 未来需要同步 Pi 上游 bugfix | 维护成本 | `src/lib/pi/README.md` 记录来源 commit hash；限制修改范围，便于 diff 对比 |
| `define: { 'process.env': '{}' }` 影响其他代码 | 副作用 | 检查项目中是否有其他 `process.env` 使用（Tauri 项目通常没有） |

## Migration Plan

1. **不需要数据迁移** — 本次只涉及源码文件操作
2. **回滚策略** — 如果迁移出问题，恢复 `.ext/pi/` 目录（Git 可追溯），删除 `src/lib/pi/`
3. **验证标准** — `npx tsc --noEmit` 通过 + `npx vite build` 无 Pi 相关错误

## Open Questions

- [ ] Pi 源码的 `openai` npm 包引用是仅 type-level（可 dev dependency）还是有运行时依赖？需要检查 import 方式
- [ ] `partial-json` 和 `yaml` 是否有更轻量的替代品（如果体积敏感）
