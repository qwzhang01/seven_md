## MODIFIED Requirements

### Requirement: TitleBar is rendered as the sole window drag region
The system SHALL render the TitleBar component as the only `data-tauri-drag-region` element, positioned above the Toolbar. The fullscreen state SHALL be detected from the global UI store and used to control TitleBar visibility.

#### Scenario: TitleBar is rendered in the main layout
- **WHEN** the application launches
- **THEN** the TitleBar component SHALL be rendered at the top of the main layout
- **AND** it SHALL be positioned above the Toolbar
- **AND** it SHALL have the `data-tauri-drag-region` attribute
- **AND** dragging the TitleBar area SHALL move the application window

#### Scenario: TitleBar is hidden in fullscreen mode
- **WHEN** the application window enters fullscreen mode
- **THEN** the TitleBar SHALL be hidden (height: 0, overflow: hidden)
- **AND** no blank area SHALL appear at the top or bottom of the screen
- **AND** the Toolbar SHALL be the topmost visible element in the layout
- **AND** the TitleBar component SHALL read `isFullscreen` from `useUIStore` (not from props)

#### Scenario: TitleBar is visible in normal (non-fullscreen) mode
- **WHEN** the application window exits fullscreen mode
- **THEN** the TitleBar SHALL be visible again with its normal height (38px)
- **AND** the layout SHALL restore to its normal state without visual artifacts

#### Scenario: Fullscreen state is detected on application init
- **WHEN** the application is loaded or hot-reloaded while already in fullscreen
- **THEN** the TitleBar SHALL correctly detect the current fullscreen state
- **AND** SHALL be hidden if the window is currently fullscreen
