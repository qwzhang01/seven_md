## Why

当前 UI 布局中，文件标签栏（TabBar）位于窗口顶部，紧贴 macOS 交通灯按钮下方。但根据产品原型设计，TabBar 应该位于窗口底部，标题栏下方只保留操作按钮区域。这样可以实现更清晰的视觉层次：顶部是窗口控制区 + 编辑工具栏，底部是文件标签区。

## What Changes

- **TabBar 位置迁移**：将文件标签栏从窗口顶部（TitleBar 区域）移动到窗口底部
- **保留 TitleBar 功能**：交通灯按钮、操作按钮保持在顶部
- **底部 TabBar 样式**：底部 TabBar 保持与原顶部 TabBar 相同的交互功能（拖拽重排、未保存指示器、悬停关闭按钮等）
- **移除 TitleBarActions**：操作按钮（命令面板、侧边栏切换、AI 助手）整合到 Toolbar 右侧

## Capabilities

### New Capabilities
- `bottom-tab-bar`：新增底部标签栏能力，包含标签显示、拖拽重排、未保存指示器、悬停关闭等交互

### Modified Capabilities
- `tab-bar-ui`：现有标签栏 UI 需求变更，TabBar 位置从顶部改为底部
- `titlebar-system`：移除 TitleBarActions 相关需求（功能已整合到 Toolbar）

## Impact

### 影响的代码
- `src/components/titlebar-v2/TitleBar.tsx`：移除 TabBar 相关代码
- `src/components/titlebar-v2/TabBar.tsx`：移动到新位置或重新实现
- `src/components/titlebar-v2/TitleBarActions.tsx`：删除（按钮已整合）
- `src/components/toolbar-v2/Toolbar.tsx`：添加右侧操作按钮组
- `src/App.tsx`：调整布局结构

### 无影响范围
- 功能逻辑不变，只是 UI 重新布局
- 文件编辑、预览功能不受影响
- 无 API 变更
