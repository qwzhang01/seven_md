## Context

Seven MD 是一个基于 Tauri + React + CodeMirror 6 的 Markdown 桌面编辑器。P0 核心功能（键盘快捷键、文件系统、Tab 缩进）和 P1 功能（Help 菜单、格式化、AI 增强、状态栏、滚动同步）已全部完成。

当前剩余 7 项 P2 优化，涉及 6 个 UI 组件和 1 个导出功能。这些优化分布在侧边栏、片段面板、通知系统、主题系统、命令面板、导出和布局 7 个独立模块中，互不耦合，可并行开发。

**技术栈约束**：React 18 + Zustand + Lucide React + Tailwind CSS + Tauri + CodeMirror 6

## Goals / Non-Goals

**Goals:**
- 侧边栏"折叠全部"按钮实际生效
- 片段面板补齐 Mermaid 和 API 文档模板
- 通知堆叠体验优化（间距 + 最大数量限制）
- 主题切换提供视觉反馈通知
- 命令面板图标专业化（emoji → Lucide）
- 新增 PDF 导出能力
- 侧边栏宽度可拖拽调整（180-500px）

**Non-Goals:**
- 不涉及编辑器核心逻辑变更
- 不涉及 AI 服务层变更
- 不涉及新增主题
- 不涉及国际化实现（仅预留接口）

## Decisions

### D1: PDF 导出方案 — `window.print()` 前端方案

**选择**：使用前端 `window.print()` + CSS `@media print` 样式方案，而非 Rust 后端 `wkhtmltopdf`。

**理由**：
- 无需新增系统级依赖（wkhtmltopdf 需要用户安装）
- `window.print()` 跨平台一致性，macOS/Linux/Windows 均支持
- 可通过 CSS `@media print` 精确控制打印样式
- 用户可通过系统打印对话框选择"另存为 PDF"或直接打印

**替代方案**：Tauri 后端调用 `wkhtmltopdf` 二进制 — 需要打包额外 40MB+ 依赖，安装体验差，放弃。

### D2: 侧边栏拖拽 — 复用 Gutter 组件模式

**选择**：参考现有 `Gutter.tsx` 的拖拽实现模式，在 Sidebar 右边缘添加 resize handle。

**理由**：
- Gutter 已有成熟的拖拽逻辑（mousedown/mousemove/mouseup + requestAnimationFrame）
- 宽度存储在 `useUIStore.sidebarWidth`（已有），无需新增 store 字段
- 180-500px 限制通过 `Math.min/Math.max` clamp 即可

### D3: 通知堆叠限制 — 最大 5 条 + 新旧替换

**选择**：最大同时显示 5 条通知，超出时移除最早的通知（FIFO）。

**理由**：
- 5 条是 VS Code 等编辑器的常见上限
- FIFO 替换最直觉，用户不会丢失最新通知
- 通过 `useNotificationStore` 的 `notifications` 数组长度判断即可

### D4: 命令面板图标 — Lucide 映射表

**选择**：在 `commands/index.ts` 中为每个命令新增 `icon` 字段（Lucide 组件名），CommandPalette 渲染时通过映射表渲染 Lucide 图标。

**理由**：
- Lucide React 已是项目依赖
- 图标映射比逐个 import 更易维护
- 降级方案：无 icon 字段时仍显示原有 emoji

## Risks / Trade-offs

- **[PDF 质量]** `window.print()` 生成的 PDF 依赖浏览器渲染引擎和用户打印设置，无法保证 100% 一致性 → 通过 `@media print` CSS 尽量控制，并在 UI 中提示"使用系统打印对话框导出"
- **[侧边栏拖拽与 Gutter 冲突]** 侧边栏右侧 resize handle 与内容区 Gutter 在视觉上可能混淆 → 使用不同的 cursor 样式（`col-resize` vs `row-resize`）和 hover 颜色区分
- **[通知替换时机]** FIFO 替换可能在用户正在阅读某条通知时将其移除 → 被 hover 暂停的通知不参与 FIFO 替换
