## ADDED Requirements

### Requirement: Export keyboard shortcuts trigger document export
The system SHALL provide keyboard shortcuts for exporting the current document to PDF and HTML formats.

#### Scenario: Cmd/Ctrl+Shift+P exports to PDF
- **WHEN** user presses Cmd+Shift+P (macOS) or Ctrl+Shift+P (Windows/Linux)
- **AND** a document is currently open
- **THEN** the system SHALL initiate the PDF export flow as defined in the export-pdf spec

#### Scenario: Cmd/Ctrl+Shift+E exports to HTML
- **WHEN** user presses Cmd+Shift+E (macOS) or Ctrl+Shift+E (Windows/Linux)
- **AND** a document is currently open
- **THEN** the system SHALL initiate the HTML export flow as defined in the export-html spec

#### Scenario: Export shortcuts have no effect when no document is open
- **WHEN** user presses an export shortcut
- **AND** no document is currently open
- **THEN** the system SHALL ignore the shortcut with no visible effect

#### Scenario: Export shortcuts do not conflict with existing shortcuts
- **WHEN** the application registers export shortcuts
- **THEN** ⌘⇧P / Ctrl+Shift+P SHALL NOT conflict with any existing registered shortcut
- **AND** ⌘⇧E / Ctrl+Shift+E SHALL NOT conflict with any existing registered shortcut

#### Scenario: Export shortcuts are shown in the Export submenu
- **WHEN** the Export submenu is open
- **THEN** "Export as PDF" SHALL display `⌘⇧P` (macOS) or `Ctrl+Shift+P` (Windows/Linux) on the right
- **AND** "Export as HTML" SHALL display `⌘⇧E` (macOS) or `Ctrl+Shift+E` (Windows/Linux) on the right
