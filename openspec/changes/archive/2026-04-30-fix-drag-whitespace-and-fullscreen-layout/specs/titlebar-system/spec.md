## ADDED Requirements

### Requirement: TitleBar is rendered as the sole window drag region
The system SHALL render the TitleBar component as the only `data-tauri-drag-region` element, positioned above the Toolbar.

#### Scenario: TitleBar is rendered in the main layout
- **WHEN** the application launches
- **THEN** the TitleBar component SHALL be rendered at the top of the main layout
- **AND** it SHALL be positioned above the Toolbar
- **AND** it SHALL have the `data-tauri-drag-region` attribute
- **AND** dragging the TitleBar area SHALL move the application window

#### Scenario: TitleBar is hidden in fullscreen mode
- **WHEN** the application window enters fullscreen mode
- **THEN** the TitleBar SHALL be hidden (height: 0, overflow: hidden)
- **AND** no white area SHALL appear at the top of the screen
- **AND** the Toolbar SHALL expand to fill the space previously occupied by the TitleBar

#### Scenario: TitleBar is visible in normal (non-fullscreen) mode
- **WHEN** the application window exits fullscreen mode
- **THEN** the TitleBar SHALL be visible again with its normal height (38px)
- **AND** the layout SHALL restore to its normal state without visual artifacts
