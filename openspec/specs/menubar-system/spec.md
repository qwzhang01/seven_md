## ADDED Requirements

### Requirement: Menu bar displays seven main menu categories
The system SHALL display a menu bar containing File, Edit, View, Insert, Format, Theme, and Help menus below the title bar.

#### Scenario: Menu bar layout on application start
- **WHEN** the application launches
- **THEN** a horizontal menu bar SHALL be displayed below the title bar
- **AND** the following menus SHALL appear from left to right: 文件(File), 编辑(Edit), 视图(View), 插入(Insert), 格式(Format), 主题(Theme), 帮助(Help)
- **AND** the menu bar height SHALL be 32 pixels

### Requirement: File menu provides file management operations
The system SHALL provide a File menu with operations for creating, opening, saving, and exporting files.

#### Scenario: File menu items
- **WHEN** user clicks the File menu
- **THEN** the following items SHALL be displayed in order:
  - 新建文件 (Ctrl+N)
  - 新建窗口 (Ctrl+Shift+N)
  - Separator
  - 打开文件 (Ctrl+O)
  - 打开文件夹
  - Separator
  - 保存 (Ctrl+S)
  - 另存为 (Ctrl+Shift+S)
  - Separator
  - 导出为 PDF
  - 导出为 HTML

#### Scenario: New file creates untitled document
- **WHEN** user selects "新建文件" or presses Ctrl+N
- **THEN** a new empty Markdown file SHALL be created
- **AND** a new tab labeled "Untitled" SHALL be opened
- **AND** focus SHALL be placed in the editor

#### Scenario: Open file shows native picker
- **WHEN** user selects "打开文件" or presses Ctrl+O
- **THEN** a native file selection dialog SHALL be displayed
- **AND** the dialog SHALL filter for Markdown files (*.md, *.markdown)
- **AND** upon selection, the file SHALL be opened in a new tab

#### Scenario: Save writes content to disk
- **WHEN** user selects "保存" or presses Ctrl+S
- **AND** a file is currently open with a path
- **THEN** the current editor content SHALL be saved to the file
- **AND** the unsaved indicator dot SHALL be removed from the tab
- **AND** a success notification SHALL be displayed

#### Scenario: Export as PDF generates PDF file
- **WHEN** user selects "导出为 PDF"
- **THEN** the current Markdown content SHALL be converted to PDF format
- **AND** a save dialog SHALL appear for choosing the output location
- **AND** the generated PDF SHALL preserve formatting (headers, lists, code blocks, images)

### Requirement: Edit menu provides editing and search operations
The system SHALL provide an Edit menu with undo/redo, clipboard, and search operations.

#### Scenario: Edit menu items
- **WHEN** user clicks the Edit menu
- **THEN** the following items SHALL be displayed:
  - 撤销 (Ctrl+Z)
  - 重做 (Ctrl+Shift+Z)
  - Separator
  - 剪切 (Ctrl+X)
  - 复制 (Ctrl+C)
  - 粘贴 (Ctrl+V)
  - Separator
  - 查找 (Ctrl+F)
  - 替换 (Ctrl+H)

#### Scenario: Undo reverses last action
- **WHEN** user selects "撤销" or presses Ctrl+Z
- **THEN** the last edit operation SHALL be reversed
- **AND** the editor view SHALL update accordingly

#### Scenario: Find opens find bar
- **WHEN** user selects "查找" or presses Ctrl+F
- **THEN** the find replace bar SHALL appear at the bottom of the editor area
- **AND** focus SHALL be placed in the find input field

### Requirement: View menu provides display control options
The system SHALL provide a View menu for controlling UI visibility, zoom, and layout modes.

#### Scenario: View menu items
- **WHEN** user clicks the View menu
- **THEN** the following items SHALL be displayed:
  - 命令面板 (Ctrl+Shift+P)
  - 切换侧边栏 (Ctrl+B)
  - 切换大纲面板 (Ctrl+Shift+O)
  - Separator
  - 放大 (Ctrl++)
  - 缩小 (Ctrl+-)
  - 重置缩放 (Ctrl+0)
  - Separator
  - 仅编辑器
  - 仅预览
  - 分栏视图

#### Scenario: Toggle sidebar visibility
- **WHEN** user selects "切换侧边栏" or presses Ctrl+B
- **THEN** the sidebar SHALL be hidden if currently visible
- **OR** the sidebar SHALL be shown if currently hidden

#### Scenario: Zoom in increases font size
- **WHEN** user selects "放大" or presses Ctrl++
- **THEN** the editor font size SHALL increase by 1px
- **AND** the new size SHALL persist within the session

### Requirement: Insert menu provides Markdown element insertion
The system SHALL provide an Insert menu for inserting various Markdown elements at the cursor position.

#### Scenario: Insert menu items
- **WHEN** user clicks the Insert menu
- **THEN** the following insertion options SHALL be available:
  - 标题 → inserts `# `
  - 加粗 → wraps selection with `**text**`
  - 斜体 → wraps selection with `*text*`
  - Separator
  - 行内代码 → wraps selection with `` `code` ``
  - 代码块 → inserts ```language\n\n```
  - Separator
  - 链接 → inserts `[text](url)`
  - 图片 → inserts `![alt](url)`
  - Separator
  - 表格 → inserts table template
  - 水平线 → inserts `---`
  - Separator
  - 无序列表 → inserts `- item`
  - 有序列表 → inserts `1. item`
  - 任务列表 → inserts `- [ ] task`
  - Separator
  - 引用 → inserts `> quote`

#### Scenario: Insert with text selected
- **WHEN** user has text selected in the editor
- **AND** user chooses an insert option like "加粗"
- **THEN** the selected text SHALL be wrapped with the appropriate Markdown syntax (e.g., `**selected text**`)
- **AND** the cursor SHALL remain positioned appropriately

#### Scenario: Insert without selection
- **WHEN** no text is selected in the editor
- **AND** user chooses an insert option
- **THEN** the Markdown template syntax SHALL be inserted at the cursor position
- **AND** the cursor SHALL be positioned for user input (e.g., inside the bold markers)

### Requirement: Format menu provides text formatting options
The system SHALL provide a Format menu for applying text formatting.

#### Scenario: Format menu items
- **WHEN** user clicks the Format menu
- **THEN** the following formatting options SHALL be available:
  - 加粗 (Ctrl+B) — toggles bold
  - 斜体 (Ctrl+I) — toggles italic
  - 删除线 — toggles strikethrough
  - Separator
  - 标题 1 / 标题 2 / 标题 3
  - Separator
  - 代码 — toggles inline code
  - 链接 — toggles link format

### Requirement: Theme menu provides theme switching
The system SHALL provide a Theme menu for switching between available color themes.

#### Scenario: Theme menu items
- **WHEN** user clicks the Theme menu
- **THEN** the following themes SHALL be listed:
  - 🌙 深色模式 (Dark)
  - ☀️ 浅色模式 (Light)
  - 🎨 Monokai
  - 🎨 Solarized
  - 🎨 Nord
  - 🎨 Dracula
  - 🎨 GitHub

#### Scenario: Theme switches immediately
- **WHEN** user selects a theme from the Theme menu
- **THEN** the entire application UI SHALL immediately change to the selected theme colors
- **AND** a smooth transition animation (~200ms) SHALL play
- **AND** the selected theme SHALL be persisted to local storage

### Requirement: Help menu provides documentation and about information
The system SHALL provide a Help menu with documentation links and application information.

#### Scenario: Help menu items
- **WHEN** user clicks the Help menu
- **THEN** the following items SHALL be displayed:
  - 欢迎页
  - Markdown 指南
  - 快捷键参考
  - Separator
  - About Seven Markdown
  - 检查更新

#### Scenario: About dialog shows Seven Markdown branding
- **WHEN** user selects "About Seven Markdown"
- **THEN** a modal dialog SHALL display showing:
  - Application name: "Seven Markdown"
  - Slogan: "Write Markdown Like Code"
  - Version number
  - License information (MIT)

### Requirement: Menus support keyboard navigation
The system SHALL allow full keyboard navigation of the menu bar and dropdown menus.

#### Scenario: Menu opens on click or keyboard
- **WHEN** user clicks a menu item OR uses the appropriate Alt/keyboard shortcut
- **THEN** the corresponding dropdown menu SHALL open
- **AND** the first item SHALL receive focus highlight

#### Scenario: Arrow keys navigate menu items
- **WHEN** a dropdown menu is open
- **AND** user presses Up/Down arrow keys
- **THEN** the highlight SHALL move to the previous/next menu item

#### Scenario: Escape closes menu
- **WHEN** any menu is open
- **AND** user presses Escape key
- **THEN** the menu SHALL close immediately
- **AND** focus SHALL return to the previous element

#### Scenario: Click outside closes menu
- **WHEN** a dropdown menu is open
- **AND** user clicks outside the menu area
- **THEN** the menu SHALL close immediately

### Requirement: Menu items display keyboard shortcuts
The system SHALL display keyboard shortcut hints next to applicable menu items.

#### Scenario: Shortcuts displayed in gray text
- **WHEN** a menu is opened
- **AND** a menu item has an associated keyboard shortcut
- **THEN** the shortcut SHALL be displayed on the right side of the menu item in gray text
- **AND** the modifier keys SHALL use platform-appropriate notation (Cmd for macOS, Ctrl for others)
