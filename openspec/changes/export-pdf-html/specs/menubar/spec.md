## MODIFIED Requirements

### Requirement: File menu provides file operations
The system SHALL provide a File menu with operations for creating, opening, saving, managing, and exporting files.

#### Scenario: File menu displays standard file operations
- **WHEN** user clicks on the File menu
- **THEN** the menu SHALL display the following items in order:
  - New File (Cmd/Ctrl+N)
  - Open File (Cmd/Ctrl+O)
  - Open Folder (Cmd/Ctrl+Shift+O)
  - Separator
  - Save (Cmd/Ctrl+S)
  - Save As (Cmd/Ctrl+Shift+S)
  - Separator
  - Export submenu
  - Separator
  - Recent Files (submenu)
  - Separator
  - Exit (Windows/Linux) or Close (macOS, Cmd+W)

#### Scenario: Open File shows file picker dialog
- **WHEN** user clicks "Open File" from File menu
- **THEN** the system SHALL display a native file picker dialog
- **AND** the dialog SHALL filter for Markdown files (*.md, *.markdown, *.txt)

#### Scenario: Open Folder shows folder picker dialog
- **WHEN** user clicks "Open Folder" from File menu
- **THEN** the system SHALL display a native folder picker dialog
- **AND** the selected folder SHALL populate the sidebar

#### Scenario: Save writes current content to file
- **WHEN** user clicks "Save" from File menu and a file is currently open
- **THEN** the system SHALL save the current editor content to the file
- **AND** show a success notification

#### Scenario: Save As creates new file
- **WHEN** user clicks "Save As" from File menu
- **THEN** the system SHALL display a save file dialog
- **AND** allow user to specify a new file name and location

## ADDED Requirements

### Requirement: File menu provides an Export submenu
The system SHALL provide an Export submenu within the File menu containing PDF and HTML export options.

#### Scenario: Export submenu displays export options
- **WHEN** user hovers over or clicks the "Export" item in the File menu
- **THEN** a submenu SHALL appear containing:
  - Export as PDF (⌘⇧P / Ctrl+Shift+P)
  - Export as HTML (⌘⇧E / Ctrl+Shift+E)

#### Scenario: Export items are disabled when no document is open
- **WHEN** no document is currently open
- **THEN** both "Export as PDF" and "Export as HTML" submenu items SHALL be visually disabled
- **AND** clicking them SHALL have no effect

#### Scenario: Export as PDF triggers PDF export
- **WHEN** user clicks "Export as PDF" from the Export submenu
- **THEN** the system SHALL initiate the PDF export flow as defined in the export-pdf spec

#### Scenario: Export as HTML triggers HTML export
- **WHEN** user clicks "Export as HTML" from the Export submenu
- **THEN** the system SHALL initiate the HTML export flow as defined in the export-html spec
