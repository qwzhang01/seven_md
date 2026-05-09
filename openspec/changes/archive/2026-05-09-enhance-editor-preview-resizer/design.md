## Context

Seven Markdown 的编辑区和预览区之间有一个 `Gutter.tsx` 拖拽分隔条组件，代码逻辑完整（mousedown → mousemove 计算 dx → 回调更新 editorWidth）。但在实际运行时**完全无法工作**。

**Root Cause 分析**：

在 `AppV2.tsx` 第 884-888 行：
```tsx
<div data-component="gutter">
  <Gutter onResize={handleGutterResize} />
</div>
```

`#md-mate-editor-preview` 容器是 `display: flex; flex-direction: row`，默认 `align-items: stretch`。`<div data-component="gutter">` 作为 flex 子元素在 cross-axis（高度）方向被 stretch 到与容器等高。

但 Gutter 组件内部渲染的 `<div style="width: 6px; ...">` 是一个空的 block 元素，没有设置 `height`。在 block flow 中，空 div 的高度为 0。因此：
- Gutter 的背景色和 border 不可见（高度 0 无渲染面积）
- 鼠标事件永远不会触发在 Gutter div 上（0 高度的元素不接收点击）
- 用户在 `<div data-component="gutter">` 区域点击时，事件目标是外层 div 而非 Gutter，不会触发 `onMouseDown`

## Goals / Non-Goals

**Goals:**
- 修复 Gutter 高度 Bug，使其可见可拖拽
- 拖拽调整编辑器/预览宽度比例正常工作
- 宽度持久化（刷新恢复）
- 双击重置 50/50 分割

**Non-Goals:**
- 不改变三种视图模式切换逻辑
- 不涉及移动端垂直 gutter
- 不修改侧边栏 resize 逻辑

## Decisions

### Decision 1: 移除多余包裹层，让 Gutter 直接作为 flex 子元素

**选择**：移除 `<div data-component="gutter">` 包裹层，让 `<Gutter>` 组件直接作为 `#md-mate-editor-preview` 的 flex 子元素。同时在 Gutter 组件内添加 `alignSelf: 'stretch'` 或 `height: '100%'`（实际上作为 flex 子元素 + 默认 align-items: stretch，只需确保不被覆盖即可）。

**理由**：
- 作为 flex 子元素，Gutter div 会被 `align-items: stretch` 自动拉伸到容器高度
- 移除一层 DOM 减少复杂度
- 保留 `data-component="gutter"` 属性在 Gutter 组件根 div 上用于调试

**替代方案**：保留包裹层但加 `className="h-full"` → 仍需要 Gutter 内部设 `h-full`，多余

### Decision 2: editorWidth 提升到 useUIStore 并持久化

**选择**：将 `editorWidth` 从 `AppV2.tsx` 的 `useState` 迁移到 `useUIStore`，利用 Zustand persist 中间件自动持久化。

**理由**：
- `useUIStore` 已使用 `persist` 中间件，新增字段零配置
- 其他 UI 状态（`sidebarWidth`、`viewMode`）已在此 store 持久化，保持一致

### Decision 3: Gutter 双击重置

**选择**：在 Gutter 组件上添加 `onDoubleClick`，回调 `setEditorWidth(null)` 恢复默认 flex 分割。

**理由**：与侧边栏 resize handle 交互模式一致（双击恢复默认宽度）。

### Decision 4: 拖拽期间禁用 transition

**选择**：利用已有的 `[data-resizing]` CSS 属性，添加规则 `[data-resizing] #md-mate-editor-preview > * { transition: none !important }` 禁用拖拽时的动画延迟。

**理由**：当前 editor-pane 有 `transition: flex 0.25s ease`，拖拽时会导致 250ms 延迟跟手。

## Risks / Trade-offs

- **[Risk] Gutter 作为直接 flex 子元素后，条件渲染逻辑需要调整** → Mitigation: 仅需将条件渲染的 `<div>` 改为 `<Gutter>` 本身带条件
- **[Risk] 持久化的 editorWidth 在窗口 resize 后可能不合理** → Mitigation: 已有第 631-634 行逻辑对过宽情况做 reset
- **[Risk] dblclick 与 drag 冲突** → Mitigation: 浏览器原生 dblclick 需要两次快速 click，拖拽需要 mousemove，两者不冲突
