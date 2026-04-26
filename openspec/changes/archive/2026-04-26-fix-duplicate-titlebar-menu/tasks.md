## 1. 重写 Rust 原生菜单 — 完整覆盖前端全部 57 个菜单项

> 重写 `src-tauri/src/main.rs` 第 63-191 行的菜单代码，从当前 4 个菜单 16 项扩展为 7 个菜单 60 项。

### 1.1 File 菜单（10 项）

- [x] 1.1.1 新增 `new_file` 菜单项（`CmdOrCtrl+N`），emit `menu-new-file`
- [x] 1.1.2 新增 `new_window` 菜单项（`CmdOrCtrl+Shift+N`），emit `menu-new-window`
- [x] 1.1.3 保留 `open_file`（`CmdOrCtrl+O`），emit `menu-open-file`（原 `menu-open`，统一命名）
- [x] 1.1.4 保留 `open_folder`，emit `menu-open-folder`
- [x] 1.1.5 保留 `close_folder`，emit `menu-close-folder`
- [x] 1.1.6 保留 `save`（`CmdOrCtrl+S`），emit `menu-save`
- [x] 1.1.7 保留 `save_as`（`CmdOrCtrl+Shift+S`），emit `menu-save-as`
- [x] 1.1.8 保留 Export 子菜单：`export_pdf`（emit `menu-export-pdf`，**移除快捷键避免与命令面板冲突**）、`export_html`（emit `menu-export-html`）
- [x] 1.1.9 保留 `quit`（`CmdOrCtrl+Q`），emit `menu-quit`
- [x] 1.1.10 按照正确顺序排列并添加分隔线（New File/New Window → sep → Open/OpenFolder/CloseFolder → sep → Save/SaveAs → sep → Export → sep → Quit）

### 1.2 Edit 菜单（8 项）

- [x] 1.2.1 **新增** `undo`（`CmdOrCtrl+Z`），emit `menu-undo`
- [x] 1.2.2 **新增** `redo`（`CmdOrCtrl+Shift+Z`），emit `menu-redo`
- [x] 1.2.3 保留 `cut`（`CmdOrCtrl+X`），emit `menu-cut`
- [x] 1.2.4 保留 `copy`（`CmdOrCtrl+C`），emit `menu-copy`
- [x] 1.2.5 保留 `paste`（`CmdOrCtrl+V`），emit `menu-paste`
- [x] 1.2.6 保留 `select_all`（`CmdOrCtrl+A`），emit `menu-select-all`
- [x] 1.2.7 **新增** `find`（`CmdOrCtrl+F`），emit `menu-find`
- [x] 1.2.8 **新增** `replace`（`CmdOrCtrl+H`），emit `menu-replace`
- [x] 1.2.9 按顺序：Undo/Redo → sep → Cut/Copy/Paste/SelectAll → sep → Find/Replace

### 1.3 View 菜单（9 项）

- [x] 1.3.1 **新增** `command_palette`（`CmdOrCtrl+Shift+P`），emit `menu-command-palette`
- [x] 1.3.2 保留 `toggle_sidebar`，**快捷键改为 `CmdOrCtrl+\\`**（避免与 Format Bold 的 `CmdOrCtrl+B` 冲突），emit `menu-toggle-sidebar`
- [x] 1.3.3 **新增** `toggle_outline`（`CmdOrCtrl+Shift+O`），emit `menu-toggle-outline`
- [x] 1.3.4 保留 `zoom_in`（`CmdOrCtrl+=`），emit `menu-zoom-in`
- [x] 1.3.5 保留 `zoom_out`（`CmdOrCtrl+-`），emit `menu-zoom-out`
- [x] 1.3.6 保留 `reset_zoom`（`CmdOrCtrl+0`），emit `menu-reset-zoom`
- [x] 1.3.7 **新增** `view_editor_only`（无快捷键），emit `menu-view-editor-only`
- [x] 1.3.8 **新增** `view_preview_only`（无快捷键），emit `menu-view-preview-only`
- [x] 1.3.9 **新增** `view_split`（无快捷键），emit `menu-view-split`
- [x] 1.3.10 按顺序：CommandPalette → sep → Sidebar/Outline → sep → Zoom → sep → ViewModes

### 1.4 Insert 菜单（13 项）— 全部新增

- [x] 1.4.1 创建 Insert `Submenu`，包含以下菜单项：
  - `insert_heading`（Heading） → emit `menu-insert-heading`
  - `insert_bold`（Bold） → emit `menu-insert-bold`
  - `insert_italic`（Italic） → emit `menu-insert-italic`
  - *separator*
  - `insert_inline_code`（Inline Code） → emit `menu-insert-inline-code`
  - `insert_code_block`（Code Block） → emit `menu-insert-code-block`
  - *separator*
  - `insert_link`（Link，`CmdOrCtrl+K`） → emit `menu-insert-link`
  - `insert_image`（Image） → emit `menu-insert-image`
  - *separator*
  - `insert_table`（Table） → emit `menu-insert-table`
  - `insert_hr`（Horizontal Rule） → emit `menu-insert-hr`
  - *separator*
  - `insert_ul`（Unordered List） → emit `menu-insert-ul`
  - `insert_ol`（Ordered List） → emit `menu-insert-ol`
  - `insert_task`（Task List） → emit `menu-insert-task`
  - *separator*
  - `insert_quote`（Blockquote） → emit `menu-insert-quote`

### 1.5 Format 菜单（8 项）— 全部新增

- [x] 1.5.1 创建 Format `Submenu`，包含以下菜单项：
  - `format_bold`（Bold，`CmdOrCtrl+B`） → emit `menu-format-bold`
  - `format_italic`（Italic，`CmdOrCtrl+I`） → emit `menu-format-italic`
  - `format_strikethrough`（Strikethrough） → emit `menu-format-strikethrough`
  - *separator*
  - `format_h1`（Heading 1） → emit `menu-format-h1`
  - `format_h2`（Heading 2） → emit `menu-format-h2`
  - `format_h3`（Heading 3） → emit `menu-format-h3`
  - *separator*
  - `format_code`（Code） → emit `menu-format-code`
  - `format_link`（Link） → emit `menu-format-link`

### 1.6 Theme 菜单（7 项）— 全部新增

- [x] 1.6.1 创建 Theme `Submenu`，硬编码 7 个主题（对应 `src/themes/index.ts` 的 `allThemes`）：
  - `theme_dark`（Dark Mode） → emit `menu-theme-change` + payload `"dark"`
  - `theme_light`（Light Mode） → emit `menu-theme-change` + payload `"light"`
  - `theme_monokai`（Monokai） → emit `menu-theme-change` + payload `"monokai"`
  - `theme_solarized`（Solarized） → emit `menu-theme-change` + payload `"solarized"`
  - `theme_nord`（Nord） → emit `menu-theme-change` + payload `"nord"`
  - `theme_dracula`（Dracula） → emit `menu-theme-change` + payload `"dracula"`
  - `theme_github`（GitHub） → emit `menu-theme-change` + payload `"github"`

### 1.7 Help 菜单（5 项）

- [x] 1.7.1 **新增** `welcome`（Welcome） → emit `menu-welcome`
- [x] 1.7.2 **新增** `markdown_guide`（Markdown Guide） → emit `menu-markdown-guide`
- [x] 1.7.3 **新增** `keyboard_shortcuts`（Keyboard Shortcuts） → emit `menu-keyboard-shortcuts`
- [x] 1.7.4 保留 `about`（About Seven MD） → emit `menu-about`
- [x] 1.7.5 **新增** `check_update`（Check for Updates） → emit `menu-check-update`
- [x] 1.7.6 按顺序：Welcome/MarkdownGuide/KeyboardShortcuts → sep → About/CheckUpdate

### 1.8 on_menu_event 事件处理

- [x] 1.8.1 重写 `on_menu_event` 闭包，为所有 60 个菜单项 ID 添加 match arm，每个 emit 对应事件
- [x] 1.8.2 Theme 菜单项的 emit 需携带 payload：`app_handle.emit("menu-theme-change", theme_id_string)`

---

## 2. 前端添加原生菜单事件监听（约 60 个 listener）

> 在 `src/AppV2.tsx` 中新增 `useEffect`，使用 `listen()` 监听所有原生菜单 emit 的 Tauri 事件。

### 2.1 File 菜单事件监听

- [x] 2.1.1 `menu-new-file` → `openTab(null, '')`
- [x] 2.1.2 `menu-new-window` → 暂时 noop（TODO 注释）
- [x] 2.1.3 `menu-open-file` → `handleOpenFile()`
- [x] 2.1.4 `menu-open-folder` → `useWorkspaceStore.getState().openFolder()`
- [x] 2.1.5 `menu-close-folder` → `useWorkspaceStore.getState().closeFolder()`
- [x] 2.1.6 `menu-save` → `handleSaveFile()`
- [x] 2.1.7 `menu-save-as` → 实现另存为逻辑（open save dialog → saveFile）
- [x] 2.1.8 `menu-export-pdf` → `window.dispatchEvent(new CustomEvent('app:export-pdf'))`
- [x] 2.1.9 `menu-export-html` → `window.dispatchEvent(new CustomEvent('app:export-html'))`
- [x] 2.1.10 `menu-quit` → `getCurrentWindow().close()`

### 2.2 Edit 菜单事件监听

- [x] 2.2.1 `menu-undo` → `window.dispatchEvent(new CustomEvent('editor:undo'))`
- [x] 2.2.2 `menu-redo` → `window.dispatchEvent(new CustomEvent('editor:redo'))`
- [x] 2.2.3 `menu-cut` → `window.dispatchEvent(new CustomEvent('editor:cut'))`
- [x] 2.2.4 `menu-copy` → `window.dispatchEvent(new CustomEvent('editor:copy'))`
- [x] 2.2.5 `menu-paste` → `window.dispatchEvent(new CustomEvent('editor:paste'))`
- [x] 2.2.6 `menu-select-all` → `window.dispatchEvent(new CustomEvent('editor:select-all'))`
- [x] 2.2.7 `menu-find` → `useUIStore.getState().setFindReplaceMode('find')`
- [x] 2.2.8 `menu-replace` → `useUIStore.getState().setFindReplaceMode('replace')`

### 2.3 View 菜单事件监听

- [x] 2.3.1 `menu-command-palette` → `useUIStore.getState().toggleCommandPalette()`
- [x] 2.3.2 `menu-toggle-sidebar` → `useUIStore.getState().toggleSidebar()`
- [x] 2.3.3 `menu-toggle-outline` → `useUIStore.getState().setActiveSidebarPanel('outline')`
- [x] 2.3.4 `menu-zoom-in` → `useUIStore.getState().zoomIn()`
- [x] 2.3.5 `menu-zoom-out` → `useUIStore.getState().zoomOut()`
- [x] 2.3.6 `menu-reset-zoom` → `useUIStore.getState().setZoomLevel(14)`
- [x] 2.3.7 `menu-view-editor-only` → `useUIStore.getState().setViewMode('editor-only')`
- [x] 2.3.8 `menu-view-preview-only` → `useUIStore.getState().setViewMode('preview-only')`
- [x] 2.3.9 `menu-view-split` → `useUIStore.getState().setViewMode('split')`

### 2.4 Insert 菜单事件监听（复用 `editor:insert` 自定义事件）

- [x] 2.4.1 `menu-insert-heading` → `dispatchEvent(new CustomEvent('editor:insert', { detail: '# ' }))`
- [x] 2.4.2 `menu-insert-bold` → detail: `'**加粗文本**'`
- [x] 2.4.3 `menu-insert-italic` → detail: `'*斜体文本*'`
- [x] 2.4.4 `menu-insert-inline-code` → detail: `` '`代码`' ``
- [x] 2.4.5 `menu-insert-code-block` → detail: `` '```language\n\n```' ``
- [x] 2.4.6 `menu-insert-link` → detail: `'[文本](url)'`
- [x] 2.4.7 `menu-insert-image` → detail: `'![描述](url)'`
- [x] 2.4.8 `menu-insert-table` → detail: `'| 列1 | 列2 | 列3 |\n|------|------|------|\n| | | |'`
- [x] 2.4.9 `menu-insert-hr` → detail: `'\n---\n'`
- [x] 2.4.10 `menu-insert-ul` → detail: `'- '`
- [x] 2.4.11 `menu-insert-ol` → detail: `'1. '`
- [x] 2.4.12 `menu-insert-task` → detail: `'- [ ] '`
- [x] 2.4.13 `menu-insert-quote` → detail: `'> '`

### 2.5 Format 菜单事件监听（复用 `editor:insert` 自定义事件）

- [x] 2.5.1 `menu-format-bold` → detail: `'**'`
- [x] 2.5.2 `menu-format-italic` → detail: `'*'`
- [x] 2.5.3 `menu-format-strikethrough` → detail: `'~~'`
- [x] 2.5.4 `menu-format-h1` → detail: `'# '`
- [x] 2.5.5 `menu-format-h2` → detail: `'## '`
- [x] 2.5.6 `menu-format-h3` → detail: `'### '`
- [x] 2.5.7 `menu-format-code` → detail: `` '`' ``
- [x] 2.5.8 `menu-format-link` → detail: `'[](url)'`

### 2.6 Theme 菜单事件监听

- [x] 2.6.1 `menu-theme-change` → 从 event.payload 读取 theme ID，调用 `useThemeStore.getState().setTheme(payload as ThemeId)`

### 2.7 Help 菜单事件监听

- [x] 2.7.1 `menu-welcome` → 暂时 noop（TODO 注释）
- [x] 2.7.2 `menu-markdown-guide` → `window.open('https://www.markdownguide.org/', '_blank')`
- [x] 2.7.3 `menu-keyboard-shortcuts` → 暂时 noop（TODO 注释）
- [x] 2.7.4 `menu-about` → 暂时 noop（TODO 注释）
- [x] 2.7.5 `menu-check-update` → 暂时 noop（TODO 注释）

### 2.8 Cleanup

- [x] 2.8.1 确保所有 `listen()` 返回的 unlisten 函数在 useEffect cleanup 中正确调用
- [x] 2.8.2 移除 `AppV2.tsx` 中通过 `window.addEventListener` 监听 `app:save-file`/`app:open-file`/`app:new-file` 的代码，这些操作已由 Tauri event listener 替代

---

## 3. 删除前端 MenuBar 组件

- [x] 3.1 删除整个 `src/components/menubar-v2/` 目录（10 个文件）
- [x] 3.2 在 `src/AppV2.tsx` 中删除 `import { MenuBar } from './components/menubar-v2/MenuBar'`
- [x] 3.3 在 `src/AppV2.tsx` 中删除 `<MenuBar />` JSX 渲染

## 4. 删除前端 TrafficLights 组件

- [x] 4.1 删除 `src/components/titlebar-v2/TrafficLights.tsx`
- [x] 4.2 修改 `src/components/titlebar-v2/TitleBar.tsx`：删除 `import { TrafficLights }` 和 `<TrafficLights />`
- [x] 4.3 修改 `src/components/titlebar-v2/index.ts`：删除 `export { TrafficLights }`

## 5. 删除前端菜单状态管理

- [x] 5.1 删除 `src/hooks/useMenuState.tsx`
- [x] 5.2 删除 `src/hooks/useMenuState.test.tsx`
- [x] 5.3 全局搜索确认没有其他文件导入 `useMenuState` ✅ 无残留

## 6. 清理 CSS 样式

- [x] 6.1 `src/styles/themes.css`：删除 `--menubar-height: 30px;`
- [x] 6.2 `src/styles/themes.css`：删除 `[data-component="menubar"] { font-size: 11px; }`
- [x] 6.3 `src/styles/themes.css`：删除 `[data-component="menubar"] { overflow-x: auto; }`
- [x] 6.4 `src/index.css`：删除 `[class*="MenuBar"],`

## 7. 更新 E2E 测试

- [x] 7.1 删除 `e2e/pages/MenuBarPage.ts`
- [x] 7.2 修改 `e2e/fixtures/index.ts`：移除 MenuBarPage 导入和 fixture
- [x] 7.3 修改 `e2e/pages/PageObjectFactory.ts`：移除 MenuBarPage 相关
- [x] 7.4 修改 `e2e/tests/v2/app-launch.spec.ts`：删除 "菜单栏渲染 7 个菜单" 用例
- [x] 7.5 修改 `e2e/tests/file/file-operations.spec.ts`：将 `[role="menubar"]` 选择器改为快捷键测试
- [x] 7.6 修改 `e2e/tests/editor/user-interaction.spec.ts`：更新菜单栏测试注释

## 8. 验证和回归测试

- [x] 8.1 编译 Rust 后端无错误、无警告 ✅ `cargo check` 通过
- [x] 8.2 编译前端无 TypeScript 错误 ✅ `tsc --noEmit` 通过
- [x] 8.3 Vite 前端构建通过 ✅ `vite build` 成功
- [ ] 8.4 macOS 上运行：确认只有一套交通灯和一套菜单栏 ⏳ 需手动验证
- [ ] 8.5 逐一点击原生菜单全部 60 个菜单项，确认前端操作正确执行 ⏳ 需手动验证
- [ ] 8.6 验证 ⌘N/⌘O/⌘S/⌘B/⌘I/⌘K/⌘F/⌘H/⌘\\等快捷键正常工作 ⏳ 需手动验证
- [ ] 8.7 验证 Insert 菜单在编辑器有焦点时正确插入内容 ⏳ 需手动验证
- [ ] 8.8 验证 Theme 菜单切换全部 7 个主题正常 ⏳ 需手动验证
- [ ] 8.9 验证窗口拖拽正常 ⏳ 需手动验证
- [ ] 8.10 确认全局搜索无 `menubar-v2`、`TrafficLights`、`useMenuState` 残留 ✅ 已确认

---

## ⚠️ 实施顺序建议

1. ~~**Phase 1 — Rust 原生菜单重写**（任务 1）~~ ✅ 已完成
2. ~~**Phase 2 — 前端事件监听**（任务 2）~~ ✅ 已完成
3. ~~**Phase 3 — 验证桥接**~~ ✅ 已跳过（同时实施 Phase 4）
4. ~~**Phase 4 — 删除前端代码**（任务 3-6）~~ ✅ 已完成
5. ~~**Phase 5 — 测试更新**（任务 7）~~ ✅ 已完成
6. **Phase 6 — 全面验证**（任务 8）⏳ 编译验证通过，运行时验证需手动进行
