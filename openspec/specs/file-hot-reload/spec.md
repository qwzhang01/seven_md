### Requirement: Auto-reload unmodified tabs on external file change
The system SHALL automatically reload the content of open tabs whose underlying file has been externally modified, provided the tab has no unsaved local changes.

#### Scenario: Unmodified tab reloads on external change
- **WHEN** the file system watcher detects a change (`fs-watch:changed` event)
- **AND** an open tab references a file path that has been modified externally
- **AND** the tab's `isDirty` flag is `false`
- **THEN** the system SHALL re-read the file content via `readFile(path)`
- **AND** if the new content differs from the tab's current content, the tab's content SHALL be updated
- **AND** the editor SHALL reflect the new content without losing cursor position (if possible)
- **AND** the tab's `isDirty` flag SHALL remain `false`

#### Scenario: Multiple tabs reload concurrently with throttling
- **WHEN** the file system watcher detects a change
- **AND** multiple open tabs reference modified files
- **THEN** the system SHALL reload at most 5 files in parallel
- **AND** all eligible tabs SHALL be updated within one reload cycle

#### Scenario: File content unchanged after re-read
- **WHEN** the system re-reads a file triggered by `fs-watch:changed`
- **AND** the file content is identical to the tab's current content
- **THEN** no state update SHALL be performed
- **AND** no re-render SHALL be triggered

### Requirement: Conflict notification for dirty tabs on external change
The system SHALL notify the user when a file with unsaved local changes has been externally modified, and allow them to choose how to resolve the conflict.

#### Scenario: Dirty tab detects external modification
- **WHEN** the file system watcher detects a change
- **AND** an open tab references the modified file
- **AND** the tab's `isDirty` flag is `true`
- **THEN** the system SHALL display a visual indicator on the tab (e.g., a warning icon or badge)
- **AND** the system SHALL NOT overwrite the tab's content automatically

#### Scenario: User chooses to reload external version
- **WHEN** the user clicks the conflict indicator on a dirty tab
- **THEN** a dialog or action menu SHALL appear with options: "重新加载文件" and "保留本地修改"
- **WHEN** the user selects "重新加载文件"
- **THEN** the tab content SHALL be replaced with the latest file content from disk
- **AND** the tab's `isDirty` flag SHALL be set to `false`
- **AND** the conflict indicator SHALL be removed

#### Scenario: User chooses to keep local version
- **WHEN** the user selects "保留本地修改" from the conflict resolution options
- **THEN** the tab content SHALL remain unchanged
- **AND** the conflict indicator SHALL be removed
- **AND** the tab SHALL remain in `isDirty` state

### Requirement: File store exposes reload action
The `useFileStore` SHALL expose a `reloadTabContent` action for updating tab content from external sources.

#### Scenario: reloadTabContent updates tab without marking dirty
- **WHEN** `reloadTabContent(tabId, newContent)` is called
- **THEN** the tab's `content` field SHALL be updated to `newContent`
- **AND** the tab's `isDirty` flag SHALL be set to `false`
- **AND** no other tabs SHALL be affected

### Requirement: File store exposes external conflict state
The `useFileStore` SHALL track which tabs have external conflicts.

#### Scenario: markTabExternalConflict sets conflict flag
- **WHEN** `markTabExternalConflict(tabId, true)` is called
- **THEN** the tab SHALL be marked as having an external conflict
- **AND** UI components SHALL be able to query this state to display indicators

#### Scenario: clearTabExternalConflict removes conflict flag
- **WHEN** `markTabExternalConflict(tabId, false)` is called
- **THEN** the tab's external conflict flag SHALL be cleared
