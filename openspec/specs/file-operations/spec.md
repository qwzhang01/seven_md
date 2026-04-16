## MODIFIED Requirements

### Requirement: File open operations integrate with tab system
The system SHALL open files in the multi-tab system rather than replacing the current file state.

#### Scenario: Open file creates new tab
- **WHEN** user opens a file from the file dialog (Cmd/Ctrl+O)
- **THEN** a new tab SHALL be created for that file
- **AND** the new tab SHALL become the active tab
- **AND** existing tabs SHALL remain open and unchanged

#### Scenario: Open file from file tree
- **WHEN** user clicks a file in the file tree
- **THEN** if the file is already open in a tab, that tab SHALL become active
- **OR** if the file is not open, a new tab SHALL be created for it

#### Scenario: Open recent file
- **WHEN** user opens a file from the recent files menu
- **THEN** if the file is already open in a tab, that tab SHALL become active
- **OR** if the file is not open, a new tab SHALL be created for it

### Requirement: File save operations work on active tab
The system SHALL save the content of the currently active tab.

#### Scenario: Save active tab
- **WHEN** user triggers save (Cmd/Ctrl+S)
- **THEN** the system SHALL save the active tab's content to its associated file
- **AND** the active tab's dirty indicator SHALL be removed

#### Scenario: Save As for active tab
- **WHEN** user triggers Save As (Cmd/Ctrl+Shift+S)
- **THEN** the system SHALL save the active tab's content to a new file path
- **AND** update the tab's file path and title to the new file
- **AND** remove the dirty indicator

#### Scenario: Save all dirty tabs
- **WHEN** user chooses "Save All" from the menu
- **THEN** the system SHALL save all tabs with unsaved changes
- **AND** remove dirty indicators from all saved tabs

### Requirement: New file operation creates new tab
The system SHALL create a new tab when creating a new file.

#### Scenario: Create new untitled file
- **WHEN** user creates a new file (Cmd/Ctrl+N)
- **THEN** a new untitled tab SHALL be created
- **AND** the new tab SHALL become the active tab
- **AND** the tab title SHALL be "Untitled-N" where N is sequential

#### Scenario: Multiple untitled files have unique names
- **WHEN** user creates multiple new files without saving
- **THEN** each SHALL have a unique untitled name (Untitled-1, Untitled-2, etc.)

### Requirement: File operations preserve tab state
The system SHALL preserve the state of other tabs when performing file operations.

#### Scenario: Opening file preserves existing tabs
- **WHEN** user opens a file while other tabs are open
- **THEN** all existing tabs SHALL remain open
- **AND** their states (content, cursor, scroll, dirty) SHALL be preserved

#### Scenario: Saving one tab does not affect others
- **WHEN** user saves the active tab
- **THEN** only that tab's file SHALL be saved
- **AND** other tabs' states SHALL remain unchanged

#### Scenario: Closing tab switches to adjacent tab
- **WHEN** user closes the active tab
- **THEN** the system SHALL activate the tab immediately to the left
- **OR** if no left tab exists, activate the tab to the right
- **OR** if no other tabs exist, no tab shall be active

## ADDED Requirements

### Requirement: File operations handle tab closing warnings
The system SHALL warn users about unsaved changes when closing tabs.

#### Scenario: Close dirty tab shows warning
- **WHEN** user attempts to close a tab with unsaved changes
- **THEN** the system SHALL display a warning dialog with options:
  - Save
  - Don't Save
  - Cancel

#### Scenario: Save option in close warning
- **WHEN** user chooses "Save" from the close warning dialog
- **THEN** the tab's content SHALL be saved to its file
- **AND** the tab SHALL close

#### Scenario: Don't Save option in close warning
- **WHEN** user chooses "Don't Save" from the close warning dialog
- **THEN** the tab SHALL close without saving
- **AND** the file on disk SHALL remain unchanged

#### Scenario: Cancel option in close warning
- **WHEN** user chooses "Cancel" from the close warning dialog
- **THEN** the tab SHALL remain open
- **AND** the unsaved content SHALL be preserved

### Requirement: File tree integration highlights open files
The system SHALL visually indicate which files in the file tree are currently open in tabs.

#### Scenario: Highlight open files in file tree
- **WHEN** a file is open in a tab
- **THEN** that file SHALL be visually highlighted in the file tree (e.g., bold text or different color)

#### Scenario: Remove highlight when tab closes
- **WHEN** a tab is closed
- **THEN** the corresponding file in the file tree SHALL lose its open indicator

#### Scenario: Active tab highlighted differently
- **WHEN** a file's tab is currently active
- **THEN** that file in the file tree SHALL have a distinct active indicator
