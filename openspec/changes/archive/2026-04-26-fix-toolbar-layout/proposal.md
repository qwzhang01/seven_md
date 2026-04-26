## Why

当前 UI 布局存在两个问题：
1. **Toolbar 按钮位置分散**：命令面板、侧边栏切换、AI 助手三个按钮分散在不同位置（TitleBarActions 和 Toolbar），不符合用户期望的"与撤销/重做等按钮并排在 Toolbar 最右边"的设计
2. **TabBar 位置不当**：文件标签栏目前紧贴最上方，用户期望标签栏应该有一个合适的间距或与 TitleBar 有更好的视觉分隔

## What Changes

- **移动 Toolbar 右侧按钮**：将命令面板、侧边栏切换、AI 助手三个按钮从 TitleBarActions 移动到 Toolbar 最右边
- **按钮顺序**：命令面板 | 侧边栏切换 | AI（按此顺序从左到右排列）
- **移除 TitleBarActions**：删除 TitleBarActions.tsx 组件，因为其功能已合并到 Toolbar
- **调整 TitleBar 布局**：TitleBar 只保留 TabBar，不再包含操作按钮
- **调整 TabBar 视觉位置**：确保 TabBar 与标题栏有适当的视觉分隔

## Capabilities

### New Capabilities
- 无新增功能，只是 UI 布局调整

### Modified Capabilities
- `toolbar-system`：按钮布局变更，原 TitleBarActions 的按钮移入 Toolbar 右侧
- `tab-bar-ui`：TabBar 位置微调

## Impact

### 影响的代码
- `src/components/titlebar-v2/TitleBarActions.tsx`：删除
- `src/components/titlebar-v2/TitleBar.tsx`：移除 TitleBarActions 引用
- `src/components/toolbar-v2/Toolbar.tsx`：添加右侧操作按钮组
- `src/components/titlebar-v2/TabBar.tsx`：视觉位置调整

### 无影响范围
- 功能逻辑不变，只是 UI 重新布局
- 无 API 变更
- 无数据迁移
