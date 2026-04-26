## Why

当前 Seven Markdown 的菜单系统与规范（menu-config.js）存在显著差异，包括 macOS 平台特性缺失、菜单结构不完整、快捷键缺失、国际化标签不一致等问题。这些差异影响了用户体验的一致性和功能完整性。需要全面对齐 Tauri 菜单实现与规范要求。

## What Changes

### 新增功能
- **macOS Apple 菜单**：添加完整的 Apple 子菜单（关于、偏好设置、服务、隐藏等）
- **macOS 窗口菜单**：添加最小化、缩放、全部置于前面等窗口管理功能
- **新建窗口**：支持 Cmd+Shift+N 创建新窗口
- **最近打开**：添加最近文档子菜单和清除功能
- **全部保存**：添加 Cmd+Alt+S 快捷键保存所有文件
- **粘贴并匹配样式**：添加 Cmd+Shift+V 功能
- **查找导航**：添加 Cmd+G / Cmd+Shift+G 快捷键
- **脚注插入**：添加脚注快捷键
- **折叠区块**：添加折叠区块快捷键
- **全屏切换**：添加全屏快捷键
- **AI 助手面板切换**：添加 Cmd+Shift+A 快捷键
- **显示选项**：添加行号、迷你地图、自动换行开关
- **编辑器视图子菜单**：添加仅编辑器/仅预览/分栏视图子菜单及快捷键

### 修改功能
- **菜单标签国际化**：将 Tauri 菜单标签统一为中文（文件/编辑/视图/插入/格式/主题/帮助）
- **侧边栏切换快捷键**：修复为 Ctrl+B（原为 Ctrl+\）
- **标题子菜单**：插入和格式菜单添加 H1-H6 六级标题子菜单
- **插入菜单快捷键**：补充删除线、行内代码、代码块、图片、水平线等快捷键
- **清除格式**：添加 Cmd+\ 快捷键
- **格式菜单标题**：补充 H4-H6 标题选项

## Capabilities

### New Capabilities
- `macos-platform-menus`：macOS 平台专属的 Apple 菜单和窗口菜单
- `recent-documents-menu`：最近打开文档子菜单及清除功能
- `ai-panel-toggle`：AI 助手面板切换功能
- `view-display-options`：视图显示选项（行号、迷你地图、自动换行）

### Modified Capabilities
- `menubar-system`：需要修改现有菜单系统规格以支持：
  - 新增菜单项和子菜单结构
  - 补充缺失的快捷键绑定
  - 修正快捷键不一致问题
  - 中文标签替换英文标签

## Impact

### 受影响代码
- `src-tauri/src/main.rs`：Tauri 菜单定义和创建逻辑
- `src-tauri/src/menu.rs`：菜单构建辅助函数（如存在）
- `src/components/MenuBar.tsx`：前端菜单渲染组件
- `src/hooks/useKeyboardShortcuts.ts`：快捷键注册逻辑

### 依赖项
- 无新增外部依赖
- 需要与 `keyboard-shortcuts-hook` 和 `keyboard-navigation` 规格协调

### 系统影响
- 跨平台菜单行为需保持一致（macOS 特殊处理除外）
- 快捷键绑定需要避免与其他功能冲突
