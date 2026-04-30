## Context

The application uses CodeMirror 6 as its editor (`EditorPaneV2.tsx`). CodeMirror's `defaultKeymap` and `historyKeymap` handle standard editing shortcuts (Cmd+C/X/V/Z/A) natively within the editor's DOM scope.

Separately, `AppV2.tsx` uses a `useKeyboardShortcuts` hook that registers a `document`-level `keydown` listener. This hook fires for **every** keydown event on the document, including those already handled by CodeMirror.

Two bugs exist:

1. **Missing clipboard event handlers in `EditorPaneV2.tsx`**: The native Tauri menu emits `menu-cut`, `menu-copy`, `menu-paste`, `menu-select-all` events, which `AppV2.tsx` translates into `editor:cut`, `editor:copy`, `editor:paste`, `editor:select-all` CustomEvents. However, `EditorPaneV2.tsx` has no listeners for these events — they are silently dropped.

2. **Potential hook interference with native shortcuts**: The `useKeyboardShortcuts` hook calls `event.preventDefault()` by default for every matched shortcut. While `Cmd+C/X/V/Z` are not registered in the shortcuts array (so the hook won't call their actions), the hook iterates over all shortcuts on every keydown. More critically, if any future shortcut accidentally matches these keys, it would block CodeMirror's handling. The current architecture also makes it easy to accidentally register conflicting shortcuts.

## Goals / Non-Goals

**Goals:**
- Add `editor:cut`, `editor:copy`, `editor:paste`, `editor:select-all` event listeners in `EditorPaneV2.tsx` so menu-triggered clipboard operations work
- Ensure `Cmd+C/X/V/Z/A` (macOS) and `Ctrl+C/X/V/Z/A` (Windows/Linux) are never intercepted by the `useKeyboardShortcuts` hook
- Verify that CodeMirror's `defaultKeymap` + `historyKeymap` handle these keys natively when the editor has focus

**Non-Goals:**
- Implementing custom clipboard logic (rely on browser/OS native clipboard APIs via CodeMirror)
- Changing the `useKeyboardShortcuts` hook architecture
- Adding shortcuts for when the editor does NOT have focus (clipboard ops only make sense in the editor)

## Decisions

### Decision 1: Implement clipboard operations via CodeMirror's built-in commands

**Choice**: Use CodeMirror's `clipboardCopy`, `clipboardCut`, `clipboardPaste` commands (from `@codemirror/commands`) in the `editor:copy/cut/paste` event handlers, falling back to `document.execCommand` if needed.

**Alternative considered**: Manually read/write `navigator.clipboard` — rejected because CodeMirror already manages selection state and has its own clipboard integration that handles edge cases (e.g., multi-cursor, virtual content).

**Rationale**: CodeMirror's built-in commands are the correct abstraction layer. They dispatch through the editor's command system and respect the current selection.

### Decision 2: Use `document.execCommand` as the clipboard bridge

**Choice**: For `editor:cut/copy`, dispatch a synthetic `copy`/`cut` DOM event on the editor's DOM node, which triggers the browser's native clipboard handling. For `editor:paste`, use `navigator.clipboard.readText()` and insert via CodeMirror's `view.dispatch`.

**Alternative**: Use CodeMirror's `@codemirror/commands` clipboard commands directly — these are the preferred approach if available.

**Rationale**: The browser's native clipboard events are the most reliable cross-platform approach in a Tauri webview context.

### Decision 3: Do not register Cmd+C/X/V/Z/A in the shortcuts hook

**Choice**: Explicitly document that these keys MUST NOT appear in the `AppV2.tsx` shortcuts array. Add a code comment to this effect.

**Rationale**: CodeMirror handles these natively via `defaultKeymap` and `historyKeymap`. Registering them in the hook would call `preventDefault()` and break CodeMirror's handling.

## Risks / Trade-offs

- **[Risk] Tauri webview clipboard permissions** → In some Tauri configurations, `navigator.clipboard` requires explicit permissions. Mitigation: use `document.execCommand('copy')` as fallback, which works in webview contexts without additional permissions.
- **[Risk] `editor:paste` with async clipboard API** → `navigator.clipboard.readText()` is async; the paste handler must be async-aware. Mitigation: use `async/await` in the event handler.
- **[Trade-off] Menu paste vs. keyboard paste** → Menu-triggered paste goes through our custom handler; keyboard paste goes through CodeMirror's native handler. Both paths should produce identical results since both ultimately call CodeMirror's dispatch.
