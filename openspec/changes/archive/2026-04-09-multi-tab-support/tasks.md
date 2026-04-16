## 1. State Architecture Refactoring

- [x] 1.1 Create new TabState and TabsState interfaces in `src/types/index.ts`
- [x] 1.2 Update AppState to use TabsState instead of single FileState
- [x] 1.3 Create new tab-related action types in `src/reducers/appReducer.ts`
- [x] 1.4 Implement tab reducer logic (OPEN_TAB, CLOSE_TAB, SWITCH_TAB, REORDER_TABS, UPDATE_TAB_CONTENT)
- [x] 1.5 Create migration logic to convert single-file state to single tab on first launch
- [x] 1.6 Add tab ID generation utility function
- [x] 1.7 Write unit tests for new tab state management
- [x] 1.8 Test migration from old persisted state to new tab state

## 2. Core Tab Management Hook

- [x] 2.1 Create `src/hooks/useTabManagement.ts` hook
- [x] 2.2 Implement `openTab(filePath)` function with duplicate detection
- [x] 2.3 Implement `closeTab(tabId)` function with dirty warning logic
- [x] 2.4 Implement `switchTab(tabId)` function with state preservation
- [x] 2.5 Implement `closeAllTabs()` function
- [x] 2.6 Implement `closeOtherTabs(tabId)` function
- [x] 2.7 Implement `closeTabsToRight(tabId)` function
- [x] 2.8 Implement `reopenLastClosedTab()` function for Cmd/Ctrl+Shift+T
- [x] 2.9 Implement recently closed tabs history (limit to 10)
- [x] 2.10 Add LRU eviction logic for clean tabs when exceeding threshold
- [x] 2.11 Implement create new untitled tab with sequential naming (Untitled-N)
- [x] 2.12 Write unit tests for useTabManagement hook

## 3. Tab Bar UI Component

- [x] 3.1 Create `src/components/TabBar/` directory structure
- [x] 3.2 Implement TabBar component with basic styling
- [x] 3.3 Implement Tab component with file icon, title, and close button
- [x] 3.4 Add dirty indicator (dot or icon) for unsaved tabs
- [x] 3.5 Implement tab click to switch functionality
- [x] 3.6 Implement tab close button functionality
- [x] 3.7 Add hover and active tab visual states
- [x] 3.8 Add tooltip showing full file path on hover
- [x] 3.9 Implement horizontal scrolling for tab bar overflow
- [x] 3.10 Add overflow dropdown menu showing all open tabs
- [x] 3.11 Implement drag-and-drop tab reordering using HTML5 Drag API
- [x] 3.12 Add drag preview and drop indicator visuals
- [x] 3.13 Implement tab context menu (Close, Close Others, Close to Right, Close All, Copy Path, Reveal in File Tree)
- [x] 3.14 Implement middle-click to close tab functionality
- [x] 3.15 Add keyboard navigation support for tab bar (Tab, Enter, Context Menu key)
- [x] 3.16 Ensure tab bar adapts to light/dark theme
- [x] 3.17 Hide tab bar when only one tab is open
- [x] 3.18 Implement empty state when no tabs are open
- [x] 3.19 Write unit tests for TabBar component
- [x] 3.20 Write accessibility tests for tab bar

## 4. Integration with Existing Components

- [x] 4.1 Update `FileTreeItem` to open files in tabs instead of replacing current file
- [x] 4.2 Update `FileTreeItem` to switch to existing tab if file is already open
- [x] 4.3 Add visual indicator in file tree for open files (bold or different color)
- [x] 4.4 Update `MenuBar/FileMenu.tsx` to integrate with tab system
- [x] 4.5 Update `useFileOperations` hook to work with active tab
- [x] 4.6 Modify `CodeMirrorEditor` to sync with active tab's content and cursor
- [x] 4.7 Update editor to preserve scroll position when switching tabs
- [x] 4.8 Ensure editor updates active tab's dirty state on content change
- [x] 4.9 Update drag-and-drop file handling to open files in tabs

## 5. Recent Files Integration

- [x] 5.1 Update recent files tracking to work with tabs (opening a file in a tab adds to recent files)
- [x] 5.2 Add visual indicator for files currently open in tabs (bullet point or checkmark)
- [x] 5.3 Update recent files click to activate existing tab or create new tab
- [x] 5.4 Update tooltip to show tab status for open files ("Currently open in tab X")
- [x] 5.5 Write tests for recent files + tab integration

## 6. Keyboard Shortcuts

- [x] 6.1 Add Cmd/Ctrl+Tab shortcut for switching to next tab
- [x] 6.2 Add Cmd/Ctrl+Shift+Tab shortcut for switching to previous tab
- [x] 6.3 Add Cmd/Ctrl+W shortcut for closing active tab
- [x] 6.4 Add Cmd/Ctrl+Shift+W shortcut for closing all tabs
- [x] 6.5 Add Cmd/Ctrl+Shift+T shortcut for reopening last closed tab
- [x] 6.6 Add Cmd/Ctrl+1 through 9 shortcuts for switching to specific tabs
- [x] 6.7 Add Cmd/Ctrl+0 shortcut for last tab
- [x] 6.8 Add Cmd/Ctrl+Shift+PageUp/Down for tab reordering
- [x] 6.9 Add Alt+Left/Right for tab history navigation
- [x] 6.10 Update File menu to show tab-related shortcuts
- [x] 6.11 Add tab shortcuts to keyboard shortcuts help documentation
- [x] 6.12 Update keyboard shortcuts documentation in docs/
- [x] 6.13 Write tests for new keyboard shortcuts
## 7. Tab Persistence

- [x] 7.1 Create tab persistence utilities in `src/utils/tabPersistence.ts`
- [x] 7.2 Implement saveTabState function to save tabs to local storage (debounced)
- [x] 7.3 Implement loadTabState function to restore tabs on app launch
- [x] 7.4 Persist only dirty tab content (clean tabs reload from disk)
- [x] 7.5 Persist cursor position and scroll position for each tab
- [x] 7.6 Persist tab order and active tab ID
- [x] 7.7 Persist and restore recently closed tabs history
- [x] 7.8 Implement autosave of tab state every 5 minutes
- [x] 7.9 Handle missing files gracefully when restoring tabs (show error, keep tab open)
- [x] 7.10 Handle corrupted persistence data with fallback
- [x] 7.11 Add setting to clear tab history
- [x] 7.12 Write unit tests for tab persistence utilities
- [x] 7.13 Test persistence performance with 50+ tabs

## 8. Dirty Tab Warning Dialog

- [x] 8.1 Create `src/components/DirtyTabDialog.tsx` component
- [x] 8.2 Implement Save, Don't Save, and Cancel buttons
- [x] 8.3 Integrate dialog with tab close logic
- [x] 8.4 Handle batch close warnings (Close All with multiple dirty tabs)
- [x] 8.5 Add "Save All" option when closing multiple dirty tabs
- [x] 8.6 Write unit tests for DirtyTabDialog component

## 9. Menu Updates

- [x] 9.1 Add "Close Tab" menu item in File menu
- [x] 9.2 Add "Close All Tabs" menu item in File menu
- [x] 9.3 Add "Reopen Closed Tab" menu item (disabled when no closed tabs)
- [x] 9.4 Add "Save All" menu item in File menu
- [x] 9.5 Update "New File" to create new tab
- [x] 9.6 Update "Open File" to open in new tab
- [x] 9.7 Update "Open Recent" to work with tabs
- [x] 9.8 Add tab navigation items in View menu
- [x] 9.9 Update menu items to show keyboard shortcuts
- [x] 9.10 Update native menu event listeners (Tauri) for new menu items

## 10. Status Bar Updates

- [x] 10.1 Update status bar to show current tab file name
- [x] 10.2 Update status bar to show tab count (e.g., "Tab 1 of 5")
- [x] 10.3 Update status bar cursor position to reflect active tab

## 11. Performance Optimization

- [x] 11.1 Implement React.memo for Tab component to prevent unnecessary re-renders
- [x] 11.2 Implement React.memo for TabBar component
- [x] 11.3 Implement LRU cache for tab content eviction
- [x] 11.4 Add lazy loading for inactive tab content
- [x] 11.5 Implement warning when tab count exceeds 40; hard limit at 50
- [x] 11.6 Optimize tab switching performance with transaction batching
- [x] 11.7 Add loading indicator for large files (>1MB) on tab switch
- [x] 11.8 Add performance monitoring for tab switching
- [x] 11.9 Test memory usage with 50 open tabs
- [x] 11.10 Add performance tests for tab operations

## 12. Error Handling and Edge Cases

- [x] 12.1 Handle file deleted externally while tab is open
- [x] 12.2 Handle file modified externally (show warning banner, compare modification timestamp)
- [x] 12.3 Handle file permission errors when saving
- [x] 12.4 Handle network drive disconnection
- [x] 12.5 Handle maximum tab limit (50 tabs) with user-friendly error
- [x] 12.6 Handle tab state corruption with recovery mechanism
- [x] 12.7 Write error handling tests

## 13. Testing

- [x] 13.1 Write integration tests for tab lifecycle (open, switch, close)
- [x] 13.2 Write integration tests for tab persistence across app restarts
- [x] 13.3 Write tests for tab reordering via drag-and-drop
- [x] 13.4 Write tests for tab context menu actions
- [x] 13.5 Write tests for dirty tab warnings
- [x] 13.6 Write tests for keyboard shortcuts
- [x] 13.7 Write tests for file tree integration
- [x] 13.8 Write tests for menu integration
- [x] 13.9 Write tests for recent files integration
- [x] 13.10 Write tests for status bar updates
- [x] 13.11 Achieve 80% test coverage for new tab-related code
- [x] 13.12 Run full regression test suite to ensure no breaking changes
- [x] 13.13 Write E2E tests for multi-tab workflows

## 14. Documentation and Polish

- [x] 14.1 Update ARCHITECTURE.md with new tab state management design
- [x] 14.2 Update API-REFERENCE.md with new tab-related hooks and functions
- [x] 14.3 Update USER-GUIDE.md with tab management instructions
- [x] 14.4 Add inline code comments for complex tab logic
- [x] 14.5 Ensure accessibility (ARIA labels, keyboard navigation)
- [ ] 14.6 Test on all platforms (Windows, macOS, Linux)
- [ ] 14.7 Performance profiling with many tabs
- [x] 14.8 Bug fixing and edge case handling
- [x] 14.9 Code review and refactoring
- [ ] 14.10 Final QA testing on macOS, Windows, and Linux
