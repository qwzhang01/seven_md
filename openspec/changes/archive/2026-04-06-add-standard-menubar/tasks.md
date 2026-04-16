## 1. Menu Components Foundation

- [x] 1.1 Create `src/components/MenuBar/MenuBar.tsx` - Main menu bar container component
- [x] 1.2 Create `src/components/MenuBar/Menu.tsx` - Individual menu dropdown component
- [x] 1.3 Create `src/components/MenuBar/MenuItem.tsx` - Menu item component with icon, label, and shortcut
- [x] 1.4 Create `src/components/MenuBar/MenuSeparator.tsx` - Menu divider component
- [x] 1.5 Create `src/components/MenuBar/index.ts` - Export all menu components
- [x] 1.6 Add CSS styles for menu components (dropdown, hover states, positioning)
- [x] 1.7 Ensure menu components support dark/light theme

## 2. Menu State Management

- [x] 2.1 Create menu state context/hook for managing open/close state
- [x] 2.2 Implement click-outside-to-close functionality for menus
- [x] 2.3 Add keyboard navigation support (Alt key, arrow keys, Enter, Escape)
- [x] 2.4 Implement smart dropdown positioning (detect viewport boundaries)

## 3. File Menu Implementation

- [x] 3.1 Create File menu with all menu items (New, Open File, Open Folder, Save, Save As, Recent Files, Exit)
- [x] 3.2 Wire up "Open File" to use Tauri dialog API (`@tauri-apps/plugin-dialog`)
- [x] 3.3 Wire up "Open Folder" to use Tauri dialog API
- [x] 3.4 Wire up "Save" to save current file content
- [x] 3.5 Wire up "Save As" to show save dialog
- [x] 3.6 Implement "New File" functionality (clear editor, create untitled file)
- [x] 3.7 Add "Exit" functionality (close window on Windows/Linux, Cmd+W on macOS)
- [x] 3.8 Disable Save/Save As when no file is open

## 4. Recent Files Feature

- [x] 4.1 Create `src/hooks/useRecentFiles.ts` hook for managing recent files list
- [x] 4.2 Implement localStorage persistence for recent files (key: "seven-md:recent-files")
- [x] 4.3 Add file/folder to recent list when opened successfully
- [x] 4.4 Create Recent Files submenu component
- [x] 4.5 Display recent files with file name and full path tooltip
- [x] 4.6 Implement click handler to open recent file/folder
- [x] 4.7 Add "Clear Recent Files" option
- [x] 4.8 Handle non-existent files (show error, remove from list)
- [x] 4.9 Validate recent files on application startup
- [x] 4.10 Limit recent files list to 10 items

## 5. Edit Menu Implementation

- [x] 5.1 Create Edit menu with all menu items (Undo, Redo, Cut, Copy, Paste, Select All, Find, Replace)
- [x] 5.2 Wire up "Undo" to CodeMirror undo functionality
- [x] 5.3 Wire up "Redo" to CodeMirror redo functionality
- [x] 5.4 Wire up "Find" to open CodeMirror search panel
- [x] 5.5 Wire up "Replace" to open CodeMirror search/replace panel
- [x] 5.6 Implement Cut, Copy, Paste using Clipboard API
- [x] 5.7 Implement Select All functionality
- [x] 5.8 Disable Undo/Redo when no history available
- [x] 5.9 Disable Cut/Copy when no selection

## 6. View Menu Implementation

- [x] 6.1 Create View menu with all menu items (Toggle Sidebar, Toggle Preview, Zoom In, Zoom Out, Reset Zoom, Full Screen)
- [x] 6.2 Implement "Toggle Sidebar" functionality
- [x] 6.3 Implement "Toggle Preview" functionality
- [x] 6.4 Implement "Zoom In" (increase editor font size by 2px)
- [x] 6.5 Implement "Zoom Out" (decrease editor font size by 2px)
- [x] 6.6 Implement "Reset Zoom" (reset to default 14px)
- [x] 6.7 Persist zoom level in localStorage
- [x] 6.8 Implement "Full Screen" toggle using Tauri window API
- [x] 6.9 Update zoom menu items to show current zoom level

## 7. Help Menu Implementation

- [x] 7.1 Create Help menu with menu items (Keyboard Shortcuts, About Seven MD)
- [x] 7.2 Create "About Seven MD" modal component with app info, version, license
- [x] 7.3 Create "Keyboard Shortcuts" modal showing all available shortcuts
- [x] 7.4 Add links to documentation and repository in About modal

## 8. Keyboard Shortcuts System

- [x] 8.1 Create `src/hooks/useKeyboardShortcuts.ts` hook for global shortcuts
- [x] 8.2 Detect platform (macOS vs Windows/Linux) for modifier keys
- [x] 8.3 Implement file operation shortcuts (Cmd/Ctrl+O, Cmd/Ctrl+S, Cmd/Ctrl+N, Cmd/Ctrl+Shift+O, Cmd/Ctrl+Shift+S)
- [x] 8.4 Implement edit operation shortcuts (Cmd/Ctrl+Z, Cmd/Ctrl+Shift+Z, Cmd/Ctrl+F, Cmd/Ctrl+H)
- [x] 8.5 Implement view operation shortcuts (Cmd/Ctrl+B, Cmd/Ctrl+P, Cmd/Ctrl++, Cmd/Ctrl+-, Cmd/Ctrl+0)
- [x] 8.6 Implement Full Screen shortcut (F11 on Windows/Linux, Cmd+Ctrl+F on macOS)
- [x] 8.7 Prevent shortcuts from conflicting with CodeMirror built-in shortcuts
- [x] 8.8 Ensure shortcuts work when editor has focus vs when other elements have focus

## 9. Title Bar Integration

- [x] 9.1 Update `src/components/TitleBar/index.tsx` to include MenuBar component
- [x] 9.2 Position menu bar between window controls spacer and app title/breadcrumb
- [x] 9.3 Ensure menu bar integrates with Tauri drag region (`data-tauri-drag-region`)
- [x] 9.4 Adjust spacing and layout to accommodate menu bar
- [x] 9.5 Test menu bar visibility and positioning on different window sizes

## 10. Testing and Polish

- [x] 10.1 Test all menu items are functional on macOS
- [x] 10.2 Test all menu items are functional on Windows/Linux (if applicable)
- [x] 10.3 Test keyboard shortcuts don't conflict with editor
- [x] 10.4 Test recent files persistence across sessions
- [x] 10.5 Test zoom level persistence across sessions
- [x] 10.6 Test dark/light theme switching for menu components
- [x] 10.7 Test menu keyboard navigation (Alt key, arrow keys)
- [x] 10.8 Test click-outside-to-close functionality
- [x] 10.9 Test responsive behavior on narrow windows
- [x] 10.10 Add ARIA labels for accessibility

## 11. Documentation

- [x] 11.1 Update README.md with menu bar features
- [x] 11.2 Document keyboard shortcuts in help modal
- [x] 11.3 Add inline code comments for complex menu logic
