## Why

当前 Seven MD 只能打开单个 Markdown 文件，用户在处理文档集合或项目文档时需要频繁切换文件，效率低下。用户需要一个文件浏览器来快速浏览和切换文件夹中的文档，同时希望能够自定义界面布局以适应不同的工作场景。

## What Changes

### 新增功能

- **文件夹打开功能**: 支持打开文件夹，在左侧显示文件树目录结构
- **可折叠侧边栏**: 左侧文件树侧边栏可折叠/展开，保持界面简洁
- **多级目录树**: 支持显示嵌套文件夹结构，可展开/折叠子目录
- **文件图标**: 为不同类型的文件显示相应的图标
- **编辑器/预览区折叠**: 右侧编辑区和预览区均可独立折叠，提供更灵活的布局
- **文件夹路径持久化**: 记住上次打开的文件夹路径，应用启动时自动恢复

### 修改功能

- **工具栏增强**: 添加文件夹打开按钮和侧边栏切换按钮
- **布局系统重构**: 从固定两栏布局改为可折叠的三区域布局

## Capabilities

### New Capabilities

- `folder-sidebar`: 文件夹侧边栏功能，包括打开文件夹、显示文件树、折叠/展开侧边栏
- `file-tree`: 文件树组件，支持多级目录展示、文件图标、点击打开文件
- `collapsible-panes`: 可折叠面板功能，支持编辑器面板和预览面板的折叠/展开
- `folder-persistence`: 文件夹路径持久化，记住上次打开的文件夹

### Modified Capabilities

- `file-operations`: 扩展现有文件操作能力，增加打开文件夹的功能

## Impact

### 前端影响

- 新增组件: `Sidebar`, `FileTree`, `FileTreeItem`, `CollapsiblePane`
- 新增 Hooks: `useFolder`, `useFileTree`, `useSidebarState`, `usePaneState`
- 新增状态管理: 文件夹路径、文件树数据、侧边栏/面板折叠状态
- 修改布局: `App.tsx` 需要从两栏布局改为三区域可折叠布局
- 新增工具栏按钮: 打开文件夹、切换侧边栏、折叠编辑器、折叠预览

### 后端影响 (Rust)

- 新增 Tauri 命令: `open_folder`, `read_directory`, `get_file_tree`
- 新增持久化存储: 保存/读取文件夹路径偏好

### 依赖影响

- 可能需要新增文件图标库 (如 `react-icons` 或自定义 SVG 图标)
- 无破坏性变更

- dependencies: []
- unlocks: ['design', 'specs']
