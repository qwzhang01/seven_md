## ADDED Requirements

### Requirement: View menu includes AI panel toggle
The system SHALL provide a menu item to toggle the AI assistant panel visibility.

#### Scenario: AI Panel toggle in View menu
- **WHEN** user clicks the View menu
- **THEN** a "Toggle AI Panel" menu item SHALL appear
- **AND** the menu item SHALL be positioned below "Toggle Outline"
- **AND** the shortcut SHALL be displayed as "Cmd+Shift+A"

#### Scenario: Toggle AI Panel shortcut
- **WHEN** user presses Cmd+Shift+A
- **THEN** the AI assistant panel SHALL be toggled
- **AND** if visible, it SHALL be hidden
- **AND** if hidden, it SHALL be shown

#### Scenario: AI Panel toggle via menu
- **WHEN** user selects "Toggle AI Panel" from the View menu
- **THEN** the AI assistant panel SHALL be toggled
- **AND** the panel state SHALL match the toggle action

### Requirement: AI Panel toggle state reflects current visibility
The system SHALL update the AI Panel menu item state based on the current visibility.

#### Scenario: Menu item checkmark reflects state
- **WHEN** the AI assistant panel is visible
- **AND** the View menu is opened
- **THEN** "Toggle AI Panel" SHALL show a checkmark
- **WHEN** the AI assistant panel is hidden
- **AND** the View menu is opened
- **THEN** "Toggle AI Panel" SHALL NOT show a checkmark
