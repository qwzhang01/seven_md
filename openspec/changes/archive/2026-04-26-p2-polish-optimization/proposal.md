## Why

P0 核心功能和 P1 功能完善已全部完成，Seven MD 的编辑器核心体验已达标。但仍有 7 项 P2 优化点未实现：侧边栏折叠逻辑缺失、片段面板模板不全、通知堆叠体验粗糙、主题切换无反馈、命令面板 emoji 图标不够专业、PDF 导出缺失、侧边栏宽度不可拖拽。这些细节直接影响用户对产品完成度的感知，需要统一收口。

## What Changes

- 侧边栏资源管理器添加"折叠全部"按钮的实际折叠逻辑（当前按钮存在但无功能）
- 片段面板新增 Mermaid 流程图和 API 文档两个常用模板
- 通知系统添加堆叠间距和最大显示数限制（当前多条通知可能堆叠溢出）
- 主题切换时显示通知反馈（当前切换无任何视觉确认）
- 命令面板图标从 emoji 替换为 Lucide 图标，提升专业感
- 新增 PDF 导出功能（HTML 导出已有，PDF 缺失）
- 侧边栏右边缘添加拖拽调整宽度功能（180-500px 范围）

## Capabilities

### New Capabilities

- `sidebar-collapse-all`: 侧边栏资源管理器的"折叠全部"功能逻辑
- `snippet-templates-extended`: 片段面板扩展模板（Mermaid 流程图 + API 文档）
- `notification-stack-limit`: 通知堆叠数量限制与间距优化
- `theme-switch-feedback`: 主题切换时的通知反馈
- `command-palette-lucide-icons`: 命令面板 Lucide 图标替换 emoji
- `pdf-export`: PDF 导出功能
- `sidebar-resize`: 侧边栏宽度拖拽调整

### Modified Capabilities

（无现有 spec 需要修改 — 以上均为新增能力）

## Impact

- **UI 组件**：`Sidebar.tsx`、`SnippetsPanel.tsx`、`NotificationContainer.tsx`、`ThemeMenu.tsx`、`CommandPalette.tsx`、`AppV2.tsx`
- **Rust 后端**：可能需要新增 PDF 导出相关命令（或前端使用 `window.print()` 方案）
- **依赖**：Lucide React 图标库已存在，无需新增依赖
- **用户体验**：所有变更均为增强，无破坏性改动
