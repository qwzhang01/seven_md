## MODIFIED Requirements

### Requirement: Explorer shows action buttons on hover
The system SHALL display action buttons when hovering over section headers, and new file/folder creation SHALL be context-aware of the currently selected folder.

#### Scenario: Section header actions
- **WHEN** user hovers over a section header (e.g., "MD Mate 工作区")
- **THEN** action buttons SHALL appear:
  - 📄 New File button
  - 📁 New Folder button
  - 🔄 Refresh button
  - 📂 Collapse All button

#### Scenario: Create new file from explorer — no folder selected
- **WHEN** user clicks the "New File" button in the explorer header
- **AND** no folder is currently selected in the file tree
- **THEN** a new untitled file SHALL be created in the workspace root directory
- **AND** the file name SHALL become editable for renaming
- **AND** upon confirmation, the file SHALL be created and opened in the editor

#### Scenario: Create new file from explorer — folder selected
- **WHEN** user clicks the "New File" button in the explorer header
- **AND** a folder is currently selected in the file tree
- **THEN** a new untitled file SHALL be created inside the selected folder
- **AND** the selected folder SHALL expand to reveal the new file
- **AND** the file name SHALL become editable for renaming
- **AND** upon confirmation, the file SHALL be created and opened in the editor

#### Scenario: Create new folder from explorer — folder selected
- **WHEN** user clicks the "New Folder" button in the explorer header
- **AND** a folder is currently selected in the file tree
- **THEN** a new untitled folder SHALL be created inside the selected folder
- **AND** the selected folder SHALL expand to reveal the new subfolder
- **AND** the folder name SHALL become editable for renaming
