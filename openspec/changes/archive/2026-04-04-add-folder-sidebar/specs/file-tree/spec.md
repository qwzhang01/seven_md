## ADDED Requirements

### Requirement: File tree displays hierarchical structure
The system SHALL display files and directories in a hierarchical tree structure.

#### Scenario: Display root level contents
- **WHEN** a folder is opened
- **THEN** system displays all markdown files and directories at the root level

#### Scenario: Display nested directory
- **WHEN** directory contains subdirectories
- **THEN** system displays subdirectories with expand/collapse indicators
- **AND** user can expand subdirectories to see their contents

#### Scenario: Multi-level navigation
- **WHEN** user expands a subdirectory
- **THEN** system loads and displays the contents of that subdirectory
- **AND** user can continue to expand nested subdirectories

### Requirement: Directories can be expanded and collapsed
The system SHALL allow users to expand and collapse directory nodes.

#### Scenario: Expand directory
- **WHEN** user clicks on a collapsed directory
- **THEN** system expands the directory and shows its contents
- **AND** directory icon changes to indicate expanded state

#### Scenario: Collapse directory
- **WHEN** user clicks on an expanded directory
- **THEN** system collapses the directory and hides its contents
- **AND** directory icon changes to indicate collapsed state

#### Scenario: Remember expanded directories
- **WHEN** user expands or collapses directories
- **THEN** system remembers the expansion state during the session

### Requirement: Files display appropriate icons
The system SHALL display appropriate icons for different file types.

#### Scenario: Markdown file icon
- **WHEN** file tree displays a .md file
- **THEN** system displays a markdown file icon

#### Scenario: Directory icons
- **WHEN** file tree displays a directory
- **THEN** system displays a folder icon (closed when collapsed, open when expanded)

#### Scenario: Unknown file type icon
- **WHEN** file tree displays a file with unknown extension (if shown)
- **THEN** system displays a generic file icon

### Requirement: User can open file by clicking
The system SHALL allow users to open a file by clicking on it in the file tree.

#### Scenario: Click to open file
- **WHEN** user clicks on a markdown file in the file tree
- **THEN** system opens the file in the editor
- **AND** system highlights the file in the file tree

#### Scenario: Click on currently open file
- **WHEN** user clicks on the currently open file
- **THEN** system does not reload the file (no-op)

#### Scenario: Switch between files
- **WHEN** a file is open
- **AND** user clicks on a different file
- **THEN** if current file has unsaved changes, system prompts to save
- **AND** system opens the new file

### Requirement: File tree filters content
The system SHALL filter the displayed content appropriately.

#### Scenario: Show only markdown files
- **WHEN** file tree displays directory contents
- **THEN** system shows only .md files and directories
- **AND** system hides hidden files (starting with .)

#### Scenario: Sort order
- **WHEN** file tree displays contents
- **THEN** system sorts directories first, then files
- **AND** items are sorted alphabetically within each group

### Requirement: File tree indicates current file
The system SHALL visually indicate the currently open file.

#### Scenario: Highlight current file
- **WHEN** a file is open
- **THEN** system highlights the file in the file tree with a different background

#### Scenario: Scroll to current file
- **WHEN** a file is opened
- **THEN** system scrolls the file tree to ensure the file is visible
