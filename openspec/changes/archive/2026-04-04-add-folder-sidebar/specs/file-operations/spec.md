## ADDED Requirements

### Requirement: User can open a folder via menu
The system SHALL allow users to open a folder through the application menu.

#### Scenario: Open folder from File menu
- **WHEN** user clicks "File" > "Open Folder" in the menu
- **THEN** system displays a native folder picker dialog
- **AND** if user selects a folder, system loads the folder

### Requirement: Toolbar includes folder-related buttons
The system SHALL provide folder-related buttons in the toolbar.

#### Scenario: Open Folder button
- **WHEN** toolbar is displayed
- **THEN** system shows an "Open Folder" button with appropriate icon

#### Scenario: Toggle Sidebar button
- **WHEN** toolbar is displayed
- **THEN** system shows a "Toggle Sidebar" button

#### Scenario: Toggle Editor button
- **WHEN** toolbar is displayed
- **THEN** system shows a "Toggle Editor" button

#### Scenario: Toggle Preview button
- **WHEN** toolbar is displayed
- **THEN** system shows a "Toggle Preview" button

### Requirement: File operations work with folder context
The system SHALL ensure file operations work correctly within the folder context.

#### Scenario: Open file from folder
- **WHEN** a folder is open
- **AND** user opens a file from the file tree
- **THEN** system loads the file content
- **AND** system updates the window title with the file name

#### Scenario: Save file in folder
- **WHEN** user edits a file from the folder
- **AND** user saves the file
- **THEN** system saves the file to its original location
- **AND** file tree shows no dirty indicator

#### Scenario: Close file from folder
- **WHEN** a file from the folder is open
- **AND** user closes the file
- **THEN** system clears the editor
- **AND** file tree removes the highlight

### Requirement: Drag and drop supports folders
The system SHALL support drag and drop of folders.

#### Scenario: Drag folder to window
- **WHEN** user drags a folder to the application window
- **THEN** system opens the folder and displays its contents in the sidebar

#### Scenario: Drag file to window
- **WHEN** user drags a file to the application window
- **THEN** system opens the file (existing behavior)
- **AND** if the file is within the open folder, system highlights it in the file tree
