## ADDED Requirements

### Requirement: Opening a file records it in recent documents
The system SHALL automatically add a file to the recent documents list whenever it is successfully opened.

#### Scenario: Open file via menu or keyboard shortcut
- **WHEN** user opens a file via "打开文件" menu item or `Ctrl+O`
- **AND** the file is successfully read from disk
- **THEN** the file path SHALL be saved to `localStorage` under key `recent-documents`
- **AND** the entry SHALL include `path`, `name` (filename), and `lastOpened` (timestamp)
- **AND** the file SHALL appear at the top of the recent documents list

#### Scenario: Open folder records folder in recent documents
- **WHEN** user opens a folder via "打开文件夹" menu item
- **AND** the folder is successfully opened
- **THEN** the folder path SHALL be saved to `localStorage` under key `recent-documents`
- **AND** the entry type SHALL be `folder`

#### Scenario: Duplicate entry is moved to top
- **WHEN** user opens a file that already exists in the recent documents list
- **THEN** the existing entry SHALL be removed
- **AND** a new entry with updated `lastOpened` timestamp SHALL be added at the top

#### Scenario: List is capped at 10 entries
- **WHEN** the recent documents list already contains 10 entries
- **AND** user opens a new file
- **THEN** the oldest entry SHALL be removed
- **AND** the new file SHALL be added at the top
- **AND** the list SHALL contain exactly 10 entries
