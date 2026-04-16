## Why

Currently, the editor only supports single-file editing, which is inefficient for users who need to work with multiple files simultaneously. Users have to close the current file to open another one, losing their editing context each time. Multi-tab support is a standard feature in modern editors (VS Code, Sublime Text, Typora) and is essential for improving workflow efficiency.

This change enables users to open multiple files in separate tabs, switch between them quickly, and preserve editing state (cursor position, scroll position, unsaved changes) for each file independently.

## What Changes

- **Multi-file state management**: Transform the single-file state (`FileState`) into a multi-tab architecture with an array of open files and an active tab index
- **Tab bar UI component**: Add a visual tab bar above the editor to display all open files with file icons, close buttons, and overflow dropdown for many tabs
- **Tab switching**: Allow users to switch between open tabs while preserving each file's content, cursor position, and dirty state
- **Tab closing**: Enable closing individual tabs with dirty file warnings and "Close All" functionality; support middle-click to close
- **Tab context menu**: Right-click menu on tabs for close, close others, close to right, and copy path actions
- **Drag-and-drop reordering**: Allow users to reorder tabs by dragging them
- **Keyboard shortcuts**: Add shortcuts for tab navigation (Cmd/Ctrl+Tab, Cmd/Ctrl+W, Cmd/Ctrl+Shift+T)
- **File tree integration**: Clicking a file in the tree opens it in a new tab or switches to it if already open
- **Recent files integration**: Opening recent files opens them in new tabs; visual indicator for files currently open in tabs
- **Persisted tab state**: Save open tabs and their order when closing the app, restore on launch
- **Status bar updates**: Show current tab file name and tab count (e.g., "Tab 1 of 5")
- **Menu bar updates**: Add "Close Tab", "Close All Tabs", "Reopen Closed Tab", "Save All" menu items

## Capabilities

### New Capabilities
- `tab-management`: Core tab lifecycle management - opening, switching, closing, and reordering tabs
- `tab-bar-ui`: Visual tab bar component with file icons, close buttons, overflow dropdown, and context menus
- `tab-persistence`: Persisting and restoring tab state across app sessions

### Modified Capabilities
- `file-operations`: Extend file open/save operations to work with the tab system instead of single-file state
- `keyboard-shortcuts`: Add new keyboard shortcuts for tab navigation and management
- `menubar`: Add "Close Tab", "Close All Tabs", "Reopen Closed Tab", "Save All" menu items
- `recent-files`: Integrate with tab system; show open-in-tab indicators; activate existing tab instead of opening duplicate

## Impact

- **State Management**: Major refactoring of `FileState` to support multiple files
- **Components**: New `TabBar` component; modifications to `FileTreeItem`, `MenuBar`, `StatusBar`, and editor components
- **Reducers**: New actions for tab operations (OPEN_TAB, CLOSE_TAB, SWITCH_TAB, REORDER_TABS, etc.)
- **Hooks**: New `useTabManagement` hook; modifications to `useFileOperations` and `useAppState`
- **Tests**: New tests for tab management logic and TabBar component; updates to existing file operation tests
- **Performance**: Memory management for multiple open files; LRU eviction for tab bar with many tabs
- **Breaking Changes**: None - all changes are additive and backward compatible
