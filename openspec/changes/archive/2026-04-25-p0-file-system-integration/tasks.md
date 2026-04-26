## 1. 扩展 tauriCommands.ts

- [x] 1.1 在 `src/tauriCommands.ts` 中添加 `FileTreeNode` 类型定义（与 Rust 后端 `FileTreeNode` 对齐：name, path, type, extension, children, isLoaded）
- [x] 1.2 添加 `readDirectory(path: string): Promise<FileTreeNode[]>` 封装函数
- [x] 1.3 添加 `openFolderDialog(): Promise<string | null>` 封装函数（invoke 'open_folder'）
- [x] 1.4 添加 `searchInFiles(folderPath, query, searchType): Promise<SearchResponse>` 封装函数，并将 `SearchResponse`/`SearchResult`/`TextSearchResult` 类型定义移入或复用 `src/types/index.ts`

## 2. 创建 useWorkspaceStore

- [x] 2.1 创建 `src/stores/useWorkspaceStore.ts`，定义接口：`folderPath`, `folderTree` (Map<string, FileTreeNode[]>), `expandedDirs` (Set<string>), `isLoading`, `rootNodes` (FileTreeNode[])
- [x] 2.2 实现 `openFolder()` action：调用 `openFolderDialog()` → 成功后设置 `folderPath` → 调用 `loadDirectory(folderPath)` → 调用 `startFsWatch(folderPath)`
- [x] 2.3 实现 `closeFolder()` action：清空所有状态 → 调用 `stopFsWatch()`
- [x] 2.4 实现 `loadDirectory(path)` action：调用 `readDirectory(path)` → 存入 `folderTree` Map → 设置对应目录 `isLoaded: true`
- [x] 2.5 实现 `toggleDirectory(path)` action：展开/折叠逻辑 + 按需触发 `loadDirectory`
- [x] 2.6 实现 `refreshTree()` action：重新加载 root + 所有 expandedDirs
- [x] 2.7 实现 `createFile(parentDir, fileName)` 和 `createDirectory(parentDir, dirName)` actions：调用对应 tauriCommand → 刷新父目录
- [x] 2.8 在 `src/stores/index.ts` 中导出 `useWorkspaceStore`

## 3. AppV2 集成打开文件夹流程

- [x] 3.1 在 `AppV2.tsx` 中添加 `menu-open-folder` 和 `menu-close-folder` 事件监听，分别调用 `useWorkspaceStore.openFolder()` / `closeFolder()`
- [x] 3.2 添加 `fs-watch:changed` Tauri 事件监听（使用 `@tauri-apps/api/event` 的 `listen`），触发防抖 `refreshTree()`（500ms）
- [x] 3.3 在组件卸载时清理事件监听器

## 4. 改造 ExplorerPanel

- [x] 4.1 导入 `useWorkspaceStore`，替换 `const workspaceTree: TreeNode | null = null` 为从 Store 获取的真实数据
- [x] 4.2 实现目录树渲染：遍历 `rootNodes`，递归渲染，展开的目录从 `folderTree` Map 中获取子节点
- [x] 4.3 目录点击调用 `toggleDirectory(path)`，文件点击调用 `handleFileClick`（检查 tab → switchTab 或 readFile+openTab）
- [x] 4.4 实现"新建文件"按钮：点击后显示内联 input，回车调用 `createFile`
- [x] 4.5 实现"新建文件夹"按钮：点击后显示内联 input，回车调用 `createDirectory`
- [x] 4.6 实现"刷新"按钮：调用 `refreshTree()`
- [x] 4.7 无工作区时点击提示区域触发 `openFolder()`

## 5. 改造 SearchPanel

- [x] 5.1 导入 `useWorkspaceStore` 获取 `folderPath`，导入 `useFileSearch` hook
- [x] 5.2 实现双模式逻辑：`folderPath === null` 时保持现有 tab 搜索；`folderPath !== null` 时使用 `useFileSearch(folderPath)` 结果
- [x] 5.3 搜索结果点击处理：对于后端搜索结果，如文件未打开则通过 `readFile` + `openTab` 打开后跳转到行号
- [x] 5.4 添加模式指示器：显示"搜索已打开文件"或"搜索工作区: {folderName}"
- [x] 5.5 后端搜索返回 `truncated: true` 时显示"结果已限制为 200 条"提示

## 6. 集成测试验证

- [x] 6.1 手动验证完整流程：打开文件夹 → 目录树显示 → 展开子目录 → 点击文件打开 → 搜索文件内容 → 新建文件 → 刷新
- [x] 6.2 验证关闭文件夹后状态清空，SearchPanel 切回 tab 搜索模式
