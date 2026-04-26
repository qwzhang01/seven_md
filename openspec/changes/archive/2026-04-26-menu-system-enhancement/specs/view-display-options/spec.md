## ADDED Requirements

### Requirement: View menu includes display options submenu
The system SHALL provide a Display Options submenu in the View menu for toggling editor display settings.

#### Scenario: Display Options submenu items
- **WHEN** user clicks the View menu
- **THEN** a "Display Options" submenu SHALL appear
- **AND** the following checkable items SHALL be available:
  - Show Line Numbers (显示行号)
  - Show Minimap (显示迷你地图)
  - Word Wrap (自动换行)

#### Scenario: Show Line Numbers toggle
- **WHEN** user selects "Show Line Numbers"
- **AND** line numbers are currently hidden
- **THEN** line numbers SHALL be displayed in the editor gutter
- **WHEN** line numbers are currently shown
- **AND** user selects "Show Line Numbers"
- **THEN** line numbers SHALL be hidden

#### Scenario: Show Minimap toggle
- **WHEN** user selects "Show Minimap"
- **AND** minimap is currently hidden
- **THEN** the minimap SHALL be displayed on the right side of the editor
- **WHEN** minimap is currently shown
- **AND** user selects "Show Minimap"
- **THEN** the minimap SHALL be hidden

#### Scenario: Word Wrap toggle
- **WHEN** user selects "Word Wrap"
- **AND** word wrap is currently disabled
- **THEN** long lines SHALL wrap to fit the editor width
- **WHEN** word wrap is currently enabled
- **AND** user selects "Word Wrap"
- **THEN** long lines SHALL display with horizontal scrollbar

### Requirement: Display options persist across sessions
The system SHALL store display option preferences in persistent storage.

#### Scenario: Display options restored on restart
- **WHEN** the application is restarted
- **THEN** the previously saved display options SHALL be restored
- **AND** the editor SHALL display according to saved preferences

#### Scenario: Display options checkmark reflects state
- **WHEN** a display option is enabled
- **AND** the View menu is opened
- **THEN** the corresponding menu item SHALL show a checkmark
- **WHEN** a display option is disabled
- **AND** the View menu is opened
- **THEN** the corresponding menu item SHALL NOT show a checkmark
