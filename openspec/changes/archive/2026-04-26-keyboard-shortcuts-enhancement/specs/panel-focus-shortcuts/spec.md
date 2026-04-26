## ADDED Requirements

### Requirement: System provides panel focus shortcuts for sidebars
The system SHALL provide keyboard shortcuts to focus and switch between sidebar panels including explorer, search, and outline views.

#### Scenario: Ctrl+Shift+E focuses explorer panel
- **WHEN** user presses Ctrl+Shift+E (or ⌘+Shift+E on macOS)
- **THEN** the explorer panel SHALL become visible if hidden
- **AND** focus SHALL move to the explorer panel's file tree

#### Scenario: Ctrl+Shift+F focuses search panel
- **WHEN** user presses Ctrl+Shift+F (or ⌘+Shift+F on macOS)
- **THEN** the search panel SHALL become visible if hidden
- **AND** focus SHALL move to the search input field

#### Scenario: Ctrl+Shift+O focuses outline panel
- **WHEN** user presses Ctrl+Shift+O (or ⌘+Shift+O on macOS)
- **THEN** the outline panel SHALL become visible if hidden
- **AND** focus SHALL move to the outline tree view

#### Scenario: Panel focus shortcuts are blocked when modal is open
- **WHEN** a modal dialog (such as AboutDialog) is open
- **AND** any panel focus shortcut is pressed
- **THEN** the shortcut SHALL NOT trigger panel focus
- **AND** the action SHALL be ignored or handled by the modal
