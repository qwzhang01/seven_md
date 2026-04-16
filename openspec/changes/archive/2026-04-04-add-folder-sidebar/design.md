## Context

MD Reader 当前是一个基于 Tauri v2 + React 19 的 Markdown 阅读器，采用固定的左右两栏布局（编辑器 + 预览）。应用支持打开单个 `.md` 文件，主题切换等基础功能。

现有技术栈：
- **前端**: React 19 + TypeScript + Vite + Tailwind CSS
- **后端**: Rust + Tauri v2
- **状态管理**: React useState/useContext（轻量级状态管理）
- **持久化**: localStorage 用于主题偏好

本次变更需要扩展应用的能力，支持打开文件夹并提供可折叠的三区域布局。

## Goals / Non-Goals

**Goals:**

1. 实现可折叠的文件夹侧边栏，支持显示多级目录结构
2. 实现文件树组件，支持点击文件打开、显示文件图标
3. 实现编辑器和预览区的独立折叠功能
4. 实现文件夹路径的持久化存储
5. 保持现有功能的兼容性，无破坏性变更
6. 保持应用的轻量级特性，不引入重型状态管理库

**Non-Goals:**

1. 多标签页支持（单文件模式，后续迭代）
2. 文件管理操作（新建、重命名、删除文件）
3. 文件搜索/过滤功能
4. 云同步功能
5. 文件拖拽排序

## Decisions

### 1. 布局架构设计

**决策**: 采用 CSS Flexbox + 动态宽度实现可折叠三区域布局

**理由**:
- Flexbox 天然支持动态调整，适合实现可折叠面板
- 无需引入额外的布局库
- 与现有 Tailwind CSS 架构兼容良好

**布局结构**:
```
┌──────────────────────────────────────────────────────┐
│                     Toolbar                          │
├─────────┬────────────────────┬───────────────────────┤
│ Sidebar │     Editor Pane    │     Preview Pane      │
│ (可折叠) │      (可折叠)       │       (可折叠)         │
│  240px  │       flex-1       │        flex-1         │
│ 默认展开 │      默认展开       │       默认展开         │
└─────────┴────────────────────┴───────────────────────┘
```

**替代方案考虑**:
- CSS Grid: 更适合固定网格布局，灵活性不如 Flexbox
- react-split-pane: 功能强大但增加依赖，当前需求简单不需要

### 2. 状态管理方案

**决策**: 使用 React Context + useReducer 管理全局状态

**理由**:
- 应用状态相对简单，不需要 Redux/Zustand 等重型方案
- Context 可以满足跨组件状态共享需求
- useReducer 适合管理复杂的状态逻辑（如文件夹切换、面板折叠）
- 保持技术栈一致性

**状态结构**:
```typescript
interface AppState {
  // 文件夹状态
  folder: {
    path: string | null;
    tree: FileTreeNode[] | null;
    expandedDirs: Set<string>;
  };
  
  // 文件状态
  file: {
    path: string | null;
    content: string;
    isDirty: boolean;
  };
  
  // UI 状态
  ui: {
    sidebarCollapsed: boolean;
    editorCollapsed: boolean;
    previewCollapsed: boolean;
    theme: 'light' | 'dark';
  };
}
```

### 3. 文件树数据结构

**决策**: 采用递归树形结构，支持懒加载

**理由**:
- 文件夹可能包含大量文件，懒加载可以提升性能
- 递归结构便于组件递归渲染
- 只在展开目录时加载子节点

**数据结构**:
```typescript
interface FileTreeNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  extension?: string;  // 文件扩展名，用于图标
  children?: FileTreeNode[];
  isLoaded?: boolean;  // 目录是否已加载子节点
}
```

### 4. Rust 后端 API 设计

**决策**: 提供 3 个核心 Tauri 命令

**命令列表**:

| 命令 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `open_folder` | - | `string \| null` | 打开文件夹选择对话框，返回选择的路径 |
| `read_directory` | `path: string` | `FileTreeNode[]` | 读取指定目录下的文件和子目录 |
| `get_store_path` | - | `string` | 获取应用存储路径（用于持久化） |

**文件过滤策略**:
- 默认只显示 `.md` 文件和目录
- 隐藏以 `.` 开头的文件/目录（如 `.git`, `.DS_Store`）
- 后续可通过配置支持更多文件类型

### 5. 持久化方案

**决策**: 使用 Tauri 的 `app_data_dir` 存储 JSON 配置文件

**理由**:
- 跨平台兼容（macOS 使用 `~/Library/Application Support`）
- 比 localStorage 更适合桌面应用
- 支持存储复杂对象

**存储内容**:
```json
{
  "lastFolderPath": "/path/to/last/folder",
  "sidebarCollapsed": false,
  "editorCollapsed": false,
  "previewCollapsed": false
}
```

### 6. 文件图标方案

**决策**: 使用 Lucide React 图标库（已可能安装）或自定义 SVG

**理由**:
- Lucide 是轻量级的图标库，与 Tailwind 风格搭配良好
- 如果项目未安装，使用简单的 SVG 图标
- 主要图标: `folder`, `folder-open`, `file`, `file-text`

### 7. 组件设计

**组件层次结构**:
```
App
├── Toolbar
│   ├── OpenFolderButton
│   ├── ToggleSidebarButton
│   ├── ToggleEditorButton
│   ├── TogglePreviewButton
│   └── ... (existing buttons)
├── Sidebar (可折叠)
│   ├── SidebarHeader (文件夹名称)
│   └── FileTree
│       └── FileTreeItem (递归)
│           ├── DirectoryItem
│           └── FileItem
├── EditorPane (可折叠)
│   └── Editor (existing)
└── PreviewPane (可折叠)
    └── Preview (existing)
```

## Risks / Trade-offs

### 风险 1: 大型文件夹性能问题

**风险**: 打开包含大量文件的文件夹可能导致文件树渲染缓慢

**缓解措施**:
- 实现虚拟滚动（如需要，后续引入 react-window）
- 限制初始加载深度，懒加载子目录
- 添加文件数量限制提示

### 风险 2: 状态同步复杂性

**风险**: 文件树状态、文件内容状态、UI 状态之间的同步可能复杂

**缓解措施**:
- 使用单一数据源原则
- 明确状态更新流程
- 添加状态变更日志便于调试

### 风险 3: 跨平台路径处理

**风险**: macOS 使用 `/`，Windows 使用 `\`，路径处理需要兼容

**缓解措施**:
- 使用 Rust 的 `std::path::Path` 处理路径
- 前端统一使用后端返回的路径格式

### 权衡: 单文件模式 vs 多标签页

**权衡**: 第一版采用单文件模式简化实现

**理由**:
- 降低初始实现复杂度
- 用户可以快速体验核心功能
- 后续迭代添加多标签页支持

## Migration Plan

### 实施步骤

1. **Phase 1: 基础架构** (预计 2-3 小时)
   - 创建状态管理 Context
   - 重构 App.tsx 布局结构
   - 实现可折叠面板组件

2. **Phase 2: 文件夹功能** (预计 3-4 小时)
   - 实现 Rust 后端命令
   - 创建 FileTree 组件
   - 实现文件夹打开功能

3. **Phase 3: 持久化** (预计 1-2 小时)
   - 实现配置存储/读取
   - 启动时恢复状态

4. **Phase 4: 完善与测试** (预计 2 小时)
   - 添加文件图标
   - 处理边界情况
   - 测试各功能

### 回滚策略

- 所有变更在 feature branch 开发
- 保持原有组件和 API 不变，仅扩展功能
- 如需回滚，删除新增组件和代码即可

## Open Questions

1. **文件树排序**: 文件和目录如何排序？（建议：目录优先，然后按字母排序）
2. **文件类型过滤**: 是否只显示 `.md` 文件？（建议：第一版只显示 .md，后续可配置）
3. **折叠动画**: 是否需要折叠/展开动画？（建议：添加平滑过渡动画提升体验）
4. **键盘快捷键**: 是否支持快捷键切换面板？（建议：后续迭代添加）

- dependencies: [{'id': 'proposal', 'done': True, 'path': 'proposal.md', 'description': 'Initial proposal document outlining the change'}]
- unlocks: ['tasks']
