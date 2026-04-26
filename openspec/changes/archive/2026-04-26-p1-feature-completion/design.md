## Context

Seven MD v1.0 的核心编辑框架已完成约 85%，5 个 P1 功能区域处于 UI 空壳或缺失状态。现有代码基础：

- **Help 菜单**：`HelpMenu.tsx`（20 行）6 个菜单项，4 个空壳。`MenuDropdown` 组件已有成熟的菜单项渲染逻辑。模态框系统 `useUIStore.modalType`/`ConfirmDialog` 已就绪可复用。
- **右键菜单**：`EditorContextMenu.tsx`（159 行）功能完整，`menuItems` 数组结构清晰易扩展。命令系统已注册 `edit.format` 但无监听者。
- **AI 助手**：`useAIStore`（89 行）状态结构完整（4 模式、selectedText）。4 个 Mode 组件均存在但 Rewrite/Translate/Explain 无交互逻辑。ChatMode 为 mock。项目无任何 AI 服务文件。
- **状态栏**：`StatusBar.tsx`（118 行）8 个按钮区域布局完整。`useEditorStore` 已有 `cursorPosition`/`fileEncoding`/`lineEnding`。Rust 后端无 `get_git_branch` 命令但可通过 Tauri shell 插件执行。
- **滚动同步**：`EditorPaneV2.tsx` 使用 CodeMirror `EditorView`，`PreviewPaneV2.tsx` 使用 `overflow-y-auto` div。两者完全独立滚动，无共享状态。

## Goals / Non-Goals

**Goals:**
- 实现 Help 菜单中"快捷键参考"和"关于"模态框
- 在右键菜单中添加"格式化文档"选项并实现基础 Markdown 格式化
- 建立 AI 服务抽象层，让改写/翻译/解释三模式可执行（支持可配置 API 端点）
- 状态栏所有按钮具备实际交互能力
- 实现编辑器到预览的基础滚动同步

**Non-Goals:**
- 不实现完整的欢迎页（暂用 notification 占位）
- 不实现自动更新检测功能（暂用 notification 占位）
- 不构建自有 AI 模型/后端——仅对接 OpenAI 兼容 API
- 不实现 heading 锚点级别的精确滚动映射（仅做比例同步）
- 不实现 Git 操作功能（仅读取分支名显示）

## Decisions

### Decision 1: Help 菜单使用独立模态框组件，复用现有 ConfirmDialog 模式

**选择**：创建 `ShortcutReferenceDialog` 和 `AboutDialog` 两个独立组件，通过 `useUIStore` 的 `modalType` 状态控制显示。

**替代方案**：使用通用 `Modal` 组件 + 动态内容 slot → 拒绝，因为快捷键参考是复杂的表格布局，通用 Modal 不够灵活。

**理由**：项目中 `ConfirmDialog` 已建立了模态框模式（固定 overlay + 居中面板 + ESC/overlay 关闭），新对话框复用相同模式可保持 UI 一致性。快捷键数据直接从 `useCommandStore` 读取，无需硬编码。

### Decision 2: Markdown 格式化使用轻量级内置实现，不引入外部库

**选择**：在 `EditorPaneV2.tsx` 中监听 `editor:format` 事件，实现简单的 Markdown 格式化规则（统一空行、修复列表缩进、去除尾部空格）。

**替代方案**：引入 `prettier` + `prettier/plugin-markdown` → 拒绝，因为 prettier 是重依赖（~2MB），且在 Tauri 桌面环境中引入打包体积问题。

**理由**：v1.0 阶段只需基础格式化（用户期望不高），后续可渐进式引入更完整的格式化器。格式化通过 CodeMirror 的 `view.dispatch` 直接替换文档内容，保证撤销栈完整。

### Decision 3: AI 服务层使用策略模式，支持可配置 API 端点

**选择**：创建 `src/services/aiService.ts`，定义 `AIServiceConfig` 接口（apiKey、endpoint、model），每种模式（chat/rewrite/translate/explain）实现为独立方法，返回统一的 `Promise<string>` 结果。

**替代方案 A**：直接在各 Mode 组件中调用 API → 拒绝，违反关注分离、不利于测试和配置管理。
**替代方案 B**：使用 Tauri Rust 后端代理 AI API 调用 → 拒绝，增加跨层复杂度，且 AI API 配置频繁变更不适合编译期绑定。

**理由**：策略模式允许在不修改 UI 组件的情况下切换 AI 提供商（OpenAI/Anthropic/本地模型）。配置通过 `localStorage` 持久化，后续可扩展为设置面板。编辑器选中文本通过 CodeMirror `view.state.selection` 获取并同步到 `useAIStore.selectedText`。

### Decision 4: 状态栏 Git 分支通过 Tauri shell 插件执行命令获取

**选择**：使用 `@tauri-apps/plugin-shell` 的 `Command.create('git', ['branch', '--show-current'])` 获取 Git 分支名，定时轮询（5 秒间隔）更新。

**替代方案**：在 Rust 后端新增专用命令 → 可行但不必要，shell 插件已在 Tauri v2 生态中成熟。

**理由**：仅需读取一行文本（分支名），不需要复杂的 Git 操作，shell 命令是最轻量的实现方式。轮询间隔 5 秒足够响应分支切换，不会产生性能负担。

### Decision 5: 滚动同步使用比例映射 + debounce，通过 useEditorStore 共享状态

**选择**：在 `EditorPaneV2` 中监听 CodeMirror scroll 事件，计算 `scrollTop / scrollHeight` 比例，通过 `useEditorStore.scrollPosition` 共享给 `PreviewPaneV2`。预览端根据自己的 `scrollHeight * ratio` 执行 `scrollTo()`。滚动事件使用 `requestAnimationFrame` debounce。

**替代方案**：source map 映射（Markdown 行号 → HTML 元素位置） → 拒绝，实现复杂且依赖 ReactMarkdown 内部结构。

**理由**：比例映射简单可靠，对长文档效果可接受。通过 `useEditorStore` 传递避免了 prop drilling。toggle 开关通过 `useEditorStore.scrollSyncEnabled` 控制，默认关闭，用户可在状态栏或视图菜单中开启。

## Risks / Trade-offs

- **[AI API 不可用]** → 降级处理：服务层捕获网络/API 错误，显示 notification 提示 "AI 服务暂时不可用"，UI 保持可用状态（不卡在 loading）。首次使用时如果未配置 API Key 显示引导提示。

- **[Markdown 格式化有损]** → 格式化前自动创建撤销点（CodeMirror transaction），用户可 Ctrl+Z 回退。格式化规则保守：只处理多余空行、尾部空格、列表缩进。

- **[滚动同步循环]** → 使用 `isExternalScroll` flag 防止 A→B→A 循环。编辑器滚动 → 设置 flag → 更新预览 scrollTop → 预览的 scroll 事件检查 flag 跳过。

- **[Git 分支读取在非 Git 目录下失败]** → shell 命令执行失败时静默降级，Git 分支显示为 '—'。

- **[大量快捷键渲染性能]** → 快捷键参考对话框从 `useCommandStore` 读取 59 个命令，使用虚拟化列表或分类 Tab 防止渲染性能问题。

## Open Questions

1. AI 服务的 API Key 存储位置：`localStorage` vs Tauri 的 secure storage？安全性 vs 实现复杂度权衡待定。
2. 滚动同步默认是否开启？当前设计为默认关闭，但用户可能期望默认开启。
3. 是否需要在 HelpMenu "关于" 中显示 Tauri/Rust 后端版本信息？需要额外的 IPC 调用获取。
