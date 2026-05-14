## ADDED Requirements

### Requirement: Tab management supports opening file by path from link navigation
The tab management system SHALL support opening a file given an absolute path, reading its content, and creating or activating a tab — used by the markdown link navigation feature.

#### Scenario: Open file by absolute path creates new tab
- **WHEN** `openFileByPath(absolutePath)` is called with a valid file path that is not already open
- **THEN** the system SHALL invoke Tauri `readFile` command to read the file content
- **AND** a new tab SHALL be created with the file name as label and file content loaded
- **AND** the new tab SHALL become the active tab

#### Scenario: Open file by absolute path activates existing tab
- **WHEN** `openFileByPath(absolutePath)` is called with a file path that is already open in a tab
- **THEN** the existing tab SHALL be activated (brought to front)
- **AND** no duplicate tab SHALL be created

#### Scenario: Open file by absolute path handles read failure
- **WHEN** `openFileByPath(absolutePath)` is called and the file cannot be read (does not exist or permission denied)
- **THEN** no tab SHALL be created
- **AND** the function SHALL return an error or null to allow the caller to show a notification
