## ADDED Requirements

### Requirement: Recent files integrate with tab system
The system SHALL track files opened in tabs in the recent files list.

#### Scenario: Opening file in tab adds to recent files
- **WHEN** user opens a file that creates a new tab
- **THEN** the file path SHALL be added to the recent files list
- **AND** the list SHALL be ordered with most recent first

#### Scenario: Switching to existing tab updates recent files
- **WHEN** user switches to a tab with an already open file
- **THEN** the file path SHALL be moved to the top of the recent files list
- **AND** no duplicate SHALL be created

#### Scenario: Saving untitled file adds to recent files
- **WHEN** user saves an untitled tab to a new file
- **THEN** the saved file path SHALL be added to the recent files list

### Requirement: Recent files track tab association
The system SHALL maintain a connection between recent files and open tabs for efficient navigation.

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
- **THEN** the file SHALL display a visual indicator (e.g., bullet point or checkmark)
- **AND** the indicator distinguishes open files from closed files

#### Scenario: Tooltip shows tab status
- **WHEN** user hovers over a recent file that is open in a tab
- **THEN** the tooltip SHALL indicate "Currently open in tab X"
- **AND** show the tab's position or name

## MODIFIED Requirements

### Requirement: Recent files are accessible from File menu
The system SHALL provide access to recent files through the File menu.

#### Scenario: Recent Files submenu displays recent files
- **WHEN** user opens the File menu
- **THEN** a "Recent Files" submenu SHALL be displayed
- **AND** the submenu SHALL show up to 10 recent items
- **AND** each item SHALL display the file or folder name
- **AND** hovering over an item SHALL show the full path as a tooltip
- **AND** items currently open in tabs SHALL display an indicator

#### Scenario: Clicking recent file opens or activates it
- **WHEN** user clicks on a recent file in the Recent Files submenu
- **THEN** if the file is open in a tab, that tab SHALL become active
- **OR** if the file is not open, it SHALL be opened in a new tab
- **AND** the menu SHALL close

#### Scenario: Clicking recent folder opens it
- **WHEN** user clicks on a recent folder in the Recent Files submenu
- **THEN** the folder SHALL be opened and displayed in the sidebar
- **AND** the menu SHALL close

#### Scenario: Recent Files shows empty state
- **WHEN** no files or folders have been opened yet
- **THEN** the Recent Files submenu SHALL display "No recent files"
- **AND** the text SHALL be disabled/grayed out
