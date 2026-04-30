## ADDED Requirements

### Requirement: Help menu opens shortcut reference dialog
The system SHALL display a "快捷键参考" modal dialog when the user clicks the corresponding Help menu item.

#### Scenario: Open shortcut reference from Help menu
- **WHEN** user clicks "快捷键参考" in the Help menu
- **THEN** a modal dialog SHALL appear with title "快捷键参考"
- **AND** the dialog SHALL display all registered commands from the command store grouped by category (文件、编辑、视图、插入、主题、AI)
- **AND** each entry SHALL show the command title and its formatted shortcut key (e.g., "⌘+S" on macOS, "Ctrl+S" on Windows)

#### Scenario: Shortcut reference data is live from command store
- **WHEN** the shortcut reference dialog is displayed
- **THEN** the shortcut list SHALL be dynamically populated from `useCommandStore`
- **AND** commands without a `shortcut` field SHALL be excluded from the display

#### Scenario: Close shortcut reference dialog
- **WHEN** the shortcut reference dialog is open
- **AND** user presses Escape or clicks the overlay backdrop or clicks the close button
- **THEN** the dialog SHALL close
- **AND** focus SHALL return to the editor

## MODIFIED Requirements

### Requirement: Help menu opens About dialog
The system SHALL display an "关于 Seven Markdown" modal dialog when the user clicks the corresponding Help menu item.

#### Scenario: Open About dialog
- **WHEN** user clicks "About Seven Markdown" in the Help menu
- **THEN** a modal dialog SHALL appear with title "关于 Seven Markdown"
- **AND** the dialog SHALL display: application name "Seven Markdown", version number, slogan "Write Markdown Like Code"
- **AND** the dialog SHALL display: license type (MIT), and technology stack summary (Tauri v2 + React 19 + TypeScript + CodeMirror 6)
- **AND** the dialog SHALL display the ME Logo icon (blue-purple gradient)

#### Scenario: About dialog shows MIT license
- **WHEN** the About dialog is displayed
- **THEN** the copyright text SHALL display "MIT License © 2024-2026 Seven Markdown Contributors"

#### Scenario: Close About dialog
- **WHEN** the About dialog is open
- **AND** user presses Escape or clicks the overlay backdrop or clicks the close button
- **THEN** the dialog SHALL close

## ADDED Requirements

### Requirement: Help menu opens Welcome dialog
The system SHALL display a "欢迎使用 Seven Markdown" modal dialog when the user clicks the corresponding Help menu item.

#### Scenario: Open Welcome dialog from Help menu
- **WHEN** user clicks "欢迎页" in the Help menu
- **THEN** a modal dialog SHALL appear with title "欢迎使用 Seven Markdown"
- **AND** the dialog SHALL display: application name, slogan "Write Markdown Like Code", ME Logo icon (blue-purple gradient)

#### Scenario: Welcome dialog shows quick actions
- **WHEN** the Welcome dialog is displayed
- **THEN** the dialog SHALL display three quick action buttons: "新建文件", "打开文件", "打开文件夹"
- **AND** clicking each button SHALL trigger the corresponding file/folder operation

#### Scenario: Welcome dialog shows recent documents with type-aware icons
- **WHEN** the Welcome dialog is displayed
- **AND** user has previously opened files or folders
- **THEN** the dialog SHALL display up to 5 recent documents from `localStorage` key `recent-documents`
- **AND** each entry SHALL show: file/folder name, path (truncated), last opened time
- **AND** entries with `type: 'file'` SHALL display a file icon (`FileText`)
- **AND** entries with `type: 'folder'` SHALL display a folder icon (`FolderOpen`)
- **AND** clicking a recent document SHALL dispatch `app:open-recent` event with `{ path, type }` as detail
- **AND** the system SHALL open the file or folder according to the `type` field

#### Scenario: Welcome dialog shows empty state when no recent documents
- **WHEN** the Welcome dialog is displayed
- **AND** no files have been opened previously
- **THEN** the dialog SHALL display "暂无最近文档" placeholder text

#### Scenario: Close Welcome dialog
- **WHEN** the Welcome dialog is open
- **AND** user presses Escape or clicks the overlay backdrop or clicks the close button
- **THEN** the dialog SHALL close

### Requirement: Help menu check for updates
The system SHALL display version information when the user clicks the "检查更新" menu item.

#### Scenario: Check for updates
- **WHEN** user clicks "检查更新" in the Help menu
- **THEN** the system SHALL display an info notification with message "正在检查更新..."
- **AND** the system SHALL compare current version with latest available version
- **AND** the system SHALL display a success notification showing the current version
- **OR** the system SHALL display an error notification if the check fails
