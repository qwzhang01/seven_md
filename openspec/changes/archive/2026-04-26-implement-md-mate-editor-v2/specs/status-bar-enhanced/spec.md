## ADDED Requirements

### Requirement: Enhanced status bar displays multi-section information
The system SHALL display an enhanced status bar at the bottom of the window showing Git info, sync status, problems, cursor position, encoding, line endings, language mode, and notifications.

#### Scenario: Status bar layout
- **WHEN** the status bar is displayed
- **THEN** it SHALL be divided into two main regions:
  - **Left region**: 🔀 Git branch | 🔄 Sync status | ⚠ Problems count | 🔔 Notifications count
  - **Right region**: Line X, Col Y | Encoding (UTF-8) | Line ending (LF/CRLF) | Language (Markdown)
- **AND** items within each region SHALL be separated by vertical dividers
- **AND** the status bar height SHALL be 24 pixels

#### Scenario: Git branch display
- **WHEN** the workspace is a Git repository
- **THEN** the current branch name (e.g., "main") SHALL be shown with a 🔀 icon in the leftmost position
- **AND** clicking the branch name SHALL show branch details (future: branch switcher)

#### Scenario: Sync status indicator
- **WHEN** files are being synchronized (auto-save, remote sync, etc.)
- **THEN** a spinning 🔄 animation SHALL appear indicating sync in progress
- **WHEN** sync is complete
- **THEN** the text "已同步" SHALL be displayed statically

#### Scenario: Errors and warnings count
- **WHEN** there are linting/validation errors or warnings in the current document
- **THEN** ⚠ N SHALL show where N is the total error+warning count
- **AND** clicking this item SHALL open a problems panel (future)

#### Scenario: Cursor position display
- **WHEN** the cursor moves in the editor
- **THEN** the right region SHALL update to show "行 X, 列 Y" reflecting current position
- **AND** clicking the position SHALL open a "Go to Line" dialog (future)

#### Scenario: File encoding display
- **WHEN** a file is opened
- **THEN** its encoding (e.g., "UTF-8") SHALL be displayed
- **AND** clicking SHALL allow changing encoding (with re-interpretation option)

#### Scenario: Line ending display
- **WHEN** a file is opened
- **THEN** its line ending type ("LF" for Unix/Mac, "CRLF" for Windows) SHALL be displayed
- **AND** clicking SHALL toggle between LF and CRLF (with confirmation)

#### Scenario: Language mode display
- **WHEN** a file is opened
- **THEN** its detected language ("Markdown") SHALL be displayed
- **AND** clicking SHALL allow manually overriding the language mode

### Requirement: Status bar items respond to clicks
The system SHALL provide interactive behavior when clicking status bar items.

#### Scenario: Clickable items have hover effect
- **WHEN** user hovers over an interactive status bar item
- **THEN** the item background SHALL lighten slightly to indicate clickability

#### Scenario: Notification bell shows count
- **WHEN** there are unread notifications
- **THEN** the 🔔 icon SHALL show a badge count
- **AND** clicking SHALL open the notification list/dropdown

### Requirement: Enhanced status bar respects theme
The system SHALL render the status bar using current theme colors.

#### Scenario: Dark theme status bar
- **WHEN** the dark theme is active
- **THEN** the status bar SHALL use dark background (#1e1e1e) with light secondary text (#858585)

#### Scenario: Light theme status bar
- **WHEN** the light theme is active
- **THEN** the status bar SHALL use light background (#f3f4f6) with dark secondary text (#6b7280)
