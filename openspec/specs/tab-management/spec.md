## MODIFIED Requirements

### Requirement: System manages multiple file tabs with state persistence
The system SHALL manage the lifecycle of open file tabs including creation, activation, closing, and state tracking. The system SHALL also support batch close operations.

#### Scenario: New file creates untitled tab
- **WHEN** user initiates "New File" (Ctrl+N or menu)
- **THEN** a new untitled tab SHALL be created with label "Untitled"
- **AND** the tab SHALL become the active tab
- **AND** the editor SHALL show an empty Markdown document
- **AND** the untitled tab SHALL be marked as dirty (modified) by default

#### Scenario: Opening existing file creates or activates tab
- **WHEN** user opens a file that is not already open
- **THEN** a new tab SHALL be created showing the file name (without extension path)
- **AND** the file content SHALL be loaded into the editor
- **AND** the preview SHALL render the file content
- **WHEN** user opens a file that IS already open in another tab
- **THEN** instead of creating a new tab, the existing tab SHALL be activated (brought to front)

#### Scenario: Opening file by absolute path
- **WHEN** `openFileByPath(absolutePath)` action is called
- **THEN** if a tab with the same path already exists, it SHALL be activated
- **AND** if no existing tab matches, the file SHALL be read from disk via `readFile`
- **AND** a new tab SHALL be created with the file content
- **AND** the new tab SHALL become the active tab
- **IF** the file read fails, the action SHALL return `null` without creating a tab

#### Scenario: Closing tab with unsaved changes prompts confirmation
- **WHEN** user attempts to close a tab that has unsaved modifications (blue dot visible)
- **THEN** a DirtyTabDialog confirmation modal SHALL appear
- **AND** options SHALL be: [不保存] [取消] [保存]
- **IF** user chooses Save → save first, then close tab
- **IF** user chooses Don't Save → close without saving
- **IF** user chooses Cancel → do nothing, keep tab open

#### Scenario: Closing last tab shows welcome/editor
- **WHEN** user closes the last remaining open tab
- **THEN** the editor area SHALL show either:
  - An empty "Welcome" / start page with quick actions
  - OR remain as empty editor ready for new file

#### Scenario: Tab order persists within session
- **WHEN** tabs are reordered via drag-and-drop
- **THEN** the new order SHALL be maintained during the current session
- **AND** if tab persistence is enabled, order SHALL survive window refresh

#### Scenario: Close others leaves only the target tab
- **WHEN** `closeOtherTabs(tabId)` is invoked
- **THEN** all tabs except the one with the given tabId SHALL be closed
- **AND** each tab with unsaved changes SHALL trigger the DirtyTabDialog before closing
- **AND** the target tab SHALL become the active tab

#### Scenario: Close all removes every tab
- **WHEN** `closeAllTabs()` is invoked
- **THEN** all open tabs SHALL be closed
- **AND** each tab with unsaved changes SHALL trigger the DirtyTabDialog before closing

#### Scenario: Close tabs to the left removes tabs before target
- **WHEN** `closeTabsToLeft(tabId)` is invoked
- **THEN** all tabs positioned before the target tab in the tab order SHALL be closed
- **AND** each tab with unsaved changes SHALL trigger the DirtyTabDialog before closing
- **AND** the target tab SHALL remain open

#### Scenario: Close tabs to the right removes tabs after target
- **WHEN** `closeTabsToRight(tabId)` is invoked
- **THEN** all tabs positioned after the target tab in the tab order SHALL be closed
- **AND** each tab with unsaved changes SHALL trigger the DirtyTabDialog before closing
- **AND** the target tab SHALL remain open
