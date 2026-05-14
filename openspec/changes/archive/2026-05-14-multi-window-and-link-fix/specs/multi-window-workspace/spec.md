## ADDED Requirements

### Requirement: Window creation supports initial folder parameter
The `create_new_window` Tauri command SHALL accept an optional `initial_folder` parameter specifying the folder path the new window should open.

#### Scenario: Create window with folder path
- **WHEN** `create_new_window` is invoked with `initial_folder = "/path/to/project"`
- **THEN** a new Tauri window SHALL be created
- **AND** the window URL SHALL include a query parameter `?folder=/path/to/project` (URL-encoded)
- **AND** the window SHALL have a unique label in the format `window-{timestamp_ms}`

#### Scenario: Create window without folder path
- **WHEN** `create_new_window` is invoked without `initial_folder` (or with `None`)
- **THEN** a new Tauri window SHALL be created with no query parameter
- **AND** the window SHALL display the default empty workspace state

### Requirement: Frontend reads window context on initialization
The application SHALL read the URL query parameters on startup to determine if a folder should be automatically opened.

#### Scenario: Window opens with folder parameter
- **WHEN** the React application initializes and `window.location.search` contains `folder=/path/to/project`
- **THEN** the application SHALL automatically call `openFolderByPath("/path/to/project")` on the workspace store
- **AND** the file explorer panel SHALL display the directory tree of the specified folder
- **AND** no folder-picker dialog SHALL be shown

#### Scenario: Window opens without folder parameter
- **WHEN** the React application initializes and `window.location.search` does not contain a `folder` parameter
- **THEN** the application SHALL start with an empty workspace (existing behavior)
- **AND** the user SHALL be able to manually open a folder

### Requirement: Workspace store supports direct path opening
The `useWorkspaceStore` SHALL provide an `openFolderByPath(path: string)` action that opens a folder without showing the system dialog.

#### Scenario: Open folder by path succeeds
- **WHEN** `openFolderByPath("/path/to/project")` is called with a valid directory path
- **THEN** `folderPath` SHALL be set to the provided path
- **AND** `readDirectory` SHALL be called to load the root-level contents
- **AND** `startFsWatch` SHALL be called to begin file system monitoring
- **AND** the window title SHALL include the folder name

#### Scenario: Open folder by path fails for invalid path
- **WHEN** `openFolderByPath("/nonexistent/path")` is called with a path that does not exist
- **THEN** `folderPath` SHALL remain `null`
- **AND** a notification SHALL be shown indicating the folder could not be found

### Requirement: Each window maintains independent workspace state
Each Tauri window SHALL have its own isolated workspace state including folder path, directory tree, file tabs, and editor content.

#### Scenario: Two windows with different folders
- **WHEN** window A opens folder `/project-a` and window B opens folder `/project-b`
- **THEN** window A's file explorer SHALL show only `/project-a` contents
- **AND** window B's file explorer SHALL show only `/project-b` contents
- **AND** editing a file in window A SHALL NOT affect window B's editor state

#### Scenario: Closing folder in one window does not affect others
- **WHEN** window A has folder `/project-a` open and window B has folder `/project-b` open
- **AND** user closes the folder in window A
- **THEN** window A SHALL show an empty workspace
- **AND** window B SHALL continue showing `/project-b` contents unchanged

### Requirement: Menu new window action opens folder picker for new window
The "新建窗口" menu action SHALL create a new window and optionally prompt for a folder.

#### Scenario: New window via menu
- **WHEN** user activates "新建窗口" (Ctrl/Cmd+Shift+N)
- **THEN** a new empty window SHALL be created
- **AND** the new window SHALL start with an empty workspace
- **AND** the user SHALL be able to open a folder in the new window independently

### Requirement: Open folder in new window action
The application SHALL provide a way to open a specific folder in a new window from the existing window.

#### Scenario: Open folder in new window from context
- **WHEN** user triggers "在新窗口中打开文件夹" action (e.g., from menu or command palette)
- **THEN** a system folder-picker dialog SHALL appear
- **AND** if the user selects a folder, a new window SHALL be created with that folder auto-opened
- **AND** the current window SHALL remain unchanged
