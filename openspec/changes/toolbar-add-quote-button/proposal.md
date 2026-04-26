## Why

根据交互规范，工具栏的"其他"分组中应包含"引用"按钮，用于快速插入 Markdown 引用语法（`> `）。当前工具栏缺少该按钮，影响功能完整性和用户编辑效率。

## What Changes

- 在工具栏"其他"分组中添加引用（Quote）按钮
- 按钮使用 Lucide React 的 `Quote` 图标
- 点击行为：在当前行首插入 `> `，或有选中文本时包裹为引用格式
- 与其他格式按钮保持一致的悬停 Tooltip 显示
- 按钮位置：在"水平线"按钮之前

## Capabilities

### New Capabilities

- `toolbar-quote-button`: 工具栏引用按钮功能

### Modified Capabilities

- `editor-toolbar`: 扩展工具栏按钮列表

## Impact

- 修改文件：`src/components/toolbar-v2/Toolbar.tsx`
- 修改文件：`src/commands/index.ts`（添加对应命令）
- 无需修改规范文档（属于实现细节完善）
