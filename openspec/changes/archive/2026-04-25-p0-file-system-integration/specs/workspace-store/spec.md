## ADDED Requirements

### Requirement: System provides workspace state management via Zustand Store
The system SHALL provide a `useWorkspaceStore` Zustand store that manages workspace folder state, directory tree data, and file system operations.

#### Scenario: Store initializes with no workspace
- **WHEN** the application starts without a previously opened folder
- **THEN** `folderPath` SHALL be `null`
- **AND** `folderTree` SHALL be `null`
- **AND** `isLoading` SHALL be `false`

#### Scenario: openFolder triggers folder dialog and loads directory
- **WHEN** `openFolder()` action is called
- **THEN** the system SHALL invoke the Tauri `open_folder` command to show a folder picker dialog
- **AND** if the user selects a folder, `folderPath` SHALL be set to the selected path
- **AND** `readDirectory` SHALL be called to load the root-level contents
- **AND** `startFsWatch` SHALL be called to begin file system monitoring

#### Scenario: openFolder handles user cancellation
- **WHEN** `openFolder()` is called and the user cancels the dialog
- **THEN** `folderPath` SHALL remain unchanged
- **AND** no directory loading or file watching SHALL be initiated

#### Scenario: closeFolder clears workspace state
- **WHEN** `closeFolder()` action is called
- **THEN** `folderPath` SHALL be set to `null`
- **AND** `folderTree` SHALL be set to `null`
- **AND** `expandedDirs` SHALL be cleared
- **AND** `stopFsWatch` SHALL be called to stop file monitoring

#### Scenario: loadDirectory populates directory contents with lazy loading
- **WHEN** `loadDirectory(path)` is called
- **THEN** the system SHALL invoke Tauri `read_directory` command with the given path
- **AND** the returned `FileTreeNode[]` SHALL be stored in the directory cache
- **AND** directories in the result SHALL have `isLoaded: false` until explicitly expanded

#### Scenario: toggleDirectory expands or collapses a directory
- **WHEN** `toggleDirectory(path)` is called for a collapsed directory
- **THEN** the directory SHALL be added to `expandedDirs`
- **AND** if the directory is not yet loaded (`isLoaded: false`), `loadDirectory` SHALL be triggered
- **WHEN** `toggleDirectory(path)` is called for an expanded directory
- **THEN** the directory SHALL be removed from `expandedDirs`

#### Scenario: refreshTree reloads all expanded directories
- **WHEN** `refreshTree()` action is called
- **THEN** the system SHALL re-invoke `readDirectory` for the root folder and all currently expanded directories
- **AND** the directory tree SHALL be updated with fresh data

### Requirement: System provides workspace file CRUD operations
The store SHALL expose file system mutation actions that delegate to Tauri commands.

#### Scenario: createFile creates a new file in the workspace
- **WHEN** `createFile(parentDir, fileName)` is called
- **THEN** the system SHALL invoke Tauri `create_file` command with `parentDir/fileName`
- **AND** the parent directory SHALL be refreshed to show the new file
- **AND** the new file SHALL be automatically opened in a tab

#### Scenario: createDirectory creates a new directory in the workspace
- **WHEN** `createDirectory(parentDir, dirName)` is called
- **THEN** the system SHALL invoke Tauri `create_directory` command with `parentDir/dirName`
- **AND** the parent directory SHALL be refreshed to show the new directory

### Requirement: System extends tauriCommands with missing IPC wrappers
The `tauriCommands.ts` file SHALL export wrapper functions for all file system Tauri commands.

#### Scenario: readDirectory wrapper is available
- **WHEN** `readDirectory(path)` is called
- **THEN** it SHALL invoke `invoke('read_directory', { path })` and return `FileTreeNode[]`

#### Scenario: openFolderDialog wrapper is available
- **WHEN** `openFolderDialog()` is called
- **THEN** it SHALL invoke `invoke('open_folder')` and return the selected folder path or `null`

#### Scenario: searchInFiles wrapper is available
- **WHEN** `searchInFiles(folderPath, query, searchType)` is called
- **THEN** it SHALL invoke `invoke('search_in_files', { folderPath, query, searchType })` and return `SearchResponse`
