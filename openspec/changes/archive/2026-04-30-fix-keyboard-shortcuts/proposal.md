## Why

On macOS, the standard editing shortcuts Cmd+C (copy), Cmd+X (cut), Cmd+V (paste), and Cmd+Z (undo) do not work in the editor. The root cause is twofold: (1) the `useKeyboardShortcuts` hook registers a `document` keydown listener with `preventDefault: true` by default, which fires before CodeMirror's internal keymap and can interfere with native clipboard/undo handling; (2) the `editor:cut`, `editor:copy`, `editor:paste`, and `editor:select-all` CustomEvents dispatched by the native menu have no listeners in `EditorPaneV2.tsx`, so menu-triggered clipboard operations are silently dropped.

## What Changes

- **Add `editor:cut`, `editor:copy`, `editor:paste`, `editor:select-all` event handlers in `EditorPaneV2.tsx`** so that menu-triggered clipboard operations actually execute against the CodeMirror view.
- **Exclude native browser/OS shortcuts (Cmd+C/X/V/Z/A on macOS, Ctrl+C/X/V/Z/A on Windows) from the `useKeyboardShortcuts` hook** — these must not be intercepted or have `preventDefault` called on them, as they are handled natively by CodeMirror's `defaultKeymap` and the OS clipboard.
- **Verify CodeMirror `defaultKeymap` covers Ctrl/Cmd+Z (undo) and Ctrl/Cmd+Y / Ctrl/Cmd+Shift+Z (redo)** — already present via `historyKeymap`, but confirm no conflicting registration exists.

## Capabilities

### New Capabilities
- `clipboard-shortcuts`: Handles `editor:cut`, `editor:copy`, `editor:paste`, `editor:select-all` CustomEvents in the editor, enabling menu-triggered clipboard operations.

### Modified Capabilities
- `keyboard-shortcuts-hook`: Add a mechanism to skip `preventDefault` for shortcuts that should be handled natively (clipboard and undo/redo keys), preventing the hook from blocking CodeMirror's built-in keymap processing.

## Impact

- **Affected files**:
  - `src/components/editor-v2/EditorPaneV2.tsx` — add `editor:cut`, `editor:copy`, `editor:paste`, `editor:select-all` event listeners
  - `src/AppV2.tsx` — ensure `Cmd+C/X/V/Z/A` shortcuts are NOT registered in the `useKeyboardShortcuts` shortcuts array (they must pass through to CodeMirror)
  - `src/hooks/useKeyboardShortcuts.ts` — potentially no change needed if the issue is purely missing event handlers; verify hook does not intercept unregistered keys
- **Risk**: Low — changes are additive (new event listeners) and defensive (removing unintended interception).
