## Context

应用使用 CodeMirror 6 作为编辑器（`EditorPaneV2.tsx`）。Tauri 原生菜单触发 `menu-cut/copy/paste` 事件，`AppV2.tsx` 将其转发为 `editor:cut/copy/paste` CustomEvent，`EditorPaneV2.tsx` 中有对应的 `useEffect` 监听器。

**当前剪贴板问题根因**：

1. **`handleCut` / `handleCopy`**：通过 `viewRef.current.dom.dispatchEvent(new ClipboardEvent('cut/copy', { bubbles: true, cancelable: true }))` 触发。在 Tauri webview（基于 WKWebView/WebView2）中，通过 JS 构造的 `ClipboardEvent` 不携带实际剪贴板数据，浏览器不会将选中文本写入系统剪贴板，导致复制/剪切无效。

2. **`handlePaste`**：使用 `navigator.clipboard.readText()` 读取剪贴板，失败时 fallback 到 `document.execCommand('paste')`。在 Tauri webview 中，`execCommand('paste')` 会触发浏览器原生粘贴 UI（弹出按钮），而非直接粘贴文本。

**标签页导航缺失**：当前 `AppV2.tsx` 的 shortcuts 数组中没有标签页切换快捷键（`Ctrl+Tab`、`Alt+Left/Right` 等），用户无法用键盘在标签页间导航。

## Goals / Non-Goals

**Goals:**
- 修复菜单触发的 `editor:cut`：将选中文本写入系统剪贴板并删除选中内容
- 修复菜单触发的 `editor:copy`：将选中文本写入系统剪贴板
- 修复菜单触发的 `editor:paste`：从系统剪贴板读取文本并插入，移除 `execCommand('paste')` fallback
- 新增 `Ctrl+Tab` / `Ctrl+Shift+Tab` 快捷键切换下一个/上一个标签页
- 新增 `Alt+Left` / `Alt+Right` 快捷键实现标签页历史后退/前进（切换到上一个/下一个访问过的标签页）
- 在 Tauri 原生菜单中添加"下一个标签页"/"上一个标签页"菜单项

**Non-Goals:**
- 修改键盘直接触发的 `Cmd+C/X/V`（这些由 CodeMirror `defaultKeymap` 原生处理，已正常工作）
- 实现完整的标签页历史栈（仅实现基于索引的前后切换）
- 跨窗口剪贴板同步

## Decisions

### Decision 1: 使用 `navigator.clipboard.writeText()` 实现 copy/cut

**选择**：在 `handleCopy` 中，读取 CodeMirror 当前选中文本（`view.state.sliceDoc(sel.from, sel.to)`），调用 `navigator.clipboard.writeText(selectedText)`。在 `handleCut` 中，额外通过 `view.dispatch` 删除选中内容。

**备选方案**：继续使用 `ClipboardEvent` 构造 — 已证明在 Tauri webview 中无效，排除。

**理由**：`navigator.clipboard.writeText()` 是 W3C 标准 Async Clipboard API，在 Tauri webview 中有效，且不依赖浏览器原生事件机制。

### Decision 2: 移除 `execCommand('paste')` fallback

**选择**：`handlePaste` 仅使用 `navigator.clipboard.readText()`，失败时静默忽略（不调用任何 fallback）。

**备选方案**：保留 `execCommand('paste')` fallback — 会触发浏览器原生粘贴 UI 按钮弹出，用户体验差，排除。

**理由**：在 Tauri 环境中，`navigator.clipboard.readText()` 应当可用（Tauri 默认允许剪贴板访问）。若失败，静默忽略比弹出 UI 更好。

### Decision 3: 标签页切换使用基于索引的循环切换

**选择**：在 `useFileStore` 中添加 `switchToNextTab()` / `switchToPrevTab()` 方法，基于当前 `activeTabId` 在 `tabs` 数组中的索引，循环切换到下一个/上一个标签页。

**备选方案**：维护历史访问栈实现真正的"前进/后退" — 复杂度高，超出当前需求范围，排除。

**理由**：基于索引的循环切换实现简单、行为可预期，与 VS Code、浏览器的 `Ctrl+Tab` 行为一致。

### Decision 4: `Alt+Left` / `Alt+Right` 映射为上一个/下一个标签页

**选择**：`Alt+Left` → `switchToPrevTab()`，`Alt+Right` → `switchToNextTab()`。

**备选方案**：使用 `Ctrl+PageUp/PageDown` — 与部分系统快捷键冲突，且 `Alt+Left/Right` 在 macOS 上更符合"历史导航"语义。

**理由**：`Alt+Left/Right` 在 macOS 上不与 CodeMirror 内置快捷键冲突（CodeMirror 使用 `Alt+Left/Right` 进行词级移动，但仅在编辑器有焦点时生效；标签页切换是全局快捷键，需在编辑器无焦点时也能触发）。

**注意**：`Alt+Left/Right` 在编辑器有焦点时会与 CodeMirror 词级移动冲突。因此这两个快捷键应仅在编辑器无焦点时生效，或使用 `Ctrl+Tab` / `Ctrl+Shift+Tab` 作为主要快捷键（这两个不与 CodeMirror 冲突）。

### Decision 5: `Ctrl+Tab` 在 macOS 上的处理

**选择**：在 `useKeyboardShortcuts` hook 中注册 `{ key: 'Tab', ctrlKey: true }` 和 `{ key: 'Tab', ctrlKey: true, shiftKey: true }`，并设置 `preventDefault: true`。

**理由**：macOS 系统层面会拦截 `Ctrl+Tab` 用于切换窗口，但在 Tauri webview 内部，`document` 级别的 `keydown` 监听器可以先于系统处理。需要测试验证。

## Risks / Trade-offs

- **[Risk] `navigator.clipboard.writeText()` 权限问题** → Tauri 默认允许剪贴板写入，但某些安全配置可能限制。缓解：在 `tauri.conf.json` 中确认 `clipboard` 权限已启用。
- **[Risk] `Ctrl+Tab` 被 macOS 系统拦截** → 若系统层面拦截，webview 内的监听器收不到事件。缓解：提供 `Alt+Left/Right` 作为备选快捷键；在 Tauri 原生菜单中注册菜单项作为兜底。
- **[Risk] `Alt+Left/Right` 与 CodeMirror 词级移动冲突** → 当编辑器有焦点时，`Alt+Left/Right` 会被 CodeMirror 消费。缓解：在 shortcuts 中检查 `!ui.editorFocused` 条件，仅在编辑器无焦点时触发标签页切换。
- **[Trade-off] 标签页历史 vs 索引切换** → 基于索引的切换不保留访问历史，`Alt+Left` 总是切换到索引更小的标签页，而非"上一个访问的"标签页。这是有意为之的简化。
