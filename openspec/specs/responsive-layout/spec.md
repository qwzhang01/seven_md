## ADDED Requirements

### Requirement: Application adapts layout for different screen sizes
The system SHALL provide responsive layout adaptation for desktop (≥769px) and mobile (<768px) screen widths.

#### Scenario: Desktop layout (≥769px)
- **WHEN** the viewport width is 769px or greater
- **THEN** the application SHALL use the full desktop layout:
  - Complete activity bar (48px wide) + resizable sidebar (180-500px)
  - Editor and preview side-by-side in split view
  - All panels (search, outline, snippets) rendered inline in sidebar
  - Full toolbar with all groups visible
  - Full menu bar with all menus accessible

#### Scenario: Mobile/tablet layout (<768px)
- **WHEN** the viewport width is less than 768px
- **THEN** the application SHALL adapt to a compact layout:
  - Activity bar collapsed; only icons visible (48px strip)
  - Sidebar hidden by default; clicking activity icon shows overlay panel (absolute positioned, covers content)
  - Editor and preview stacked vertically (each ~50% height)
  - Gutter/divider hidden; replaced by a draggable horizontal separator
  - Toolbar may scroll horizontally if overflow
  - Menu bar accessible via hamburger menu (future) or remains visible

#### Scenario: Responsive breakpoint behavior
- **WHEN** the viewport crosses the 768px breakpoint
- **THEN** the layout SHALL smoothly transition (not instant snap)
- **AND** no content loss SHALL occur during transition
- **AND** the transition duration SHALL be ~250ms

### Requirement: Layout adapts seamlessly during fullscreen transitions
The system SHALL ensure the layout adapts correctly during fullscreen entry and exit transitions without producing blank areas or visual artifacts.

#### Scenario: No blank area during fullscreen entry
- **WHEN** the user enters fullscreen mode
- **THEN** the layout SHALL expand smoothly to fill the entire screen
- **AND** no dark/blank area SHALL appear at the bottom of the screen during or after the transition
- **AND** the StatusBar SHALL remain anchored to the very bottom of the screen

#### Scenario: No blank area during fullscreen exit
- **WHEN** the user exits fullscreen mode
- **THEN** the layout SHALL shrink smoothly to match the normal window size
- **AND** no visual artifacts or blank areas SHALL appear during the transition

#### Scenario: TitleBar height transition on fullscreen change
- **WHEN** the fullscreen state changes
- **THEN** the TitleBar height SHALL transition between 0px (fullscreen) and 38px (normal)
- **AND** the remaining layout elements SHALL redistribute the reclaimed/given height without layout shift
