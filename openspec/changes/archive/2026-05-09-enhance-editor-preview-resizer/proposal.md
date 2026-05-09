## Why

编辑区和预览区之间的 Gutter 分隔条虽然在代码中有完整实现（`Gutter.tsx`），但实际上**无法工作**。原因是：

1. **Gutter 高度为 0**：`AppV2.tsx` 中 Gutter 被包裹在 `<div data-component="gutter">` 中，这个 div 在 flex row 容器中通过 `align-items: stretch` 获得了满高度。但 Gutter 组件内部的 div（`width: 6px`）作为 block 子元素，没有设置 `height: 100%`，导致实际渲染高度为 0——看不到也无法点击
2. **无可见的分隔指示**：由于 Gutter 高度为 0，用户在编辑区和预览区中间看不到任何可拖拽的视觉提示

这是一个阻断性 Bug：用户完全无法通过拖拽调整编辑区和预览区的宽度比例。

## What Changes

- 修复 Gutter 组件的高度问题，确保其占满父容器的完整高度，使其可见且可交互
- 同时增加宽度持久化、双击重置等增强功能

具体变更：
- `Gutter.tsx`：添加 `height: '100%'` 样式，确保 Gutter 区域可见可交互
- 或调整 `AppV2.tsx` 中 `<div data-component="gutter">` 的结构（移除多余包裹层，或让 Gutter 直接作为 flex 子元素）
- 增加双击重置 50/50 分割功能
- 将 `editorWidth` 持久化到 `useUIStore`

## Capabilities

### New Capabilities
- `editor-preview-resize-persist`: 编辑器/预览宽度比例持久化存储与恢复

### Modified Capabilities
- `view-layout`: 修复 Gutter 高度 Bug 使拖拽功能正常工作，增强交互（双击重置）

## Impact

- **代码变更**：`src/components/editor-v2/Gutter.tsx`（修复高度）、`src/AppV2.tsx`（调整 Gutter 容器或 editorWidth 逻辑）、`src/stores/useUIStore.ts`（新增 editorWidth 字段）
- **数据**：localStorage 中新增持久化字段 `editorWidth`
- **向后兼容**：完全兼容，无 breaking changes，纯 Bug 修复 + 增强
