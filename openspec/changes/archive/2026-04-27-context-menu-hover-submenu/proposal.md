## Why

编辑器右键菜单中的"插入"子菜单当前需要点击才能展开，不符合交互规范中"鼠标移入'插入'项时展开子菜单"的要求。VS Code 等主流编辑器均支持 hover 展开子菜单的交互方式，提供更流畅的操作体验。

## What Changes

- 增强 `EditorContextMenu.tsx` 中的"插入"子菜单
- 添加 `onMouseEnter` 事件监听，当鼠标移入"插入"菜单项时自动展开子菜单
- 添加 `onMouseLeave` 事件处理，当鼠标离开子菜单区域时关闭子菜单
- 确保子菜单的位置计算正确，不会超出视口
- 全局考虑：在其他可能需要 hover 展开的场景（如工具栏下拉菜单）也进行类似处理

## Capabilities

### New Capabilities

- `context-menu-hover-expand`: 右键菜单子菜单 hover 展开功能

### Modified Capabilities

- `editor-context-menu`: 扩展子菜单交互行为

## Impact

- 修改文件：`src/components/editor-v2/EditorContextMenu.tsx`
- 可能影响：`src/components/toolbar-v2/Toolbar.tsx`（如有下拉菜单）
- 用户体验提升：与 VS Code 等主流编辑器一致的交互方式
