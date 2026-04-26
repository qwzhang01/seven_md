## MODIFIED Requirements

### Requirement: Help menu opens About dialog
The system SHALL display an "关于 Seven Markdown" modal dialog when the user clicks the corresponding Help menu item.

#### Scenario: Open About dialog
- **WHEN** user clicks "About Seven Markdown" in the Help menu
- **THEN** a modal dialog SHALL appear with title "关于 Seven Markdown"
- **AND** the dialog SHALL display: application name "Seven Markdown", version number, slogan "Write Markdown Like Code"
- **AND** the dialog SHALL display: license type (MIT), and technology stack summary (Tauri v2 + React 19 + TypeScript + CodeMirror 6)
- **AND** the dialog SHALL display the ME Logo icon (blue-purple gradient)

#### Scenario: About dialog shows MIT license
- **WHEN** the About dialog is displayed
- **THEN** the copyright text SHALL display "MIT License © 2024-2026 Seven Markdown Contributors"

#### Scenario: Close About dialog
- **WHEN** the About dialog is open
- **AND** user presses Escape or clicks the overlay backdrop or clicks the close button
- **THEN** the dialog SHALL close
