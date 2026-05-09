## 1. 修复 Gutter 高度 Bug（核心）

- [x] 1.1 在 `src/AppV2.tsx` 中移除 `<div data-component="gutter">` 包裹层，让 `<Gutter>` 直接作为 `#md-mate-editor-preview` 的 flex 子元素（条件渲染移到 Gutter 本身）
- [x] 1.2 在 `src/components/editor-v2/Gutter.tsx` 中添加 `data-component="gutter"` 属性和高度样式，确保 Gutter 作为 flex 子元素时正确撑满高度（`alignSelf: 'stretch'` 或不设置，由 flex 容器默认 stretch）

## 2. Store 层：editorWidth 持久化

- [x] 2.1 在 `src/stores/useUIStore.ts` 中新增 `editorWidth: number | null` 字段（默认 null）和 `setEditorWidth` action
- [x] 2.2 确保 `editorWidth` 包含在 Zustand persist 的 partialize 配置中
- [x] 2.3 在 `src/AppV2.tsx` 中移除本地 `useState<number | null>(null)` 的 `editorWidth`，改为从 `useUIStore` 读取和写入

## 3. Gutter 交互增强

- [x] 3.1 在 `Gutter.tsx` 中新增 `onReset` prop，添加 `onDoubleClick` 事件处理，双击时调用 `onReset` 恢复 50/50 分割
- [x] 3.2 在 `AppV2.tsx` 中传递 `onReset={() => setEditorWidth(null)}` 给 Gutter 组件

## 4. 拖拽跟手优化

- [x] 4.1 在 `src/index.css` 中添加 CSS 规则：`[data-resizing] #md-mate-editor-preview > * { transition: none !important }`

## 5. 预览面板最小宽度

- [x] 5.1 在 `AppV2.tsx` 的 `handleGutterResize` 中增加预览面板最小宽度约束：`newW` 上限改为 `Math.min(total - 200, total * MAX_EDITOR_WIDTH_RATIO)`
