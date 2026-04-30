## 1. 修复剪贴板快捷键（EditorPaneV2.tsx）

- [x] 1.1 重写 `handleCopy`：读取 `view.state.selection.main`，若选中文本非空则调用 `navigator.clipboard.writeText(selectedText)`，空选中时静默忽略
- [x] 1.2 重写 `handleCut`：读取选中文本，调用 `navigator.clipboard.writeText(selectedText)`，然后通过 `view.dispatch` 删除选中内容（`changes: { from: sel.from, to: sel.to, insert: '' }`），空选中时静默忽略
- [x] 1.3 重写 `handlePaste`：仅使用 `navigator.clipboard.readText()` 读取剪贴板，移除 `document.execCommand('paste')` fallback，失败时静默忽略
- [x] 1.4 确保所有 clipboard handler 在 `!viewRef.current` 时提前返回（guard 已有，确认保留）
- [ ] 1.5 手动验证：在编辑器中选中文本，通过菜单"复制"，确认文本已写入剪贴板（可粘贴到其他应用）
- [ ] 1.6 手动验证：在编辑器中选中文本，通过菜单"剪切"，确认文本已写入剪贴板且编辑器中已删除
- [ ] 1.7 手动验证：通过菜单"粘贴"，确认剪贴板内容直接插入编辑器，不弹出任何 UI 按钮

## 2. 在 useFileStore 中添加标签页切换方法

- [x] 2.1 在 `src/stores/useFileStore.ts` 中添加 `switchToNextTab()` 方法：找到当前 `activeTabId` 在 `tabs` 数组中的索引，切换到 `(index + 1) % tabs.length` 对应的标签页；若 `tabs.length <= 1` 则不操作
- [x] 2.2 在 `src/stores/useFileStore.ts` 中添加 `switchToPrevTab()` 方法：切换到 `(index - 1 + tabs.length) % tabs.length` 对应的标签页；若 `tabs.length <= 1` 则不操作

## 3. 在 AppV2.tsx 中注册标签页导航快捷键

- [x] 3.1 在 `shortcuts` 数组中添加 `Ctrl+Tab` → `switchToNextTab()`，设置 `preventDefault: true`
- [x] 3.2 在 `shortcuts` 数组中添加 `Ctrl+Shift+Tab` → `switchToPrevTab()`，设置 `preventDefault: true`
- [x] 3.3 在 `shortcuts` 数组中添加 `Alt+Left` → 仅当 `!ui.editorFocused` 时调用 `switchToPrevTab()`，设置 `preventDefault: false`（避免干扰 CodeMirror 词级移动）
- [x] 3.4 在 `shortcuts` 数组中添加 `Alt+Right` → 仅当 `!ui.editorFocused` 时调用 `switchToNextTab()`，设置 `preventDefault: false`
- [x] 3.5 在 `AppV2.tsx` 的 Tauri 菜单事件监听中添加 `menu-next-tab` → `switchToNextTab()` 和 `menu-prev-tab` → `switchToPrevTab()`

## 4. 在 Tauri 原生菜单中添加标签页导航菜单项（main.rs）

- [x] 4.1 在 `main.rs` 中创建 `next_tab` 菜单项：`MenuItem::with_id(app, "next_tab", "下一个标签页", true, Some("Ctrl+Tab"))`
- [x] 4.2 在 `main.rs` 中创建 `prev_tab` 菜单项：`MenuItem::with_id(app, "prev_tab", "上一个标签页", true, Some("Ctrl+Shift+Tab"))`
- [x] 4.3 将 `next_tab` 和 `prev_tab` 添加到 View 菜单（`view_menu`）的末尾，在 `toggle_fullscreen` 之后，用 separator 分隔
- [x] 4.4 在 `app.on_menu_event` 的 match 块中添加：`"next_tab" => { let _ = app_handle.emit("menu-next-tab", ()); }` 和 `"prev_tab" => { let _ = app_handle.emit("menu-prev-tab", ()); }`

## 5. 手动验证标签页导航

- [ ] 5.1 打开 3 个以上标签页，按 `Ctrl+Tab` 验证依次切换到下一个标签页（循环）
- [ ] 5.2 按 `Ctrl+Shift+Tab` 验证依次切换到上一个标签页（循环）
- [ ] 5.3 点击编辑器外区域（使编辑器失去焦点），按 `Alt+Right` 验证切换到下一个标签页
- [ ] 5.4 点击编辑器外区域，按 `Alt+Left` 验证切换到上一个标签页
- [ ] 5.5 点击编辑器内（使编辑器获得焦点），按 `Alt+Left/Right` 验证 CodeMirror 词级移动正常工作，不触发标签页切换
- [ ] 5.6 通过菜单"视图 → 下一个标签页"验证标签页切换正常
