## MODIFIED Requirements

### Requirement: File operations support extended actions including export
The system SHALL provide comprehensive file operations including create, open, save, export, and manage.

#### Scenario: Create new file (enhanced)
- **WHEN** user selects "新建文件" (Ctrl+N)
- **THEN** a new untitled .md file SHALL be created in memory
- **AND** a new tab SHALL be opened for this file
- **AND** the file SHALL be added to the "打开的文件" section of the explorer

#### Scenario: Create new window
- **WHEN** user selects "新建窗口" (Ctrl+Shift+N)
- **THEN** a completely new MD Mate application window SHALL be opened
- **AND** the new window SHALL be independent (separate state)

#### Scenario: Open folder populates workspace
- **WHEN** user selects "打开文件夹" from File menu
- **THEN** a native folder picker dialog SHALL appear
- **AND** upon selection, the folder contents SHALL populate the explorer's workspace tree view
- **AND** this becomes the root workspace for file browsing

#### Scenario: Save As creates new copy
- **WHEN** user selects "另存为" (Ctrl+Shift+S)
- **THEN** a native "Save As" dialog SHALL appear
- **AND** user can choose location and filename
- **AND** upon saving, the current tab SHALL switch to reference the new file path
- **AND** the old file (if any) remains unchanged

#### Scenario: Export to PDF (NEW capability)
- **WHEN** user selects "导出为 PDF" from File menu
- **THEN** the current Markdown document SHALL be converted to PDF format
- **AND** a "Save As" dialog shall prompt for output location
- **AND** the generated PDF SHALL include:
  - Rendered headings, text formatting, lists
  - Code blocks with syntax highlighting preserved
  - Tables rendered as PDF tables
  - Images embedded
  - Math formulas rendered

#### Scenario: Export to HTML (NEW capability)
- **WHEN** user selects "导出为 HTML" from File menu
- **THEN** the current Markdown document SHALL be converted to self-contained HTML
- **AND** a "Save As" dialog shall prompt for output location
- **AND** the HTML SHALL include inline styles (or embedded CSS) so it renders standalone
- **AND** math formulas SHALL be rendered (via KaTeX CSS/JS included or pre-rendered)

### Requirement: File system supports move operation
The system SHALL support moving files and folders to new locations within the workspace via the file system API.

#### Scenario: Move file to a different folder
- **WHEN** a move operation is triggered with a source file path and a target folder path
- **THEN** the system SHALL call the underlying file system rename/move API
- **AND** the file SHALL appear at the new path
- **AND** the file SHALL no longer exist at the original path
- **AND** the workspace file tree SHALL refresh to reflect the change

#### Scenario: Move folder to a different folder
- **WHEN** a move operation is triggered with a source folder path and a target folder path
- **THEN** the system SHALL move the entire folder (including all contents) to the target location
- **AND** the folder and all its contents SHALL appear under the new path
- **AND** the original folder path SHALL no longer exist
- **AND** the workspace file tree SHALL refresh to reflect the change

#### Scenario: Move operation fails gracefully
- **WHEN** a move operation fails (e.g., permission denied, target already exists)
- **THEN** the system SHALL display an error notification to the user
- **AND** the source file/folder SHALL remain at its original location unchanged
- **AND** the workspace file tree SHALL remain consistent with the actual file system state
