## ADDED Requirements

### Requirement: Bottom tab bar displays open file tabs
The system SHALL display tabs for all currently opened files at the bottom of the editor area, providing clear visual separation from the title bar and toolbar above.

#### Scenario: Tab bar is visible at bottom of window
- **WHEN** the application window is displayed
- **THEN** a tab bar SHALL be visible at the bottom of the window
- **AND** the tab bar SHALL span the full width of the editor area
- **AND** the tab bar SHALL be positioned below the editor/preview content

#### Scenario: Single tab displayed
- **WHEN** one file is opened in the editor
- **THEN** a single tab SHALL be displayed showing the file name
- **AND** the tab SHALL be active (highlighted)

#### Scenario: Multiple tabs displayed
- **WHEN** multiple files are opened
- **THEN** each file SHALL have its own tab in the tab bar
- **AND** tabs SHALL be arranged horizontally from left to right
- **AND** the active tab SHALL be visually distinguished

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

#### Scenario: Clicking tab switches active file
- **WHEN** user clicks on a non-active tab
- **THEN** that tab SHALL become active
- **AND** the editor content SHALL switch to show the selected file

### Requirement: Bottom tab bar has appropriate height and spacing
The system SHALL ensure the bottom tab bar has consistent styling that matches the overall application design.

#### Scenario: Tab bar height is consistent
- **WHEN** the tab bar is rendered
- **THEN** it SHALL have a fixed height of approximately 40px
- **AND** individual tabs SHALL be appropriately sized for comfortable interaction

#### Scenario: Tab bar scrolls horizontally when tabs overflow
- **WHEN** there are more tabs than can fit in the visible area
- **THEN** the tab bar SHALL support horizontal scrolling
- **AND** users SHALL be able to scroll to see hidden tabs
