## ADDED Requirements

### Requirement: Folder path is persisted
The system SHALL persist the last opened folder path across sessions.

#### Scenario: Save folder path
- **WHEN** user opens a folder
- **THEN** system saves the folder path to persistent storage

#### Scenario: Restore folder on startup
- **WHEN** application starts
- **AND** a folder path was previously saved
- **THEN** system attempts to open the last folder
- **AND** if folder exists, system loads it automatically

#### Scenario: Handle missing folder
- **WHEN** application starts
- **AND** saved folder path no longer exists
- **THEN** system clears the saved path
- **AND** displays empty state (no error shown)

### Requirement: Pane states are persisted
The system SHALL persist the collapsed states of all panes.

#### Scenario: Save sidebar state
- **WHEN** user toggles sidebar collapse state
- **THEN** system saves the state to persistent storage

#### Scenario: Save editor state
- **WHEN** user toggles editor collapse state
- **THEN** system saves the state to persistent storage

#### Scenario: Save preview state
- **WHEN** user toggles preview collapse state
- **THEN** system saves the state to persistent storage

#### Scenario: Restore all states on startup
- **WHEN** application starts
- **THEN** system restores all pane collapse states from persistent storage

### Requirement: Persistence uses appropriate storage
The system SHALL use platform-appropriate persistent storage.

#### Scenario: Use app data directory
- **WHEN** saving or loading persisted data
- **THEN** system uses the platform's application data directory
- **AND** data is stored in a JSON format file

#### Scenario: Handle storage errors gracefully
- **WHEN** storage read or write fails
- **THEN** system continues operation with default values
- **AND** logs the error for debugging

### Requirement: Persistence does not block UI
The system SHALL perform persistence operations without blocking the UI.

#### Scenario: Async persistence
- **WHEN** saving data to persistent storage
- **THEN** system performs the operation asynchronously
- **AND** UI remains responsive

#### Scenario: Load on startup
- **WHEN** application is starting
- **THEN** system loads persisted data as part of initialization
- **AND** shows appropriate loading state if needed
