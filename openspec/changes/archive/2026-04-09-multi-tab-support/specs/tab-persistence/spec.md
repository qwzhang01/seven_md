## ADDED Requirements

### Requirement: Tab state persists across app sessions
The system SHALL save the open tabs and their state when the app closes and restore them when the app reopens.

#### Scenario: Restore tabs on app launch
- **WHEN** the application starts
- **THEN** the system SHALL load previously saved tab state
- **AND** all tabs that were open at last close SHALL be restored
- **AND** the active tab SHALL be the same as when the app was closed

#### Scenario: Restore tab order
- **WHEN** tabs are restored on app launch
- **THEN** the tab order SHALL match the order at last close

#### Scenario: Restore cursor and scroll position
- **WHEN** tabs are restored on app launch
- **THEN** each tab's cursor position SHALL be restored
- **AND** each tab's scroll position SHALL be restored

#### Scenario: Restore dirty state for unsaved files
- **WHEN** tabs are restored on app launch
- **AND** a tab had unsaved changes at last close
- **THEN** that tab SHALL be restored with its unsaved content
- **AND** the dirty indicator SHALL be visible

### Requirement: Persistence saves tab metadata
The system SHALL persist essential metadata for each open tab.

#### Scenario: Save file path
- **WHEN** tab state is persisted
- **THEN** the file path SHALL be saved for each tab (if it exists)

#### Scenario: Save cursor position
- **WHEN** tab state is persisted
- **THEN** the cursor position (line and column) SHALL be saved for each tab

#### Scenario: Save scroll position
- **WHEN** tab state is persisted
- **THEN** the scroll position (line number) SHALL be saved for each tab

#### Scenario: Save dirty state
- **WHEN** tab state is persisted
- **THEN** the dirty flag SHALL be saved for each tab

#### Scenario: Save unsaved content for dirty tabs
- **WHEN** tab state is persisted
- **AND** a tab has unsaved changes
- **THEN** the unsaved content SHALL be saved
- **AND** clean tabs SHALL NOT save their content (will reload from disk)

### Requirement: Persistence handles missing files gracefully
The system SHALL handle cases where previously open files no longer exist.

#### Scenario: File deleted since last session
- **WHEN** tabs are being restored
- **AND** a file no longer exists on disk
- **THEN** the system SHALL display a warning: "File [name] no longer exists"
- **AND** the tab SHALL still be restored with its saved content
- **AND** the tab SHALL be marked as dirty (unsaved)

#### Scenario: File moved since last session
- **WHEN** tabs are being restored
- **AND** a file has been moved to a different location
- **THEN** the system SHALL behave the same as if the file was deleted
- **AND** display the same warning

#### Scenario: Handle corrupted persistence data
- **WHEN** tab state is being loaded
- **AND** the persisted data is corrupted or invalid
- **THEN** the system SHALL gracefully handle the error
- **AND** start with no tabs open (or a single untitled tab)
- **AND** log the error for debugging

### Requirement: Persistence uses efficient storage
The system SHALL store tab state efficiently to avoid excessive disk usage.

#### Scenario: Only dirty tabs save full content
- **WHEN** tab state is persisted
- **THEN** only tabs with unsaved changes SHALL have their content saved
- **AND** clean tabs SHALL only save metadata (path, cursor, scroll)
- **AND** clean tab content SHALL be reloaded from disk on restore

#### Scenario: Storage size is reasonable
- **WHEN** 50 tabs are persisted (including 10 with unsaved changes)
- **THEN** the total storage size SHALL be less than 5MB
- **AND** loading time SHALL be less than 500ms

### Requirement: Persistence integrates with app close
The system SHALL automatically save tab state when the app closes.

#### Scenario: Save on app quit
- **WHEN** user quits the application
- **THEN** tab state SHALL be saved before the app closes
- **AND** the save operation SHALL complete before the app exits

#### Scenario: Save on window close
- **WHEN** user closes the main window
- **THEN** tab state SHALL be saved before the window closes

#### Scenario: Handle dirty tabs on quit
- **WHEN** user quits the application with dirty tabs open
- **THEN** tab state SHALL be saved including unsaved content
- **AND** the user SHALL NOT lose unsaved work
- **AND** unsaved work SHALL be restored on next launch

### Requirement: Persistence supports manual clear
The system SHALL allow users to clear persisted tab state.

#### Scenario: Clear tab history from settings
- **WHEN** user chooses to clear tab history in settings
- **THEN** all persisted tab state SHALL be deleted
- **AND** the next app launch SHALL start with no tabs (or a single untitled tab)

### Requirement: Persistence preserves tab order
The system SHALL maintain the exact tab order across sessions.

#### Scenario: Restore exact tab order
- **WHEN** tabs are restored on app launch
- **THEN** the tabs SHALL appear in the same left-to-right order as at last close

#### Scenario: Preserve reorder changes
- **WHEN** user reorders tabs and then closes the app
- **THEN** the new order SHALL be saved
- **AND** restored on next launch

### Requirement: Persistence handles multiple app instances
The system SHALL handle multiple app instances gracefully.

#### Scenario: Multiple instances warning
- **WHEN** a second instance of the app is launched
- **THEN** the system SHALL display a warning about multiple instances
- **AND** each instance SHALL maintain its own tab state separately

#### Scenario: Tab state isolated per instance
- **WHEN** multiple instances are running
- **THEN** tab state SHALL be isolated per instance
- **AND** closing one instance SHALL NOT affect tab state of other instances

### Requirement: Persistence performance is optimized
The system SHALL ensure persistence operations do not impact app performance.

#### Scenario: Autosave tab state periodically
- **WHEN** the app is running
- **THEN** tab state SHALL be autosaved every 5 minutes
- **AND** the autosave operation SHALL complete in less than 100ms

#### Scenario: Save does not block UI
- **WHEN** tab state is being saved
- **THEN** the UI SHALL remain responsive
- **AND** editing operations SHALL NOT be blocked

#### Scenario: Restore is fast
- **WHEN** tabs are being restored on app launch
- **THEN** restoration SHALL complete in less than 500ms for 50 tabs
- **AND** the app UI SHALL appear within 1 second of launch
