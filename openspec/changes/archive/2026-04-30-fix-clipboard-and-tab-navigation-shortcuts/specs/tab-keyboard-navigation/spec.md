## ADDED Requirements

### Requirement: Editor supports keyboard-driven tab switching
The system SHALL allow users to switch between open tabs using keyboard shortcuts without requiring mouse interaction.

#### Scenario: Ctrl+Tab switches to next tab
- **WHEN** the user presses `Ctrl+Tab` (macOS: `Ctrl+Tab`)
- **AND** there are two or more open tabs
- **THEN** the system SHALL activate the tab immediately to the right of the current active tab
- **AND** if the current tab is the last tab, the system SHALL wrap around and activate the first tab

#### Scenario: Ctrl+Shift+Tab switches to previous tab
- **WHEN** the user presses `Ctrl+Shift+Tab` (macOS: `Ctrl+Shift+Tab`)
- **AND** there are two or more open tabs
- **THEN** the system SHALL activate the tab immediately to the left of the current active tab
- **AND** if the current tab is the first tab, the system SHALL wrap around and activate the last tab

#### Scenario: Tab switching is a no-op with only one tab
- **WHEN** the user presses `Ctrl+Tab` or `Ctrl+Shift+Tab`
- **AND** there is only one open tab
- **THEN** the system SHALL remain on the current tab without any visible change

#### Scenario: Tab switching is a no-op with no tabs
- **WHEN** the user presses `Ctrl+Tab` or `Ctrl+Shift+Tab`
- **AND** there are no open tabs
- **THEN** the system SHALL silently ignore the shortcut without throwing an error

### Requirement: Editor supports Alt+Left/Right tab navigation when editor is not focused
The system SHALL allow users to navigate to the previous/next tab using `Alt+Left` / `Alt+Right` when the editor does not have focus.

#### Scenario: Alt+Left navigates to previous tab when editor is not focused
- **WHEN** the user presses `Alt+Left`
- **AND** the editor does NOT have focus
- **AND** there are two or more open tabs
- **THEN** the system SHALL activate the tab immediately to the left of the current active tab (with wrap-around)

#### Scenario: Alt+Right navigates to next tab when editor is not focused
- **WHEN** the user presses `Alt+Right`
- **AND** the editor does NOT have focus
- **AND** there are two or more open tabs
- **THEN** the system SHALL activate the tab immediately to the right of the current active tab (with wrap-around)

#### Scenario: Alt+Left/Right does not interfere with CodeMirror word navigation
- **WHEN** the user presses `Alt+Left` or `Alt+Right`
- **AND** the editor HAS focus
- **THEN** the system SHALL NOT trigger tab switching
- **AND** CodeMirror's built-in word-level cursor movement SHALL execute normally
