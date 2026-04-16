## Why

Seven MD currently displays file operations (Open, Folder, Save) as standalone buttons in the title bar, which deviates from standard desktop application design patterns. This creates an inconsistent user experience for users familiar with conventional desktop software. Implementing a standard menu bar will improve discoverability, follow platform conventions, and provide a scalable foundation for future features.

## What Changes

- Replace standalone action buttons (Open, Folder, Save) with a standard desktop menu bar
- Introduce hierarchical menu structure with File, Edit, View, and Help menus
- Consolidate file operations under File menu (New, Open File, Open Folder, Save, Save As, Recent Files, Exit)
- Add Edit menu with common editing operations (Undo, Redo, Cut, Copy, Paste, Select All, Find, Replace)
- Add View menu for UI controls (Toggle Sidebar, Toggle Preview, Zoom In/Out/Reset, Full Screen)
- Add Help menu with application information (About, Documentation, Keyboard Shortcuts)
- Implement keyboard shortcuts for common operations (Cmd/Ctrl+O, Cmd/Ctrl+S, etc.)
- Maintain native window controls (close, minimize, maximize) in their current position
- Ensure menu bar integrates seamlessly with the existing title bar drag region

## Capabilities

### New Capabilities
- `menubar`: Standard desktop menu bar with hierarchical menus (File, Edit, View, Help)
- `keyboard-shortcuts`: Global keyboard shortcuts for common operations
- `recent-files`: Track and display recently opened files

### Modified Capabilities
<!-- No existing capabilities to modify -->

## Impact

- dependencies: []
- unlocks: ['design', 'specs']
