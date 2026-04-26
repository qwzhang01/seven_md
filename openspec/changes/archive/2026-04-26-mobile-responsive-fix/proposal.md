## Why

当前 Seven Markdown 在小屏幕设备上的响应式适配不完整。根据 `responsive-layout` spec 的规范，移动端需要实现编辑器与预览区域上下排列（各占 50% 高度）以及侧边栏弹出覆盖行为，但 AppV2.tsx 目前的实现未满足这些要求。

## What Changes

- **移动端编辑器+预览纵向布局**：在小屏幕（<768px）下，编辑器与预览区域改为上下垂直排列，各占 50% 高度
- **移动端侧边栏弹出覆盖**：在小屏幕下，点击活动栏图标弹出绝对定位的覆盖面板，而非简单收起侧边栏
- **添加媒体查询断点**：在 AppV2.tsx 中添加 `@media (max-width: 768px)` 样式切换

## Capabilities

### New Capabilities
无新能力创建。

### Modified Capabilities
- `responsive-layout`：补充实现 `mobile-editor-preview-stacking` 和 `mobile-sidebar-overlay` 子场景

## Impact

- **受影响文件**：`AppV2.tsx`（布局结构）、相关 CSS 样式
- **相关 Spec**：`openspec/specs/responsive-layout/spec.md`
- **依赖项**：无新增外部依赖
