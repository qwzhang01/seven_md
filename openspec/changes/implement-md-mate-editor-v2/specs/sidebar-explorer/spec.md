## ADDED Requirements

### Requirement: Explorer panel displays file tree
The system SHALL display a file tree in the explorer panel showing the folder structure of the opened workspace.

#### Scenario: Explorer panel structure
- **WHEN** the explorer panel is active (via activity bar)
- **THEN** the panel SHALL display:
  - A header with "资源管理器" title and action buttons
  - An "打开的文件" section listing currently open files
  - A "MD Mate 工作区" section showing the workspace file tree
- **AND** files SHALL be displayed with appropriate icons based on file type
- **AND** folders SHALL be displayed with folder icons and expand/collapse arrows

#### Scenario: File tree shows workspace contents
- **WHEN** a workspace folder is opened
- **THEN** the explorer SHALL display the complete folder hierarchy
- **AND** folders SHALL appear before files within each directory
- **AND** items SHALL be sorted alphabetically (folders first, then files)

### Requirement: Explorer supports folder expansion and collapse
The system SHALL allow users to expand and collapse folders in the file tree.

#### Scenario: Expand folder on click
- **WHEN** user clicks a folder item or its expand arrow
- **AND** the folder is collapsed
- **THEN** the folder SHALL expand to show its children
- **AND** the arrow SHALL rotate to point downward

#### Scenario: Collapse folder on click
- **WHEN** user clicks an expanded folder or its arrow
- **THEN** the folder SHALL collapse to hide its children
- **AND** the arrow SHALL rotate to point rightward

### Requirement: Opening files from explorer
The system SHALL allow users to open files by clicking them in the explorer.

#### Scenario: Click file to open
- **WHEN** user clicks a file in the explorer panel
- **THEN** the file SHALL open in a new tab in the editor area (if not already open)
- **OR** if already open, that tab SHALL become active
- **AND** the editor content SHALL show the file's Markdown content
- **AND** the preview area SHALL render the file's rendered output
- **AND** the file SHALL be highlighted as the active file in the explorer

#### Scenario: Modified files show indicator
- **WHEN** an opened file has unsaved changes
- **THEN** a blue dot (●) SHALL appear next to the file name in both:
  - The "打开的文件" section of the explorer
  - The tab bar tab for that file

### Requirement: Explorer shows action buttons on hover
The system SHALL display action buttons when hovering over section headers.

#### Scenario: Section header actions
- **WHEN** user hovers over a section header (e.g., "MD Mate 工作区")
- **THEN** action buttons SHALL appear:
  - 📄 New File button
  - 📁 New Folder button
  - 🔄 Refresh button
  - 📂 Collapse All button

#### Scenario: Create new file from explorer
- **WHEN** user clicks the "New File" button in the explorer header
- **THEN** a new untitled file SHALL be created in the current directory
- **AND** the file name SHALL become editable for renaming
- **AND** upon confirmation, the file SHALL be created and opened in the editor

### Requirement: Sidebar is resizable
The system SHALL allow resizing the sidebar width by dragging its edge.

#### Scenario: Drag sidebar edge to resize
- **WHEN** user clicks and drags the right edge of the sidebar
- **THEN** the sidebar width SHALL follow the cursor
- **AND** the width SHALL be constrained between 180px minimum and 500px maximum

#### Scenario: Double-click auto-sizes sidebar
- **WHEN** user double-clicks the sidebar divider/edge
- **THEN** the sidebar SHALL resize to an optimal default width (260px)
