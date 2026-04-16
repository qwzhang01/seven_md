## Why

Seven MD currently has no way to search for text within the open folder — users must manually browse the file tree to locate content. Adding a file search capability lets users quickly find files by name or locate text across all Markdown files in the workspace, which is a core productivity feature expected in any editor.

## What Changes

- Add a **Search panel** in the sidebar that can be toggled via keyboard shortcut (`Cmd/Ctrl+Shift+F`) or a sidebar icon
- Support **filename search**: filter files in the workspace by name (fuzzy match)
- Support **full-text search**: search for text content across all `.md` files in the open folder
- Display search results with file name, line number, and a snippet of the matching line
- Clicking a result opens the file and scrolls to the matching line
- Search is scoped to the currently open folder; disabled when no folder is open
- Add a new Tauri backend command `search_in_files` to perform file content scanning in Rust for performance
- Add i18n keys for all new UI strings (English + Chinese)

## Capabilities

### New Capabilities

- `file-search`: Search panel UI, search input, results list, result navigation, and keyboard shortcut integration. Covers both filename search and full-text content search within the open workspace folder.

### Modified Capabilities

- `keyboard-shortcuts`: Add new shortcut `Cmd/Ctrl+Shift+F` to open/focus the search panel.

## Impact

- **Frontend**: New `SearchPanel` component under `src/components/SearchPanel/`; new `useFileSearch` hook under `src/hooks/`; updates to `Sidebar` to include the search panel toggle; updates to `useKeyboardShortcuts` for the new shortcut; new i18n keys in `src/locales/`
- **Backend**: New Tauri command `search_in_files(folder_path, query, search_type)` in `src-tauri/src/commands.rs`; uses Rust's standard file I/O for scanning — no new Cargo dependencies required
- **State**: Search query and results added to app UI state or local component state (no persistence needed)
- **APIs**: New IPC command exposed to frontend; no external network dependencies
