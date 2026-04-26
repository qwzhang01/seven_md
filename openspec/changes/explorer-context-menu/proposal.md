## Why

资源管理器（文件树）是用户管理文件的核心入口。当前文件/文件夹右键菜单功能完全缺失，用户无法通过右键进行常见的文件操作（如新建、删除、重命名、复制路径等），严重影响使用体验和操作效率。

## What Changes

### 文件右键菜单
- **新建文件**: 在当前目录创建新 .md 文件
- **新建文件夹**: 在当前位置创建新文件夹
- **重命名**: 弹出输入框重命名文件
- **删除**: 删除文件（带确认提示）
- **复制**: 复制文件
- **复制路径**: 复制文件的绝对路径到剪贴板
- **在终端中打开**: 打开文件所在目录的终端
- **在 Finder 中显示**: macOS 下在 Finder 中定位文件

### 文件夹右键菜单
- **新建文件**: 在当前目录创建新 .md 文件
- **新建文件夹**: 在当前目录创建新文件夹
- **重命名**: 弹出输入框重命名文件夹
- **删除**: 删除文件夹及其内容（带确认提示）
- **复制路径**: 复制文件夹的绝对路径
- **在终端中打开**: 打开文件夹的终端
- **在 Finder 中显示**: macOS 下在 Finder 中定位文件夹

### 技术实现
- 创建可复用的 `ContextMenu` 组件
- 文件树节点支持 `onContextMenu` 事件
- 使用 Tauri FS API 执行文件操作
- 异步操作添加加载状态和错误处理

## Capabilities

### New Capabilities

- `explorer-file-context-menu`: 资源管理器文件右键菜单
- `explorer-folder-context-menu`: 资源管理器文件夹右键菜单

## Impact

- 新增文件：`src/components/sidebar-v2/ExplorerContextMenu.tsx`
- 修改文件：`src/components/sidebar-v2/ExplorerPanel.tsx`
- 依赖 Tauri 文件系统 API (`@tauri-apps/plugin-fs`)
