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

### Requirement: Help menu opens About dialog
The system SHALL display an "关于 Seven MD" modal dialog when the user clicks the corresponding Help menu item.

#### Scenario: Open About dialog
- **WHEN** user clicks "关于 MD Mate" in the Help menu
- **THEN** a modal dialog SHALL appear with title "关于 Seven MD"
- **AND** the dialog SHALL display: application name, version number, license type (MIT), and technology stack summary (Tauri v2 + React 19 + TypeScript + CodeMirror 6)

#### Scenario: Close About dialog
- **WHEN** the About dialog is open
- **AND** user presses Escape or clicks the overlay backdrop or clicks the close button
- **THEN** the dialog SHALL close

### Requirement: Help menu placeholder items show notification
The system SHALL show a notification for unimplemented Help menu items.

#### Scenario: Welcome page placeholder
- **WHEN** user clicks "欢迎页" in the Help menu
- **THEN** the system SHALL display an info notification with message "欢迎页功能开发中"
- **AND** the notification SHALL auto-close after 3 seconds

#### Scenario: Check for updates placeholder
- **WHEN** user clicks "检查更新" in the Help menu
- **THEN** the system SHALL display an info notification with message "检查更新功能开发中"
- **AND** the notification SHALL auto-close after 3 seconds
