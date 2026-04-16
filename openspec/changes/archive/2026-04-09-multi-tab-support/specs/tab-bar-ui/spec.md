## ADDED Requirements

### Requirement: Tab bar displays all open tabs
The system SHALL display a tab bar above the editor showing all open tabs.

#### Scenario: Tab bar is visible with multiple tabs
- **WHEN** two or more tabs are open
- **THEN** the tab bar SHALL be visible above the editor
- **AND** each tab SHALL be displayed as a button in the tab bar

#### Scenario: Tab bar hides with single tab
- **WHEN** only one tab is open
- **THEN** the tab bar MAY be hidden to reduce clutter
- **AND** the single tab's content SHALL be displayed in the editor

#### Scenario: Tab bar scrolls horizontally with many tabs
- **WHEN** the number of tabs exceeds the visible width
- **THEN** the tab bar SHALL enable horizontal scrolling
- **OR** display scroll buttons (< >) to navigate tabs

### Requirement: Each tab displays file information
The system SHALL show relevant file information in each tab.

#### Scenario: Tab shows file name
- **WHEN** a tab is displayed
- **THEN** it SHALL show the file name (without path) as the tab title
- **AND** the file name SHALL be truncated with ellipsis (...) if too long

#### Scenario: Tab shows file icon
- **WHEN** a tab is displayed
- **THEN** it SHALL show a file type icon on the left side of the tab title
- **AND** the icon SHALL correspond to the file extension (e.g., .md icon for Markdown files)

#### Scenario: Tab shows dirty indicator
- **WHEN** a tab has unsaved changes
- **THEN** the tab SHALL display a visual indicator (e.g., a dot or modified icon)
- **AND** the indicator SHALL be removed when the file is saved

#### Scenario: Untitled tab shows generic name
- **WHEN** a tab has no file path (untitled)
- **THEN** the tab title SHALL be "Untitled-N" where N is a sequential number

### Requirement: Tab bar provides close buttons
The system SHALL allow closing tabs directly from the tab bar.

#### Scenario: Tab shows close button on hover
- **WHEN** user hovers over a tab
- **THEN** a close button (X) SHALL appear on the right side of the tab
- **AND** the close button SHALL be hidden when not hovering

#### Scenario: Click close button to close tab
- **WHEN** user clicks the close button on a tab
- **THEN** the tab SHALL close (with dirty warning if needed)
- **AND** the tab bar SHALL update to remove the closed tab

#### Scenario: Active tab always shows close button
- **WHEN** a tab is active
- **THEN** the close button SHALL always be visible (not just on hover)

### Requirement: Tab bar supports context menu
The system SHALL provide a context menu when right-clicking a tab.

#### Scenario: Right-click opens context menu
- **WHEN** user right-clicks on a tab
- **THEN** a context menu SHALL appear with tab-related actions

#### Scenario: Context menu contains close actions
- **WHEN** the tab context menu is open
- **THEN** it SHALL include the following options:
  - Close
  - Close Others
  - Close to Right
  - Close All

#### Scenario: Close action closes clicked tab
- **WHEN** user clicks "Close" in the context menu
- **THEN** only the right-clicked tab SHALL close

#### Scenario: Close Others action
- **WHEN** user clicks "Close Others" in the context menu
- **THEN** all tabs except the right-clicked tab SHALL close
- **AND** dirty tabs SHALL trigger warnings before closing

#### Scenario: Close to Right action
- **WHEN** user clicks "Close to Right" in the context menu
- **THEN** all tabs to the right of the right-clicked tab SHALL close
- **AND** tabs to the left SHALL remain open

#### Scenario: Close All action
- **WHEN** user clicks "Close All" in the context menu
- **THEN** all tabs SHALL close
- **AND** dirty tabs SHALL trigger warnings before closing

#### Scenario: Context menu includes copy path action
- **WHEN** the tab context menu is open for a saved file
- **THEN** it SHALL include "Copy Path" option
- **AND** clicking it SHALL copy the file path to the clipboard

#### Scenario: Context menu includes reveal in file tree
- **WHEN** the tab context menu is open for a file in an open folder
- **THEN** it SHALL include "Reveal in File Tree" option
- **AND** clicking it SHALL highlight and scroll to the file in the file tree

### Requirement: Tab bar supports drag-and-drop
The system SHALL allow users to reorder tabs by dragging.

#### Scenario: Drag initiates reordering
- **WHEN** user starts dragging a tab
- **THEN** the tab SHALL become semi-transparent and follow the cursor
- **AND** other tabs SHALL shift to show potential drop positions

#### Scenario: Drop completes reordering
- **WHEN** user drops a tab at a new position
- **THEN** the tab SHALL snap into the new position
- **AND** all tabs SHALL be displayed in the new order

#### Scenario: Drag preview shows tab content
- **WHEN** user drags a tab
- **THEN** a visual preview of the tab SHALL follow the cursor
- **AND** the preview SHALL show the tab's file name

#### Scenario: Drop indicator shows position
- **WHEN** user drags a tab over other tabs
- **THEN** a visual indicator (e.g., a line) SHALL show where the tab will be dropped

### Requirement: Tab bar is keyboard accessible
The system SHALL ensure the tab bar is fully accessible via keyboard.

#### Scenario: Tab key navigates between tabs
- **WHEN** user presses Tab key while the tab bar has focus
- **THEN** focus SHALL move between tabs

#### Scenario: Enter activates focused tab
- **WHEN** a tab has focus and user presses Enter
- **THEN** that tab SHALL become active
- **AND** the editor SHALL display its content

#### Scenario: Context menu opens with keyboard
- **WHEN** a tab has focus and user presses the context menu key (or Shift+F10)
- **THEN** the tab context menu SHALL open

### Requirement: Tab bar adapts to theme
The system SHALL ensure the tab bar styling matches the application theme.

#### Scenario: Tab bar uses light theme styling
- **WHEN** the application is in light mode
- **THEN** the tab bar SHALL use light colors and appropriate contrast

#### Scenario: Tab bar uses dark theme styling
- **WHEN** the application is in dark mode
- **THEN** the tab bar SHALL use dark colors and appropriate contrast

#### Scenario: Active tab has distinct style
- **WHEN** a tab is active
- **THEN** it SHALL have a distinct background color or border
- **AND** the style SHALL be visible in both light and dark themes

### Requirement: Tab bar provides visual feedback
The system SHALL provide visual feedback for user interactions.

#### Scenario: Hover highlights tab
- **WHEN** user hovers over a tab
- **THEN** the tab SHALL have a highlighted background or border

#### Scenario: Active tab has persistent highlight
- **WHEN** a tab is active
- **THEN** it SHALL have a persistent highlight that remains even when not hovering

#### Scenario: Clicking tab shows press feedback
- **WHEN** user clicks a tab
- **THEN** the tab SHALL show a pressed state briefly (e.g., darker background)
