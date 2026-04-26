## ADDED Requirements

### Requirement: 唯一交通灯按钮 — 系统原生

应用程序在 macOS 上 SHALL 仅显示一套窗口控制按钮（关闭、最小化/缩放、全屏），由系统原生渲染（`decorations: true`）。前端 SHALL NOT 渲染任何自定义交通灯组件。

#### Scenario: macOS 上只有原生交通灯
- **WHEN** 用户在 macOS 上启动 Seven MD
- **THEN** 窗口左上角仅显示系统原生的红黄绿交通灯按钮
- **AND** 前端不渲染 `TrafficLights` 组件

#### Scenario: Windows 上使用系统原生窗口按钮
- **WHEN** 用户在 Windows 上启动 Seven MD
- **THEN** 窗口右上角显示系统原生的最小化/最大化/关闭按钮

---

### Requirement: 唯一菜单栏 — 系统原生，100% 覆盖前端菜单功能

应用程序 SHALL 仅使用通过 `tauri::menu` API 创建的系统原生菜单栏。原生菜单 SHALL 完整覆盖前端菜单（`menubar-v2`）的全部 7 个菜单、57 个功能项。前端 SHALL NOT 渲染任何自定义菜单栏组件。

#### Requirement: File 菜单（10 项）

原生 File 菜单 SHALL 包含以下菜单项，顺序和分隔线如下：

| 菜单项 | Menu ID | 快捷键 | 说明 |
|--------|---------|--------|------|
| New File | `new_file` | `CmdOrCtrl+N` | 新建空白 Markdown 标签页 |
| New Window | `new_window` | `CmdOrCtrl+Shift+N` | 创建新应用窗口 |
| *separator* | | | |
| Open File... | `open_file` | `CmdOrCtrl+O` | 打开文件选择对话框 |
| Open Folder | `open_folder` | — | 打开文件夹 |
| Close Folder | `close_folder` | — | 关闭当前文件夹 |
| *separator* | | | |
| Save | `save` | `CmdOrCtrl+S` | 保存当前文件 |
| Save As... | `save_as` | `CmdOrCtrl+Shift+S` | 另存为 |
| *separator* | | | |
| Export ▸ | (submenu) | | 导出子菜单 |
| ├ Export as PDF | `export_pdf` | — | 导出为 PDF |
| └ Export as HTML | `export_html` | — | 导出为 HTML |
| *separator* | | | |
| Quit Seven MD | `quit` | `CmdOrCtrl+Q` | 退出应用 |

#### Scenario: File → New File 新建文件
- **WHEN** 用户点击 File → New File 或按 ⌘N
- **THEN** 应用创建一个新的空白 Markdown 标签页

#### Scenario: File → Open File 打开文件
- **WHEN** 用户点击 File → Open File... 或按 ⌘O
- **THEN** 弹出系统文件选择对话框（过滤 .md/.markdown）
- **AND** 选择文件后在新标签页打开

#### Scenario: File → Save 保存
- **WHEN** 用户点击 File → Save 或按 ⌘S 且当前有活动标签页
- **THEN** 保存当前标签页内容到文件

#### Requirement: Edit 菜单（8 项）

| 菜单项 | Menu ID | 快捷键 |
|--------|---------|--------|
| Undo | `undo` | `CmdOrCtrl+Z` |
| Redo | `redo` | `CmdOrCtrl+Shift+Z` |
| *separator* | | |
| Cut | `cut` | `CmdOrCtrl+X` |
| Copy | `copy` | `CmdOrCtrl+C` |
| Paste | `paste` | `CmdOrCtrl+V` |
| Select All | `select_all` | `CmdOrCtrl+A` |
| *separator* | | |
| Find | `find` | `CmdOrCtrl+F` |
| Replace | `replace` | `CmdOrCtrl+H` |

#### Scenario: Edit → Find 打开查找
- **WHEN** 用户点击 Edit → Find 或按 ⌘F
- **THEN** 编辑器显示查找栏（`FindReplaceBar`）

#### Requirement: View 菜单（9 项）

| 菜单项 | Menu ID | 快捷键 |
|--------|---------|--------|
| Command Palette | `command_palette` | `CmdOrCtrl+Shift+P` |
| *separator* | | |
| Toggle Sidebar | `toggle_sidebar` | `CmdOrCtrl+\\` |
| Toggle Outline | `toggle_outline` | `CmdOrCtrl+Shift+O` |
| *separator* | | |
| Zoom In | `zoom_in` | `CmdOrCtrl+=` |
| Zoom Out | `zoom_out` | `CmdOrCtrl+-` |
| Reset Zoom | `reset_zoom` | `CmdOrCtrl+0` |
| *separator* | | |
| Editor Only | `view_editor_only` | — |
| Preview Only | `view_preview_only` | — |
| Split View | `view_split` | — |

#### Scenario: View → Toggle Sidebar 切换侧边栏
- **WHEN** 用户点击 View → Toggle Sidebar 或按 ⌘\\
- **THEN** 侧边栏显示/隐藏状态切换

#### Scenario: View → Editor Only 切换视图模式
- **WHEN** 用户点击 View → Editor Only
- **THEN** 视图切换为仅编辑器模式

#### Requirement: Insert 菜单（13 项）— 完全新增

| 菜单项 | Menu ID | 快捷键 | 插入内容 |
|--------|---------|--------|---------|
| Heading | `insert_heading` | — | `# ` |
| Bold | `insert_bold` | — | `**加粗文本**` |
| Italic | `insert_italic` | — | `*斜体文本*` |
| *separator* | | | |
| Inline Code | `insert_inline_code` | — | `` `代码` `` |
| Code Block | `insert_code_block` | — | ` ```language\n\n``` ` |
| *separator* | | | |
| Link | `insert_link` | `CmdOrCtrl+K` | `[文本](url)` |
| Image | `insert_image` | — | `![描述](url)` |
| *separator* | | | |
| Table | `insert_table` | — | 3×1 Markdown 表格模板 |
| Horizontal Rule | `insert_hr` | — | `\n---\n` |
| *separator* | | | |
| Unordered List | `insert_ul` | — | `- ` |
| Ordered List | `insert_ol` | — | `1. ` |
| Task List | `insert_task` | — | `- [ ] ` |
| *separator* | | | |
| Blockquote | `insert_quote` | — | `> ` |

#### Scenario: Insert → Table 插入表格
- **WHEN** 用户点击 Insert → Table 且编辑器有焦点
- **THEN** 在光标位置插入 Markdown 表格模板

#### Scenario: Insert → Link 插入链接
- **WHEN** 用户点击 Insert → Link 或按 ⌘K
- **THEN** 在光标位置插入 `[文本](url)` 模板

#### Requirement: Format 菜单（8 项）— 完全新增

| 菜单项 | Menu ID | 快捷键 | 格式标记 |
|--------|---------|--------|---------|
| Bold | `format_bold` | `CmdOrCtrl+B` | `**` |
| Italic | `format_italic` | `CmdOrCtrl+I` | `*` |
| Strikethrough | `format_strikethrough` | — | `~~` |
| *separator* | | | |
| Heading 1 | `format_h1` | — | `# ` |
| Heading 2 | `format_h2` | — | `## ` |
| Heading 3 | `format_h3` | — | `### ` |
| *separator* | | | |
| Code | `format_code` | — | `` ` `` |
| Link | `format_link` | — | `[](url)` |

#### Scenario: Format → Bold 加粗
- **WHEN** 用户选中文本后点击 Format → Bold 或按 ⌘B
- **THEN** 选中文本被 `**` 包裹

#### Requirement: Theme 菜单（7 项）— 完全新增

原生菜单 SHALL 硬编码以下 7 个主题选项，与 `src/themes/index.ts` 中的 `allThemes` 数组一一对应：

| 菜单项 | Menu ID | Theme ID（payload） |
|--------|---------|-------------------|
| Dark Mode | `theme_dark` | `dark` |
| Light Mode | `theme_light` | `light` |
| Monokai | `theme_monokai` | `monokai` |
| Solarized | `theme_solarized` | `solarized` |
| Nord | `theme_nord` | `nord` |
| Dracula | `theme_dracula` | `dracula` |
| GitHub | `theme_github` | `github` |

每个主题菜单项点击后 SHALL emit `menu-theme-change` 事件，payload 为对应的 theme ID 字符串。

#### Scenario: Theme → Dracula 切换主题
- **WHEN** 用户点击 Theme → Dracula
- **THEN** 应用主题切换为 Dracula 配色
- **AND** 编辑器、侧边栏、状态栏等所有组件应用新主题

#### Requirement: Help 菜单（5 项）

| 菜单项 | Menu ID | 说明 |
|--------|---------|------|
| Welcome | `welcome` | 显示欢迎页（待实现） |
| Markdown Guide | `markdown_guide` | 打开 markdownguide.org |
| Keyboard Shortcuts | `keyboard_shortcuts` | 显示快捷键参考（待实现） |
| *separator* | | |
| About Seven MD | `about` | 显示关于对话框 |
| Check for Updates | `check_update` | 检查更新（待实现） |

#### Scenario: Help → Markdown Guide 打开指南
- **WHEN** 用户点击 Help → Markdown Guide
- **THEN** 系统默认浏览器打开 https://www.markdownguide.org/

---

### Requirement: 原生菜单事件桥接完整性

前端 SHALL 监听所有 60 个原生菜单项的 emit 事件，并正确映射到对应的操作。事件命名规则为 `menu-<action>`，如 `menu-save`、`menu-insert-bold`、`menu-theme-change`。

#### Scenario: 所有菜单事件均有前端处理器
- **WHEN** 遍历 `main.rs` 中 `on_menu_event` 的所有 emit 事件名
- **THEN** 每个事件名在前端代码中都有对应的 `listen()` 注册

### Requirement: 无前端菜单代码残留

前端代码库中 SHALL NOT 包含以下文件和代码：
- `src/components/menubar-v2/` 目录及其所有文件
- `src/components/titlebar-v2/TrafficLights.tsx`
- `src/hooks/useMenuState.tsx` 和 `src/hooks/useMenuState.test.tsx`
- `AppV2.tsx` 中对 `MenuBar` 的导入和渲染
- `TitleBar.tsx` 中对 `TrafficLights` 的导入和渲染
- CSS 中的 `--menubar-height` 变量和 `[data-component="menubar"]` 样式规则

---

## REMOVED Requirements

### Requirement: 前端自定义交通灯组件
- 删除 `TrafficLights.tsx` 及其所有功能

### Requirement: 前端自定义菜单栏组件
- 删除 `MenuBar.tsx` 及全部 7 个子菜单组件（FileMenu/EditMenu/ViewMenu/InsertMenu/FormatMenu/ThemeMenu/HelpMenu）

### Requirement: 前端菜单状态管理
- 删除 `useMenuState.tsx` Context Provider 及其测试文件
