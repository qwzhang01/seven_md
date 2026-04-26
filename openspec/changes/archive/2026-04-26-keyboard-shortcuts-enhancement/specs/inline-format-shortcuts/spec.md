## ADDED Requirements

### Requirement: System provides window and tab management shortcuts
The system SHALL provide keyboard shortcuts for closing windows and tabs to improve workflow efficiency.

#### Scenario: Ctrl+W closes current tab
- **WHEN** user presses Ctrl+W (or ⌘+W on macOS)
- **AND** there is an active tab open
- **THEN** the current tab SHALL be closed
- **AND** if there are other tabs remaining, focus SHALL move to the next tab

#### Scenario: Ctrl+W does nothing when no tabs are open
- **WHEN** user presses Ctrl+W
- **AND** no tabs are open
- **THEN** no action SHALL occur
- **AND** no error SHALL be thrown

#### Scenario: Ctrl+W prompts to save unsaved changes
- **WHEN** user presses Ctrl+W on a tab with unsaved changes
- **THEN** the system SHALL prompt the user to save changes
- **AND** the tab SHALL only close after the user confirms or the file is saved

### Requirement: System provides inline text formatting shortcuts
The system SHALL provide keyboard shortcuts for common text formatting operations when the editor is focused.

#### Scenario: Ctrl+B toggles bold formatting
- **WHEN** user presses Ctrl+B (or ⌘+B on macOS)
- **AND** the editor has focus
- **THEN** the selected text SHALL be wrapped with bold markers (`**`)
- **OR** if no text is selected, bold mode SHALL be toggled for subsequent input

#### Scenario: Ctrl+I toggles italic formatting
- **WHEN** user presses Ctrl+I (or ⌘+I on macOS)
- **AND** the editor has focus
- **THEN** the selected text SHALL be wrapped with italic markers (`*`)
- **OR** if no text is selected, italic mode SHALL be toggled for subsequent input

#### Scenario: Ctrl+K inserts link
- **WHEN** user presses Ctrl+K (or ⌘+K on macOS)
- **AND** the editor has focus
- **THEN** the system SHALL insert a link template `[text](url)`
- **AND** cursor SHALL be positioned at the URL placeholder

#### Scenario: Format shortcuts are ignored when editor does not have focus
- **WHEN** user presses Ctrl+B, Ctrl+I, or Ctrl+K
- **AND** the editor does not have focus
- **THEN** no formatting action SHALL occur
- **AND** the event SHALL propagate normally
