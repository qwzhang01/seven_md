## Context

Seven MD is a Tauri v2 desktop Markdown editor. The frontend is React + TypeScript; the backend is Rust. Currently the sidebar shows only a file tree — there is no search capability. Users with large folders must scroll through the tree to find files or content.

The existing sidebar (`src/components/Sidebar/`) hosts the `FileTree` component. The `useKeyboardShortcuts` hook registers all global shortcuts. The Tauri IPC layer in `src-tauri/src/commands.rs` exposes file-system operations to the frontend.

## Goals / Non-Goals

**Goals:**
- Provide filename search (fuzzy match) scoped to the open folder
- Provide full-text search across all `.md` files in the open folder
- Show results with file path, line number, and a text snippet
- Navigate to a result by clicking (open file, scroll to line)
- Toggle the search panel via `Cmd/Ctrl+Shift+F`
- Perform file content scanning in Rust for performance
- Support i18n (English + Chinese)

**Non-Goals:**
- Search inside non-Markdown files
- Regex or advanced query syntax
- Persistent search history
- Real-time / incremental indexing (search runs on demand)
- Search across multiple open folders simultaneously

## Decisions

### 1. Rust backend for full-text scanning

**Decision**: Implement `search_in_files` as a Tauri command in Rust rather than reading files in JavaScript.

**Rationale**: Rust can walk the directory tree and scan file contents natively without serializing large file buffers over IPC. For a folder with hundreds of Markdown files this is significantly faster than reading each file in JS. No new Cargo dependencies are needed — `std::fs` and `walkdir` (already available via Tauri's transitive deps) are sufficient. If `walkdir` is not already present, `std::fs::read_dir` with recursion is used instead.

**Alternatives considered**:
- *JS-side scanning via `@tauri-apps/api/fs`*: Would require reading every file over IPC, causing high serialization overhead for large folders. Rejected.
- *SQLite full-text index*: Overkill for the scope; adds a dependency and complexity. Rejected.

### 2. Search panel as a sidebar tab, not a floating overlay

**Decision**: Add the search panel as a second tab/mode inside the existing `Sidebar` component, toggled by a search icon button at the top of the sidebar.

**Rationale**: Keeps the layout consistent with the existing sidebar pattern. The sidebar already has collapse/expand logic; reusing it avoids a new overlay z-index layer and focus-trap complexity.

**Alternatives considered**:
- *Floating modal overlay*: Disrupts the editor layout and requires separate focus management. Rejected.
- *Separate panel below the file tree*: Splits sidebar real estate awkwardly. Rejected.

### 3. Search type: filename vs. full-text as a toggle

**Decision**: A segmented toggle (two buttons: "Files" / "Text") switches between filename search and full-text search. Both share the same input field.

**Rationale**: Keeps the UI minimal — one input, one results list. Users familiar with VS Code's search panel will find this pattern intuitive.

### 4. Result navigation: open file + scroll to line via existing IPC

**Decision**: Clicking a result dispatches the existing `open_file` action to load the file, then sends a custom event `search:navigate` with the target line number. The editor listens for this event and scrolls CodeMirror to the line.

**Rationale**: Reuses the existing file-open flow. The line-scroll is a lightweight addition to the CodeMirror editor wrapper.

### 5. Local component state for search results (no global state)

**Decision**: Search query and results are stored in local state inside `SearchPanel`, not in the global `AppState` reducer.

**Rationale**: Search results are ephemeral and do not need to survive navigation or app restart. Adding them to global state would complicate the reducer with no benefit.

## Risks / Trade-offs

| Risk | Mitigation |
|------|-----------|
| Large folders (1000+ files) cause slow full-text search | Run search in a Tauri async command; show a loading spinner; debounce input by 300 ms |
| `Cmd/Ctrl+Shift+F` conflicts with browser/WebView shortcuts | Test on all platforms; the shortcut is registered at the Tauri level via `useKeyboardShortcuts`, which takes precedence |
| Scrolling CodeMirror to an arbitrary line may not work if the file is not yet rendered | Defer the scroll event until after the editor's `onReady` callback fires |
| Binary or very large `.md` files cause read errors | Catch errors per-file in Rust; skip and log; do not abort the entire search |

## Migration Plan

1. Add `search_in_files` Tauri command (backend, no breaking change)
2. Add `SearchPanel` component and `useFileSearch` hook (frontend, additive)
3. Update `Sidebar` to render `SearchPanel` as a second tab (additive)
4. Register `Cmd/Ctrl+Shift+F` in `useKeyboardShortcuts` (additive)
5. Add i18n keys to `src/locales/en.json` and `src/locales/zh.json`
6. Add unit tests for `useFileSearch` and `SearchPanel`

Rollback: all changes are additive. Removing the search panel tab and the Tauri command reverts the feature with no data migration needed.

## Open Questions

- Should filename search be case-insensitive by default? *(Assumed yes — align with OS conventions.)*
- Should the search panel remember the last query within a session? *(Assumed yes — local state persists while the panel is mounted.)*
- Maximum number of results to return from Rust? *(Proposed cap: 200 results to avoid overwhelming the UI.)*
