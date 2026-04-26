## Why

Seven MD 的核心框架和主要 UI 组件已经就绪（完成度约 85%），但有 5 个 P1 功能区域处于"UI 空壳"或"完全缺失"状态，影响产品可用性：

1. **Help 菜单空壳**：`HelpMenu.tsx` 注册了 6 个菜单项，但 "欢迎页"、"快捷键参考"、"关于 Seven MD"、"检查更新" 4 项的 action 仅调用 `onClose()`，没有弹出任何对话框或页面。用户无法查看快捷键总表或应用版本信息。

2. **右键菜单缺少"格式化文档"**：v1.0 交互说明要求右键菜单包含"格式化文档"选项，`EditorContextMenu.tsx` 中不存在该项。虽然命令系统已注册 `edit.format` 并 dispatch `editor:format` 事件，但**无 UI 入口、无事件监听者、无实际格式化逻辑**。

3. **AI 助手三模式空壳**：`useAIStore` 已定义完整的状态结构（4 模式、selectedText、loading/error），但改写（RewriteMode）、翻译（TranslateMode）、解释（ExplainMode）三个组件是**纯 UI 空壳**——"应用改写"/"应用翻译"按钮无 `onClick`、解释模式甚至缺少触发按钮、所有模式无 AI 后端调用。Chat 模式为 mock 回复（硬编码 5 条随机回复 + 10% 概率错误模拟）。整个项目无 AI 服务层文件。

4. **状态栏功能缺失**：`StatusBar.tsx` 有完整的 UI 布局（8 个按钮区域），但 Git 分支名硬编码为 `'main'`（props 默认值，无 Tauri 后端调用），同步状态硬编码为 `false`，行号/编码/换行符按钮均无 `onClick`（仅通知铃铛有实际交互）。v1.0 要求：点击行号可跳转、点击编码可切换、Git 分支应从后端读取真实值。

5. **编辑器-预览滚动同步缺失**：`EditorPaneV2.tsx` 和 `PreviewPaneV2.tsx` 完全独立滚动，无任何同步逻辑。Spec 文档明确标记为 "future feature toggle"。当前编辑长文档时，用户在编辑器中的位置无法反映在预览中。

这 5 个功能是 v1.0 交互说明中明确要求的，补齐后产品完成度将从 85% 提升至 95%+。

## What Changes

- **Help 菜单功能实现**：创建"快捷键参考"模态框（快捷键总表）和"关于 Seven MD"模态框（版本、许可证、技术栈）；"欢迎页"和"检查更新"先显示 notification 提示"功能开发中"
- **右键菜单补全"格式化文档"**：在 `EditorContextMenu.tsx` 的 `menuItems` 中添加"格式化文档"选项，并在 `EditorPaneV2.tsx` 中实现 `editor:format` 事件监听（Markdown 格式化：统一空行、修复列表缩进等）
- **AI 助手功能增强**：创建 `src/services/aiService.ts` 抽象层，实现改写/翻译/解释三模式的执行流程（selectedText → AI 调用 → 结果展示 → "应用"替换编辑器内容），Chat 模式替换 mock 为真实 API 调用；实现编辑器选中文本同步到 `useAIStore.selectedText`
- **状态栏功能补齐**：Git 分支通过 Tauri 后端 `git branch --show-current` 读取真实值；行号按钮点击弹出跳转对话框；编码/换行符按钮点击弹出切换菜单
- **编辑器-预览滚动同步**：实现按比例滚动同步（编辑器 scrollTop 百分比 → 预览 scrollTop 映射），通过 `useEditorStore` 共享滚动位置，提供 toggle 开关

## Capabilities

### New Capabilities
- `help-menu-dialogs`: Help 菜单模态框实现（快捷键参考总表 + 关于信息 + 占位通知）
- `context-menu-format`: 右键菜单"格式化文档"功能（UI 入口 + 格式化逻辑 + 事件监听）
- `ai-service-layer`: AI 助手服务层（API 抽象 + 改写/翻译/解释执行流程 + 编辑器选中文本同步）
- `statusbar-interactions`: 状态栏交互功能（Git 分支真实读取 + 按钮点击行为 + 跳转/切换菜单）
- `scroll-sync`: 编辑器-预览滚动同步（比例映射 + toggle 开关 + 状态共享）

### Modified Capabilities
（无已有 spec 需要修改）

## Impact

- **新增文件**：
  - `src/services/aiService.ts` — AI 服务抽象层
  - `src/components/dialogs/ShortcutReferenceDialog.tsx` — 快捷键参考模态框
  - `src/components/dialogs/AboutDialog.tsx` — 关于模态框
  - `src/hooks/useScrollSync.ts` — 滚动同步 hook
- **修改文件**：
  - `src/components/menubar-v2/menus/HelpMenu.tsx` — 连接模态框
  - `src/components/editor-v2/EditorContextMenu.tsx` — 添加格式化文档菜单项
  - `src/components/editor-v2/EditorPaneV2.tsx` — 格式化事件监听 + 滚动同步 + 选中文本同步
  - `src/components/editor-v2/PreviewPaneV2.tsx` — 滚动同步接收端
  - `src/components/ai-panel/RewriteMode.tsx` — 接入 AI 服务层
  - `src/components/ai-panel/TranslateMode.tsx` — 接入 AI 服务层
  - `src/components/ai-panel/ExplainMode.tsx` — 接入 AI 服务层 + 添加触发按钮
  - `src/components/ai-panel/ChatMode.tsx` — 替换 mock 为真实 API
  - `src/components/statusbar-v2/StatusBar.tsx` — 添加点击交互 + Git 分支真实读取
  - `src/stores/useEditorStore.ts` — 添加 scrollSync 状态
  - `src/stores/useAIStore.ts` — 可能扩展 AI 配置字段
- **后端依赖**：需在 Rust 后端新增 `get_git_branch` 命令（或在现有命令中扩展）
- **外部依赖**：AI 服务层需要 OpenAI/兼容 API 的接入点配置（API Key、Endpoint），可通过环境变量或设置面板配置
- **风险**：AI 功能依赖外部 API，需考虑网络不可用时的降级处理；滚动同步在大文档中可能有性能影响
