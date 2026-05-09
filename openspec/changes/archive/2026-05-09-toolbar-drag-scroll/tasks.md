## 1. 创建 useDragScroll Hook

- [x] 1.1 创建 `src/hooks/useDragScroll.ts` 文件，实现拖拽滚动的核心逻辑（mousedown/mousemove/mouseup 事件处理、scrollLeft 计算、5px 移动阈值判断）
- [x] 1.2 实现 click 事件抑制机制：当判定为拖拽操作时，在 mouseup 后短暂抑制容器内的 click 事件传播
- [x] 1.3 实现光标状态管理：拖拽中设置 `cursor: grabbing`，结束后恢复默认

## 2. 调整 Toolbar 布局结构

- [x] 2.1 将 Toolbar 组件拆分为「可滚动左侧区域」和「固定右侧区域」，左侧区域包裹所有编辑按钮组并设置 `overflow-x: hidden`
- [x] 2.2 将 `useDragScroll` hook 应用到左侧可滚动区域的容器上

## 3. 集成验证

- [x] 3.1 验证拖拽滚动功能正常工作：按住鼠标左右拖动可滚动工具栏内容
- [x] 3.2 验证拖拽与点击的区分：小幅度移动（<5px）仍触发按钮点击，大幅度拖动不触发按钮点击
- [x] 3.3 验证右侧固定按钮组不受拖拽滚动影响，始终可见
