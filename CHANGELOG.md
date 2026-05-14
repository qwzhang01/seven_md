# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Multi-Window Independent Workspaces**: Each window can now bind to its own independent folder
  - `create_new_window` Rust command supports `initial_folder` parameter for URL query context passing
  - New menu item "在新窗口中打开文件夹" (Open Folder in New Window) in File menu
  - Window auto-opens folder on startup via `?folder=` URL parameter
- **Markdown Link Smart Navigation**: Preview pane link click interception
  - Internal `.md` links open in a new editor tab (via `openFileByPath`)
  - External `http(s)://` links open in system default browser (via `open_external_url` Rust command)
  - Anchor `#heading` links smooth-scroll within the preview pane
  - Unknown/unresolvable links show user-friendly notification
- **New Store Actions**:
  - `useFileStore.openFileByPath(absolutePath)` — read file and create/activate tab
  - `useWorkspaceStore.openFolderByPath(path)` — open folder without dialog, with error handling
- **New Utility Module**: `src/utils/linkNavigation.ts` — link classification (`classifyLink`) and relative path resolution (`resolveMarkdownLink`)
- **New Tauri Commands**: `open_external_url` (cross-platform browser launch), `createNewWindow` wrapper with optional `initialFolder`
- **V2 Editor Overhaul**: Complete UI rewrite with professional-grade components
  - Custom title bar with traffic lights and tab bar (drag-to-reorder, close, dirty indicator)
  - Full menu bar (File/Edit/View/Insert/Format/Theme/Help) with keyboard navigation
  - Formatting toolbar with insert buttons, view mode toggle, AI button
  - Activity bar with 4 panels (Explorer/Search/Outline/Snippets/AI)
  - Sidebar with 4 switchable panels
  - CodeMirror 6 editor with Markdown syntax highlighting, bracket matching, auto-closing, list continuation
  - Real-time preview with GFM/KaTeX/code highlighting support
  - AI assistant panel (chat mode + rewrite mode) with error handling and retry
  - Command palette (Ctrl+Shift+P) with fuzzy search
  - Find & Replace bar with case-sensitive/whole-word/regex options
  - Notification system with auto-close
  - Modal dialog system
  - Enhanced status bar (cursor position/encoding/line ending/theme/view mode/git branch)
  - 7 built-in themes (Light/Dark/Nord/Solarized Light/Solarized Dark/One Dark/Dracula)
  - Responsive layout with mobile breakpoints
  - A11y compliance (ARIA labels, roles, keyboard navigation)
- **Windows Support**: Full Windows platform support
  - Windows-specific menu bar and window controls
  - DPI scaling support
  - NSIS and MSI installer packaging
- **Testing**: 82 unit tests (Vitest) + 5 E2E test specs (Playwright)

### Fixed
- **Preview Link Click White Screen**: Clicking Markdown links in preview pane no longer causes WebView navigation (blank screen). Links are now intercepted with proper `onClick` handler in `PreviewPaneV2.tsx`

### Changed
- Migrated from React Context/Reducer to Zustand stores (9 stores)
- Migrated from simple textarea to CodeMirror 6 editor
- Migrated from basic CSS to Tailwind CSS + CSS variable-based theming
- All components rewritten with V2 architecture

### Fixed
- **Fullscreen layout height**: Fixed macOS fullscreen mode showing dark blank area at the bottom
  - Root container changed from `h-screen` (`100vh`) to `h-dvh` (`100dvh`) for accurate dynamic viewport height
  - Added `isFullscreen` runtime state to `useUIStore` with `tauri://resize` event detection
  - TitleBar auto-hides (`height: 0`) in fullscreen mode, restoring 38px of vertical space
  - Added `html, body, #root { height: 100% }` safety measure for height inheritance

## [0.1.0] - 2024-XX-XX

### Added

- Initial release
- Basic Markdown rendering
- File open and save functionality
- Real-time preview
- Theme switching support
