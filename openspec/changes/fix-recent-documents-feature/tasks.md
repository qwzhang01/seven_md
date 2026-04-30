## 1. 统一 localStorage Key

- [x] 1.1 修改 `src/hooks/useRecentFiles.ts`：将 `STORAGE_KEY` 从 `'seven-md:recent-files'` 改为 `'recent-documents'`
- [x] 1.2 修改 `src/hooks/useRecentFiles.ts`：修复 save effect，当 `recentFiles.length === 0` 时也调用 `localStorage.removeItem(STORAGE_KEY)` 清除旧数据

## 2. 提取共享工具函数

- [x] 2.1 在 `src/AppV2.tsx` 中提取 `addRecentDocument(path: string, type: 'file' | 'folder')` 内联工具函数，负责读取、更新、写回 `localStorage` 中的 `recent-documents` 列表（最多 10 条，去重后置顶）

## 3. 打开文件/文件夹时记录最近文档

- [x] 3.1 修改 `src/AppV2.tsx` 中的 `handleOpenFile`：在 `openTab` 调用成功后，调用 `addRecentDocument(selected, 'file')`
- [x] 3.2 修改 `src/AppV2.tsx` 中 `menu-open-folder` 事件处理：在 `openFolder()` 调用后，监听文件夹路径并调用 `addRecentDocument(folderPath, 'folder')`（或在 `useWorkspaceStore.openFolder` 成功后通过回调获取路径）

## 4. 处理 app:open-recent 事件

- [x] 4.1 在 `src/AppV2.tsx` 的 `useEffect` 中添加 `window.addEventListener('app:open-recent', handler)`
- [x] 4.2 实现 handler：从 `event.detail` 获取文件路径，调用 `readFile(path)` 读取内容，调用 `openTab(path, content)` 打开标签页
- [x] 4.3 在 handler 中处理错误：文件不存在时显示 error notification（`addNotification`）
- [x] 4.4 在 handler 中成功打开后调用 `addRecentDocument(path, 'file')` 更新最近文档列表（置顶）
- [x] 4.5 在 `useEffect` 的 cleanup 函数中移除该事件监听器

## 5. 验证

- [x] 5.1 手动测试：打开一个文件，关闭欢迎页后重新打开，确认最近文档列表显示该文件
- [x] 5.2 手动测试：从欢迎页点击最近文档，确认文件正确打开
- [x] 5.3 手动测试：点击"清除菜单"（原生菜单），确认欢迎页最近文档列表清空
- [x] 5.4 手动测试：打开超过 10 个文件，确认列表最多保留 10 条
