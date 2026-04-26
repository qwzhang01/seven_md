## ADDED Requirements

### Requirement: Command palette provides fuzzy command search
The system SHALL display a command palette overlay allowing users to search and execute commands via keyboard.

#### Scenario: Open command palette
- **WHEN** user presses Ctrl+Shift+P OR clicks the command palette button in title bar OR selects from View menu
- **THEN** an overlay panel SHALL appear centered in the window
- **AND** focus SHALL be placed in the search input field
- **AND** the input placeholder SHALL read "输入命令或搜索"
- **AND** available commands SHALL be listed below the input

#### Scenario: Command palette layout
- **WHEN** the command palette is open
- **THEN** it SHALL contain:
  - An input field with ⌨️ icon and close (✕) button
  - A scrollable command list below showing items in format: `[icon] Category: Command name`

#### Scenario: Fuzzy search filters commands
- **WHEN** user types text in the command palette input
- **THEN** the command list SHALL filter to show only commands matching the input (fuzzy matching)
- **AND** matching text portions SHALL be highlighted in results
- **AND** results SHALL update in real-time as user types

### Requirement: Commands are categorized and executable
The system SHALL organize commands into categories and allow execution via selection.

#### Scenario: Default command categories
- **WHEN** the command palette opens with no search query
- **THEN** commands SHALL be grouped by category:
  - 🌙 Theme: 切换到深色模式 / 切换到浅色模式
  - ▌▌ View: 分栏视图 / 仅编辑器 / 仅预览
  - 🖌️ Edit: 格式化文档 / 切换自动换行
  - 💾 File: 保存 / 另存为 / 导出为 PDF / 导出为 HTML
  - 📊 Insert: 表格 / 代码块 / 任务列表
  - 🤖 AI: 打开助手 / 改写选中文本 / 翻译选中文本

#### Scenario: Execute command by selection
- **WHEN** user highlights a command (via arrow keys or hover) AND presses Enter
- **OR** user directly clicks on a command item
- **THEN** the selected command SHALL execute its associated action
- **AND** the command palette SHALL close

#### Scenario: Keyboard navigation through commands
- **WHEN** the command palette is open
- **AND** user presses Up/Down arrow keys
- **THEN** the selection highlight SHALL move to the previous/next command in the filtered list
- **AND** pressing Enter SHALL execute the currently selected command

#### Scenario: Export commands display keyboard shortcuts
- **WHEN** the command palette shows the export commands
- **THEN** "导出为 PDF" SHALL display its keyboard shortcut `Ctrl+Shift+E` (macOS: `Cmd+Shift+E`)
- **AND** "导出为 HTML" SHALL display its keyboard shortcut `Ctrl+Shift+W` (macOS: `Cmd+Shift+W`)

### Requirement: Command palette can be dismissed
The system SHALL allow users to close the command palette.

#### Scenario: Close with Escape
- **WHEN** the command palette is open
- **AND** user presses Escape key
- **THEN** the command palette SHALL close without executing any command
- **AND** focus SHALL return to the previously focused element

#### Scenario: Close with click on overlay
- **WHEN** the command palette is open
- **AND** user clicks on the semi-transparent overlay/background area behind it
- **THEN** the command palette SHALL close

#### Scenario: Close button
- **WHEN** user clicks the ✕ button in the command palette input field
- **THEN** the command palette SHALL close
