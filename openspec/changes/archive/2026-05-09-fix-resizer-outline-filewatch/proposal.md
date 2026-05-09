## Why

两个影响核心使用体验的 BUG 需要修复：1）大纲面板中点击标题条目无法正确导航到文档对应位置；2）文件在外部编辑器中被修改后，已打开的 Tab 内容不会自动更新为最新内容，文件夹内的文件增删变化虽然能刷新目录树，但已打开文件的内容不会同步刷新。

## What Changes

- **修复大纲面板点击导航功能**：当前 OutlinePanel 的 `handleHeadingClick` 通过 `window.dispatchEvent(CustomEvent('editor:jump-to-line'))` 发射事件，EditorPaneV2 监听该事件后滚动到目标行。BUG 可能原因：1）编辑器视图实例 `viewRef.current` 在某些时序下为 null；2）当 viewMode 为 `preview-only` 时编辑器未渲染，事件无接收方；3）事件未触发预览面板滚动。需要确保在所有视图模式下点击大纲条目都能正确导航到对应位置（编辑器或预览面板）。
- **实现已打开文件的外部变更自动重载**：当前 `fs-watch:changed` 事件仅触发 `refreshTree()` 刷新目录树，但不会重新读取已打开 Tab 中文件的最新内容。需要在收到文件系统变更通知后，对每个已打开且有物理路径的 Tab，重新读取文件内容并更新（仅当 Tab 没有未保存修改时自动更新，有未保存修改时提示用户）。

## Capabilities

### New Capabilities
- `file-hot-reload`: 已打开文件的外部变更自动检测和热重载功能。当文件在外部被修改时，自动重新加载最新内容到编辑器中；当 Tab 有未保存修改时，弹出冲突提示让用户选择保留本地版本还是加载外部版本。

### Modified Capabilities
- `sidebar-outline`: 修复点击导航在所有视图模式下的正确行为，增加对预览面板的滚动支持
- `view-layout`: 确保在不同视图模式下，大纲导航能正确路由到可见的面板（编辑器或预览）

## Impact

- `src/components/sidebar-v2/OutlinePanel.tsx`：修复导航事件分发逻辑，支持预览面板
- `src/components/editor-v2/EditorPaneV2.tsx`：确保 jump-to-line 事件处理稳定
- `src/components/editor-v2/PreviewPaneV2.tsx`：增加 heading 锚点导航支持
- `src/AppV2.tsx`：在 fs-watch 变更回调中增加文件内容热重载逻辑
- `src/stores/useFileStore.ts`：增加 `reloadTabContent` action，支持外部变更时更新 Tab 内容
- `src/stores/useWorkspaceStore.ts`：配合文件热重载的触发逻辑
