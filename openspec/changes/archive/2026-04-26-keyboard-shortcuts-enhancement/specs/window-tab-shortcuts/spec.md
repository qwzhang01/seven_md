## ADDED Requirements

### Requirement: System provides find and replace shortcuts
The system SHALL provide keyboard shortcuts to open find and replace functionality in the editor.

#### Scenario: Ctrl+H opens find and replace bar
- **WHEN** user presses Ctrl+H (or ⌘+H on macOS)
- **THEN** the find and replace bar SHALL become visible
- **AND** the replace input field SHALL be focused
- **AND** the cursor SHALL be positioned in the replace input

#### Scenario: Ctrl+H is triggered from menu
- **WHEN** user activates "Find and Replace" from the menu bar
- **THEN** the find and replace bar SHALL become visible
- **AND** the behavior SHALL be identical to Ctrl+H
