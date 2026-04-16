## 1. Rust Backend — Mutation Commands

- [x] 1.1 Add `create_file` command to `src-tauri/src/commands.rs`: create an empty file at the given path, return `Err` if file already exists or parent dir is missing; log at Info/Error
- [x] 1.2 Add `create_directory` command to `src-tauri/src/commands.rs`: create a directory at the given path, return `Err` if it already exists; log at Info/Error
- [x] 1.3 Add `rename_path` command to `src-tauri/src/commands.rs`: rename/move a file or folder from `old_path` to `new_path`, return `Err` if source missing or destination exists; log at Info/Error
- [x] 1.4 Add `delete_path` command to `src-tauri/src/commands.rs`: delete a file (`fs::remove_file`) or recursively delete a folder (`fs::remove_dir_all`), return `Err` if path missing; log at Info/Error
- [x] 1.5 Register all four new commands in `main.rs` `invoke_handler` (`tauri::generate_handler!`)
- [x] 1.6 Write unit tests for all four commands in `commands.rs` `#[cfg(test)]` block (success, already-exists, missing-path cases)

## 2. Rust Backend — File System Watcher

- [x] 2.1 Add `start_fs_watch` Tauri command in `main.rs` that accepts a `folder_path: String` and starts a polling watcher thread; emits `fs-watch:changed` event to the frontend window on any change
- [x] 2.2 Add `stop_fs_watch` Tauri command that stops the active watcher (use `Arc<Mutex<WatcherState>>` with `AtomicBool` stop flag)
- [x] 2.3 Register `start_fs_watch` and `stop_fs_watch` in `main.rs` `invoke_handler`
- [x] 2.4 Handle watcher restart: when `start_fs_watch` is called while a watcher is already running, stop the old one first

## 3. Frontend — Tauri Command Bindings

- [x] 3.1 Add `createFile`, `createDirectory`, `renamePath`, `deletePath` async functions to `src/tauriCommands.ts` (each wraps `invoke`)
- [x] 3.2 Add `startFsWatch` and `stopFsWatch` async functions to `src/tauriCommands.ts`

## 4. Frontend — useFileTree Hook Extensions

- [x] 4.1 Add `createFile(parentDir: string, name: string)` helper to `useFileTree` in `src/hooks/useAppState.ts`: calls `createFile` command, then dispatches `SET_FOLDER_TREE` with refreshed tree
- [x] 4.2 Add `createDirectory(parentDir: string, name: string)` helper to `useFileTree`
- [x] 4.3 Add `renamePath(oldPath: string, newPath: string)` helper to `useFileTree`: calls `renamePath` command, dispatches tree refresh, dispatches `UPDATE_TAB_PATH` if the renamed path matches an open tab
- [x] 4.4 Add `deletePath(path: string)` helper to `useFileTree`: calls `deletePath` command, dispatches tree refresh, dispatches `CLOSE_TAB` for any tab whose path matches the deleted path

## 5. Frontend — Context Menu Component

- [x] 5.1 Create `src/components/FileTree/ContextMenu.tsx`: a positioned `<ul>` rendered via a React portal, with items "New File", "New Folder", "Rename", "Delete"; accepts `x`, `y`, `onAction`, `onClose` props
- [x] 5.2 Add `onContextMenu` handler to `FileTreeItem.tsx` that sets context menu position and target node in local state; renders `<ContextMenu>` when active
- [x] 5.3 Attach `mousedown` listener on `document` in `ContextMenu` (via `useEffect`) to close the context menu on outside click; clean up on unmount
- [x] 5.4 Handle Escape key in `ContextMenu` to close the context menu
- [x] 5.5 Wire "New File" action: set `inlineMode = 'create-file'` state in `FileTreeItem`
- [x] 5.6 Wire "New Folder" action: set `inlineMode = 'create-folder'` state in `FileTreeItem`
- [x] 5.7 Wire "Rename" action: set `inlineMode = 'rename'` state in `FileTreeItem`
- [x] 5.8 Wire "Delete" action: show `window.confirm` dialog; on confirm call `deletePath` helper; announce result via `useAnnouncer`

## 6. Frontend — Inline Input Component

- [x] 6.1 Create `src/components/FileTree/InlineInput.tsx`: a controlled `<input>` that auto-focuses on mount, selects all text, calls `onConfirm(value)` on Enter, calls `onCancel()` on Escape; shows inline error message when `error` prop is set
- [x] 6.2 Integrate `InlineInput` into `FileTreeItem.tsx`: when `inlineMode` is `'create-file'` or `'create-folder'`, render `InlineInput` as a sibling row at the correct tree depth; when `inlineMode` is `'rename'`, replace the name label with `InlineInput` pre-filled with `node.name`
- [x] 6.3 Implement `onConfirm` for create-file: validate non-empty name, append `.md` if no extension, check for duplicate in current directory, call `createFile` helper, clear `inlineMode`
- [x] 6.4 Implement `onConfirm` for create-folder: validate non-empty name, check for duplicate, call `createDirectory` helper, clear `inlineMode`
- [x] 6.5 Implement `onConfirm` for rename: validate non-empty name, check for duplicate, call `renamePath` helper, clear `inlineMode`
- [x] 6.6 Implement `onCancel`: clear `inlineMode` state

## 7. Frontend — Auto-Refresh (Fs Watch Integration)

- [x] 7.1 In `Sidebar.tsx`, after `loadDirectory` succeeds, call `startFsWatch(folderPath)` to start the watcher
- [x] 7.2 In `Sidebar.tsx`, subscribe to `fs-watch:changed` Tauri event using `listen()` from `@tauri-apps/api/event`; debounce the handler by 200 ms; on fire, call `loadDirectory` and dispatch `SET_FOLDER_TREE`
- [x] 7.3 In `Sidebar.tsx`, call `stopFsWatch()` in the `useEffect` cleanup when `state.folder.path` changes or component unmounts
- [x] 7.4 Add a "Refresh" icon button to the sidebar header in `Sidebar.tsx`; on click, call `loadDirectory` and dispatch `SET_FOLDER_TREE`

## 8. Frontend — i18n Keys

- [x] 8.1 Add translation keys to `src/i18n/config.ts` for context menu items: `fileTree.newFile`, `fileTree.newFolder`, `fileTree.rename`, `fileTree.delete`, `fileTree.deleteConfirm`
- [x] 8.2 Add translation keys for inline input placeholders and errors: `fileTree.newFilePlaceholder`, `fileTree.newFolderPlaceholder`, `fileTree.errorEmpty`, `fileTree.errorDuplicate`
- [x] 8.3 Add translation key for sidebar refresh button: `sidebar.refresh`

## 9. Reducer — New Action Types

- [x] 9.1 `UPDATE_TAB_PATH` action already exists in `src/reducers/appReducer.ts` (updates `path` of the tab matching `tabId`); `useFileTree.renamePath` finds the tab by path and dispatches with the correct `tabId`
- [x] 9.2 Add unit tests for `UPDATE_TAB_PATH` in `src/reducers/appReducer.tab.test.ts`

## 10. Tests

- [x] 10.1 Write unit tests for `ContextMenu.tsx` (renders items, calls `onAction`, closes on Escape)
- [x] 10.2 Write unit tests for `InlineInput.tsx` (confirms on Enter, cancels on Escape, shows error, auto-focuses)
- [x] 10.3 Write unit tests for `useFileTree` new helpers (mock `invoke`, verify dispatch calls)
- [x] 10.4 Update `FileTreeItem.test.tsx` to cover right-click context menu and inline input rendering
