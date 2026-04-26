## Context

Seven Markdown 的正式品牌名称为 **"Seven Markdown"**，Slogan 为 **"Write Markdown Like Code"**。当前实现中有多处使用历史遗留的简称 "Seven MD"，违反了品牌一致性原则。

需要修改的文件：
- `src/components/dialogs/AboutDialog.tsx` — About 对话框
- `src-tauri/src/main.rs` — Tauri 原生菜单

## Goals / Non-Goals

**Goals:**
- 将所有 "Seven MD" 替换为 "Seven Markdown"
- 在 About 对话框中添加 Slogan "Write Markdown Like Code"
- 将 About 对话框中的 📝 Emoji 替换为 ME Logo 图标

**Non-Goals:**
- 不涉及应用图标（src-tauri/icons/）的修改
- 不涉及窗口标题的修改
- 不涉及其他 UI 组件的品牌名称修改

## Decisions

### 1. About 对话框文本替换

**选项 A：直接文本替换（采用）**
- 将 `AboutDialog.tsx` 中的 "Seven MD" 替换为 "Seven Markdown"
- 简单直接，风险低

**选项 B：抽取为常量**
- 创建 `src/constants/app.ts` 存放 APP_NAME, APP_SLOGAN 等常量
- 过度工程化，暂不采用

### 2. ME Logo 图标实现

**选项 A：使用 SVG 内联（采用）**
- 在 `AboutDialog.tsx` 中直接嵌入 ME Logo 的 SVG 代码
- 蓝紫渐变色，符合品牌色
- 不增加额外依赖

**选项 B：使用外部图片**
- 需要处理图片路径和打包问题
- 增加复杂度，暂不采用

## Risks / Trade-offs

- **风险**：ME Logo SVG 代码较长，可能影响组件可读性
  - **缓解**：SVG 代码作为常量抽取到组件顶部，保持 JSX 结构清晰

## Open Questions

- 无
