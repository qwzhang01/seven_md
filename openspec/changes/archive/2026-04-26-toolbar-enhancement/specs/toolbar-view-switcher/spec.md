## ADDED Requirements

### Requirement: Toolbar provides view mode switcher buttons
The system SHALL provide a group of view mode switcher buttons in the toolbar for quick access to different layout modes.

#### Scenario: View switcher displays three mode buttons
- **WHEN** the toolbar is rendered
- **THEN** a view switcher group SHALL be displayed with three buttons: Split, Editor Only, Preview Only
- **AND** the buttons SHALL use appropriate icons to represent each mode
- **AND** the active view mode button SHALL show an activated visual state

#### Scenario: Split view button
- **WHEN** user clicks the split view button
- **THEN** the layout SHALL switch to split mode (editor and preview side-by-side)
- **AND** the button SHALL show activated state

#### Scenario: Editor only button
- **WHEN** user clicks the editor only button
- **THEN** the layout SHALL switch to editor-only mode
- **AND** the preview pane SHALL be hidden
- **AND** the editor SHALL expand to fill available width

#### Scenario: Preview only button
- **WHEN** user clicks the preview only button
- **THEN** the layout SHALL switch to preview-only mode
- **AND** the editor pane SHALL be hidden
- **AND** the preview SHALL expand to fill available width

### Requirement: View switcher shows current mode state
The system SHALL indicate the currently active view mode through button visual state.

#### Scenario: Active button shows selected state
- **WHEN** a view mode is active
- **THEN** the corresponding button SHALL display an accent/highlighted background
- **AND** other buttons SHALL appear in their default state
