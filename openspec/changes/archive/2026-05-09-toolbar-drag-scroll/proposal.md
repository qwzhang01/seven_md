## Why

编辑器顶部工具栏在窗口宽度较小或按钮较多时会出现内容溢出的情况。当前用户只能通过鼠标滚轮（如果有）来水平滚动工具栏，缺少直观的拖拽交互方式。用户期望能够按住鼠标左键左右拖动来滚动工具栏，这是一种常见的、直觉性的交互模式（类似于移动端的横向滑动），可以显著提升窄屏和多按钮场景下的操作体验。

## What Changes

- 为工具栏容器添加鼠标拖拽滚动（drag-to-scroll）能力，用户按住鼠标左键并左右拖动即可水平滚动工具栏
- 工具栏容器设置 `overflow-x: auto`（或 hidden），支持水平方向内容溢出时的滚动
- 拖拽滚动过程中抑制按钮的点击事件，避免拖拽结束时误触发按钮操作
- 拖拽时显示 `grabbing` 光标，提供视觉反馈
- 右侧固定区域（命令面板、侧边栏切换、AI 按钮）不参与拖拽滚动，保持始终可见

## Capabilities

### New Capabilities
- `toolbar-drag-scroll`: 为工具栏添加鼠标按住拖拽实现水平滚动的交互能力，包含拖拽状态管理、滚动计算、点击抑制和光标反馈

### Modified Capabilities
<!-- 无需修改现有 spec -->

## Impact

- 受影响代码：`src/components/toolbar-v2/Toolbar.tsx` — 需要添加拖拽滚动逻辑（可提取为自定义 hook）
- 可能新增文件：`src/hooks/useDragScroll.ts` 或在 toolbar 目录下新增 hook
- 无 API 变更，无依赖变更，纯前端交互优化
