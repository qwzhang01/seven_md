## 1. 基础架构与状态管理

- [x] 1.1 创建类型定义文件 `src/types/index.ts`，定义 FileTreeNode、AppState 等类型
- [x] 1.2 创建状态管理 Context `src/context/AppContext.tsx`，包含 folder、file、ui 状态
- [x] 1.3 创建 useReducer 实现 `src/reducers/appReducer.ts`，处理状态更新逻辑
- [x] 1.4 创建自定义 Hooks: `useFolder`, `useFileTree`, `useSidebarState`, `usePaneState`

## 2. 布局重构

- [x] 2.1 创建 CollapsiblePane 组件 `src/components/CollapsiblePane.tsx`
- [x] 2.2 重构 App.tsx 布局结构，从两栏改为三区域 Flexbox 布局
- [x] 2.3 将 EditorPane 和 PreviewPane 包装为可折叠面板
- [x] 2.4 添加面板折叠/展开过渡动画 (Tailwind transition)

## 3. Rust 后端实现

- [x] 3.1 在 `src-tauri/src/main.rs` 中添加 `open_folder` 命令
- [x] 3.2 实现 `read_directory` 命令，返回 FileTreeNode 数组
- [x] 3.3 实现文件过滤逻辑（只显示 .md 文件，隐藏 . 开头的文件）
- [x] 3.4 实现 `get_store_path` 命令，返回应用数据目录路径
- [x] 3.5 在 `src-tauri/src/main.rs` 中注册所有新命令

## 4. Sidebar 组件实现

- [x] 4.1 创建 Sidebar 组件 `src/components/Sidebar.tsx`
- [x] 4.2 创建 SidebarHeader 组件，显示文件夹名称和关闭按钮
- [x] 4.3 实现侧边栏折叠/展开功能
- [x] 4.4 添加侧边栏折叠过渡动画

## 5. FileTree 组件实现

- [x] 5.1 创建 FileTree 组件 `src/components/FileTree.tsx`
- [x] 5.2 创建 FileTreeItem 组件 `src/components/FileTreeItem.tsx`，支持递归渲染
- [x] 5.3 实现目录展开/折叠功能
- [x] 5.4 实现懒加载子目录功能
- [x] 5.5 添加文件图标（使用 Lucide 或 SVG）
- [x] 5.6 实现点击文件打开功能
- [x] 5.7 实现当前文件高亮显示
- [x] 5.8 实现文件树排序（目录优先，字母排序）

## 6. Toolbar 增强

- [x] 6.1 在 Toolbar 中添加 "Open Folder" 按钮
- [x] 6.2 在 Toolbar 中添加 "Toggle Sidebar" 按钮
- [x] 6.3 在 Toolbar 中添加 "Toggle Editor" 按钮
- [x] 6.4 在 Toolbar 中添加 "Toggle Preview" 按钮
- [x] 6.5 添加折叠状态图标指示

## 7. 持久化实现

- [x] 7.1 创建持久化工具函数 `src/utils/persistence.ts`
- [x] 7.2 实现 Rust 端配置文件读写功能
- [x] 7.3 实现保存文件夹路径功能
- [x] 7.4 实现保存面板折叠状态功能
- [x] 7.5 实现应用启动时恢复状态功能
- [x] 7.6 处理持久化错误（文件夹不存在等）

## 8. 拖拽功能扩展

- [x] 8.1 扩展现有拖拽处理，支持文件夹拖拽
- [x] 8.2 拖拽文件夹时自动打开文件夹并显示文件树
- [x] 8.3 拖拽文件时，如果在已打开的文件夹内，高亮显示

## 9. 边界情况处理

- [x] 9.1 处理空文件夹情况（显示空状态提示）
- [x] 9.2 处理文件夹不存在情况（清除持久化路径）
- [x] 9.3 处理同时折叠所有面板的情况（至少保持一个可见）
- [x] 9.4 处理切换文件时有未保存更改的情况（提示保存）
- [x] 9.5 处理关闭文件夹时有打开文件的情况

## 10. 样式与主题

- [x] 10.1 添加暗色主题下的侧边栏样式
- [x] 10.2 添加文件树悬停和选中状态样式
- [x] 10.3 确保所有过渡动画流畅
- [x] 10.4 调整折叠后面板的视觉效果

## 11. 测试与完善

- [x] 11.1 测试文件夹打开和关闭功能
- [x] 11.2 测试文件树展开和折叠功能
- [x] 11.3 测试文件打开和编辑功能
- [x] 11.4 测试面板折叠功能
- [x] 11.5 测试持久化功能（重启应用验证状态恢复）
- [x] 11.6 测试拖拽文件夹功能
- [x] 11.7 测试暗色主题下的所有功能

## 12. 文档更新

- [x] 12.1 更新 README.md 中的功能列表
- [x] 12.2 更新 ARCHITECTURE.md 中的架构说明
- [x] 12.3 添加新功能的截图
