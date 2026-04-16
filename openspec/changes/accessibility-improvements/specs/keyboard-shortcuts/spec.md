## MODIFIED Requirements

### Requirement: File operation shortcuts work globally
The system SHALL provide keyboard shortcuts for file operations that work regardless of focus.

#### Scenario: Cmd/Ctrl+O opens file
- **WHEN** user presses Cmd+O (macOS) or Ctrl+O (Windows/Linux)
- **THEN** the system SHALL display the Open File dialog

#### Scenario: Cmd/Ctrl+Shift+O opens folder
- **WHEN** user presses Cmd+Shift+O (macOS) or Ctrl+Shift+O (Windows/Linux)
- **THEN** the system SHALL display the Open Folder dialog

#### Scenario: Cmd/Ctrl+S saves file
- **WHEN** user presses Cmd+S (macOS) or Ctrl+S (Windows/Linux)
- **AND** a file is currently open
- **THEN** the system SHALL save the current content to the file

#### Scenario: Cmd/Ctrl+N creates new file
- **WHEN** user presses Cmd+N (macOS) or Ctrl+N (Windows/Linux)
- **THEN** the system SHALL create a new untitled file

#### Scenario: Cmd/Ctrl+Shift+S saves as
- **WHEN** user presses Cmd+Shift+S (macOS) or Ctrl+Shift+S (Windows/Linux)
- **THEN** the system SHALL display the Save As dialog

#### Scenario: Cmd/Ctrl+[ navigates back
- **WHEN** user presses Cmd+[ (macOS) or Ctrl+[ (Windows/Linux)
- **THEN** the system SHALL navigate to the previously viewed file or location in the navigation history
- **AND** if there is no previous history entry, the shortcut SHALL have no effect
