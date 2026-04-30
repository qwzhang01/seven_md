## Context

当前资源管理器（`sidebar-explorer`）的文件树已支持展开/折叠文件夹、点击打开文件，以及通过 section header 上的按钮新建文件/文件夹。但存在两个缺陷：

1. **新建无上下文感知**：新建文件/文件夹按钮始终在根目录创建，忽略用户当前选中的文件夹。
2. **无拖拽移动**：文件树是纯展示+点击交互，缺少拖拽重排能力。

项目使用 Tauri + React，文件系统操作通过 Tauri 的 `fs` API 执行，前端状态由 `workspace-store`（Zustand）管理。

## Goals / Non-Goals

**Goals:**
- 新建文件/文件夹时，若有选中文件夹则在其内部创建，否则回退到根目录
- 支持通过拖拽将文件移动到任意文件夹（包括根目录）
- 支持通过拖拽将文件夹移动到其他文件夹（包括根目录）
- 拖拽过程中提供清晰的视觉反馈（高亮目标文件夹）
- 移动后同步更新已打开 Tab 的文件路径引用

**Non-Goals:**
- 不支持多选拖拽（一次只移动一个条目）
- 不支持跨工作区（跨窗口）拖拽
- 不支持拖拽排序（同级内调整顺序），仅支持跨文件夹移动
- 不支持撤销（Undo）移动操作（可在后续迭代中加入）

## Decisions

### 决策 1：使用 HTML5 原生 Drag and Drop API，而非第三方库

**选择**：使用浏览器原生 `draggable`、`onDragStart`、`onDragOver`、`onDrop` 事件。

**理由**：
- 项目已有 React 组件体系，无需引入 `react-dnd` 或 `dnd-kit` 等额外依赖
- 文件树的拖拽场景相对简单（单选、树形结构），原生 API 足够
- 减少 bundle 体积和依赖维护成本

**替代方案**：`@dnd-kit/core` 功能更强大，但对于当前需求过重。

---

### 决策 2：拖拽数据通过 `dataTransfer` 传递节点路径

**选择**：在 `onDragStart` 中将被拖拽节点的完整路径写入 `dataTransfer.setData('text/plain', sourcePath)`，在 `onDrop` 中读取并执行移动。

**理由**：简单可靠，路径是文件系统操作的唯一标识符，无需维护额外的拖拽状态。

---

### 决策 3：选中文件夹状态存储在组件本地 state，而非 workspace-store

**选择**：`ExplorerPanel` 组件维护 `selectedFolderPath: string | null` 的本地 React state。

**理由**：
- 选中文件夹是纯 UI 交互状态，不需要持久化，也不需要跨组件共享
- 避免污染全局 store，保持 `workspace-store` 专注于文件系统数据

---

### 决策 4：文件移动通过 Tauri `fs.renameFile` 实现

**选择**：调用 Tauri 的 `fs.renameFile(sourcePath, destPath)` 执行移动（rename 在同文件系统内等同于移动）。

**理由**：Tauri 已提供此 API，无需额外 Rust 命令。对于跨磁盘移动场景（极少见），可在后续迭代中处理。

---

### 决策 5：拖拽目标高亮通过 CSS class 切换实现

**选择**：在 `onDragEnter`/`onDragLeave` 时切换目标文件夹节点的 `is-drag-over` CSS class，通过样式高亮显示。

**理由**：简单直接，避免复杂的状态管理，性能好。

## Risks / Trade-offs

- **[风险] 文件夹拖入自身或子孙**：会导致路径循环。→ 缓解：在 `onDrop` 时检查目标路径是否以源路径开头，若是则拒绝操作并提示。
- **[风险] 移动后已打开 Tab 路径失效**：文件被移动后，Tab 仍引用旧路径导致保存失败。→ 缓解：移动成功后，遍历 `workspace-store` 中的 `openFiles`，将匹配旧路径的条目更新为新路径。
- **[风险] `onDragLeave` 事件在子元素间移动时误触发**：导致高亮闪烁。→ 缓解：使用 `dragCounter` 计数器（进入+1，离开-1，为0时才取消高亮）或检查 `relatedTarget`。
- **[权衡] 不支持撤销**：移动是不可逆操作，用户误操作无法恢复。→ 接受此限制，在 UI 上通过拖拽视觉反馈降低误操作概率，后续可加入操作历史。
