## Why

标签页目前缺少右键上下文菜单，用户无法通过鼠标右键快速关闭标签或批量管理标签，与主流编辑器（VS Code、JetBrains、Sublime Text 等）的交互习惯不符，影响使用效率。

## What Changes

- 在标签栏的每个标签上添加右键上下文菜单（Context Menu）
- 菜单包含以下操作项：
  - **关闭** — 关闭当前右键点击的标签
  - **关闭其他** — 关闭除当前标签以外的所有标签
  - **关闭全部** — 关闭所有已打开的标签
  - **关闭左侧** — 关闭当前标签左侧的所有标签
  - **关闭右侧** — 关闭当前标签右侧的所有标签
- 关闭含未保存修改的标签时，复用现有的 DirtyTabDialog 确认流程
- 菜单项使用 lucide-react 图标，与现有上下文菜单风格保持一致

## Capabilities

### New Capabilities

- `tab-context-menu`: 标签页右键上下文菜单，提供关闭、关闭其他、关闭全部、关闭左侧、关闭右侧五个操作项

### Modified Capabilities

- `tab-management`: 新增批量关闭标签的逻辑（关闭其他、关闭全部、关闭左侧、关闭右侧），需扩展现有 tab 管理状态与操作
- `tab-bar-ui`: 标签栏 UI 需响应右键事件并渲染上下文菜单

## Impact

- **UI 组件**：TabBar 组件需监听 `onContextMenu` 事件，渲染新的 `TabContextMenu` 组件
- **状态管理**：workspace store（或 tab store）需新增 `closeOtherTabs`、`closeAllTabs`、`closeTabsToLeft`、`closeTabsToRight` 操作
- **复用**：脏标签关闭确认逻辑（DirtyTabDialog）直接复用，无需修改
- **依赖**：lucide-react（已有）、现有 context menu 样式系统
