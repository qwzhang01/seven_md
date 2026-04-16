## MODIFIED Requirements

### Requirement: File operation shortcuts work globally
The system SHALL provide keyboard shortcuts for file operations that work regardless of focus.

#### Scenario: Cmd/Ctrl+O opens file
- **WHEN** user presses Cmd+O (macOS) or Ctrl+O (Windows/Linux)
- **THEN** the system SHALL display the Open File dialog
- **AND** the opened file SHALL be added as a new tab in the tab bar

#### Scenario: Cmd/Ctrl+Shift+O opens folder
- **WHEN** user presses Cmd+Shift+O (macOS) or Ctrl+Shift+O (Windows/Linux)
- **THEN** the system SHALL display the Open Folder dialog

#### Scenario: Cmd/Ctrl+S saves file
- **WHEN** user presses Cmd+S (macOS) or Ctrl+S (Windows/Linux)
- **AND** a tab is currently active
- **THEN** the system SHALL save the current tab's content to its file
- **AND** the tab's dirty indicator SHALL be removed

#### Scenario: Cmd/Ctrl+N creates new file
- **WHEN** user presses Cmd+N (macOS) or Ctrl+N (Windows/Linux)
- **THEN** the system SHALL create a new untitled tab
- **AND** the new tab SHALL become active

#### Scenario: Cmd/Ctrl+Shift+S saves as
- **WHEN** user presses Cmd+Shift+S (macOS) or Ctrl+Shift+S (Windows/Linux)
- **AND** a tab is currently active
- **THEN** the system SHALL display the Save As dialog
- **AND** save the current tab's content to the chosen file path

## ADDED Requirements

### Requirement: Tab navigation shortcuts work globally
The system SHALL provide keyboard shortcuts for navigating between tabs.

#### Scenario: Cmd/Ctrl+Tab switches to next tab
- **WHEN** user presses Cmd+Tab (macOS) or Ctrl+Tab (Windows/Linux)
- **THEN** the system SHALL activate the next tab to the right
- **OR** if the active tab is the rightmost tab, activate the leftmost tab

#### Scenario: Cmd/Ctrl+Shift+Tab switches to previous tab
- **WHEN** user presses Cmd+Shift+Tab (macOS) or Ctrl+Shift+Tab (Windows/Linux)
- **THEN** the system SHALL activate the previous tab to the left
- **OR** if the active tab is the leftmost tab, activate the rightmost tab

#### Scenario: Cmd/Ctrl+W closes current tab
- **WHEN** user presses Cmd+W (macOS) or Ctrl+W (Windows/Linux)
- **AND** a tab is currently active
- **THEN** the system SHALL close the active tab
- **AND** show dirty warning if the tab has unsaved changes

#### Scenario: Cmd/Ctrl+Shift+W closes all tabs
- **WHEN** user presses Cmd+Shift+W (macOS) or Ctrl+Shift+W (Windows/Linux)
- **THEN** the system SHALL close all tabs
- **AND** show dirty warnings for tabs with unsaved changes

#### Scenario: Cmd/Ctrl+Shift+T reopens last closed tab
- **WHEN** user presses Cmd+Shift+T (macOS) or Ctrl+Shift+T (Windows/Linux)
- **THEN** the system SHALL reopen the most recently closed tab
- **AND** restore its content and state
- **AND** if the file still exists, reload content from disk

#### Scenario: Cmd/Ctrl+1 through 9 switches to specific tab
- **WHEN** user presses Cmd+1 (macOS) or Ctrl+1 (Windows/Linux)
- **THEN** the system SHALL activate the first tab
- **WHEN** user presses Cmd+2 through Cmd+9 (or Ctrl+2 through Ctrl+9)
- **THEN** the system SHALL activate the corresponding tab (2nd through 9th)
- **WHEN** user presses Cmd+9 (or Ctrl+9)
- **THEN** the system SHALL activate the last tab (even if there are more than 9 tabs)

### Requirement: Tab shortcuts are discoverable
The system SHALL make tab-related keyboard shortcuts visible in the UI.

#### Scenario: File menu shows close tab shortcut
- **WHEN** the File menu is open
- **THEN** the "Close Tab" item SHALL show the Cmd/Ctrl+W shortcut

#### Scenario: View menu shows tab navigation shortcuts
- **WHEN** the View menu is open
- **THEN** it SHALL include a "Switch to Next Tab" item with Cmd/Ctrl+Tab shortcut
- **AND** include a "Switch to Previous Tab" item with Cmd/Ctrl+Shift+Tab shortcut

#### Scenario: Keyboard shortcuts help includes tab shortcuts
- **WHEN** user opens the keyboard shortcuts help
- **THEN** all tab-related shortcuts SHALL be listed in a "Tab Management" section
