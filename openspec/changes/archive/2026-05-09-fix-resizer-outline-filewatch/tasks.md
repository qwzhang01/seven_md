## 1. 修复大纲面板点击导航

- [x] 1.1 修改 `src/components/sidebar-v2/OutlinePanel.tsx` 的 `handleHeadingClick`，读取当前 `viewMode` 状态，根据模式分发不同事件：editor-only 发射 `editor:jump-to-line`，preview-only 发射 `preview:scroll-to-heading`，split 模式同时发射两者
- [x] 1.2 在 `src/components/editor-v2/PreviewPaneV2.tsx` 中添加 `preview:scroll-to-heading` 事件监听，接收 heading 文本参数，在渲染后的 HTML 中查找匹配的 heading 元素并 `scrollIntoView`
- [x] 1.3 在 `src/components/editor-v2/EditorPaneV2.tsx` 中增强 `editor:jump-to-line` 处理逻辑：当 `viewRef.current` 为 null 时，用 `setTimeout` 延迟 100ms 重试一次，避免编辑器未初始化时静默失败

## 2. 实现文件外部变更热重载

- [x] 2.1 在 `src/stores/useFileStore.ts` 中新增 `reloadTabContent(tabId, content)` action（更新内容但不标记 dirty）和 `hasExternalConflict` 字段 + `markTabExternalConflict(tabId, flag)` action
- [x] 2.2 在 `src/AppV2.tsx` 的 `fs-watch:changed` 回调中，除调用 `refreshTree()` 外，遍历所有有 `path` 的已打开 Tab：对 `isDirty === false` 的 Tab 调用 `readFile` 对比内容并更新；对 `isDirty === true` 的 Tab 标记外部冲突
- [x] 2.3 限制并发重载数量为最多 5 个（使用 `Promise.allSettled` 分批处理），防止大量 Tab 打开时阻塞
- [x] 2.4 在 TabBar 组件中，为有 `hasExternalConflict` 标记的 Tab 显示冲突警告图标，点击弹出选择菜单："重新加载文件" / "保留本地修改"
- [x] 2.5 实现冲突解决逻辑：选择重新加载则调用 `reloadTabContent`；选择保留本地则调用 `markTabExternalConflict(tabId, false)` 清除标记
