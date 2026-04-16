## ADDED Requirements

### Requirement: File system watcher starts when a folder is opened
The system SHALL start watching the open folder for changes as soon as a folder is set as the active workspace.

#### Scenario: Watcher starts on folder open
- **WHEN** the user opens a folder (via "Open Folder" or from persisted state on app launch)
- **THEN** the Rust backend starts a recursive file system watcher on that folder path

#### Scenario: Watcher restarts when folder changes
- **WHEN** the user opens a different folder while one is already open
- **THEN** the previous watcher is stopped and a new watcher is started on the new folder path

#### Scenario: Watcher stops when folder is closed
- **WHEN** the user closes the current folder
- **THEN** the file system watcher is stopped

### Requirement: External file system changes trigger automatic tree refresh
The system SHALL automatically refresh the sidebar file tree when files or folders are created, renamed, moved, or deleted outside the app.

#### Scenario: New file created externally
- **WHEN** a new `.md` file is created in the open folder by an external tool (e.g., terminal, Finder)
- **THEN** the sidebar tree refreshes within 500 ms and the new file appears

#### Scenario: File deleted externally
- **WHEN** a file is deleted from the open folder by an external tool
- **THEN** the sidebar tree refreshes and the file no longer appears

#### Scenario: Folder created externally
- **WHEN** a new folder is created in the open folder by an external tool
- **THEN** the sidebar tree refreshes and the new folder appears

#### Scenario: File renamed externally
- **WHEN** a file is renamed in the open folder by an external tool
- **THEN** the sidebar tree refreshes showing the new name

### Requirement: Watcher events are debounced to prevent redundant refreshes
The system SHALL debounce file system watch events so that a burst of changes (e.g., from a git operation) triggers at most one tree refresh.

#### Scenario: Burst of events triggers single refresh
- **WHEN** multiple file system events arrive within 200 ms of each other
- **THEN** the sidebar tree is refreshed exactly once after the burst settles

### Requirement: Manual refresh button is available as fallback
The system SHALL provide a manual refresh button in the sidebar header that reloads the file tree on demand.

#### Scenario: User clicks refresh button
- **WHEN** the user clicks the refresh button in the sidebar header
- **THEN** the sidebar tree is reloaded from disk immediately
