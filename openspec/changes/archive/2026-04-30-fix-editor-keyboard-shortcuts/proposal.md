## Why

The editor's keyboard shortcuts for copy, cut, paste, undo, and redo are broken or behave incorrectly. Copy and cut silently fail (no text is placed on the clipboard), paste triggers the browser's native paste permission dialog instead of inserting text, and undo/redo are not wired to the editor's history. Additionally, tab navigation shortcuts (back/forward history) are missing, and the right-click context menu uses the deprecated `document.execCommand` API which does not work inside a sandboxed WebView. These issues make the editor unusable for basic text editing workflows.

## What Changes

- **Fix copy shortcut**: `Cmd/Ctrl+C` — currently dispatches `editor:copy` via Tauri menu only; keyboard shortcut is intercepted by `useKeyboardShortcuts` which calls `preventDefault` and does nothing. Fix: remove the global interception and let CodeMirror's `defaultKeymap` handle it natively, OR wire the `editor:copy` event handler correctly.
- **Fix cut shortcut**: `Cmd/Ctrl+X` — same root cause as copy. The global shortcut hook intercepts the key but no action is registered, so CodeMirror never receives it.
- **Fix paste shortcut**: `Cmd/Ctrl+V` — the `handlePaste` handler in `EditorPaneV2` calls `navigator.clipboard.readText()` which requires explicit clipboard-read permission and triggers a browser permission dialog in Tauri's WebView. Fix: do not intercept `Cmd/Ctrl+V` at all; let CodeMirror's `defaultKeymap` handle paste natively via the browser's built-in paste event.
- **Fix undo/redo shortcuts**: `Cmd/Ctrl+Z` / `Cmd/Ctrl+Shift+Z` — the Tauri menu emits `editor:undo`/`editor:redo` events which are handled correctly, but the global `useKeyboardShortcuts` hook does NOT register these keys, so keyboard shortcuts only work via the native menu. Verify CodeMirror's `historyKeymap` handles these natively and remove any conflicting global registration.
- **Fix right-click context menu copy/cut/paste**: `EditorContextMenu` uses `document.execCommand('cut')`, `document.execCommand('copy')`, `document.execCommand('paste')` which are deprecated and non-functional in Tauri's WebView sandbox. Replace with the same `editor:cut`, `editor:copy`, `editor:paste` custom event dispatch used by the Tauri menu.
- **Add browser history navigation shortcuts**: `Alt+ArrowLeft` / `Alt+ArrowRight` for back/forward tab navigation are currently only active when the editor is NOT focused (`if (!ui.editorFocused)`). These should be replaced with proper tab-switching shortcuts that work regardless of editor focus, matching the tab keyboard shortcut spec (`Ctrl+Tab` / `Ctrl+Shift+Tab`).
- **Fix `Ctrl+Tab` / `Ctrl+Shift+Tab` tab navigation**: These are registered in `useKeyboardShortcuts` but `Ctrl+Tab` is a browser-reserved shortcut that may be captured by the OS/WebView before reaching the app. Verify they work and add fallback shortcuts if needed.

## Capabilities

### New Capabilities
- `editor-clipboard`: Correct clipboard operations (copy/cut/paste) in the CodeMirror editor via keyboard shortcuts and right-click context menu, without triggering browser permission dialogs.
- `editor-history-shortcuts`: Reliable undo/redo keyboard shortcuts wired to CodeMirror's history extension.
- `tab-navigation-shortcuts`: Keyboard shortcuts for switching between editor tabs that work regardless of editor focus state.

### Modified Capabilities
<!-- No existing spec-level capability specs are changing -->

## Impact

- `src/components/editor-v2/EditorPaneV2.tsx` — Remove `editor:copy`, `editor:cut`, `editor:paste` event listeners that use `navigator.clipboard` API; let CodeMirror handle clipboard natively via `defaultKeymap`.
- `src/components/editor-v2/EditorContextMenu.tsx` — Replace `document.execCommand` calls with `window.dispatchEvent(new CustomEvent('editor:cut/copy/paste'))` dispatches.
- `src/AppV2.tsx` — Remove or guard the `Ctrl+C`, `Ctrl+X`, `Ctrl+V` entries from `useKeyboardShortcuts` to avoid intercepting CodeMirror's native clipboard handling. Fix `Alt+ArrowLeft/Right` tab navigation to work regardless of editor focus.
- `src-tauri/src/main.rs` — No changes needed; Tauri menu event wiring is correct.
- `src/hooks/useKeyboardShortcuts.ts` — No changes needed to the hook itself; only the shortcut configurations passed to it need updating.
