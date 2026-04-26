## ADDED Requirements

### Requirement: Status bar displays real Git branch name
The system SHALL display the current Git branch name in the status bar by querying the system.

#### Scenario: Read Git branch from workspace
- **WHEN** a workspace folder is open
- **AND** the folder is a Git repository
- **THEN** the status bar SHALL display the actual current branch name (e.g., "main", "feature/xyz")
- **AND** the branch name SHALL be updated by polling every 5 seconds

#### Scenario: Non-Git workspace shows fallback
- **WHEN** a workspace folder is open
- **AND** the folder is NOT a Git repository (git command fails)
- **THEN** the status bar SHALL display "—" as the branch name

#### Scenario: No workspace open
- **WHEN** no workspace folder is open
- **THEN** the Git branch area SHALL display "—"

### Requirement: Status bar line/column button enables jump-to-line
The system SHALL allow users to jump to a specific line by clicking the line/column indicator.

#### Scenario: Click line number opens jump dialog
- **WHEN** user clicks the "行 X, 列 Y" button in the status bar
- **THEN** a small input dialog SHALL appear with a text field pre-filled with the current line number
- **AND** the dialog SHALL have a "跳转" button and support Enter to confirm

#### Scenario: Jump to valid line number
- **WHEN** user enters a valid line number (within document range) and confirms
- **THEN** the editor SHALL scroll to and place the cursor at the beginning of that line
- **AND** the dialog SHALL close

#### Scenario: Jump to invalid line number
- **WHEN** user enters an invalid value (non-numeric, out of range, or empty)
- **THEN** the system SHALL show a brief error indication
- **AND** the dialog SHALL remain open

### Requirement: Status bar encoding button shows encoding info
The system SHALL display file encoding information in the status bar with click interaction.

#### Scenario: Click encoding shows notification
- **WHEN** user clicks the file encoding button (e.g., "UTF-8") in the status bar
- **THEN** the system SHALL display an info notification with message "当前编码: UTF-8"
- **AND** encoding switching functionality SHALL be reserved for future implementation

### Requirement: Status bar line ending button shows line ending info
The system SHALL display line ending information in the status bar with click interaction.

#### Scenario: Click line ending shows notification
- **WHEN** user clicks the line ending button (e.g., "LF") in the status bar
- **THEN** the system SHALL display an info notification with message "当前换行符: LF"
- **AND** line ending switching functionality SHALL be reserved for future implementation

### Requirement: Status bar sync status reflects real state
The system SHALL show meaningful sync status in the status bar.

#### Scenario: File has unsaved changes
- **WHEN** the current file has unsaved modifications (dirty state)
- **THEN** the sync status SHALL display with spinning icon and text "未保存"

#### Scenario: File is saved
- **WHEN** the current file has no unsaved modifications
- **THEN** the sync status SHALL display "已保存" with static icon
