## ADDED Requirements

### Requirement: macOS Apple menu displays application info
The system SHALL display an Apple menu on macOS containing the application name and standard menu items.

#### Scenario: Apple menu on macOS
- **WHEN** the application runs on macOS
- **THEN** an Apple menu SHALL appear at the leftmost position of the menu bar
- **AND** the menu SHALL display "Seven Markdown" as the application name
- **AND** the following items SHALL be included:
  - About Seven Markdown
  - Separator
  - Preferences... (Cmd+,)
  - Separator
  - Services submenu
  - Separator
  - Hide Seven Markdown (Cmd+H)
  - Hide Others (Cmd+Option+H)
  - Show All
  - Separator
  - Quit Seven Markdown (Cmd+Q)

#### Scenario: About dialog triggered from Apple menu
- **WHEN** user selects "About Seven Markdown" from the Apple menu
- **THEN** the About dialog SHALL display
- **AND** the application name SHALL show "Seven Markdown"
- **AND** the version number SHALL be displayed

### Requirement: macOS Window menu provides window management
The system SHALL provide a Window menu on macOS for window management operations.

#### Scenario: Window menu items
- **WHEN** the application runs on macOS
- **THEN** a Window menu SHALL appear in the menu bar
- **AND** the following items SHALL be available:
  - Minimize (Cmd+M)
  - Zoom
  - Separator
  - Bring All to Front

#### Scenario: Window minimize behavior
- **WHEN** user selects "Minimize" or presses Cmd+M
- **THEN** the current window SHALL be minimized to the Dock
