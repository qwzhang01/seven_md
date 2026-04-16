## ADDED Requirements

### Requirement: User can open a folder
The system SHALL allow users to open a folder through the toolbar button or menu.

#### Scenario: Open folder via toolbar button
- **WHEN** user clicks the "Open Folder" button in the toolbar
- **THEN** system displays a native folder picker dialog
- **AND** if user selects a folder, system loads the folder and displays its contents in the sidebar

#### Scenario: Cancel folder selection
- **WHEN** user clicks the "Open Folder" button
- **AND** user cancels the folder picker dialog
- **THEN** system does nothing and maintains current state

### Requirement: Sidebar displays folder contents
The system SHALL display the contents of the opened folder in the sidebar.

#### Scenario: Display folder contents
- **WHEN** user opens a folder
- **THEN** system displays the sidebar with the folder name as header
- **AND** system shows all markdown files and subdirectories in the folder

#### Scenario: Empty folder
- **WHEN** user opens an empty folder (no .md files or subdirectories)
- **THEN** system displays an empty state message in the sidebar

### Requirement: Sidebar is collapsible
The system SHALL allow users to collapse and expand the sidebar.

#### Scenario: Collapse sidebar
- **WHEN** user clicks the sidebar toggle button
- **THEN** system collapses the sidebar to a minimal width or completely hidden
- **AND** the main content area expands to fill the space

#### Scenario: Expand sidebar
- **WHEN** sidebar is collapsed
- **AND** user clicks the sidebar toggle button
- **THEN** system expands the sidebar to its normal width
- **AND** the main content area adjusts accordingly

#### Scenario: Remember sidebar state
- **WHEN** user collapses or expands the sidebar
- **THEN** system remembers the state for the next session

### Requirement: Sidebar width is appropriate
The system SHALL display the sidebar with an appropriate width.

#### Scenario: Default sidebar width
- **WHEN** sidebar is expanded
- **THEN** system displays the sidebar with a default width of 240px

#### Scenario: Sidebar minimum width
- **WHEN** sidebar is displayed
- **THEN** system ensures minimum readable width of 180px

### Requirement: Close folder
The system SHALL allow users to close the currently opened folder.

#### Scenario: Close folder
- **WHEN** user clicks the close button on the sidebar header
- **THEN** system clears the folder from the sidebar
- **AND** system clears the file tree
- **AND** system clears the current file if it was from that folder
