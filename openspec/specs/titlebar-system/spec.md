## ADDED Requirements

### Requirement: Title bar displays macOS traffic light buttons
The system SHALL display standard macOS window control buttons (close, minimize, maximize) in the title bar area.

#### Scenario: Traffic lights are visible on launch
- **WHEN** the application window is opened on macOS
- **THEN** three circular buttons SHALL be displayed in the top-left corner of the title bar
- **AND** the close button SHALL be red (#FF5F57)
- **AND** the minimize button SHALL be yellow (#FEBC2E)
- **AND** the maximize/zoom button SHALL be green (#28C840)
- **AND** each button SHALL be 12px in diameter with 8px spacing between them

#### Scenario: Close button behavior
- **WHEN** user clicks the close (red) button
- **THEN** the system SHALL initiate window close sequence
- **AND** if there are unsaved changes, a confirmation dialog SHALL be displayed
- **OR** if no unsaved changes, the window SHALL close immediately
- **AND** keyboard shortcut Cmd+W SHALL trigger the same action

#### Scenario: Minimize button behavior
- **WHEN** user clicks the minimize (yellow) button
- **THEN** the window SHALL be minimized to the Dock
- **AND** keyboard shortcut Cmd+M SHALL trigger the same action

#### Scenario: Maximize button behavior
- **WHEN** user clicks the maximize/zoom (green) button
- **THEN** the window SHALL toggle between normal and fullscreen mode
- **AND** keyboard shortcut Ctrl+Cmd+F SHALL trigger the same action

### Requirement: Tab bar displays open file tabs
The system SHALL display a tab bar in the title bar area showing all currently open files.

#### Scenario: Single tab displayed
- **WHEN** one file is opened in the editor
- **THEN** a single tab SHALL be displayed showing the file name
- **AND** the tab SHALL be active (highlighted)

#### Scenario: Multiple tabs displayed
- **WHEN** multiple files are opened
- **THEN** each file SHALL have its own tab in the tab bar
- **AND** tabs SHALL be arranged horizontally from left to right
- **AND** the active tab SHALL be visually distinguished

#### Scenario: Tab shows unsaved indicator
- **WHEN** an open file has unsaved modifications
- **THEN** a blue dot (●) SHALL be displayed next to the file name in the tab
- **AND** after saving the file, the blue dot SHALL disappear

#### Scenario: Clicking tab switches active file
- **WHEN** user clicks on a non-active tab
- **THEN** that tab SHALL become active
- **AND** the editor content SHALL switch to show the selected file
- **AND** the preview SHALL update to render the selected file's content

#### Scenario: Tab close button appears on hover
- **WHEN** user hovers mouse over a tab
- **THEN** a close button (×) SHALL appear on the right side of the tab
- **AND** clicking the close button SHALL close that tab
- **AND** if the file has unsaved changes, a save prompt SHALL appear before closing

#### Scenario: Tabs support drag reordering
- **WHEN** user clicks and drags a tab
- **THEN** the tab SHALL move to follow the cursor position
- **AND** other tabs SHALL shift to make room
- **AND** on drop, the tab order SHALL be updated accordingly

### Requirement: Title bar contains action buttons
The system SHALL display action buttons in the title bar for quick access to common features.

#### Scenario: Command palette button
- **WHEN** the command palette button is visible in the title bar
- **AND** user clicks it or presses Ctrl+Shift+P
- **THEN** the command palette panel SHALL open

#### Scenario: Toggle sidebar button
- **WHEN** the sidebar toggle button is visible in the title bar
- **AND** user clicks it or presses Ctrl+B
- **THEN** the sidebar SHALL toggle between shown and hidden states
