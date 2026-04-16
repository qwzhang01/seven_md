## 1. Project Setup and Dependencies

- [x] 1.1 Install CodeMirror 6 core dependencies (@codemirror/state, @codemirror/view, @codemirror/lang-markdown)
- [x] 1.2 Install CodeMirror 6 extensions (@codemirror/line-numbers, @codemirror/gutter, @codemirror/highlight)
- [x] 1.3 Extend Tailwind CSS configuration for new components (titlebar, statusbar, breadcrumb)
- [x] 1.4 Update AppContext to include new state fields (cursorPosition, documentStats, fileEncoding, lineEnding)

## 2. Custom Title Bar Implementation

- [x] 2.1 Modify Tauri configuration to use frameless window (set decorations: false)
- [x] 2.2 Create TitleBar component with application logo and name display
- [x] 2.3 Add current file name display in TitleBar (format: "Seven MD - filename.md")
- [x] 2.4 Implement unsaved changes indicator (• bullet character before filename)
- [x] 2.5 Add drag region to TitleBar using data-tauri-drag-region attribute
- [x] 2.6 Create MinimizeButton component with Tauri window API integration
- [x] 2.7 Create MaximizeButton component with toggle functionality
- [x] 2.8 Create CloseButton component with unsaved changes check
- [x] 2.9 Implement theme-aware styling for TitleBar (light/dark mode)
- [x] 2.10 Integrate TitleBar into App.tsx layout (replace system title bar)

## 3. Status Bar Implementation

- [x] 3.1 Create StatusBar component with three sections (left, center, right)
- [x] 3.2 Implement cursor position display (Ln [line], Col [column])
- [x] 3.3 Add cursor position tracking logic in editor
- [x] 3.4 Implement document statistics calculation (characters, words, lines)
- [x] 3.5 Add debouncing for statistics calculation (300ms delay)
- [x] 3.6 Display file encoding in right section (default: UTF-8)
- [x] 3.7 Implement line ending detection (LF/CRLF)
- [x] 3.8 Display line ending type in right section
- [x] 3.9 Implement theme-aware styling for StatusBar
- [x] 3.10 Integrate StatusBar into App.tsx layout (bottom of window)

## 4. Editor Enhancements with CodeMirror 6

- [x] 4.1 Create CodeMirrorEditor component wrapper
- [x] 4.2 Initialize CodeMirror instance with basic configuration
- [x] 4.3 Enable line numbers extension in CodeMirror
- [x] 4.4 Configure Markdown language support (@codemirror/lang-markdown)
- [x] 4.5 Implement syntax highlighting theme for Markdown
- [x] 4.6 Add current line highlight extension
- [x] 4.7 Implement content synchronization between CodeMirror and AppContext
- [x] 4.8 Add cursor position tracking to update StatusBar
- [x] 4.9 Ensure dirty flag is set on content changes
- [x] 4.10 Implement theme-aware syntax highlighting (light/dark mode)
- [x] 4.11 Add keyboard shortcuts support (Cmd/Ctrl+S for save)
- [x] 4.12 Test file saving functionality with new editor
- [x] 4.13 Test drag-and-drop functionality with new editor
- [x] 4.14 Replace EditorPane textarea with CodeMirrorEditor component
## 5. File Icons System

- [x] 5.1 Create getFileIcon utility function to map file types to icons
- [x] 5.2 Define icon mapping for Markdown files (FileText icon)
- [x] 5.3 Define icon mapping for folders (Folder/FolderOpen icons)
- [x] 5.4 Define icon mapping for common file types (images, code, etc.)
- [x] 5.5 Implement icon size and spacing styles (16x16px, 4px spacing)
- [x] 5.6 Update FileTreeItem component to display file icons
- [x] 5.7 Add folder expand/collapse icon animation
- [x] 5.8 Implement theme-aware icon colors (light/dark mode)
- [x] 5.9 Ensure icons are accessible (high contrast, tooltips)

## 6. Breadcrumb Navigation

- [x] 6.1 Create Breadcrumb component with path segment display
- [x] 6.2 Implement path parsing to extract folder hierarchy
- [x] 6.3 Display path segments with chevron separators
- [x] 6.4 Implement long path truncation with ellipsis (collapse middle)
- [x] 6.5 Add click handler for folder segments (scroll to folder in file tree)
- [x] 6.6 Implement hover effects for clickable segments
- [x] 6.7 Add tooltip for ellipsis showing full path
- [x] 6.8 Implement theme-aware styling for Breadcrumb
- [x] 6.9 Add keyboard navigation support (Tab, Enter)
- [x] 6.10 Integrate Breadcrumb into TitleBar component
- [x] 6.11 Update Breadcrumb when file changes or folder opens

## 7. Testing and Polish

- [x] 7.1 Test custom title bar on macOS (drag, minimize, maximize, close)
- [x] 7.2 Test status bar updates in real-time (cursor, stats, encoding)
- [x] 7.3 Test editor enhancements (line numbers, syntax highlighting)
- [x] 7.4 Test file icons in various scenarios (folders, files, expand/collapse)
- [x] 7.5 Test breadcrumb navigation (click, long path, theme)
- [x] 7.6 Test theme switching for all new components
- [x] 7.7 Verify accessibility (keyboard navigation, screen reader)
- [x] 7.8 Check performance (debouncing, render optimization)
- [x] 7.9 Fix any visual inconsistencies or bugs
- [x] 7.10 Update documentation (README.md, ARCHITECTURE.md)

## 8. Final Integration and Release

- [x] 8.1 Run full test suite and fix all issues
- [x] 8.2 Verify no TypeScript or ESLint errors
- [x] 8.3 Test build process (npm run tauri:build)
- [x] 8.4 Test development mode (npm run tauri:dev)
- [x] 8.5 Create git commit with descriptive message
- [x] 8.6 Update project version number if needed
