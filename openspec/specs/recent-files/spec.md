## ADDED Requirements

### Requirement: Application tracks recently opened files
The system SHALL maintain a list of recently opened files for quick access.

#### Scenario: File is added to recent files list
- **WHEN** user opens a file successfully
- **THEN** the file path SHALL be added to the recent files list
- **AND** the list SHALL be ordered with most recent first

#### Scenario: Folder is added to recent files list
- **WHEN** user opens a folder successfully
- **THEN** the folder path SHALL be added to the recent files list
- **AND** the list SHALL be ordered with most recent first

#### Scenario: Duplicate entries are prevented
- **WHEN** user opens a file or folder already in the recent list
- **THEN** the existing entry SHALL be moved to the top of the list
- **AND** no duplicate SHALL be created

#### Scenario: List size is limited
- **WHEN** the recent files list reaches 10 items
- **AND** a new item is added
- **THEN** the oldest item SHALL be removed from the list

### Requirement: Recent files are persisted between sessions
The system SHALL persist the recent files list across application restarts.

#### Scenario: Recent files persist after application restart
- **WHEN** the application is closed and reopened
- **THEN** the recent files list SHALL be restored from the previous session
- **AND** all entries SHALL remain in the same order

#### Scenario: Recent files are stored in localStorage
- **WHEN** a file is added to or removed from the recent list
- **THEN** the updated list SHALL be saved to localStorage immediately
- **AND** use the key "seven-md:recent-files"

### Requirement: Recent files are accessible from File menu
The system SHALL provide access to recent files through the File menu.

#### Scenario: Recent Files submenu displays recent files
- **WHEN** user opens the File menu
- **THEN** a "Recent Files" submenu SHALL be displayed
- **AND** the submenu SHALL show up to 10 recent items
- **AND** each item SHALL display the file or folder name
- **AND** hovering over an item SHALL show the full path as a tooltip

#### Scenario: Clicking recent file opens it
- **WHEN** user clicks on a recent file in the Recent Files submenu
- **THEN** the file SHALL be opened in the editor
- **AND** the menu SHALL close

#### Scenario: Clicking recent folder opens it
- **WHEN** user clicks on a recent folder in the Recent Files submenu
- **THEN** the folder SHALL be opened and displayed in the sidebar
- **AND** the menu SHALL close

#### Scenario: Recent Files shows empty state
- **WHEN** no files or folders have been opened yet
- **THEN** the Recent Files submenu SHALL display "No recent files"
- **AND** the text SHALL be disabled/grayed out

### Requirement: Recent files list can be cleared
The system SHALL allow users to clear the recent files list.

#### Scenario: Clear Recent Files option is available
- **WHEN** user opens the Recent Files submenu
- **AND** there is at least one item in the list
- **THEN** a "Clear Recent Files" option SHALL be displayed at the bottom of the submenu
- **AND** the option SHALL be separated from the file list by a separator

#### Scenario: Clearing recent files removes all entries
- **WHEN** user clicks "Clear Recent Files"
- **THEN** all entries SHALL be removed from the recent files list
- **AND** the localStorage entry SHALL be updated
- **AND** the Recent Files submenu SHALL show "No recent files"

### Requirement: Invalid recent files are handled gracefully
The system SHALL handle cases where recent files no longer exist.

#### Scenario: Non-existent file shows error
- **WHEN** user clicks on a recent file that no longer exists
- **THEN** the system SHALL display an error message: "File not found"
- **AND** the file SHALL be removed from the recent files list

#### Scenario: Non-existent folder shows error
- **WHEN** user clicks on a recent folder that no longer exists
- **THEN** the system SHALL display an error message: "Folder not found"
- **AND** the folder SHALL be removed from the recent files list

#### Scenario: Checking file existence on startup
- **WHEN** the application starts and loads recent files
- **THEN** the system SHALL validate that each file/folder still exists
- **AND** remove any entries that no longer exist

### Requirement: Recent files display meaningful names
The system SHALL display recent files in a user-friendly format.

#### Scenario: File name is displayed
- **WHEN** a file is shown in the Recent Files list
- **THEN** the display text SHALL be the file name (without directory path)
- **AND** the full path SHALL be shown on hover

#### Scenario: Folder name is displayed
- **WHEN** a folder is shown in the Recent Files list
- **THEN** the display text SHALL be the folder name (without parent directory path)
- **AND** the full path SHALL be shown on hover
- **AND** a folder icon SHALL distinguish it from files

### Requirement: Recent files integrate with tab system
The system SHALL track files opened in tabs in the recent files list.

#### Scenario: Opening file in tab adds to recent files
- **WHEN** user opens a file that creates a new tab
- **THEN** the file path SHALL be added to the recent files list
- **AND** the list SHALL be ordered with most recent first

#### Scenario: Opening recent file activates existing tab
- **WHEN** user opens a file from the Recent Files submenu
- **AND** that file is already open in a tab
- **THEN** the existing tab SHALL be activated
- **AND** no new tab SHALL be created

#### Scenario: Opening recent file creates new tab if not open
- **WHEN** user opens a file from the Recent Files submenu
- **AND** that file is not currently open in any tab
- **THEN** a new tab SHALL be created for the file
- **AND** the new tab SHALL become active

### Requirement: Recent files display tab status indicators
The system SHALL indicate whether a recent file is currently open in a tab.

#### Scenario: Recent files show open indicator
- **WHEN** a file in the Recent Files list is currently open in a tab
- **THEN** the file SHALL display a visual indicator (e.g., colored icon)
- **AND** the indicator distinguishes open files from closed files

#### Scenario: Tooltip shows tab status
- **WHEN** user hovers over a recent file that is open in a tab
- **THEN** the tooltip SHALL indicate "Currently open in tab X"
