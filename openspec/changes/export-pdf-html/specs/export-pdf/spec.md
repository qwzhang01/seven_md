## ADDED Requirements

### Requirement: User can export the current document to PDF
The system SHALL allow the user to export the currently active Markdown document to a PDF file using the operating system's native print-to-PDF capability.

#### Scenario: Export PDF opens native save dialog
- **WHEN** the user triggers "Export as PDF" (via File menu or keyboard shortcut ⌘⇧P / Ctrl+Shift+P)
- **THEN** the system SHALL invoke the WebView print API
- **AND** the OS print dialog SHALL appear with "Save as PDF" as the default destination

#### Scenario: Default file name is derived from document
- **WHEN** the OS print dialog opens
- **AND** the current document has a saved file path
- **THEN** the suggested file name SHALL be the base name of the current file with a `.pdf` extension
- **AND** if the document is unsaved, the suggested name SHALL be `Untitled.pdf`

#### Scenario: PDF preserves preview rendering
- **WHEN** the PDF is generated
- **THEN** the output SHALL faithfully reproduce the preview pane rendering including:
  - GFM tables with borders and alternating row colors
  - Syntax-highlighted code blocks
  - Rendered math expressions (KaTeX)
  - Heading hierarchy and typography
- **AND** the PDF SHALL use the light theme regardless of the current app theme

#### Scenario: Export PDF uses print media styles
- **WHEN** the PDF is generated
- **THEN** the system SHALL apply `@media print` CSS overrides to:
  - Force light background and dark text
  - Remove sidebar, toolbar, and editor pane from output
  - Ensure page breaks do not split code blocks mid-line where possible

#### Scenario: Status bar shows export result
- **WHEN** the user completes or cancels the PDF export
- **THEN** if completed, the status bar SHALL display a transient success message for 4 seconds
- **AND** if the export fails, the status bar SHALL display an error message

#### Scenario: Export is disabled when no document is open
- **WHEN** no document is currently open or the editor is empty
- **THEN** the "Export as PDF" menu item SHALL be disabled
- **AND** the keyboard shortcut SHALL have no effect
