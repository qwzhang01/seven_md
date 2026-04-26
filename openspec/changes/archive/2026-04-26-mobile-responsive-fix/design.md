## Context

当前 AppV2.tsx 使用 flex 横向布局（`flex-row`）展示编辑器和预览区域，没有任何媒体查询来适应小屏幕设备。根据 `responsive-layout` spec 的要求，移动端需要：

1. 编辑器和预览上下垂直排列（各 50% 高度）
2. 侧边栏作为绝对定位的覆盖层弹出

## Goals / Non-Goals

**Goals:**
- 实现移动端（<768px）编辑器与预览区域上下排列
- 实现移动端侧边栏点击弹出覆盖行为
- 保持桌面端布局不变

**Non-Goals:**
- 不修改桌面端布局逻辑
- 不实现触摸手势缩放等复杂交互
- 不实现 hamburger 菜单（future work）

## Decisions

### 1. 使用 CSS `@media` 查询实现响应式布局
**选择**：在 AppV2.tsx 中添加 Tailwind CSS 断点类 `md:flex-row` / `md:flex-col`

**理由**：
- Tailwind 已配置 `screens: { md: '768px' }`
- 无需引入额外的状态管理
- 与现有代码风格一致

**备选方案**：
- 使用 React state + useEffect 监听 window.resize（过于复杂）

### 2. 侧边栏覆盖使用绝对定位 overlay
**选择**：在移动端使用 `position: fixed` + `inset-0` 覆盖层

**理由**：
- 原型规范明确要求"绝对定位覆盖"
- 覆盖层可阻止与主内容的交互，符合模态行为
- 易于添加点击外部关闭逻辑

### 3. 横向分隔器使用 CSS resize 或自定义拖拽
**选择**：使用 `resize: vertical` + CSS 样式

**理由**：
- 快速实现，满足基本需求
- 后续可扩展为自定义拖拽逻辑

## Risks / Trade-offs

- **风险**：分隔器拖拽在移动端体验可能不佳
  - **缓解**：先实现基本功能，后续迭代优化触摸拖拽交互
- **风险**：overlay 层可能遮挡通知等弹窗
  - **缓解**：确保 overlay z-index 低于 toast/notification
