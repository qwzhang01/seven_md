## Context

Seven MD is a Tauri v2 desktop Markdown editor. The frontend is React + TypeScript; the backend is Rust. File I/O is handled exclusively through Tauri `invoke` commands defined in `src-tauri/src/commands.rs`. The sidebar (`Sidebar.tsx`) renders a `FileTree` that is populated once when a folder is opened and never updated afterwards.

Three gaps exist today:
1. **No create**: Users cannot create new files or folders from within the app.
2. **No rename**: Users cannot rename existing files or folders from within the app.
3. **No auto-refresh**: When files/folders are created, renamed, or deleted by external tools (Finder, terminal, git), the sidebar tree is stale until the user manually re-opens the folder.

All three gaps are addressable with Rust standard-library primitives (`std::fs`) for mutations and Tauri's `tauri-plugin-fs` watch API for change detection — no new npm or Cargo dependencies are required.

## Goals / Non-Goals

**Goals:**
- Add `create_file`, `create_directory`, `rename_path`, `delete_path` Rust commands
- Expose those commands via `tauriCommands.ts` and `useFileTree` hook helpers
- Add a right-click context menu on `FileTreeItem` with: New File, New Folder, Rename, Delete
- Add inline editable input in the tree for create and rename flows
- Start a recursive fs watcher on the open folder; emit a `fs-watch:changed` event to the frontend on any change; `Sidebar` subscribes and refreshes the tree

**Non-Goals:**
- Drag-and-drop reordering of files
- Undo/redo for file mutations
- Conflict resolution when two renames collide
- Watching nested symlinks

## Decisions

### Decision 1: Use Rust `std::fs` for mutations (not `tauri-plugin-fs` JS API)

**Chosen**: Implement `create_file`, `create_directory`, `rename_path`, `delete_path` as `#[tauri::command]` functions in `commands.rs` using `std::fs`.

**Alternatives considered**:
- *Use `@tauri-apps/plugin-fs` JS API directly from the frontend*: Possible, but bypasses the existing logging infrastructure in `commands.rs` and would require granting broad FS permissions in `capabilities/default.json`. Keeping mutations in Rust keeps the permission surface minimal and consistent with the existing pattern.

**Rationale**: All existing file I/O (`read_file`, `save_file`, `read_directory`) lives in Rust. Adding mutations there keeps the architecture uniform, allows structured logging via `crate::logger`, and avoids expanding frontend FS capability grants.

### Decision 2: Use `tauri-plugin-fs` watch API for auto-refresh

**Chosen**: In `main.rs` `setup`, call `tauri_plugin_fs::watch` on the folder path whenever `SET_FOLDER_PATH` is dispatched (via a Tauri event from the frontend). The watcher emits a `fs-watch:changed` Tauri event to the frontend window. `Sidebar` listens with `@tauri-apps/api/event` `listen()` and calls `loadDirectory` to refresh.

**Alternatives considered**:
- *Poll the directory on a timer*: Simple but wasteful; introduces latency and unnecessary I/O.
- *Use `notify` crate directly*: `tauri-plugin-fs` already bundles `notify` internally; adding it again would duplicate the dependency.

**Rationale**: `tauri-plugin-fs` is already in `Cargo.toml` and `tauri.conf.json5`. Its watch API is the idiomatic Tauri v2 approach and requires no new dependencies.

### Decision 3: Inline input row for create/rename (no modal dialog)

**Chosen**: When the user selects "New File", "New Folder", or "Rename" from the context menu, `FileTreeItem` renders a temporary `<input>` element in-place (replacing the name label). Pressing Enter confirms; pressing Escape cancels.

**Alternatives considered**:
- *Use a modal dialog*: Consistent with the existing `DirtyTabDialog` pattern, but heavier UX for a simple name-entry task. VS Code, Finder, and most file managers use inline rename.

**Rationale**: Inline editing is the standard UX pattern for file trees. It keeps the interaction local to the tree item and avoids context switching.

### Decision 4: Debounce watcher events (200 ms)

**Chosen**: The frontend debounces `fs-watch:changed` events by 200 ms before calling `loadDirectory`. This prevents a burst of events (e.g., a `git checkout` touching many files) from triggering dozens of redundant reloads.

**Rationale**: File system watchers often fire multiple events for a single logical operation. A short debounce is the standard mitigation.

## Risks / Trade-offs

- **[Risk] Watcher not started if folder is already open at app launch** → Mitigation: On app startup, `Sidebar` emits `folder:opened` with the persisted folder path, which triggers watcher setup in `main.rs`.
- **[Risk] Rename of an open file leaves a stale tab** → Mitigation: After `rename_path` succeeds, dispatch `UPDATE_TAB_PATH` action to update the tab's path in state. If the tab has unsaved changes, prompt the user first.
- **[Risk] Delete of an open file leaves a dangling tab** → Mitigation: After `delete_path` succeeds, dispatch `CLOSE_TAB` for any tab whose path matches the deleted path.
- **[Risk] Context menu stays open when user clicks elsewhere** → Mitigation: Attach a `mousedown` listener on `document` to close the menu on outside click; clean up in `useEffect` return.
- **[Risk] `tauri-plugin-fs` watch may not fire on macOS for network drives** → Mitigation: Document known limitation; provide a manual "Refresh" button in the sidebar header as fallback.

## Open Questions

- Should "Delete" move files to the OS Trash (via `trash` crate) or permanently delete with `std::fs::remove_file`? Trash is safer but adds a dependency. **Tentative**: use `std::fs` for now; add Trash support in a follow-up.
- Should the watcher be restarted when the user switches folders, or stopped and a new one started? **Tentative**: stop old watcher, start new one on `SET_FOLDER_PATH`.
