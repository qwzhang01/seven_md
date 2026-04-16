## ADDED Requirements

### Requirement: Title bar displays application branding
The system SHALL display a custom title bar with the application logo and name.

#### Scenario: Application displays custom title bar
- **WHEN** the application window is opened
- **THEN** a custom title bar SHALL be displayed instead of the system default title bar
- **AND** the title bar SHALL contain the application logo on the left side
- **AND** the title bar SHALL display "Seven MD" as the application name
- **AND** the title bar height SHALL be 32 pixels

### Requirement: Title bar shows current file name
The system SHALL display the current file name in the title bar.

#### Scenario: No file opened
- **WHEN** no file is currently opened
- **THEN** the title bar SHALL display "Seven MD" without a file name

#### Scenario: File opened
- **WHEN** a file is opened
- **THEN** the title bar SHALL display the file name after the application name
- **AND** the format SHALL be "Seven MD - [filename]"

#### Scenario: File path is long
- **WHEN** the file name and path exceed the available space
- **THEN** the file name SHALL be truncated with ellipsis (...) in the middle

### Requirement: Title bar indicates unsaved changes
The system SHALL display an unsaved indicator when the file has unsaved changes.

#### Scenario: File has unsaved changes
- **WHEN** the user has modified the file but not saved
- **THEN** a bullet character (•) SHALL be displayed before the file name
- **AND** the format SHALL be "Seven MD - • [filename]"

#### Scenario: File is saved
- **WHEN** the file has no unsaved changes
- **THEN** no bullet character SHALL be displayed
- **AND** the format SHALL be "Seven MD - [filename]"

### Requirement: Title bar is draggable
The system SHALL allow the window to be moved by dragging the title bar.

#### Scenario: User drags title bar
- **WHEN** the user clicks and drags the title bar area (excluding buttons)
- **THEN** the window SHALL move accordingly
- **AND** the window position SHALL update in real-time

### Requirement: Window control buttons are available
The system SHALL provide window control buttons (minimize, maximize, close) in the title bar.

#### Scenario: Minimize button clicked
- **WHEN** the user clicks the minimize button
- **THEN** the window SHALL be minimized to the dock/taskbar

#### Scenario: Maximize button clicked on normal window
- **WHEN** the user clicks the maximize button on a normal-sized window
- **THEN** the window SHALL be maximized to fill the screen

#### Scenario: Maximize button clicked on maximized window
- **WHEN** the user clicks the maximize button on a maximized window
- **THEN** the window SHALL be restored to its previous size and position

#### Scenario: Close button clicked
- **WHEN** the user clicks the close button
- **THEN** the application SHALL initiate the close sequence
- **AND** if there are unsaved changes, a save prompt SHALL be shown

### Requirement: Title bar respects dark mode
The system SHALL display the title bar with appropriate colors for the current theme.

#### Scenario: Light mode enabled
- **WHEN** the application is in light mode
- **THEN** the title bar background SHALL be light gray (#F3F4F6)
- **AND** the text SHALL be dark (#1F2937)

#### Scenario: Dark mode enabled
- **WHEN** the application is in dark mode
- **THEN** the title bar background SHALL be dark gray (#1F2937)
- **AND** the text SHALL be light (#F3F4F6)
