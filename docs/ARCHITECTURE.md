# Architecture Overview

本文档提供 Seven MD V2 的高层架构概览。

## 🏗️ 系统架构

Seven MD 是基于 **Tauri v2** 构建的桌面应用，结合 **Rust 后端** 与 **React 前端**。

```
┌─────────────────────────────────────────────────────┐
│                    React Frontend                    │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐ │
│  │ TitleBar │ │ MenuBar  │ │ Toolbar  │ │Activity│ │
│  │ +TabBar  │ │ (7菜单)  │ │          │ │ Bar    │ │
│  └──────────┘ └──────────┘ └──────────┘ └────────┘ │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐ │
│  │ Sidebar  │ │ Editor   │ │ Preview  │ │AI Panel│ │
│  │ (4面板)  │ │ (CM6)    │ │          │ │        │ │
│  └──────────┘ └──────────┘ └──────────┘ └────────┘ │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │ CmdPallet│ │ NotifSys │ │ StatusBar│           │
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

## 📦 技术栈

### 前端

| 技术 | 用途 |
|------|------|
| React 19 | UI 框架 |
| TypeScript | 类型安全 |
| Vite | 构建工具 & 开发服务器 |
| Tailwind CSS | 样式 |
| CodeMirror 6 | 代码编辑器 |
| Zustand | 状态管理 |
| ReactMarkdown | Markdown 渲染 |
| remark-gfm | GFM 扩展 |
| rehype-highlight | 代码高亮 |
| remark-math + rehype-katex | 数学公式 |
| Lucide React | 图标库 |

### 后端

| 技术 | 用途 |
|------|------|
| Rust | 原生后端 |
| Tauri v2 | 桌面框架 |

## 🧩 组件架构（V2）

```
AppV2
├── TitleBar (交通灯 + TabBar)
├── MenuBar (文件/编辑/视图/插入/格式/主题/帮助)
├── Toolbar (格式按钮组 + 视图切换 + AI 按钮)
├── MainArea
│   ├── ActivityBar (资源管理器/搜索/大纲/片段/AI)
│   ├── Sidebar (4 个面板切换)
│   └── EditorArea
│       ├── EditorPaneV2 (CodeMirror 6)
│       │   ├── EditorContextMenu (右键菜单)
│       │   └── FindReplaceBar (查找替换)
│       ├── Gutter (可拖拽分割线)
│       └── PreviewPaneV2 (Markdown 渲染)
├── CommandPalette (Ctrl+Shift+P)
├── AIPanel (对话/改写模式)
├── NotificationSystem
├── ModalDialog
└── StatusBar
```

## 🗂️ 状态管理（Zustand Stores）

| Store | 职责 |
|-------|------|
| `useEditorStore` | 编辑器内容、光标、选区、查找替换 |
| `useUIStore` | 侧边栏/面板可见性、视图模式、模态对话框 |
| `useThemeStore` | 主题切换、CSS 变量管理 |
| `useFileStore` | 文件树、当前文件、工作区 |
| `useTabStore` | 多标签页管理 |
| `useAIStore` | AI 对话消息、加载状态 |
| `useNotificationStore` | 通知队列管理 |
| `useCommandStore` | 命令注册与执行 |

## 🎨 主题系统

7 种内置主题，基于 CSS 变量实现：

| 主题 | 风格 |
|------|------|
| Light | 经典亮色 |
| Dark | 经典暗色 |
| Nord | 北极蓝调 |
| Solarized Light | 护眼暖色 |
| Solarized Dark | 护眼暗色 |
| One Dark | Atom 风格暗色 |
| Dracula | 紫调暗色 |

每个主题定义 40+ CSS 变量，覆盖背景、文字、边框、交互等所有视觉元素。

## ⌨️ 命令系统

命令通过 `useCommandStore` 统一注册和管理，所有菜单项、工具栏按钮、快捷键都通过命令 ID 触发。

## 🔐 安全模型

- **CSP 启用** - Content Security Policy 防止 XSS
- **沙箱文件访问** - 仅允许用户选择的文件路径
- **无外部网络请求** - 纯本地应用
- **输入验证** - 路径验证、文件名验证

## 📁 项目结构

```
src/
├── components/
│   ├── titlebar-v2/       # 标题栏 + 标签页
│   ├── menubar-v2/        # 菜单栏
│   ├── toolbar-v2/        # 工具栏
│   ├── activitybar-v2/    # 活动栏
│   ├── sidebar-v2/        # 侧边栏（4 面板）
│   ├── editor-v2/         # 编辑器 + 预览 + 查找替换
│   ├── ai-panel/          # AI 助手
│   ├── cmd-palette/       # 命令面板
│   ├── notification-v2/   # 通知系统
│   ├── modal-v2/          # 模态对话框
│   └── statusbar-v2/      # 状态栏
├── stores/                # Zustand stores
├── commands/              # 命令注册
├── styles/                # 主题 CSS
├── AppV2.tsx              # 主应用
└── main.tsx               # 入口
```

## 🧪 测试

- **单元测试** - Vitest + React Testing Library（82 个测试）
- **E2E 测试** - Playwright（5 个 spec 文件）
- **Rust 测试** - cargo test
