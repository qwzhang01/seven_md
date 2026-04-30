## Context

Seven Markdown uses CodeMirror 6 as its editor engine inside a Tauri WebView. CodeMirror ships with `defaultKeymap` and `historyKeymap` that natively handle `Cmd/Ctrl+C/X/V/Z/Shift+Z` via the browser's built-in clipboard and history APIs. The application also registers a global `useKeyboardShortcuts` hook on `document` that intercepts keydown events.

**Current broken state:**

1. **Copy (`Cmd/Ctrl+C`)**: The Tauri native menu emits `menu-copy` → `editor:copy` → `handleCopy` in `EditorPaneV2`, which calls `navigator.clipboard.writeText()`. However, the global `useKeyboardShortcuts` hook does NOT register `Ctrl+C`, so the key event falls through to CodeMirror's `defaultKeymap` — which should work. **Root cause**: CodeMirror's `defaultKeymap` includes `copyLineDown` on `Shift+Alt+Down` but standard `Ctrl+C` copy is handled by the browser's native `copy` event, not a CodeMirror keymap entry. In a Tauri WebView, `Ctrl+C` fires the native OS copy which works on selected text. The `editor:copy` handler is only needed for the menu item. **Actual bug**: The `handleCopy` listener on `editor:copy` is fine; the keyboard shortcut itself works natively. Need to verify this is not being blocked.

2. **Cut (`Cmd/Ctrl+X`)**: Same analysis as copy. Native OS cut should work. The `editor:cut` handler dispatches a CodeMirror change to delete selected text after writing to clipboard — this is correct for the menu path.

3. **Paste (`Cmd/Ctrl+V`)**: The `handlePaste` listener on `editor:paste` calls `navigator.clipboard.readText()`. In Tauri's WebView, this API requires the `clipboard-read` permission which triggers a browser permission dialog. **This is the real paste bug** — the menu item triggers this dialog. The keyboard shortcut `Ctrl+V` itself is handled natively by the browser/OS and works fine in CodeMirror. The fix is to NOT use `navigator.clipboard.readText()` in the paste handler; instead, rely on CodeMirror's native paste handling for keyboard shortcuts, and for the menu item, use `document.execCommand('paste')` or dispatch a synthetic paste event.

4. **Right-click context menu**: Uses `document.execCommand('cut/copy/paste')` which is deprecated and unreliable in Tauri's sandboxed WebView. The fix is to dispatch `editor:cut`, `editor:copy`, `editor:paste` custom events (same as the Tauri menu path), which are already handled correctly in `EditorPaneV2`.

5. **Undo/Redo**: CodeMirror's `historyKeymap` handles `Ctrl+Z` / `Ctrl+Shift+Z` natively. The `editor:undo`/`editor:redo` event handlers call `undo(view)` / `redo(view)` from `@codemirror/commands` — this is correct. No fix needed here; these work via both keyboard and menu.

6. **Tab navigation (`Ctrl+Tab` / `Ctrl+Shift+Tab`)**: Registered in `useKeyboardShortcuts` with `preventDefault: true`. On macOS, `Ctrl+Tab` is a system shortcut for switching spaces/windows and may be captured by the OS before reaching the app. The `Alt+ArrowLeft/Right` shortcuts are guarded by `if (!ui.editorFocused)` which means they don't work when the editor has focus — this is wrong for tab navigation.

## Goals / Non-Goals

**Goals:**
- Fix paste via Tauri menu (stop triggering clipboard-read permission dialog)
- Fix right-click context menu copy/cut/paste (replace deprecated `execCommand`)
- Fix `Alt+ArrowLeft/Right` tab navigation to work regardless of editor focus
- Ensure `Ctrl+Tab` / `Ctrl+Shift+Tab` tab navigation works reliably
- Verify copy/cut keyboard shortcuts work natively (no code change needed if they do)

**Non-Goals:**
- Rewriting CodeMirror's keymap configuration
- Adding new keyboard shortcuts beyond what's already specified
- Changing the Tauri native menu structure

## Decisions

### Decision 1: Fix paste by using a synthetic paste event instead of `navigator.clipboard.readText()`

**Problem**: `navigator.clipboard.readText()` requires `clipboard-read` permission → triggers dialog.

**Solution**: In the `editor:paste` handler (triggered by Tauri menu), instead of calling `navigator.clipboard.readText()`, dispatch a synthetic `paste` event on the CodeMirror editor DOM element. CodeMirror's `defaultKeymap` handles the `paste` event natively using `document.execCommand` internally or the browser's paste event, which does NOT require explicit clipboard-read permission.

```typescript
const handlePaste = () => {
  if (!viewRef.current) return
  viewRef.current.contentDOM.focus()
  document.execCommand('paste')
}
```

**Alternative considered**: Use `navigator.clipboard.readText()` with a try/catch and fallback — rejected because the permission dialog still appears before the catch.

**Alternative considered**: Use Tauri's `@tauri-apps/plugin-clipboard-manager` — rejected because it adds a dependency and the native paste event approach is simpler.

### Decision 2: Fix right-click context menu by dispatching custom events

**Problem**: `document.execCommand('cut/copy/paste')` is deprecated and unreliable in Tauri WebView.

**Solution**: Replace with `window.dispatchEvent(new CustomEvent('editor:cut'))`, `editor:copy`, `editor:paste` — these are already handled correctly in `EditorPaneV2`.

**Alternative considered**: Pass `viewRef` to the context menu — rejected because it breaks component encapsulation.

### Decision 3: Fix `Alt+ArrowLeft/Right` tab navigation

**Problem**: The guard `if (!ui.editorFocused)` prevents tab navigation when the editor has focus.

**Solution**: Remove the `editorFocused` guard. `Alt+ArrowLeft/Right` are not used by CodeMirror's default keymap for text editing (they are word-jump shortcuts on some platforms). Add `preventDefault: true` to prevent browser back/forward navigation.

**Risk**: On macOS, `Alt+ArrowLeft/Right` moves the cursor by word in text inputs. Since CodeMirror handles this via its own keymap BEFORE the global `document` listener, the global handler will only fire if CodeMirror doesn't consume it. We need to verify this doesn't conflict.

**Revised solution**: Keep the `editorFocused` guard for `Alt+Arrow` to avoid conflicting with CodeMirror's word-jump. Instead, ensure `Ctrl+Tab` / `Ctrl+Shift+Tab` work reliably as the primary tab navigation shortcuts.

### Decision 4: Verify `Ctrl+Tab` works in Tauri

`Ctrl+Tab` is registered with `preventDefault: true` in `useKeyboardShortcuts`. In Tauri's WebView on macOS, `Ctrl+Tab` is NOT captured by the OS (unlike `Cmd+Tab`), so it should reach the app. No code change needed — just verify.

## Risks / Trade-offs

- **[Risk] `document.execCommand('paste')` may also be deprecated** → Mitigation: It still works in all current WebView implementations for triggering paste from user-initiated events. The Tauri menu event counts as user-initiated.
- **[Risk] `Alt+ArrowLeft/Right` conflicts with CodeMirror word-jump** → Mitigation: Keep the `editorFocused` guard; rely on `Ctrl+Tab` for tab navigation when editor is focused.
- **[Risk] Copy/cut keyboard shortcuts may silently fail in some edge cases** → Mitigation: The native OS clipboard handling is the most reliable path; no custom code needed.

## Migration Plan

All changes are backward-compatible. No data migration needed. Changes are isolated to:
1. `EditorPaneV2.tsx` — modify `handlePaste` event handler
2. `EditorContextMenu.tsx` — replace `execCommand` calls with custom event dispatches
3. `AppV2.tsx` — no changes needed (tab navigation shortcuts are already correct)

Rollback: revert the two file changes.

## Open Questions

- Does `document.execCommand('paste')` work reliably in Tauri's WebView when triggered from a menu event (non-keyboard user gesture)? → Needs runtime verification.
- Should we add `Cmd+[` / `Cmd+]` as alternative tab navigation shortcuts (VS Code style)? → Out of scope for this fix; can be a follow-up.
