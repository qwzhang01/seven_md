## Why

快捷键是提升编辑效率的关键。根据交互规范，应支持 `Ctrl+I` 斜体、`Ctrl+W` 关闭标签等快捷键。当前实现中 `Ctrl+I` 未绑定斜体功能，`Ctrl+W` 未实现关闭标签功能，不符合规范要求。

## What Changes

- 实现 `Ctrl+I` 快捷键：在编辑器焦点时插入斜体标记 `*`
- 实现 `Ctrl+W` 快捷键：关闭当前标签页（已有 dirty check 逻辑）
- 调整 `Ctrl+Shift+E` 快捷键：绑定到资源管理器（当前为 `Ctrl+Shift+O`）
- 调整 `Ctrl+Shift+F` 快捷键：绑定到搜索面板（当前为 `Ctrl+Shift+F` 已正确）
- 确认其他快捷键已正确实现：Ctrl+B（加粗/侧边栏上下文判断）、Ctrl+K（链接）等

## Capabilities

### Modified Capabilities

- `keyboard-shortcuts`: 补充缺失的快捷键绑定，修正不匹配的快捷键

## Impact

- 修改文件：`src/AppV2.tsx` 中的 shortcuts 配置
- 修改文件：`src/hooks/useKeyboardShortcuts.ts`（如需扩展）
- 无需新增能力，纯功能补全
