## 1. Backend — Tauri Command

- [x] 1.1 Add `search_in_files` async Tauri command to `src-tauri/src/commands.rs` with parameters: `folder_path: String`, `query: String`, `search_type: String` ("filename" | "fulltext")
- [x] 1.2 Implement filename search logic: recursively walk the folder, collect `.md` file paths, filter by case-insensitive fuzzy match against the query, return up to 200 results
- [x] 1.3 Implement full-text search logic: recursively walk the folder, read each `.md` file line by line, collect lines containing the query (case-insensitive), return up to 200 results with file path, line number, and snippet
- [x] 1.4 Handle per-file read errors gracefully (skip and log, do not abort the entire search)
- [x] 1.5 Register `search_in_files` in the Tauri command handler list in `src-tauri/src/lib.rs`
- [x] 1.6 Write Rust unit tests for filename search and full-text search logic

## 2. Frontend — Types & Hook

- [x] 2.1 Define TypeScript types for search results: `SearchResult` (filename search) and `TextSearchResult` (full-text search) in `src/types/`
- [x] 2.2 Create `src/hooks/useFileSearch.ts` with state: `query`, `searchType`, `results`, `isLoading`, `error`
- [x] 2.3 Implement debounced search trigger (300 ms) in `useFileSearch` that calls the `search_in_files` Tauri command
- [x] 2.4 Write unit tests for `useFileSearch` hook covering: debounce behavior, loading state, result mapping, error handling

## 3. Frontend — SearchPanel Component

- [x] 3.1 Create `src/components/SearchPanel/SearchPanel.tsx` with search input, "Files" / "Text" mode toggle, results list, and loading/empty states
- [x] 3.2 Implement result item rendering: show relative file path for filename results; show file path + line number + snippet for full-text results
- [x] 3.3 Implement click handler on result items: dispatch open-file action and emit `search:navigate` event with line number for full-text results
- [x] 3.4 Add disabled state and "Open a folder to search" message when no folder is open
- [x] 3.5 Add `src/components/SearchPanel/index.ts` barrel export
- [x] 3.6 Write component tests for `SearchPanel` covering: renders results, shows loading spinner, shows empty state, click navigates to file

## 4. Frontend — Editor Line Navigation

- [x] 4.1 Add listener for `search:navigate` custom event in the `CodeMirrorEditor` component
- [x] 4.2 Implement scroll-to-line logic using CodeMirror's `EditorView.dispatch` to move the cursor and scroll the target line into view

## 5. Frontend — Sidebar Integration

- [x] 5.1 Add a search icon button to the `Sidebar` header that toggles between file tree view and search panel view
- [x] 5.2 Render `SearchPanel` inside `Sidebar` when search mode is active; render `FileTree` otherwise
- [x] 5.3 Pass the current folder path to `SearchPanel` so it can disable itself when no folder is open

## 6. Keyboard Shortcut

- [x] 6.1 Register `Cmd+Shift+F` (macOS) / `Ctrl+Shift+F` (Windows/Linux) in `src/hooks/useKeyboardShortcuts.ts`
- [x] 6.2 Shortcut handler: switch sidebar to search mode and focus the search input field

## 7. Internationalization

- [x] 7.1 Add i18n keys for search UI strings to `src/locales/en.json`: panel title, mode labels ("Files", "Text"), placeholder text, empty state messages, truncation notice, loading text
- [x] 7.2 Add corresponding Chinese translations to `src/locales/zh.json`
- [x] 7.3 Replace all hardcoded strings in `SearchPanel` with `useTranslation` calls

## 8. Final Verification

- [ ] 8.1 Manually test filename search: open a folder, type a query, verify results appear and clicking opens the correct file
- [ ] 8.2 Manually test full-text search: type a query, verify results show correct file/line/snippet and clicking scrolls to the line
- [ ] 8.3 Verify `Cmd/Ctrl+Shift+F` shortcut opens the search panel and focuses the input
- [ ] 8.4 Verify search panel is disabled when no folder is open
- [ ] 8.5 Verify i18n strings display correctly in both English and Chinese
- [x] 8.6 Run full test suite (`npm test`) and confirm no regressions
