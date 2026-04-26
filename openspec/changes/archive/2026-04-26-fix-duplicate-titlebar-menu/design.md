## Context

Seven MD 是一个基于 Tauri v2 + React 19 的 macOS Markdown 阅读器。当前架构中窗口 UI 存在双层实现导致视觉重复：

**系统原生层（Tauri 后端）：**
- `tauri.conf.json5` 中 `decorations: true` → macOS 自动绘制原生交通灯和标题栏
- `main.rs` 中通过 `tauri::menu` API 创建了 File/Edit/View/Help 四个原生菜单 + 事件处理（第 63-191 行，约 130 行代码）
- 原生菜单事件通过 `app.emit("menu-*")` 转发到前端

**前端 Web 层（React）：**
- `TrafficLights.tsx`（77 行）→ 自定义绘制的红黄绿三色按钮，通过 JS bridge 调用 Tauri Window API
- `MenuBar.tsx`（121 行）+ 7 个子菜单组件 → 中文菜单（文件/编辑/视图/插入/格式/主题/帮助）
- `useMenuState.tsx`（32 行）→ 前端菜单状态管理 Context

**核心问题：** 两层同时渲染，导致出现双份交通灯和双份菜单栏。

**关键发现（代码扫描）：**
1. 前端 **未监听** 原生菜单发出的 `menu-*` 事件（搜索确认前端无 `menu-open`/`menu-save` 等 Tauri event listener），说明原生菜单当前实际不工作
2. `AppV2.tsx` 中仅监听了 `menu-open-folder`、`menu-close-folder`、`fs-watch:changed` 三个 Tauri 事件
3. 前端菜单通过 `window.dispatchEvent(new CustomEvent('app:*'))` 或 `window.dispatchEvent(new CustomEvent('editor:*'))` 触发操作
4. 原生菜单当前仅有 File/Edit/View/Help 四个菜单，**缺少** Insert/Format/Theme 三个菜单，且已有菜单也不完整

## Goals / Non-Goals

**Goals:**
- 消除双重交通灯和双重菜单栏的视觉问题
- 保留系统原生交通灯和原生菜单栏作为唯一的窗口控件和菜单系统
- **原生菜单必须 100% 覆盖前端菜单的所有功能项**（以前端为准，逐项迁移）
- 建立前端对原生菜单 `menu-*` 事件的完整监听和处理
- 彻底删除所有不再使用的前端菜单和交通灯代码（不做向后兼容）
- 清理所有相关的 CSS 变量和样式规则

**Non-Goals:**
- 不保留前端 MenuBar 作为 fallback 或可切换选项
- 不实现 `decorations: false` + 自定义标题栏方案
- 不做 Linux 平台适配（项目当前仅面向 macOS 和 Windows）
- 不重构 `TitleBar.tsx` 的 TabBar 和 TitleBarActions 部分（保持不变）
- 不修改 `useKeyboardShortcuts.ts` 快捷键逻辑（保持现有快捷键系统）

## Decisions

### Decision 1：保留 `decorations: true`，使用系统原生窗口装饰

**选择**：`tauri.conf.json5` 中 `decorations` 保持 `true`

**理由**：
- macOS 原生交通灯响应速度极快（系统级绘制，无 JS bridge 延迟）
- 符合 macOS HIG（Human Interface Guidelines）标准
- 系统自动处理全屏动画、Mission Control 集成、窗口 Snap 等高级功能
- 主流高性能工具（Zed、Warp、iTerm2）均使用原生窗口装饰

### Decision 2：原生菜单完整覆盖前端菜单（以前端为准）

**选择**：在 Rust 层重写原生菜单，**1:1 复刻**前端菜单的所有 7 个菜单和每一个菜单项

**理由**：前端菜单经过充分设计和验证，功能完整。原生菜单必须是前端菜单的完整映射，不能遗漏任何功能项。

### Decision 3：完全删除前端 MenuBar 和 TrafficLights

**选择**：彻底删除所有前端菜单和交通灯代码，不保留任何 fallback

**理由**：用户明确要求"不要向后兼容，不用的代码直接删除"

### Decision 4：原生菜单事件通过统一的前端 event listener 桥接

**选择**：每个原生菜单项 emit 唯一的 Tauri 事件，前端在 `AppV2.tsx` 中统一监听并执行对应操作

**实现方式**：Rust 层 `app.emit("menu-<action>")` → 前端 `listen("menu-<action>", handler)`

---

## 前端菜单功能完整清单 → 原生菜单映射表

> ⚠️ **以下为精确扫描前端代码后的逐项映射，原生菜单必须 100% 覆盖。**

### 📁 File 菜单（文件）— 来源：`menus/FileMenu.tsx`

| # | 前端菜单项 | 快捷键 | 前端触发方式 | 原生菜单 ID | 原生 emit 事件 | 原生快捷键 |
|---|-----------|--------|-------------|------------|---------------|-----------|
| 1 | 新建文件 | Ctrl+N | `openTab(null, '')` | `new_file` | `menu-new-file` | `CmdOrCtrl+N` |
| 2 | 新建窗口 | Ctrl+Shift+N | 无实际实现（仅 onClose） | `new_window` | `menu-new-window` | `CmdOrCtrl+Shift+N` |
| — | *分隔线* | | | | | |
| 3 | 打开文件 | Ctrl+O | `open()` dialog → `readFile` → `openTab` | `open_file` | `menu-open-file` | `CmdOrCtrl+O` |
| 4 | 打开文件夹 | — | `CustomEvent('app:open-folder')` | `open_folder` | `menu-open-folder` | — |
| — | *分隔线* | | | | | |
| 5 | 保存 | Ctrl+S | `CustomEvent('app:save-file')` | `save` | `menu-save` | `CmdOrCtrl+S` |
| 6 | 另存为 | Ctrl+Shift+S | `CustomEvent('app:save-as')` | `save_as` | `menu-save-as` | `CmdOrCtrl+Shift+S` |
| — | *分隔线* | | | | | |
| 7 | 导出为 PDF | — | `CustomEvent('app:export-pdf')` | `export_pdf` | `menu-export-pdf` | `CmdOrCtrl+Shift+P`（⚠️ 与命令面板冲突，建议不设快捷键） |
| 8 | 导出为 HTML | — | `CustomEvent('app:export-html')` | `export_html` | `menu-export-html` | — |

**⚠️ 注意**：
- 原生菜单已有 `open_folder`/`close_folder`，前端 File 菜单没有 `close_folder`。保留原生的 `close_folder`，补充到原生 File 菜单。
- 前端 File 菜单有 `新建窗口` 但无实际实现（仅调用 `onClose()`），原生菜单需要实现 `tauri::WindowBuilder` 创建新窗口。
- 原生菜单已有的 `Quit Seven MD`（`CmdOrCtrl+Q`）保留。

### ✏️ Edit 菜单（编辑）— 来源：`menus/EditMenu.tsx`

| # | 前端菜单项 | 快捷键 | 前端触发方式 | 原生菜单 ID | 原生 emit 事件 | 原生快捷键 |
|---|-----------|--------|-------------|------------|---------------|-----------|
| 1 | 撤销 | Ctrl+Z | `CustomEvent('editor:undo')` | `undo` | `menu-undo` | `CmdOrCtrl+Z` |
| 2 | 重做 | Ctrl+Shift+Z | `CustomEvent('editor:redo')` | `redo` | `menu-redo` | `CmdOrCtrl+Shift+Z` |
| — | *分隔线* | | | | | |
| 3 | 剪切 | Ctrl+X | `CustomEvent('editor:cut')` | `cut` | `menu-cut` | `CmdOrCtrl+X` |
| 4 | 复制 | Ctrl+C | `CustomEvent('editor:copy')` | `copy` | `menu-copy` | `CmdOrCtrl+C` |
| 5 | 粘贴 | Ctrl+V | `CustomEvent('editor:paste')` | `paste` | `menu-paste` | `CmdOrCtrl+V` |
| — | *分隔线* | | | | | |
| 6 | 查找 | Ctrl+F | `CustomEvent('editor:find')` | `find` | `menu-find` | `CmdOrCtrl+F` |
| 7 | 替换 | Ctrl+H | `CustomEvent('editor:replace')` | `replace` | `menu-replace` | `CmdOrCtrl+H` |

**⚠️ 注意**：
- 原生菜单已有的 `Select All`（`CmdOrCtrl+A`）保留（前端 Edit 菜单没有，但这是标准功能）。

### 👁️ View 菜单（视图）— 来源：`menus/ViewMenu.tsx`

| # | 前端菜单项 | 快捷键 | 前端触发方式 | 原生菜单 ID | 原生 emit 事件 | 原生快捷键 |
|---|-----------|--------|-------------|------------|---------------|-----------|
| 1 | 命令面板 | Ctrl+Shift+P | `ui.toggleCommandPalette()` | `command_palette` | `menu-command-palette` | `CmdOrCtrl+Shift+P` |
| — | *分隔线* | | | | | |
| 2 | 切换侧边栏 | Ctrl+B | `ui.toggleSidebar()` | `toggle_sidebar` | `menu-toggle-sidebar` | `CmdOrCtrl+\\` (⚠️ 改键避免与 Format Bold 冲突) |
| 3 | 切换大纲面板 | Ctrl+Shift+O | `ui.setActiveSidebarPanel('outline')` | `toggle_outline` | `menu-toggle-outline` | `CmdOrCtrl+Shift+O` |
| — | *分隔线* | | | | | |
| 4 | 放大 | Ctrl++ | `ui.zoomIn()` | `zoom_in` | `menu-zoom-in` | `CmdOrCtrl+=` |
| 5 | 缩小 | Ctrl+- | `ui.zoomOut()` | `zoom_out` | `menu-zoom-out` | `CmdOrCtrl+-` |
| 6 | 重置缩放 | Ctrl+0 | `ui.setZoomLevel(14)` | `reset_zoom` | `menu-reset-zoom` | `CmdOrCtrl+0` |
| — | *分隔线* | | | | | |
| 7 | 仅编辑器 | — | `ui.setViewMode('editor-only')` | `view_editor_only` | `menu-view-editor-only` | — |
| 8 | 仅预览 | — | `ui.setViewMode('preview-only')` | `view_preview_only` | `menu-view-preview-only` | — |
| 9 | 分栏视图 | — | `ui.setViewMode('split')` | `view_split` | `menu-view-split` | — |

**⚠️ 快捷键冲突**：
- 前端 View 菜单的 `切换侧边栏` 用 `Ctrl+B`，但 Format 菜单的 `加粗` 也用 `Ctrl+B`
- **解决方案**：原生菜单中将 `Toggle Sidebar` 改为 `CmdOrCtrl+\\`（VS Code 风格），`Bold` 保留 `CmdOrCtrl+B`

### 📝 Insert 菜单（插入）— 来源：`menus/InsertMenu.tsx`（⭐ 原生菜单需要完全新增）

| # | 前端菜单项 | 快捷键 | 前端触发方式（`editor:insert` detail） | 原生菜单 ID | 原生 emit 事件 |
|---|-----------|--------|---------------------------------------|------------|---------------|
| 1 | 标题 | — | `# ` | `insert_heading` | `menu-insert-heading` |
| 2 | 加粗 | — | `**加粗文本**` | `insert_bold` | `menu-insert-bold` |
| 3 | 斜体 | — | `*斜体文本*` | `menu-insert-italic` | `menu-insert-italic` |
| — | *分隔线* | | | | |
| 4 | 行内代码 | — | `` `代码` `` | `insert_inline_code` | `menu-insert-inline-code` |
| 5 | 代码块 | — | ` ```language\n\n``` ` | `insert_code_block` | `menu-insert-code-block` |
| — | *分隔线* | | | | |
| 6 | 链接 | Ctrl+K | `[文本](url)` | `insert_link` | `menu-insert-link` |
| 7 | 图片 | — | `![描述](url)` | `insert_image` | `menu-insert-image` |
| — | *分隔线* | | | | |
| 8 | 表格 | — | `\| 列1 \| 列2 \| 列3 \|\n\|---\|---\|---\|\n\| \| \| \|` | `insert_table` | `menu-insert-table` |
| 9 | 水平线 | — | `\n---\n` | `insert_hr` | `menu-insert-hr` |
| — | *分隔线* | | | | |
| 10 | 无序列表 | — | `- ` | `insert_ul` | `menu-insert-ul` |
| 11 | 有序列表 | — | `1. ` | `insert_ol` | `menu-insert-ol` |
| 12 | 任务列表 | — | `- [ ] ` | `insert_task` | `menu-insert-task` |
| — | *分隔线* | | | | |
| 13 | 引用 | — | `> ` | `insert_quote` | `menu-insert-quote` |

**⚠️ 注意**：
- 所有 Insert 操作的前端处理方式是 `window.dispatchEvent(new CustomEvent('editor:insert', { detail: text }))`
- 原生菜单 emit 事件后，前端 listener 需要将 detail 文本插入到编辑器光标位置
- 可以统一为：原生 emit `menu-insert-*` → 前端 listener 调用 `window.dispatchEvent(new CustomEvent('editor:insert', { detail: '...' }))`，复用现有的 editor:insert 处理逻辑

### 🎨 Format 菜单（格式）— 来源：`menus/FormatMenu.tsx`（⭐ 原生菜单需要完全新增）

| # | 前端菜单项 | 快捷键 | 前端触发方式（`editor:insert` detail） | 原生菜单 ID | 原生 emit 事件 | 原生快捷键 |
|---|-----------|--------|---------------------------------------|------------|---------------|-----------|
| 1 | 加粗 | Ctrl+B | `**` | `format_bold` | `menu-format-bold` | `CmdOrCtrl+B` |
| 2 | 斜体 | Ctrl+I | `*` | `format_italic` | `menu-format-italic` | `CmdOrCtrl+I` |
| 3 | 删除线 | — | `~~` | `format_strikethrough` | `menu-format-strikethrough` | — |
| — | *分隔线* | | | | | |
| 4 | 标题 1 | — | `# ` | `format_h1` | `menu-format-h1` | — |
| 5 | 标题 2 | — | `## ` | `format_h2` | `menu-format-h2` | — |
| 6 | 标题 3 | — | `### ` | `format_h3` | `menu-format-h3` | — |
| — | *分隔线* | | | | | |
| 7 | 代码 | — | `` ` `` | `format_code` | `menu-format-code` | — |
| 8 | 链接 | — | `[](url)` | `format_link` | `menu-format-link` | — |

### 🎭 Theme 菜单（主题）— 来源：`menus/ThemeMenu.tsx` + `src/themes/index.ts`（⭐ 原生菜单需要完全新增）

主题列表来自 `allThemes` 数组（`src/themes/index.ts` 第 237-238 行），共 **7 个主题**：

| # | 主题 ID | 前端显示名 | 前端图标 | isDark | 原生菜单 ID | 原生 emit 事件 |
|---|--------|-----------|---------|--------|------------|---------------|
| 1 | `dark` | 🌙 深色模式 | 🌙 | true | `theme_dark` | `menu-theme-change` + payload `"dark"` |
| 2 | `light` | ☀️ 浅色模式 | ☀️ | false | `theme_light` | `menu-theme-change` + payload `"light"` |
| 3 | `monokai` | 🎨 Monokai | 🎨 | true | `theme_monokai` | `menu-theme-change` + payload `"monokai"` |
| 4 | `solarized` | 🎨 Solarized | 🎨 | true | `theme_solarized` | `menu-theme-change` + payload `"solarized"` |
| 5 | `nord` | 🎨 Nord | 🎨 | true | `theme_nord` | `menu-theme-change` + payload `"nord"` |
| 6 | `dracula` | 🎨 Dracula | 🎨 | true | `theme_dracula` | `menu-theme-change` + payload `"dracula"` |
| 7 | `github` | 🎨 GitHub | 🎨 | false | `theme_github` | `menu-theme-change` + payload `"github"` |

**⚠️ 注意**：
- 前端 ThemeMenu 是动态从 `allThemes` 遍历生成的。原生菜单需要硬编码这 7 个主题。
- 如果后续新增主题，需要同步在 Rust 层和 `src/themes/index.ts` 两处新增。
- 建议 Rust 层 emit 统一事件 `menu-theme-change`，payload 携带 theme ID 字符串。

### ❓ Help 菜单（帮助）— 来源：`menus/HelpMenu.tsx`

| # | 前端菜单项 | 快捷键 | 前端触发方式 | 原生菜单 ID | 原生 emit 事件 |
|---|-----------|--------|-------------|------------|---------------|
| 1 | 欢迎页 | — | 无实际实现（仅 onClose） | `welcome` | `menu-welcome` |
| 2 | Markdown 指南 | — | `window.open('https://www.markdownguide.org/')` | `markdown_guide` | `menu-markdown-guide` |
| 3 | 快捷键参考 | — | 无实际实现（仅 onClose） | `keyboard_shortcuts` | `menu-keyboard-shortcuts` |
| — | *分隔线* | | | | |
| 4 | 关于 MD Mate | — | 无实际实现（仅 onClose） | `about` | `menu-about` |
| 5 | 检查更新 | — | 无实际实现（仅 onClose） | `check_update` | `menu-check-update` |

**⚠️ 注意**：
- Help 菜单中有多项前端未实际实现（仅调用 `onClose()`），原生菜单仍需保留这些菜单项并 emit 事件，待后续实现具体功能。

---

## 原生菜单 vs 前端菜单完整统计

| 菜单 | 前端菜单项数 | 原生当前已有 | 需新增到原生 | 原生最终项数 |
|------|------------|------------|------------|------------|
| File 文件 | 8 项 | 7 项（Open/OpenFolder/CloseFolder/Save/SaveAs/Export×2/Quit） | +2（New File, New Window） | 10 项（含 CloseFolder 和 Quit） |
| Edit 编辑 | 7 项 | 4 项（Copy/Cut/Paste/SelectAll） | +3（Undo/Redo/Find/Replace — 实际 +4 含 Replace） | 8 项（含 SelectAll） |
| View 视图 | 9 项 | 4 项（ToggleSidebar/ZoomIn/ZoomOut/ResetZoom） | +5（CommandPalette/ToggleOutline/EditorOnly/PreviewOnly/Split） | 9 项 |
| Insert 插入 | 13 项 | 0 项 | +13（全部新增） | 13 项 |
| Format 格式 | 8 项 | 0 项 | +8（全部新增） | 8 项 |
| Theme 主题 | 7 项 | 0 项 | +7（全部新增） | 7 项 |
| Help 帮助 | 5 项 | 1 项（About） | +4（Welcome/MarkdownGuide/KeyboardShortcuts/CheckUpdate） | 5 项 |
| **合计** | **57 项** | **16 项** | **+44 项** | **60 项** |

---

## 需要修改/删除的完整文件清单

### 🔴 删除的文件（共 14 个）

#### `src/components/menubar-v2/` — 整个目录删除（10 个文件）
| 文件 | 行数 | 说明 |
|------|------|------|
| `MenuBar.tsx` | 121 行 | 主菜单栏组件 |
| `MenuDropdown.tsx` | 139 行 | 通用下拉菜单渲染器 |
| `index.ts` | 3 行 | 导出文件 |
| `menus/FileMenu.tsx` | 73 行 | 文件菜单 |
| `menus/EditMenu.tsx` | 23 行 | 编辑菜单 |
| `menus/ViewMenu.tsx` | 29 行 | 视图菜单 |
| `menus/InsertMenu.tsx` | 36 行 | 插入菜单 |
| `menus/FormatMenu.tsx` | 28 行 | 格式菜单 |
| `menus/ThemeMenu.tsx` | 23 行 | 主题菜单 |
| `menus/HelpMenu.tsx` | 20 行 | 帮助菜单 |

#### `src/components/titlebar-v2/TrafficLights.tsx` — 删除（77 行）

#### `src/hooks/` — 删除菜单状态相关（2 个文件）
| 文件 | 行数 | 说明 |
|------|------|------|
| `useMenuState.tsx` | 32 行 | 前端菜单状态管理 Context Provider |
| `useMenuState.test.tsx` | ~111 行 | useMenuState 的测试文件 |

### 🟡 修改的文件

#### Rust 后端
| 文件 | 修改内容 |
|------|----------|
| `src-tauri/src/main.rs` | **重写整个菜单区域**：将现有 4 个菜单（16 项）扩展为 7 个菜单（60 项），包含完整的 MenuItem 创建和 on_menu_event 事件映射。预计修改第 63-191 行，代码量从约 130 行增长到约 350 行。 |

#### 前端组件
| 文件 | 修改内容 |
|------|----------|
| `src/AppV2.tsx` | ① 删除 `import { MenuBar }` 和 `<MenuBar />` ② 新增 ~60 个 `listen("menu-*")` 监听器（或按菜单分组），桥接到现有 store action 和 editor 自定义事件 ③ 可以移除 `app:save-file`/`app:open-file`/`app:new-file` DOM 事件监听（被 Tauri event 替代） |
| `src/components/titlebar-v2/TitleBar.tsx` | 删除 TrafficLights 导入和渲染 |
| `src/components/titlebar-v2/index.ts` | 删除 TrafficLights 导出 |

#### CSS 样式
| 文件 | 修改内容 |
|------|----------|
| `src/styles/themes.css` | 删除 `--menubar-height`、`[data-component="menubar"]` 相关样式 |
| `src/index.css` | 删除打印样式中的 `[class*="MenuBar"],` |

#### E2E 测试
| 文件 | 修改内容 |
|------|----------|
| `e2e/pages/MenuBarPage.ts` | 删除或重写 |
| `e2e/fixtures/index.ts` | 删除 MenuBarPage 相关 |
| `e2e/pages/PageObjectFactory.ts` | 删除 MenuBarPage 相关 |
| `e2e/tests/v2/app-launch.spec.ts` | 删除/修改菜单栏测试用例 |
| `e2e/tests/file/file-operations.spec.ts` | 修改 `[role="menubar"]` 选择器代码 |

### 🟢 不需要修改的文件

| 文件 | 理由 |
|------|------|
| `src-tauri/tauri.conf.json5` | `decorations: true` 已是目标状态 |
| `src/hooks/useKeyboardShortcuts.ts` | 独立的快捷键系统，保持不变 |
| `src/components/titlebar-v2/TabBar.tsx` | 与菜单无关 |
| `src/components/titlebar-v2/TabItem.tsx` | 与菜单无关 |
| `src/components/titlebar-v2/TitleBarActions.tsx` | 与菜单无关 |
| `src/themes/index.ts` | 主题定义不变，Rust 层引用其 ID |
| `src/stores/*.ts` | Store 层不受影响 |

---

## 注意事项

### ⚠️ 关键注意事项

1. **快捷键冲突解决**：
   - `CmdOrCtrl+B`：前端 View 菜单的"切换侧边栏"和 Format 菜单的"加粗"冲突
   - **解决**：原生菜单中 `Toggle Sidebar` 改为 `CmdOrCtrl+\\`（VS Code 风格），`Format Bold` 保留 `CmdOrCtrl+B`
   - `CmdOrCtrl+Shift+P`：前端 View 菜单的"命令面板"和 File 菜单的"导出 PDF"冲突
   - **解决**：原生菜单中 `Export PDF` 不设快捷键，`Command Palette` 保留 `CmdOrCtrl+Shift+P`

2. **Theme 菜单的 payload 传递**：Rust 层 emit 事件时需携带 theme ID 字符串作为 payload：
   ```rust
   // Rust
   app_handle.emit("menu-theme-change", "dark")
   // 前端
   listen<string>("menu-theme-change", (event) => {
     useThemeStore.getState().setTheme(event.payload as ThemeId)
   })
   ```

3. **Insert/Format 操作复用前端现有逻辑**：前端已有 `editor:insert` 自定义事件处理机制。原生菜单事件监听器可以直接 dispatch 对应的 `editor:insert` 事件，复用现有 editor 插入逻辑：
   ```typescript
   listen("menu-insert-bold", () => {
     window.dispatchEvent(new CustomEvent('editor:insert', { detail: '**加粗文本**' }))
   })
   ```

4. **macOS 系统菜单栏位置**：原生菜单显示在 macOS 系统顶部菜单栏，移除前端 MenuBar 后窗口可编辑区域增大 30px

5. **Windows 平台行为**：Tauri v2 在 Windows 上的原生菜单显示为窗口内嵌菜单栏，需测试布局

6. **Export 子菜单**：原生菜单已有 `Export` 作为 `Submenu`（含 PDF 和 HTML），保持这个子菜单结构

7. **Playwright E2E 限制**：Playwright 无法操作系统原生菜单，需改为通过快捷键测试

## Risks / Trade-offs

- **[Risk] 原生菜单英文** → 原生菜单使用英文，不像前端菜单可以显示中文。**Mitigation**：macOS 平台规范，可后续通过 Rust 读取 locale 实现 i18n。
- **[Risk] Theme 菜单静态化** → 原生菜单项在 setup 阶段创建，后续新增主题需要同步修改 Rust 代码。**Mitigation**：当前 7 个主题已经足够；如需动态化可通过 `Window::set_menu()` 重建。
- **[Risk] Insert/Format 依赖编辑器焦点** → 原生菜单点击后焦点可能不在编辑器上。**Mitigation**：前端 listener 中先调用 `editor.focus()` 再执行操作。
- **[Trade-off] E2E 覆盖降低** → 原生菜单无法通过 Playwright 直接测试。**Mitigation**：改为快捷键测试；核心操作函数通过 unit test 覆盖。
