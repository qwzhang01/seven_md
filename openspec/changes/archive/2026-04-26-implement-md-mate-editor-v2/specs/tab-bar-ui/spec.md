## MODIFIED Requirements

### Requirement: Tab bar displays open file tabs
The system SHALL display tabs for all currently opened files in the title bar area, with enhanced interaction features.

#### Scenario: Tab shows unsaved indicator with blue dot
- **WHEN** an open file has unsaved modifications
- **THEN** a blue dot (●) SHALL be displayed immediately after the file name in the tab
- **AND** the blue dot SHALL use the accent color (--accent-color)
- **AND** upon saving, the dot SHALL disappear

#### Scenario: Tab close button appears on hover only
- **WHEN** user's mouse hovers over a tab
- **THEN** a close button (×) SHALL appear on the right side of that tab
- **AND** the close button SHALL NOT be visible when the mouse is not hovering

#### Scenario: Tabs support drag-and-drop reordering
- **WHEN** user clicks and holds on a tab, then drags it horizontally
- **THEN** the tab SHALL detach and follow the cursor
- **AND** other tabs SHALL shift to make room (showing drop position indicator)
- **AND** on release/drop, tabs SHALL reorder to reflect the new position
- **AND** the reordering SHALL be animated (~150ms transition)

#### Scenario: Active tab is visually distinguished
- **WHEN** a tab represents the currently active file
- **THEN** the tab SHALL have:
  - A brighter/more opaque background (--bg-active)
  - A subtle top border in accent color (2px)
  - Text in primary color (--text-primary) rather than secondary

#### Scenario: Inactive tabs use muted styling
- **WHEN** a tab represents an open but inactive file
- **THEN** the tab SHALL have:
  - Background using --bg-secondary
  - No accent border
  - Text in secondary color (--text-secondary)
