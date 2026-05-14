## ADDED Requirements

### Requirement: Workspace store provides openFolderByPath action
The `useWorkspaceStore` SHALL expose an `openFolderByPath(path: string)` action that opens a folder directly without showing the system folder-picker dialog.

#### Scenario: openFolderByPath loads directory and starts watching
- **WHEN** `openFolderByPath("/path/to/project")` is called with a valid directory path
- **THEN** `folderPath` SHALL be set to `"/path/to/project"`
- **AND** `readDirectory` SHALL be called to load the root-level contents into `folderTree`
- **AND** `startFsWatch` SHALL be called to begin file system monitoring for the path
- **AND** the operation SHALL behave identically to `openFolder` after a user selects a folder

#### Scenario: openFolderByPath handles non-existent path
- **WHEN** `openFolderByPath("/nonexistent/path")` is called
- **AND** the Tauri `read_directory` command returns an error
- **THEN** `folderPath` SHALL remain `null`
- **AND** `folderTree` SHALL remain `null`
- **AND** a notification SHALL be shown indicating the folder could not be opened

#### Scenario: openFolderByPath replaces existing open folder
- **WHEN** `openFolderByPath("/new/project")` is called while another folder is already open
- **THEN** `stopFsWatch` SHALL be called for the current folder
- **AND** the existing folder state SHALL be cleared
- **AND** the new folder SHALL be opened following the standard openFolder flow
