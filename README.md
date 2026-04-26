# Seven Markdown - AI 时代的 Markdown 写作工作站

<div align="center">

![Seven Markdown Logo](docs/screenshots/login-design.png)

**Write Markdown Like Code**

`v0.1.0`

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Platform](https://img.shields.io/badge/Platform-macOS%20%7C%20Windows-green.svg)](https://github.com/qwzhang01/seven_md)

</div>

---

## 💡 愿景与背景

> **编程有太多好用的 AI Agent，写文章也可以有。**

在编程领域，我们已经有了许多优秀的 AI Agent：
- **Claude Code** - Anthropic 出品的强大编程助手
- **GitHub Copilot** - 全球最流行的 AI 编程助手
- **Cursor** - 专为 AI 编程打造的编辑器
- **OpenCode** - 开源的 AI 编程工具

**但写文章呢？尤其是用 Markdown 写文章？**

这是我的第一个尝试 —— **Seven Markdown**。

它不仅仅是 一个 Markdown 编辑器，更是一个 **AI 时代的写作工作站**：
- 内置 AI 对话、改写、翻译、解释能力
- 专为写作场景优化的编辑器体验
- 像代码编辑器一样的高效操作
- 未来将通过集成 **OpenCode** 打造写作/研究报告的 **AI IDE**

### 更大的愿景

Seven Markdown 只是开始。

我相信**每个专业领域都可以有自己的 AI Agent**：
- 📝 **Seven Markdown** - 写作 Agent（当前项目）
- 👥 **HR Agent** - 简历筛选、面试安排、绩效评估
- 💰 **财务 Agent** - 报表分析、预算编制、税务合规
- 📊 **数据分析 Agent** - 数据清洗、可视化、报告生成
- ⚖️ **法律 Agent** - 合同审查、法规查询、案例分析

未来可期，一起探索 🚀

> 📋 想了解更多规划细节？参阅 [docs/FUTURE_TODO.md](docs/FUTURE_TODO.md) - 完整路线图（含 Git 集成、OpenCode 集成等）

---

## ✨ 功能特性

### 编辑器
- 📝 **CodeMirror 6** - 专业级编辑体验，Markdown 语法高亮、括号匹配、自动配对
- 🔢 **行号 + 当前行高亮** - 点击行号选中整行
- 📋 **列表自动续行** - 列表回车自动续行，空行退出
- ↔️ **Tab 缩进** - Tab / Shift+Tab 控制缩进层级
- 🔍 **查找替换** - 支持大小写敏感、全字匹配、正则表达式
- 🎯 **多标签页** - 多文件编辑，拖拽排序，未保存标记
- 📋 **右键菜单** - 剪切/复制/粘贴 + 插入子菜单（标题/代码/链接/表格/列表/引用等，支持 hover 展开） + AI 改写

### 预览
- 📊 **实时预览** - 编辑器与预览左右分栏，实时同步渲染
- ✅ **GFM 支持** - GitHub Flavored Markdown（表格、任务列表、删除线）
- 📐 **数学公式** - KaTeX 渲染 LaTeX 数学公式
- 🎨 **代码高亮** - highlight.js 多语言语法高亮
- 🖥️ **3 种视图模式** - 分栏视图 / 仅编辑器 / 仅预览，可拖拽分隔条调整比例

### 界面
- 🎨 **7 种主题** - Dark（默认）、Light、Monokai、Solarized、Nord、Dracula、GitHub
- 🧭 **Tauri 原生菜单** - 文件 / 编辑 / 视图 / 插入 / 格式 / 主题 / 帮助，完整 macOS & Windows 原生体验
- 🛠️ **工具栏** - 撤销/重做 | H1-H3 | 加粗/斜体/删除线 | 代码/代码块 | 链接/图片 | 列表组 | 引用/表格/水平线 | AI
- 📁 **资源管理器** - VS Code 风格文件树，支持展开/折叠/新建/刷新，文件与文件夹均有标准右键菜单
- 🔍 **全局搜索** - 跨文件实时搜索，支持正则、大小写、全字匹配
- 📑 **大纲视图** - H1-H6 标题层级导航，**不同级别使用不同颜色区分**，支持筛选，点击跳转
- 🔖 **代码片段** - 表格/代码块/任务列表/Mermaid/PRD模板/API文档模板等
- 💬 **命令面板** - `Ctrl+Shift+P` 统一命令入口，模糊搜索
- 🤖 **AI 助手** - 4 种模式：对话 / 改写（专业/随意/简洁/扩展） / 翻译（中↔英/中→日） / 解释
- 🔔 **通知系统** - info / warning / error / success 4 种类型，**hover 暂停计时**，自动消失
- 🪟 **多窗口** - 支持通过 `Ctrl+Shift+N` 新建独立窗口
- 📊 **状态栏** - Git 分支（规划中）、同步状态、错误/警告计数、光标位置、编码、换行符、语言

### 平台
- 🖥️ **跨平台** - 原生支持 macOS 和 Windows
- 📱 **响应式布局** - 桌面端完整布局，小窗口自动适配
- 🌙 **原生集成** - macOS 交通灯、Tauri 原生菜单、窗口控制
- 🔒 **本地运行** - 纯本地应用，无网络依赖，保护隐私
- 🛡️ **安全** - CSP 防护、沙箱文件访问、输入验证

## 📸 截图

<div align="center">
<img src="docs/screenshots/light-mode.png" alt="Light Mode" width="45%">
<img src="docs/screenshots/dark-mode.png" alt="Dark Mode" width="45%">
</div>

## Logo

<div align="center">
<img src="docs/screenshots/login-double.png" alt="Logo">
</div>

## 🚀 快速开始

### 前置要求

- **Node.js** 18+
- **Rust** 1.70+

### 安装与运行

```bash
# 克隆仓库
git clone https://github.com/qwzhang01/seven_md.git
cd seven_md

# 安装依赖
npm install

# 开发模式运行
npm run tauri:dev
```

### 构建

```bash
# 构建生产版本
npm run tauri:build
```

构建产物位于 `src-tauri/target/release/bundle/` 目录。

### 常用命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 仅前端开发服务器 |
| `npm run tauri:dev` | Tauri 开发模式（含 Rust 后端） |
| `npm run tauri:build` | 生产构建 |
| `npm run test:run` | 运行单元/集成测试 |
| `npm run test:coverage` | 测试覆盖率报告 |
| `npm run test:e2e` | Playwright E2E 测试 |
| `npm run lint` | ESLint 代码检查 |
| `npm run type-check` | TypeScript 类型检查 |
| `npm run format` | Prettier 代码格式化 |

## 🛠️ 技术栈

| 技术 | 说明 |
|------|------|
| **Tauri v2** | Rust 后端，原生桌面能力（窗口管理、文件系统、**原生菜单**） |
| **React 19** | UI 框架 |
| **TypeScript** | 类型安全 |
| **Vite 5** | 构建工具 & 开发服务器 |
| **Tailwind CSS 3** | 实用优先的样式框架 |
| **CodeMirror 6** | 专业级 Markdown 编辑器引擎 |
| **Zustand 5** | 轻量级状态管理（8 个 Store） |
| **react-markdown** | Markdown 预览渲染 |
| **remark-gfm** | GFM 扩展（表格、任务列表、删除线） |
| **remark-math + rehype-katex** | 数学公式渲染 |
| **rehype-highlight** | 代码块语法高亮 |
| **Lucide React** | 图标库 |
| **i18next** | 国际化 |

## 📁 项目结构

```
seven_md/
├── src/                        # 前端源代码
│   ├── components/             # React 组件
│   │   ├── titlebar-v2/       # 标题栏（交通灯 + 标签页 + 操作按钮）
│   │   ├── toolbar-v2/        # 工具栏（格式按钮组 + AI 按钮）
│   │   ├── activitybar-v2/    # 活动栏（4 图标切换侧边栏面板）
│   │   ├── sidebar-v2/        # 侧边栏（资源管理器/搜索/大纲/片段）
│   │   ├── editor-v2/         # 编辑器 + 预览 + 分隔条 + 右键菜单 + 查找替换
│   │   ├── ai-panel/          # AI 助手（对话/改写/翻译/解释 4 模式）
│   │   ├── cmd-palette/       # 命令面板
│   │   ├── notification-v2/   # 通知系统（4 种类型，支持 hover 暂停）
│   │   ├── modal-v2/          # 模态对话框（确认/脏文件提示）
│   │   ├── dialogs/           # 业务对话框
│   │   ├── statusbar-v2/      # 状态栏
│   │   └── ErrorBoundary/     # 错误边界
│   ├── stores/                 # Zustand 状态管理（8 个 Store）
│   ├── commands/               # 命令注册与执行
│   ├── hooks/                  # 自定义 Hooks（文件操作/快捷键/搜索/主题等）
│   ├── utils/                  # 工具函数（日志/路径验证/导出/安全等）
│   ├── styles/                 # 全局样式（主题 CSS / 无障碍 / RTL）
│   ├── themes/                 # 主题定义（7 种主题）
│   ├── types/                  # TypeScript 类型定义
│   ├── i18n/                   # 国际化配置
│   ├── test/                   # 单元/集成测试
│   ├── AppV2.tsx               # 主应用组件（注册 Tauri 菜单事件）
│   └── main.tsx                # 入口文件
├── src-tauri/                  # Rust 后端
│   └── src/
│       ├── main.rs             # 应用入口 + Tauri 原生菜单定义
│       ├── commands.rs         # Tauri IPC 命令
│       └── logger.rs           # 日志模块
├── e2e/                        # Playwright E2E 测试（Page Object Model）
├── docs/                       # 项目文档（含 FUTURE_TODO.md 规划路线图）
│   └── v1/                     # v1.0 需求文档（原型 + 交互说明）
└── openspec/                   # OpenSpec 设计规范
```

> **说明**：菜单栏由 **Tauri 原生菜单** 实现（`src-tauri/src/main.rs`），前端通过监听菜单事件响应用户操作（`AppV2.tsx`），因此 `src/components/` 下不存在前端 MenuBar 组件。

## ⌨️ 快捷键

> 以下使用 `Ctrl` 占位；macOS 上等同于 `Cmd`。

### 文件操作

| 快捷键 | 功能 |
|--------|------|
| `Ctrl+N` | 新建文件 |
| `Ctrl+Shift+N` | 新建窗口 |
| `Ctrl+O` | 打开文件 |
| `Ctrl+S` | 保存 |
| `Ctrl+Alt+S` | 全部保存 |
| `Ctrl+Shift+S` | 另存为 |
| `Ctrl+W` | 关闭标签 |
| `Ctrl+Q` | 退出（macOS 下为 `Cmd+Q`） |

### 编辑

| 快捷键 | 功能 |
|--------|------|
| `Ctrl+Z` | 撤销 |
| `Ctrl+Shift+Z` | 重做 |
| `Ctrl+X` / `Ctrl+C` / `Ctrl+V` | 剪切 / 复制 / 粘贴 |
| `Ctrl+A` | 全选 |
| `Ctrl+F` | 查找 |
| `Ctrl+H` | 查找替换 |
| `Ctrl+B` | 加粗 |
| `Ctrl+I` | 斜体 |
| `Ctrl+Shift+X` | 删除线 |
| `Ctrl+K` | 插入链接 |
| `Ctrl+E` | 行内代码 |
| `Ctrl+Alt+C` | 代码块 |
| `Cmd+1` ~ `Cmd+6` | 标题 H1 ~ H6（macOS） |
| `Tab` / `Shift+Tab` | 增加/减少缩进 |

### 视图与面板

| 快捷键 | 功能 |
|--------|------|
| `Ctrl+Shift+P` | 命令面板 |
| `Ctrl+B` | 切换侧边栏（原 `Ctrl+\``，已统一为 VS Code 风格） |
| `Ctrl+Shift+E` | 切换资源管理器 |
| `Ctrl+Shift+F` | 切换搜索 |
| `Ctrl+Shift+O` | 切换大纲 |
| `Ctrl+Shift+A` | 切换 AI 助手面板 |
| `Ctrl+Alt+1` / `Ctrl+Alt+2` / `Ctrl+Alt+3` | 仅编辑器 / 仅预览 / 分栏 |
| `Ctrl+=` / `Ctrl+-` | 放大 / 缩小 |
| `Ctrl+0` | 重置缩放 |
| `F11` | 全屏 |
| `Esc` | 关闭当前弹出层 |

## 📖 文档

| 文档 | 说明 |
|------|------|
| [用户指南](docs/USER-GUIDE.md) | 完整功能使用说明 |
| [架构概览](docs/ARCHITECTURE.md) | 系统架构、组件树、状态管理 |
| [代码贡献指南](docs/CONTRIBUTING-CODE.md) | 开发环境、编码规范、PR 流程 |
| [测试指南](docs/TESTING.md) | 单元/集成测试编写与运行 |
| [E2E 测试指南](docs/E2E-TESTING.md) | Playwright E2E 测试 |
| [调试指南](docs/DEBUGGING.md) | 前后端调试技巧 |
| [未来规划 TODO](docs/FUTURE_TODO.md) | Git 集成、OpenCode 集成等完整路线图 |
| [Windows 安装指南](docs/windows-installation-guide.md) | Windows 安装与配置 |
| [Windows 故障排除](docs/windows-troubleshooting.md) | Windows 常见问题 |

## 🗺️ 开发计划

### v1.0 里程碑（已完成）

- [x] CodeMirror 6 编辑器 + 实时预览
- [x] 7 种主题切换
- [x] VS Code 风格侧边栏（资源管理器/搜索/大纲/片段）
- [x] Tauri 原生菜单（文件/编辑/视图/插入/格式/主题/帮助）
- [x] 命令面板
- [x] 右键菜单（含插入子菜单 hover 展开）
- [x] 查找替换
- [x] 通知系统（含 hover 暂停）
- [x] 多标签页管理
- [x] AI 助手（对话/改写/翻译/解释）
- [x] 多窗口支持（`Ctrl+Shift+N`）
- [x] 大纲面板 H1-H6 颜色区分

### v1.1 规划中

- [ ] 资源管理器文件 / 文件夹右键菜单
- [ ] 工具栏补齐引用按钮
- [ ] 帮助菜单完整化（欢迎页 / Markdown 指南 / 快捷键参考 / 关于 / 检查更新）
- [ ] 文件导出（PDF / HTML）

### v2.0 愿景（见 [FUTURE_TODO.md](docs/FUTURE_TODO.md)）

- [ ] ⭐ **Git 集成** - 状态栏分支显示、提交/推送/拉取、Diff 查看
- [ ] ⭐ **OpenCode 集成** - 打造 AI 写作/研究报告的 IDE
- [ ] 插件系统
- [ ] 多语言 UI
- [ ] 云同步
- [ ] 协同编辑

## 📄 许可证

本项目采用 [MIT License](LICENSE) 开源协议。

## 🙏 致谢

- [Tauri](https://tauri.app/) - 构建更小、更快、更安全的桌面应用
- [React](https://react.dev/) - 用于构建用户界面的 JavaScript 库
- [CodeMirror](https://codemirror.net/) - 可扩展的代码编辑器
- [Zustand](https://github.com/pmndrs/zustand) - 简洁的 React 状态管理
- [Tailwind CSS](https://tailwindcss.com/) - 实用优先的 CSS 框架
- [Lucide](https://lucide.dev/) - 精美的开源图标库
- [KaTeX](https://katex.org/) - 快速的数学公式渲染
