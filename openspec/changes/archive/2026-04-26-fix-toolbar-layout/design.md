## Context

**当前布局：**
- `TitleBar`：包含 `TabBar` + `TitleBarActions`（命令面板、侧边栏切换按钮）
- `Toolbar`：独立的编辑工具栏（包含 AI 助手按钮）
- 两个区域分离，按钮功能分散

**问题：**
- 用户期望命令面板、侧边栏切换、AI 助手三个按钮与编辑按钮组并排在 Toolbar 最右边
- TabBar 当前紧贴顶部，缺少视觉分隔

## Goals / Non-Goals

**Goals:**
- 将命令面板、侧边栏切换、AI 助手按钮移动到 Toolbar 最右边
- 保持所有按钮功能不变
- 移除 TitleBarActions 组件

**Non-Goals:**
- 不改变按钮的图标、样式、交互行为
- 不修改功能逻辑
- 不改变 TabBar 的交互行为

## Decisions

### Decision 1: 合并按钮到 Toolbar

**选择：** 将 TitleBarActions 的按钮移动到 Toolbar 最右边，作为最后一个 ToolbarGroup

**理由：**
- 保持按钮的功能逻辑不变，只需移动位置
- Toolbar 已有良好的分组结构，易于添加新按钮组
- 减少组件数量，简化代码结构

### Decision 2: 按钮顺序

**选择：** 从左到右顺序为：命令面板 | 侧边栏切换 | AI

**理由：**
- 符合用户原型图的设计
- 命令面板（Ctrl+Shift+P）是最常用的全局操作，放在最左边
- AI 助手是特色功能，放在最右边便于识别

### Decision 3: 删除 TitleBarActions

**选择：** 完全移除 TitleBarActions.tsx 组件

**理由：**
- 该组件功能简单，移动到 Toolbar 后即可删除
- 减少维护成本

### Decision 4: TabBar 视觉调整

**选择：** 在 TitleBar 中保留 TabBar，但调整其样式确保与 macOS 交通灯有适当间距

**理由：**
- TabBar 需要在窗口拖动区域（data-tauri-drag-region）内
- macOS 交通灯按钮需要占用左侧空间
- 当前 TabBar 已正确使用 `flex-1` 占据中间空间

## Risks / Trade-offs

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| 按钮过多导致 Toolbar 拥挤 | 工具栏可能超出屏幕宽度 | 使用滚动或折叠（当前已有 overflow 处理） |
| 删除 TitleBarActions 影响现有功能 | 可能遗漏某些功能 | 仔细对比按钮功能，确保全部迁移 |
