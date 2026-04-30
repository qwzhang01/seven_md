## Why

键盘快捷键存在两类问题：(1) 复制（Cmd+C）和剪切（Cmd+X）在编辑器中无效，粘贴（Cmd+V）触发浏览器原生粘贴按钮弹出而非直接粘贴文本；(2) 缺少标签页导航快捷键（前进/后退历史、切换到下一个/上一个标签页），用户无法用键盘在标签页间高效切换。

## What Changes

- **修复 `editor:cut` 事件处理**：当前 `handleCut` 向 `viewRef.current.dom` 派发 `ClipboardEvent('cut')`，但 Tauri webview 中 `ClipboardEvent` 构造函数不携带实际剪贴板数据，导致剪切无效。改为先用 `navigator.clipboard.writeText()` 写入选中文本，再删除选中内容。
- **修复 `editor:copy` 事件处理**：同上，`ClipboardEvent('copy')` 在 Tauri webview 中不触发真实复制。改为直接调用 `navigator.clipboard.writeText()` 写入选中文本。
- **修复 `editor:paste` 事件处理**：当前实现在 `navigator.clipboard.readText()` 失败时调用 `document.execCommand('paste')`，该 fallback 会触发浏览器原生粘贴 UI 按钮弹出。改为在 Tauri 环境中使用 `@tauri-apps/plugin-clipboard-manager` 或直接通过 `navigator.clipboard.readText()` 读取，去掉 `execCommand('paste')` fallback。
- **新增标签页导航快捷键**：在 `AppV2.tsx` 的 shortcuts 数组中添加：
  - `Ctrl+Tab` / `Ctrl+Shift+Tab`：切换到下一个/上一个标签页
  - `Ctrl+PageDown` / `Ctrl+PageUp`：切换到下一个/上一个标签页（VS Code 风格备选）
  - `Alt+Left` / `Alt+Right`：标签页历史后退/前进（浏览器历史导航风格）
- **在 Tauri 原生菜单中注册标签页导航菜单项**：在 `main.rs` 的 Window 菜单（macOS）或 View 菜单中添加"下一个标签页"/"上一个标签页"菜单项，绑定对应快捷键。

## Capabilities

### New Capabilities
- `tab-keyboard-navigation`: 通过键盘快捷键在标签页间切换（下一个/上一个标签页，历史前进/后退）

### Modified Capabilities
- `keyboard-shortcuts-hook`: 新增标签页导航快捷键注册，确保 `Ctrl+Tab`、`Alt+Left/Right` 等不与 CodeMirror 内置快捷键冲突
- `keyboard-navigation`: 标签页导航场景的键盘行为规范更新
- `menubar-system`: macOS Window 菜单 / View 菜单新增标签页导航菜单项

## Impact

- **`src/components/editor-v2/EditorPaneV2.tsx`**：重写 `handleCut`、`handleCopy`、`handlePaste` 事件处理，使用 `navigator.clipboard` API 直接读写剪贴板，移除 `ClipboardEvent` 构造和 `execCommand` fallback
- **`src/AppV2.tsx`**：在 `shortcuts` 数组中新增标签页导航快捷键（`Ctrl+Tab`、`Ctrl+Shift+Tab`、`Alt+Left`、`Alt+Right`）；新增对应 Tauri 菜单事件监听
- **`src-tauri/src/main.rs`**：在 Window 菜单（macOS）或 View 菜单中新增"下一个标签页"/"上一个标签页"菜单项，绑定 `Ctrl+Tab` / `Ctrl+Shift+Tab`
- **`src/stores/useFileStore.ts`**（可能）：确认 `switchTab` 支持按索引切换，如不支持则添加 `switchToNextTab` / `switchToPrevTab` 方法
