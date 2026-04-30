## 1. Fix Paste via Tauri Menu (EditorPaneV2)

- [ ] 1.1 In `src/components/editor-v2/EditorPaneV2.tsx`, locate the `handlePaste` function inside the `editor:paste` event listener
- [ ] 1.2 Replace the `navigator.clipboard.readText()` implementation with `viewRef.current.contentDOM.focus(); document.execCommand('paste')` to trigger native paste without a permission dialog
- [ ] 1.3 Verify that pasting via Edit menu no longer shows a browser permission dialog

## 2. Fix Right-Click Context Menu Copy/Cut/Paste (EditorContextMenu)

- [ ] 2.1 In `src/components/editor-v2/EditorContextMenu.tsx`, locate the `menuItems` array definition
- [ ] 2.2 Replace the `action: () => document.execCommand('cut')` for "剪切" with `action: () => window.dispatchEvent(new CustomEvent('editor:cut'))`
- [ ] 2.3 Replace the `action: () => document.execCommand('copy')` for "复制" with `action: () => window.dispatchEvent(new CustomEvent('editor:copy'))`
- [ ] 2.4 Replace the `action: () => document.execCommand('paste')` for "粘贴" with `action: () => window.dispatchEvent(new CustomEvent('editor:paste'))`
- [ ] 2.5 Verify that right-click → 复制 copies selected text to clipboard
- [ ] 2.6 Verify that right-click → 剪切 removes selected text and copies to clipboard
- [ ] 2.7 Verify that right-click → 粘贴 inserts clipboard content without a permission dialog

## 3. Verify Native Keyboard Shortcuts Work (No Code Change Expected)

- [ ] 3.1 Test `Cmd+C` / `Ctrl+C` with selected text — confirm text is copied to clipboard natively via CodeMirror
- [ ] 3.2 Test `Cmd+X` / `Ctrl+X` with selected text — confirm text is cut natively via CodeMirror
- [ ] 3.3 Test `Cmd+V` / `Ctrl+V` — confirm paste works without permission dialog (native browser paste event)
- [ ] 3.4 Test `Cmd+Z` / `Ctrl+Z` — confirm undo works via CodeMirror `historyKeymap`
- [ ] 3.5 Test `Cmd+Shift+Z` / `Ctrl+Shift+Z` — confirm redo works via CodeMirror `historyKeymap`
- [ ] 3.6 If any of the above fail, investigate whether `useKeyboardShortcuts` is intercepting the key and add an explicit exclusion

## 4. Verify Tab Navigation Shortcuts

- [ ] 4.1 Test `Ctrl+Tab` with multiple tabs open — confirm it switches to the next tab
- [ ] 4.2 Test `Ctrl+Shift+Tab` with multiple tabs open — confirm it switches to the previous tab
- [ ] 4.3 Test `Ctrl+Tab` wraps from last tab to first tab
- [ ] 4.4 Test `Ctrl+Shift+Tab` wraps from first tab to last tab
- [ ] 4.5 Test `Alt+ArrowRight` when editor is NOT focused — confirm it switches to next tab
- [ ] 4.6 Test `Alt+ArrowLeft` when editor is NOT focused — confirm it switches to previous tab
- [ ] 4.7 Test `Alt+ArrowRight` when editor IS focused — confirm CodeMirror handles word-jump, no tab switch occurs
- [ ] 4.8 If `Ctrl+Tab` does not work in Tauri WebView, add `Cmd+Shift+]` / `Cmd+Shift+[` as macOS alternative shortcuts in `AppV2.tsx`

## 5. Code Cleanup and Documentation

- [ ] 5.1 Review the comment in `AppV2.tsx` that says "Do NOT register Cmd/Ctrl+C, X, V, Z, A here" — update it to accurately reflect the current state after fixes
- [ ] 5.2 Remove the `editor:copy` and `editor:cut` event listeners from `EditorPaneV2.tsx` if they are no longer needed (only the Tauri menu path uses them; if the context menu now uses custom events, these listeners are still needed for the menu path — keep them)
- [ ] 5.3 Add a code comment in `EditorPaneV2.tsx` explaining why `handlePaste` uses `document.execCommand('paste')` instead of `navigator.clipboard.readText()`
