## ADDED Requirements

### Requirement: User can export the current document to a standalone HTML file
The system SHALL allow the user to export the currently active Markdown document to a self-contained HTML file that can be opened in any browser without external dependencies.

#### Scenario: Export HTML opens native save dialog
- **WHEN** the user triggers "Export as HTML" (via File menu or keyboard shortcut ⌘⇧E / Ctrl+Shift+E)
- **THEN** the system SHALL display a native save-file dialog
- **AND** the dialog SHALL default to `.html` file extension
- **AND** the suggested file name SHALL be the base name of the current file with `.html` extension, or `Untitled.html` if unsaved

#### Scenario: Exported HTML is self-contained
- **WHEN** the HTML file is written to disk
- **THEN** the file SHALL contain all required CSS inlined in a `<style>` block within `<head>`
- **AND** the inlined CSS SHALL include: app typography styles, KaTeX math styles, syntax highlighting styles
- **AND** the file SHALL NOT reference any external CDN URLs or local file paths for styles
- **AND** the file SHALL be openable in a browser without an internet connection

#### Scenario: Exported HTML preserves full preview rendering
- **WHEN** the HTML file is opened in a browser
- **THEN** it SHALL render identically to the in-app preview pane including:
  - GFM tables
  - Syntax-highlighted code blocks
  - Rendered math expressions (KaTeX)
  - Heading hierarchy and typography
  - Blockquotes, lists, and inline formatting

#### Scenario: Exported HTML includes document metadata
- **WHEN** the HTML file is written
- **THEN** the `<title>` element SHALL be set to the first `# heading` found in the document
- **AND** if no heading is found, the `<title>` SHALL be the file name or "Untitled"
- **AND** the file SHALL include `<meta charset="UTF-8">` and `<meta name="viewport" content="width=device-width, initial-scale=1">`

#### Scenario: Exported HTML uses light theme
- **WHEN** the HTML file is generated
- **THEN** the output SHALL always use the light color scheme regardless of the current app theme
- **AND** the background SHALL be white and text SHALL be dark

#### Scenario: Status bar shows export result
- **WHEN** the HTML export completes successfully
- **THEN** the status bar SHALL display a transient message showing the exported file path for 4 seconds
- **AND** if the user cancels the save dialog, no message SHALL be shown
- **AND** if the export fails (e.g., write permission error), the status bar SHALL display an error message

#### Scenario: Export is disabled when no document is open
- **WHEN** no document is currently open or the editor is empty
- **THEN** the "Export as HTML" menu item SHALL be disabled
- **AND** the keyboard shortcut SHALL have no effect

### Requirement: HTML export handles linked images gracefully
The system SHALL handle image references in the exported HTML without breaking the output.

#### Scenario: Relative image paths are preserved as-is
- **WHEN** the Markdown document contains relative image references (e.g., `![](./image.png)`)
- **THEN** the exported HTML SHALL preserve the original `src` attribute unchanged
- **AND** the image MAY not display if the HTML file is moved to a different directory (v1 behavior; embedding is a v2 concern)

#### Scenario: Absolute and remote image URLs are preserved
- **WHEN** the Markdown document contains absolute or remote image URLs
- **THEN** the exported HTML SHALL preserve those URLs unchanged
- **AND** the images SHALL display correctly when the browser has internet access
