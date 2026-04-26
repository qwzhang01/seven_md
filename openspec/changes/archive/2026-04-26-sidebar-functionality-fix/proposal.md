## Why

Seven Markdown 的侧边栏功能在规范中已有明确定义（activity-bar、sidebar-resize、sidebar-explorer 等 spec），但当前实现存在三个交互层面的缺陷：

1. **活动栏点击行为不完整**：规范要求再次点击已激活图标应收起侧边栏，但当前实现仅切换面板内容
2. **侧边栏宽度拖拽未实现**：规范定义了完整的 resize 交互（含最小/最大限制、双击重置），但组件缺少 resize handle
3. **资源管理器操作按钮缺失**：规范要求悬停节标题时显示新建/刷新/折叠按钮，但未在组件中实现

这些问题影响用户工作流效率，需要尽快修复。

## What Changes

### Activity Bar 交互修复
- 修复 `ActivityBar.tsx` 的 `onClick` 逻辑：再次点击已激活图标时调用 `setSidebarCollapsed(true)` 收起侧边栏

### Sidebar Resize 功能补全
- 在 `Sidebar` 组件右边缘添加 resize handle（4px 可拖拽区域）
- 实现 `mousedown` → `mousemove` → `mouseup` 拖拽交互
- 添加 `useUIStore.sidebarWidth` 持久化存储
- 限制宽度范围：最小 180px，最大 500px
- 双击 handle 恢复默认宽度 240px

### Explorer Panel 操作按钮实现
- 在节标题区域添加悬停显示的操作按钮组：
  - 📄 新建文件 (New File)
  - 📁 新建文件夹 (New Folder)
  - 🔄 刷新 (Refresh)
  - 📂 折叠全部 (Collapse All)

## Capabilities

### New Capabilities
无新增 capabilities，本次修复基于已有 spec 补全实现。

### Modified Capabilities
- `activity-bar`：修复规范中的"点击已激活图标收起侧边栏"行为（已在 spec.md 第 38-41 行定义，但实现未遵循）
- `sidebar-resize`：实现规范中定义的 resize handle 和交互（spec.md 第 3-28 行）
- `sidebar-explorer`：实现规范中定义的悬停操作按钮（spec.md 第 52-67 行）

## Impact

### 受影响代码
- `src/components/sidebar/ActivityBar.tsx` — onClick 逻辑修复
- `src/components/sidebar/Sidebar.tsx` — 添加 resize handle
- `src/components/sidebar/ExplorerPanel.tsx` — 添加操作按钮

### 涉及 Store
- `useUIStore` — 新增/更新 `sidebarWidth` 状态

### 依赖
- 无新增外部依赖
- 使用原生 mouse 事件实现拖拽
