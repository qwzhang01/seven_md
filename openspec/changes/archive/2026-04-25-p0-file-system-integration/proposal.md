## Why

Seven MD 的 Rust 后端已经完整实现了 14 个 Tauri IPC 命令（read_file、save_file、read_directory、search_in_files、create_file、create_directory、rename_path、delete_path、open_folder、export_html、start_fs_watch、stop_fs_watch 等），前端 `tauriCommands.ts` 也封装了 8 个核心命令。但**前端集成层完全断开**：

1. **ExplorerPanel 空壳**：`workspaceTree` 硬编码为 `null`，工作区永远显示"点击打开文件夹加载工作区"；"新建文件"、"新建文件夹"、"刷新"按钮无实际逻辑
2. **SearchPanel 仅搜索内存**：只搜索已打开的 tab 内容，完全不使用后端的 `search_in_files` 命令；而 `useFileSearch.ts` hook 已封装了完整的后端搜索能力但 SearchPanel 未接入
3. **工作区状态管理缺失**：`useFileStore` 只管理 tab 状态，不包含 `folderPath`/`folderTree` 等工作区概念；`useAppState`/`AppContext` 实现文件不存在（仅有测试文件）
4. **文件夹打开流程断裂**：菜单中 "Open Folder" 发射 `menu-open-folder` 事件但无监听者；后端 `open_folder` 命令存在但前端未封装
5. **文件系统监听未接入**：`startFsWatch`/`stopFsWatch` 在 Rust 后端和 `tauriCommands.ts` 都就绪，但无组件调用，`fs-watch:changed` 事件无监听者

**本质问题**：后端已就绪，前端需要一个 **Workspace Store** + **集成层**把 UI 组件与 Tauri 后端连通。

## What Changes

- **创建 `useWorkspaceStore`（Zustand）**：管理 `folderPath`、`folderTree`、`expandedDirs`、`isLoading` 等工作区状态，提供 `openFolder`、`closeFolder`、`loadDirectory`、`refreshTree`、`createFile`、`createDirectory`、`renamePath`、`deletePath` actions
- **扩展 `tauriCommands.ts`**：新增 `readDirectory`、`openFolderDialog`、`searchInFiles` 封装函数
- **改造 ExplorerPanel**：接入 `useWorkspaceStore`，展示真实文件树（支持懒加载子目录、折叠/展开），"新建文件"/"新建文件夹"/"刷新"按钮连接实际操作
- **改造 SearchPanel**：引入双模式搜索——无工作区时搜索已打开 tab（现有行为），有工作区时使用后端 `search_in_files`（接入 `useFileSearch` hook）
- **AppV2 集成打开文件夹流程**：监听 `menu-open-folder` 事件，调用 `useWorkspaceStore.openFolder()`，成功后加载目录树并启动文件监听
- **接入文件系统监听**：工作区打开时调用 `startFsWatch`，关闭时调用 `stopFsWatch`，监听 `fs-watch:changed` 事件触发自动刷新

## Capabilities

### New Capabilities
- `workspace-store`: Zustand Store 管理工作区状态（文件夹路径、目录树、展开状态、CRUD 操作），替代缺失的 AppContext
- `explorer-integration`: ExplorerPanel 接入真实文件系统，支持目录树懒加载、文件 CRUD UI、自动刷新
- `search-integration`: SearchPanel 双模式搜索（内存 tab 搜索 + 后端文件系统搜索）

### Modified Capabilities
（无已有 spec 需要修改）

## Impact

- **新增文件**：
  - `src/stores/useWorkspaceStore.ts` — 工作区状态管理
- **修改文件**：
  - `src/tauriCommands.ts` — 新增 `readDirectory`、`openFolderDialog`、`searchInFiles` 函数
  - `src/stores/index.ts` — 导出新 Store
  - `src/components/sidebar-v2/ExplorerPanel.tsx` — 接入真实文件系统
  - `src/components/sidebar-v2/SearchPanel.tsx` — 引入双模式搜索
  - `src/AppV2.tsx` — 集成打开文件夹流程和文件监听
- **依赖**：Rust 后端已就绪（无需修改），`@tauri-apps/api/core`（invoke）、`@tauri-apps/plugin-dialog`（open）已安装
- **风险**：ExplorerPanel 和 SearchPanel 的 UI 改造需保持现有视觉风格不变；文件系统监听的轮询间隔（800ms）可能在大目录下有性能影响
