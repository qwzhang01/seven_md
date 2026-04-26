## Context

Seven MD 的文件系统架构分三层：
1. **Rust 后端**（`src-tauri/src/commands.rs` + `main.rs`）：14 个 Tauri 命令全部实现，包括文件 CRUD、目录读取（懒加载设计，只读一层）、全文搜索（200 条限制）、文件夹对话框、文件系统轮询监听（800ms）
2. **TypeScript IPC 层**（`src/tauriCommands.ts`）：封装了 8 个命令（readFile、saveFile、createFile、createDirectory、renamePath、deletePath、startFsWatch、stopFsWatch），但缺少 `readDirectory`、`openFolderDialog`、`searchInFiles`
3. **前端 UI 层**：ExplorerPanel（workspaceTree=null 空壳）、SearchPanel（仅搜索内存 tab）、useFileStore（纯 tab 管理，无工作区概念）

**约束**：
- 不修改 Rust 后端（已完备且有单元测试）
- 保持现有 Zustand Store 架构模式（8 个 Store，按业务域拆分）
- ExplorerPanel/SearchPanel 的 UI 样式保持与现有一致（CSS 变量体系）
- `useAppState`/`AppContext` 实现文件不存在且已废弃，不再使用 Context API

## Goals / Non-Goals

**Goals:**
- 创建 `useWorkspaceStore`（第 9 个 Zustand Store）管理工作区状态
- ExplorerPanel 展示真实文件系统目录树（懒加载子目录）
- 工作区操作按钮（新建文件/文件夹/刷新）全部功能化
- SearchPanel 在有工作区时切换为后端文件搜索
- 打开文件夹 → 加载目录树 → 启动文件监听 完整流程
- 文件 CRUD 操作后自动刷新相关目录

**Non-Goals:**
- 不实现文件拖拽上传（v2.0）
- 不实现多工作区（当前只支持一个工作区）
- 不实现文件重命名/删除的 UI 入口（右键菜单，属于 P1 scope）
- 不重写 SearchPanel 的 UI 布局（仅替换数据源）
- 不实现文件内容预览 tooltip

## Decisions

### 决策 1：新建 useWorkspaceStore 而非扩展 useFileStore

**选择**：创建独立的 `src/stores/useWorkspaceStore.ts`
**替代方案**：
- A) 在 useFileStore 中添加工作区状态 → 拒绝，违反单一职责（tab 管理 vs 工作区管理是不同关注点）
- B) 实现缺失的 AppContext/useAppState → 拒绝，项目已迁移到 Zustand，不应引入 Context API

**理由**：useFileStore 管理 tabs/activeTabId 等运行时编辑状态，而工作区是更持久的概念（文件夹路径、目录树）。独立 Store 更清晰，且与现有 8 Store 架构模式一致。

### 决策 2：目录树懒加载 — 与后端设计对齐

**选择**：`read_directory` 后端已实现为单层读取（子目录返回 `children: []` + `isLoaded: false`），前端 Store 在用户展开目录时才调用 `readDirectory` 加载子目录
**实现**：
- Store 维护 `Map<string, FileTreeNode[]>` 表示每个已加载目录的内容
- 展开目录时检查 `isLoaded`，如为 false 则触发 `readDirectory` 并更新
- 收起目录时不清除缓存，再次展开时直接显示

**理由**：避免一次性递归加载整棵目录树（可能极深），与后端懒加载设计保持一致。

### 决策 3：SearchPanel 双模式 — 渐进增强

**选择**：SearchPanel 根据 `useWorkspaceStore.folderPath` 是否存在切换搜索模式：
- `folderPath === null`：保持现有行为，搜索已打开的 tab 内容（前端内存搜索）
- `folderPath !== null`：使用 `useFileSearch` hook 调用后端 `search_in_files`

**理由**：保持向后兼容，未打开工作区时仍可搜索已打开文件。

### 决策 4：文件监听 — 使用现有轮询机制

**选择**：打开工作区时调用 `startFsWatch(folderPath)`，关闭时调用 `stopFsWatch()`，监听 `fs-watch:changed` 事件时刷新当前展开的目录
**实现**：通过 Tauri `listen` API 监听后端 emitted 的 `fs-watch:changed` 事件

**风险 mitigation**：刷新操作需防抖（500ms），避免频繁 IPC 调用。

### 决策 5：tauriCommands 扩展 — 补齐封装

**选择**：在 `tauriCommands.ts` 中新增 3 个函数：
- `readDirectory(path: string): Promise<FileTreeNode[]>`
- `openFolderDialog(): Promise<string | null>` — 封装 `invoke('open_folder')`
- `searchInFiles(folderPath, query, searchType): Promise<SearchResponse>` — 从 `useFileSearch.ts` 中的直接 invoke 提取到封装层

**理由**：统一 IPC 调用入口，便于 mock 和测试。

## Risks / Trade-offs

- **[Risk] 大型目录性能** → Mitigation: 懒加载 + 后端只返回 .md 文件和目录 + 文件监听防抖
- **[Risk] ExplorerPanel 状态与 Tab 状态不同步** → Mitigation: 在 ExplorerPanel 中点击文件时，检查 tab 是否已打开，已打开则 switchTab，未打开则通过 `readFile` 加载并 `openTab`
- **[Risk] SearchPanel 模式切换时用户体验不连续** → Mitigation: 切换模式时清空结果并显示加载状态提示
- **[Trade-off] 不实现右键菜单文件操作** → 当前只做 Explorer 面板顶部按钮的新建功能，右键重命名/删除放到 P1 提案中
