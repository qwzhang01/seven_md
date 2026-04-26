## MODIFIED Requirements

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

### Requirement: Mobile editor and preview stacked vertically
The system SHALL stack the editor and preview panes vertically on mobile devices, each occupying approximately 50% of the viewport height.

#### Scenario: Editor and preview vertical stacking on mobile
- **WHEN** the viewport width is less than 768px
- **THEN** the editor pane SHALL be positioned above the preview pane
- **AND** the editor pane SHALL occupy approximately 50% of the viewport height
- **AND** the preview pane SHALL occupy approximately 50% of the viewport height
- **AND** a draggable horizontal separator SHALL replace the vertical gutter divider

#### Scenario: Horizontal divider replacement
- **WHEN** the viewport width is less than 768px
- **THEN** the vertical gutter/divider between editor and preview SHALL be hidden
- **AND** a horizontal draggable separator SHALL be rendered between the editor and preview panes
- **AND** the horizontal separator SHALL allow resizing the split ratio by dragging

### Requirement: Mobile sidebar overlay behavior
The system SHALL show the sidebar as an overlay panel when clicking activity bar icons on mobile devices.

#### Scenario: Activity bar icon tap shows overlay sidebar
- **WHEN** the viewport width is less than 768px
- **AND** the user taps an activity bar icon
- **THEN** the corresponding sidebar panel SHALL be shown as an absolute positioned overlay
- **AND** the overlay SHALL cover the main content area (not push content)
- **AND** the overlay SHALL be dismissible by tapping outside or selecting an item

#### Scenario: Sidebar overlay dismissible
- **WHEN** a sidebar overlay is visible on mobile
- **AND** the user taps outside the overlay panel
- **THEN** the overlay SHALL be dismissed
- **AND** the main content area SHALL become fully visible again

#### Scenario: Multiple sidebar panels on mobile
- **WHEN** the viewport width is less than 768px
- **AND** a sidebar panel is already visible (overlay mode)
- **AND** the user taps a different activity bar icon
- **THEN** the current overlay SHALL be replaced with the newly selected panel
- **AND** the transition SHALL be immediate (no animation needed for panel switch)
