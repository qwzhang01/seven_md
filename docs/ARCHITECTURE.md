# Architecture Overview

本文档描述 Seven MD 的整体架构，适用于开发者快速理解系统设计。

---

## 🏗️ 系统架构

Seven MD 是基于 **Tauri v2** 构建的跨平台桌面应用，采用 **Rust 后端** + **React 前端** 的混合架构。

```
┌─────────────────────────────────────────────────────┐
│                    React Frontend                    │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐ │
│  │ TitleBar │ │ MenuBar  │ │ Toolbar  │ │Activity│ │
│  │ +TabBar  │ │ (7菜单)  │ │          │ │ Bar    │ │
│  └──────────┘ └──────────┘ └──────────┘ └────────┘ │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐ │
│  │ Sidebar  │ │ Editor   │ │ Preview  │ │AI Panel│ │
│  │ (4面板)  │ │ (CM6)    │ │          │ │(4模式) │ │
│  └──────────┘ └──────────┘ └──────────┘ └────────┘ │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │ CmdPalet │ │ NotifSys │ │ StatusBar│           │
│  └──────────┘ └──────────┘ └──────────┘           │
│                                                     │
│  ┌─────────────────────────────────────────────────┐│
│  │           Zustand Stores (8 stores)             ││
│  └─────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────┤
│                    Tauri IPC Bridge                  │
├─────────────────────────────────────────────────────┤
│                    Rust Backend                      │
│  File System │ Window Manager │ Menu System          │
└─────────────────────────────────────────────────────┘
```

---

## 📦 技术栈

### 前端

| 技术 | 用途 |
|------|------|
| React 19 | UI 框架 |
| TypeScript | 类型安全 |
| Vite 5 | 构建工具 & 开发服务器 |
| Tailwind CSS 3 | 样式系统 |
| CodeMirror 6 | Markdown 代码编辑器 |
| Zustand 5 | 状态管理 |
| react-markdown 10 | Markdown 预览渲染 |
| remark-gfm | GFM 扩展（表格、任务列表、删除线） |
| remark-math + rehype-katex | 数学公式渲染 |
| rehype-highlight | 代码块语法高亮 |
| Lucide React | 图标库 |
| i18next | 国际化 |

### 后端

| 技术 | 用途 |
|------|------|
| Rust | 原生后端逻辑 |
| Tauri v2 | 桌面应用框架、窗口管理、文件系统访问 |

---

## 🧩 组件架构

```
AppV2
├── TitleBar
│   ├── TrafficLights (macOS 交通灯)
│   ├── TabBar (文件标签页)
│   └── TitleBarActions (命令面板/侧边栏切换)
├── MenuBar (文件/编辑/视图/插入/格式/主题/帮助)
│   └── MenuDropdown (各菜单下拉)
│       ├── FileMenu
│       ├── EditMenu
│       ├── ViewMenu
│       ├── InsertMenu
│       ├── FormatMenu
│       ├── ThemeMenu
│       └── HelpMenu
├── Toolbar (格式按钮 + 视图切换 + AI 按钮)
│   ├── ToolbarGroup
│   └── ToolbarButton
├── MainArea
│   ├── ActivityBar (资源管理器/搜索/大纲/片段)
│   ├── Sidebar
│   │   ├── ExplorerPanel (文件树)
│   │   ├── SearchPanel (全局搜索)
│   │   ├── OutlinePanel (文档大纲)
│   │   └── SnippetsPanel (代码片段)
│   └── EditorArea
│       ├── EditorPaneV2 (CodeMirror 6 编辑器)
│       │   ├── EditorContextMenu (右键菜单 + 插入子菜单)
│       │   └── FindReplaceBar (查找替换栏)
│       ├── Gutter (可拖拽分割线)
│       └── PreviewPaneV2 (Markdown 实时渲染)
├── CommandPalette (Ctrl+Shift+P 命令面板)
├── AIPanel (AI 助手面板)
│   ├── ChatMode (对话模式)
│   ├── RewriteMode (改写模式)
│   ├── TranslateMode (翻译模式)
│   └── ExplainMode (解释模式)
├── NotificationSystem
│   ├── NotificationContainer
│   └── NotificationItem (info/warning/error/success)
├── Modal
│   ├── ConfirmDialog
│   └── DirtyTabModal
├── StatusBar
└── ErrorBoundary
```

---

## 🗂️ 状态管理（Zustand Stores）

| Store | 职责 |
|-------|------|
| `useEditorStore` | 编辑器内容、光标位置、选区状态、查找替换 |
| `useUIStore` | 侧边栏/面板可见性、视图模式、模态对话框 |
| `useThemeStore` | 主题切换、CSS 变量管理 |
| `useFileStore` | 文件树、当前文件、工作区管理 |
| `useAIStore` | AI 对话消息、AI 面板模式、加载状态 |
| `useNotificationStore` | 通知队列管理（4 种类型） |
| `useCommandStore` | 命令注册、执行与检索 |
| `useSettingsStore` | 用户偏好设置持久化 |

---

## 🎨 主题系统

7 种内置主题，基于 CSS 变量（`--bg-*`、`--text-*`、`--border-*`、`--accent-*` 等 40+ 变量）实现全局切换：

| 主题 | 风格 | 背景色 |
|------|------|--------|
| Dark（默认） | 经典暗色 | `#1e1e1e` |
| Light | 经典亮色 | `#ffffff` |
| Monokai | Sublime 经典 | `#272822` |
| Solarized | 护眼暖色调 | `#002b36` |
| Nord | 北极蓝调 | `#2e3440` |
| Dracula | 紫调暗色 | `#282a36` |
| GitHub | GitHub 浅色 | `#ffffff` |

切换方式：菜单栏 → 主题、命令面板输入 "主题"。切换即时生效，自动保存到本地存储。

---

## ⌨️ 命令系统

所有操作统一通过 `useCommandStore` 注册和管理。菜单项、工具栏按钮、快捷键、命令面板均通过**命令 ID** 触发同一个命令处理器，保证行为一致性。

命令注册在 `src/commands/index.ts` 和 `src/commands/registry.ts` 中完成。

---

## 🔐 安全模型

- **CSP 启用** - Content Security Policy 防止 XSS
- **沙箱文件访问** - 仅允许用户主动选择的文件路径
- **无外部网络请求** - 纯本地应用，保护用户隐私
- **输入验证** - 路径验证（`pathValidator.ts`）、输入消毒（`inputSanitizer.ts`）

---

## 📁 项目结构

```
seven_md/
├── src/                        # 前端源代码
│   ├── components/
│   │   ├── titlebar-v2/       # 标题栏（交通灯 + 标签页 + 操作按钮）
│   │   ├── menubar-v2/        # 菜单栏（7 大菜单 + 下拉面板）
│   │   ├── toolbar-v2/        # 工具栏（格式按钮组 + AI 按钮）
│   │   ├── activitybar-v2/    # 活动栏（4 个图标切换侧边栏面板）
│   │   ├── sidebar-v2/        # 侧边栏（资源管理器/搜索/大纲/片段）
│   │   ├── editor-v2/         # 编辑器（CM6 + 预览 + 右键菜单 + 查找替换 + 分隔条）
│   │   ├── ai-panel/          # AI 助手（对话/改写/翻译/解释 4 模式）
│   │   ├── cmd-palette/       # 命令面板
│   │   ├── notification-v2/   # 通知系统（4 种类型）
│   │   ├── modal-v2/          # 模态对话框（确认/脏文件提示）
│   │   ├── statusbar-v2/      # 状态栏
│   │   └── ErrorBoundary/     # 错误边界
│   ├── stores/                 # Zustand 状态管理（8 个 store）
│   ├── commands/               # 命令注册与执行
│   ├── hooks/                  # 自定义 Hooks
│   ├── utils/                  # 工具函数（日志/路径/导出/安全等）
│   ├── styles/                 # 全局样式（主题 CSS / 无障碍 / RTL）
│   ├── themes/                 # 主题定义
│   ├── types/                  # TypeScript 类型定义
│   ├── i18n/                   # 国际化配置
│   ├── test/                   # 单元/集成测试
│   ├── AppV2.tsx               # 主应用组件
│   └── main.tsx                # 入口文件
├── src-tauri/                  # Rust 后端
│   └── src/
│       ├── main.rs             # 应用入口
│       ├── lib.rs              # 库导出
│       ├── commands.rs         # Tauri IPC 命令
│       ├── logger.rs           # 日志模块
│       └── menu.rs             # 原生菜单
├── e2e/                        # Playwright E2E 测试
│   ├── tests/                  # 测试用例
│   ├── pages/                  # Page Object Model
│   ├── fixtures/               # 测试夹具
│   ├── helpers/                # 辅助工具
│   └── setup/                  # 环境设置
├── docs/                       # 项目文档
│   └── v1.0/                   # v1.0 需求文档（原型 + 交互说明）
└── openspec/                   # OpenSpec 设计规范
```

---

## 🧪 测试体系

| 层级 | 框架 | 范围 |
|------|------|------|
| 前端单元测试 | Vitest + React Testing Library | 组件、Store、Hooks、工具函数 |
| 前端集成测试 | Vitest | 命令执行、标签管理、主题切换 |
| E2E 测试 | Playwright | 用户完整操作流程 |
| 后端测试 | cargo test | Rust 命令层测试 |

---

## 📐 视图模式

| 模式 | 说明 |
|------|------|
| 分栏视图 | 编辑器 + 预览并排（默认） |
| 仅编辑器 | 隐藏预览，编辑器占满 |
| 仅预览 | 隐藏编辑器，预览占满 |

切换通过视图菜单、命令面板或编辑器标签栏右侧按钮触发。

---

## 📱 响应式适配

- **桌面端（≥769px）**：完整布局（活动栏 + 侧边栏 + 编辑器 + 预览）
- **移动端（<768px）**：侧边栏收起，编辑器与预览上下排列
