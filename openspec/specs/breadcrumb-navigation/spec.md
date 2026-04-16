## ADDED Requirements

### Requirement: Breadcrumb displays current file path
The system SHALL display the full path of the current file as a breadcrumb trail.

#### Scenario: File is opened
- **WHEN** a file is opened
- **THEN** the breadcrumb SHALL display the full path to the file
- **AND** each path segment SHALL be separated by a chevron icon (>)
- **AND** the format SHALL be "folder > subfolder > filename.md"

#### Scenario: File is in root folder
- **WHEN** a file is opened in the root of the opened folder
- **THEN** the breadcrumb SHALL display only the file name

#### Scenario: No file is opened
- **WHEN** no file is opened
- **THEN** no breadcrumb SHALL be displayed

### Requirement: Breadcrumb supports navigation
The system SHALL allow users to navigate by clicking on breadcrumb segments.

#### Scenario: Click on folder segment
- **WHEN** the user clicks on a folder segment in the breadcrumb
- **THEN** the file tree SHALL scroll to and highlight that folder
- **AND** the folder SHALL be expanded if it was collapsed

#### Scenario: Click on current file segment
- **WHEN** the user clicks on the current file segment
- **THEN** no action SHALL be taken (current file is already open)

#### Scenario: Hover on clickable segment
- **WHEN** the user hovers over a folder segment
- **THEN** the segment SHALL show a hover effect
- **AND** the cursor SHALL change to a pointer

### Requirement: Breadcrumb handles long paths
The system SHALL handle long file paths gracefully in the breadcrumb display.

#### Scenario: Path is too long for available space
- **WHEN** the breadcrumb path exceeds the available width
- **THEN** the middle segments SHALL be collapsed
- **AND** an ellipsis (...) SHALL be shown in place of collapsed segments
- **AND** the first folder and current file SHALL always be visible

#### Scenario: Hover over ellipsis
- **WHEN** the user hovers over the ellipsis
- **THEN** a tooltip SHALL display the full path

### Requirement: Breadcrumb integrates with title bar
The system SHALL display the breadcrumb in the title bar area.

#### Scenario: Breadcrumb placement
- **WHEN** the title bar is displayed
- **THEN** the breadcrumb SHALL appear in the center of the title bar
- **AND** the breadcrumb SHALL be vertically centered
- **AND** the breadcrumb SHALL not overlap with the window control buttons

#### Scenario: Breadcrumb visibility
- **WHEN** a file is opened
- **THEN** the breadcrumb SHALL be visible
- **WHEN** no file is opened
- **THEN** the breadcrumb area SHALL be empty or hidden

### Requirement: Breadcrumb respects theme
The system SHALL display the breadcrumb with appropriate colors for the current theme.

#### Scenario: Light mode breadcrumb
- **WHEN** the application is in light mode
- **THEN** breadcrumb text SHALL be dark gray
- **AND** chevron icons SHALL be medium gray
- **AND** hover effects SHALL use a light background

#### Scenario: Dark mode breadcrumb
- **WHEN** the application is in dark mode
- **THEN** breadcrumb text SHALL be light gray
- **AND** chevron icons SHALL be medium gray
- **AND** hover effects SHALL use a dark background

### Requirement: Breadcrumb is accessible
The system SHALL ensure the breadcrumb is accessible to all users.

#### Scenario: Keyboard navigation
- **WHEN** the user navigates using Tab key
- **THEN** each breadcrumb segment SHALL be focusable
- **AND** Enter key SHALL activate the focused segment

#### Scenario: Screen reader compatibility
- **WHEN** a screen reader is active
- **THEN** the breadcrumb SHALL be announced as navigation
- **AND** each segment SHALL be clearly identified
