## Why

The file tree sidebar currently supports only read operations — users can browse and open existing files, but cannot create, rename, or react to external filesystem changes. This blocks basic file management workflows that users expect from any editor, and forces them to leave the app to perform routine tasks.

## What Changes

- **New**: Right-click context menu on file tree items (files and folders) with actions: New File, New Folder, Rename, Delete
- **New**: Inline name-input UI for creating a new file or folder directly in the tree (appears as a temporary editable row)
- **New**: Inline rename UI for editing an existing file or folder name in-place
- **New**: Rust Tauri commands: `create_file`, `create_directory`, `rename_path`, `delete_path`
- **New**: File system watcher using Tauri's `tauri-plugin-fs` watch API to detect external changes and auto-refresh the tree
- **Modified**: `FileTreeItem` component gains context-menu support and inline edit state
- **Modified**: `Sidebar` component subscribes to fs-watch events and triggers tree reload on change
- **Modified**: `tauriCommands.ts` exposes the four new backend commands

## Capabilities

### New Capabilities
- `file-tree-context-menu`: Right-click context menu on tree nodes with New File, New Folder, Rename, Delete actions
- `inline-create-rename`: Inline editable input row in the file tree for creating and renaming files/folders
- `fs-watch-auto-refresh`: File system watcher that detects external changes and automatically refreshes the sidebar tree

### Modified Capabilities
- `file-operations`: Extends existing file-operations spec with four new Rust commands (`create_file`, `create_directory`, `rename_path`, `delete_path`) and their frontend bindings

## Impact

- **Rust backend** (`src-tauri/src/commands.rs`): 4 new `#[tauri::command]` functions; `main.rs` registers them in `invoke_handler` and sets up the fs watcher
- **Frontend** (`src/components/FileTreeItem.tsx`): Context menu state, inline input rendering, keyboard handling (Enter/Escape)
- **Frontend** (`src/components/Sidebar.tsx`): Subscribes to `fs-watch:changed` event, triggers `loadDirectory` refresh
- **Frontend** (`src/tauriCommands.ts`): 4 new exported async functions
- **Frontend** (`src/hooks/useAppState.ts`): `useFileTree` hook gains `createFile`, `createDirectory`, `renamePath`, `deletePath` helpers
- **i18n** (`src/i18n/config.ts`): New translation keys for context menu labels and inline input placeholders
- No new npm dependencies; uses existing `@tauri-apps/plugin-fs` and `@tauri-apps/api/event`
