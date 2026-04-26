## Requirements

### Requirement: ExplorerPanel displays real file system tree
The ExplorerPanel SHALL replace the hardcoded `null` workspace tree with data from `useWorkspaceStore`.

#### Scenario: No workspace open shows prompt
- **WHEN** no folder is open (`folderPath === null`)
- **THEN** the workspace section SHALL display a "点击打开文件夹加载工作区" prompt with a folder icon
- **AND** clicking the prompt area SHALL trigger `openFolder()`

#### Scenario: Workspace open shows directory tree
- **WHEN** a folder is open
- **THEN** the workspace section SHALL display a tree view of the folder contents
- **AND** directories SHALL show expand/collapse chevrons
- **AND** files SHALL show file type icons based on extension
- **AND** the workspace header SHALL show the folder name

#### Scenario: Expanding a directory loads its contents lazily
- **WHEN** a user clicks on a collapsed directory in the tree
- **THEN** the system SHALL call `toggleDirectory(path)` on the workspace store
- **AND** if the directory has not been loaded yet, a loading indicator SHALL be shown briefly
- **AND** the directory's children SHALL appear below it with proper indentation

#### Scenario: Clicking a file opens it in the editor
- **WHEN** a user clicks on a file in the workspace tree
- **THEN** if the file is already open in a tab, that tab SHALL be activated
- **AND** if the file is not open, the system SHALL read the file via `readFile` and open it in a new tab

#### Scenario: Active file is highlighted in the tree
- **WHEN** a file is the currently active tab
- **THEN** that file's row in the tree SHALL have the active highlight style (`var(--bg-active)`)

### Requirement: ExplorerPanel action buttons are functional
The workspace section header buttons SHALL perform real operations.

#### Scenario: New File button creates a file
- **WHEN** the user clicks the "新建文件" button in the workspace header
- **THEN** the system SHALL show an inline input field for the file name
- **AND** on Enter, the system SHALL call `createFile(folderPath, fileName)`
- **AND** the new file SHALL appear in the tree and be opened in a tab

#### Scenario: New Folder button creates a directory
- **WHEN** the user clicks the "新建文件夹" button in the workspace header
- **THEN** the system SHALL show an inline input field for the directory name
- **AND** on Enter, the system SHALL call `createDirectory(folderPath, dirName)`
- **AND** the new directory SHALL appear in the tree

#### Scenario: Refresh button refreshes the tree
- **WHEN** the user clicks the "刷新" button
- **THEN** the system SHALL call `refreshTree()` on the workspace store
- **AND** the tree SHALL be updated with the latest file system state

### Requirement: File system changes trigger automatic tree refresh
The ExplorerPanel SHALL react to file system change events.

#### Scenario: External file changes refresh the tree
- **WHEN** the file system watcher detects changes (via `fs-watch:changed` event)
- **THEN** the workspace store SHALL debounce-refresh all expanded directories (500ms debounce)
- **AND** the tree SHALL update without losing the user's expand/collapse state
