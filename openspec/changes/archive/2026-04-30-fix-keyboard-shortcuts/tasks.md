## 1. Add clipboard event handlers in EditorPaneV2.tsx

- [x] 1.1 Import `selectAll` from `@codemirror/commands` in `EditorPaneV2.tsx` (alongside existing `undo`, `redo` imports)
- [x] 1.2 Add `useEffect` to listen for `editor:cut` — dispatch a synthetic `cut` DOM event on `viewRef.current.dom` to trigger the browser's native cut handling
- [x] 1.3 Add `useEffect` to listen for `editor:copy` — dispatch a synthetic `copy` DOM event on `viewRef.current.dom` to trigger the browser's native copy handling
- [x] 1.4 Add `useEffect` to listen for `editor:paste` — use `navigator.clipboard.readText()` (async) and insert the text via `view.dispatch` at the current cursor/selection position
- [x] 1.5 Add `useEffect` to listen for `editor:select-all` — call `selectAll(viewRef.current)` from `@codemirror/commands`
- [x] 1.6 Ensure all handlers guard against `!viewRef.current` (no-op when editor not initialized)
- [x] 1.7 Ensure all handlers return cleanup functions that call `window.removeEventListener`

## 2. Verify AppV2.tsx shortcuts array does not intercept native keys

- [x] 2.1 Audit the `shortcuts` array in `AppV2.tsx` — confirm no entry uses `key: 'c'`, `key: 'x'`, `key: 'v'`, `key: 'z'`, or `key: 'a'` with `ctrlKey: true` alone (without additional modifiers like `shiftKey`)
- [x] 2.2 Add a code comment above the shortcuts array explaining that `Cmd/Ctrl+C/X/V/Z/A` must NOT be registered here as they are handled natively by CodeMirror

## 3. Manual verification

- [ ] 3.1 Run the app and verify `Cmd+C` copies selected text in the editor
- [ ] 3.2 Run the app and verify `Cmd+X` cuts selected text in the editor
- [ ] 3.3 Run the app and verify `Cmd+V` pastes clipboard content in the editor
- [ ] 3.4 Run the app and verify `Cmd+Z` undoes the last edit in the editor
- [ ] 3.5 Run the app and verify Edit menu → Cut/Copy/Paste/Select All work correctly
- [ ] 3.6 Run the app and verify `Cmd+Z` still works (via CodeMirror `historyKeymap`)
