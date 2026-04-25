# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
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

### Changed
- Migrated from React Context/Reducer to Zustand stores (8 stores)
- Migrated from simple textarea to CodeMirror 6 editor
- Migrated from basic CSS to Tailwind CSS + CSS variable-based theming
- All components rewritten with V2 architecture

## [0.1.0] - 2024-XX-XX

### Added

- Initial release
- Basic Markdown rendering
- File open and save functionality
- Real-time preview
- Theme switching support
