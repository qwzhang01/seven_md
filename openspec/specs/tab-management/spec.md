## ADDED Requirements

### Requirement: Users can open multiple files in tabs
The system SHALL allow users to open multiple files simultaneously, each in its own tab.

#### Scenario: Open file creates new tab
- **WHEN** user opens a file from the file tree or file dialog
- **THEN** the system SHALL create a new tab with that file's content
- **AND** the new tab SHALL become the active tab

#### Scenario: Clicking already-open file switches to its tab
- **WHEN** user clicks a file in the file tree that is already open in a tab
- **THEN** the system SHALL switch to that existing tab
- **AND** no new tab SHALL be created

#### Scenario: Opening file preserves existing tabs
- **WHEN** user opens a new file while other files are already open
- **THEN** existing tabs SHALL remain open
- **AND** their states (content, cursor, scroll) SHALL be preserved

### Requirement: Users can switch between open tabs
The system SHALL allow users to switch between open tabs while preserving each tab's editing state.

#### Scenario: Click tab to switch
- **WHEN** user clicks on a tab in the tab bar
- **THEN** the system SHALL activate that tab
- **AND** the editor SHALL display that tab's content
- **AND** the cursor position and scroll position SHALL be restored

#### Scenario: Switch preserves dirty state
- **WHEN** user switches away from a tab with unsaved changes
- **THEN** the dirty indicator SHALL remain visible
- **AND** the unsaved content SHALL be preserved

#### Scenario: Switch preserves cursor and scroll
- **WHEN** user switches between tabs
- **THEN** each tab's cursor position SHALL be preserved
- **AND** each tab's scroll position SHALL be preserved
- **AND** switching back to a tab SHALL restore its exact previous state

### Requirement: Users can close tabs
The system SHALL allow users to close individual tabs with appropriate warnings for unsaved changes.

#### Scenario: Close clean tab without warning
- **WHEN** user closes a tab that has no unsaved changes
- **THEN** the tab SHALL close immediately
- **AND** no warning SHALL be displayed

#### Scenario: Close dirty tab shows warning
- **WHEN** user attempts to close a tab with unsaved changes
- **THEN** the system SHALL display a warning dialog with options:
  - Save and Close
  - Discard Changes and Close
  - Cancel

#### Scenario: Save and close dirty tab
- **WHEN** user chooses "Save and Close" from the warning dialog
- **THEN** the system SHALL save the file
- **AND** the tab SHALL close
- **AND** no unsaved content SHALL be lost

#### Scenario: Discard changes and close tab
- **WHEN** user chooses "Discard Changes and Close" from the warning dialog
- **THEN** the tab SHALL close
- **AND** unsaved changes SHALL be lost
- **AND** the original file on disk SHALL remain unchanged

#### Scenario: Cancel close operation
- **WHEN** user chooses "Cancel" from the warning dialog
- **THEN** the tab SHALL remain open
- **AND** the unsaved content SHALL be preserved

#### Scenario: Close tab switches to adjacent tab
- **WHEN** user closes the active tab
- **THEN** the system SHALL activate the tab immediately to the left
- **OR** if no tab exists to the left, the tab to the right
- **OR** if no other tabs exist, no tab shall be active

### Requirement: Users can reorder tabs by dragging
The system SHALL allow users to reorder tabs using drag-and-drop.

#### Scenario: Drag tab to reorder
- **WHEN** user drags a tab and drops it at a new position
- **THEN** the tab SHALL move to the new position
- **AND** the tab order SHALL be updated in the state

#### Scenario: Drag shows visual feedback
- **WHEN** user drags a tab
- **THEN** a visual indicator SHALL show where the tab will be dropped
- **AND** other tabs SHALL shift to make room for the dragged tab

#### Scenario: Drop completes reordering
- **WHEN** user drops a dragged tab
- **THEN** the tab SHALL snap into its new position
- **AND** the tab bar SHALL display tabs in the new order

### Requirement: Each tab maintains independent state
The system SHALL maintain separate editing state for each open tab.

#### Scenario: Tabs have independent content
- **WHEN** multiple tabs are open
- **THEN** each tab SHALL have its own content buffer
- **AND** editing in one tab SHALL NOT affect content in other tabs

#### Scenario: Tabs have independent cursor position
- **WHEN** user switches between tabs
- **THEN** each tab SHALL remember its cursor position
- **AND** switching to a tab SHALL restore its cursor position

#### Scenario: Tabs have independent scroll position
- **WHEN** user scrolls in a tab and then switches to another tab
- **THEN** the scroll position SHALL be preserved for the first tab
- **AND** switching back SHALL restore the scroll position

#### Scenario: Tabs have independent dirty state
- **WHEN** user makes changes in one tab
- **THEN** only that tab SHALL be marked as dirty
- **AND** other tabs' dirty states SHALL NOT be affected

### Requirement: System limits number of open tabs
The system SHALL enforce a reasonable limit on the number of open tabs to maintain performance.

#### Scenario: Soft limit warning
- **WHEN** user opens the 40th tab
- **THEN** the system SHALL display a notification: "You have many tabs open. Consider closing unused ones."

#### Scenario: Hard limit enforcement
- **WHEN** user attempts to open a tab beyond the 50-tab limit
- **THEN** the system SHALL NOT open the new tab
- **AND** the system SHALL display an error: "Maximum tab limit (50) reached. Please close some tabs."

#### Scenario: LRU eviction for clean tabs
- **WHEN** the number of open tabs exceeds 40
- **THEN** the system MAY evict the least recently used clean (not dirty) tabs
- **AND** dirty tabs SHALL NEVER be evicted automatically
- **AND** the user SHALL be notified of any evicted tabs

### Requirement: Tabs can be identified uniquely
The system SHALL assign a unique identifier to each tab.

#### Scenario: Each tab has unique ID
- **WHEN** a new tab is created
- **THEN** the system SHALL assign a unique UUID to that tab
- **AND** this ID SHALL remain constant for the lifetime of the tab

#### Scenario: Multiple tabs for same file
- **WHEN** user opens the same file multiple times
- **THEN** each instance SHALL have a unique tab ID
- **AND** each tab SHALL maintain independent state

### Requirement: Active tab is clearly indicated
The system SHALL visually indicate which tab is currently active.

#### Scenario: Active tab has visual indicator
- **WHEN** a tab is active
- **THEN** it SHALL have a distinct visual style (e.g., different background color, border)
- **AND** non-active tabs SHALL have a muted appearance

#### Scenario: Switching tabs updates indicator
- **WHEN** user switches to a different tab
- **THEN** the active indicator SHALL move to the newly active tab
- **AND** the previously active tab SHALL lose the indicator

### Requirement: Tabs support unsaved files
The system SHALL allow creating tabs for unsaved (Untitled) files.

#### Scenario: Create new untitled tab
- **WHEN** user creates a new file (Cmd/Ctrl+N)
- **THEN** a new tab SHALL be created with no file path
- **AND** the tab title SHALL be "Untitled-N" where N is a sequential number

#### Scenario: Save untitled tab
- **WHEN** user saves an untitled tab
- **THEN** the system SHALL prompt for a file path
- **AND** after saving, the tab SHALL be associated with the chosen file path
- **AND** the tab title SHALL update to the file name
