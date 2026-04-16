## ADDED Requirements

### Requirement: File tree displays file type icons
The system SHALL display different icons for different file types in the file tree.

#### Scenario: Markdown file icon
- **WHEN** a Markdown file is displayed in the file tree
- **THEN** a document/text icon SHALL be shown
- **AND** the icon SHALL visually indicate it's a Markdown file

#### Scenario: Folder icons
- **WHEN** a folder is displayed in the file tree
- **THEN** a folder icon SHALL be shown
- **WHEN** a folder is expanded
- **THEN** an open folder icon SHALL be shown
- **WHEN** a folder is collapsed
- **THEN** a closed folder icon SHALL be shown

#### Scenario: Unknown file type icon
- **WHEN** a file with an unknown extension is displayed
- **THEN** a generic file icon SHALL be shown

#### Scenario: Icon size and alignment
- **WHEN** icons are displayed in the file tree
- **THEN** icons SHALL be 16x16 pixels in size
- **AND** icons SHALL be vertically centered with the text
- **AND** icons SHALL have appropriate spacing from the text (4px)

### Requirement: File icons respect theme
The system SHALL display icons with appropriate colors for the current theme.

#### Scenario: Light mode icons
- **WHEN** the application is in light mode
- **THEN** file icons SHALL use darker colors for visibility
- **AND** folder icons SHALL use a standard yellow/orange color

#### Scenario: Dark mode icons
- **WHEN** the application is in dark mode
- **THEN** file icons SHALL use lighter colors for visibility
- **AND** folder icons SHALL maintain visibility on dark background

### Requirement: File icons are accessible
The system SHALL ensure file icons are accessible to all users.

#### Scenario: High contrast mode
- **WHEN** the system is in high contrast mode
- **THEN** file icons SHALL maintain sufficient contrast
- **AND** icons SHALL remain distinguishable from each other

#### Scenario: Icon tooltips
- **WHEN** the user hovers over a file icon
- **THEN** a tooltip SHALL display the file type if needed

### Requirement: File tree item styling includes icons
The system SHALL integrate icons seamlessly into the file tree item styling.

#### Scenario: File tree item layout
- **WHEN** a file tree item is displayed
- **THEN** the icon SHALL appear before the file name
- **AND** the icon and text SHALL be horizontally aligned
- **AND** the item SHALL have appropriate padding (8px horizontal)

#### Scenario: Selected file styling
- **WHEN** a file is selected
- **THEN** the entire item (including icon) SHALL have a selection highlight
- **AND** the icon SHALL remain visible with appropriate contrast
