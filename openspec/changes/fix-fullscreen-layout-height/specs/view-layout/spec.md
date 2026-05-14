## ADDED Requirements

### Requirement: Root layout container fills the entire window in all modes
The system SHALL ensure the root layout container always fills the entire window height, including in fullscreen mode, normal mode, and during fullscreen transitions.

#### Scenario: Root container uses dynamic viewport height
- **WHEN** the application renders its root layout container
- **THEN** the container height SHALL use `100dvh` (dynamic viewport height) instead of `100vh`
- **AND** a fallback of `100vh` SHALL be provided for environments that do not support `dvh`
- **AND** the container SHALL completely fill the window without any blank areas at the top or bottom

#### Scenario: Layout fills entire screen in fullscreen mode
- **WHEN** the user enters fullscreen mode (via menu, keyboard shortcut, or maximize button)
- **THEN** the root layout container SHALL expand to fill the entire screen
- **AND** all child elements (Toolbar, Main Area, StatusBar) SHALL collectively occupy the full height
- **AND** no blank or dark areas SHALL appear at the bottom of the screen

#### Scenario: Layout correctly adjusts when exiting fullscreen
- **WHEN** the user exits fullscreen mode
- **THEN** the root layout container SHALL resize to match the normal window dimensions
- **AND** the transition SHALL be seamless without layout flicker or blank areas

### Requirement: Fullscreen state is tracked in the global UI store
The system SHALL maintain the current fullscreen state in the global UI store so any component can react to fullscreen changes.

#### Scenario: Fullscreen state is updated on window resize
- **WHEN** the Tauri window emits a `tauri://resize` event
- **THEN** the system SHALL query `getCurrentWindow().isFullscreen()` (with a short delay to account for animation)
- **AND** SHALL update `isFullscreen` in `useUIStore`
- **AND** the update SHALL be reflected in all components that subscribe to `isFullscreen`

#### Scenario: Fullscreen state is initialized on startup
- **WHEN** the application starts or is hot-reloaded
- **THEN** the system SHALL immediately query `getCurrentWindow().isFullscreen()`
- **AND** SHALL set the initial `isFullscreen` value in the UI store
