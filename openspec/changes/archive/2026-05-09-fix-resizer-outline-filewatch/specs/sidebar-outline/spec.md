## MODIFIED Requirements

### Requirement: Clicking outline item navigates to heading
The system SHALL allow navigation to document sections by clicking outline items, in all view modes.

#### Scenario: Click heading navigates in editor-only mode
- **WHEN** the current view mode is `editor-only`
- **AND** user clicks a heading in the outline panel
- **THEN** the editor SHALL scroll to position that heading line at the center of the viewport
- **AND** the cursor SHALL be placed at the beginning of that heading line
- **AND** the editor SHALL receive focus

#### Scenario: Click heading navigates in preview-only mode
- **WHEN** the current view mode is `preview-only`
- **AND** user clicks a heading in the outline panel
- **THEN** the preview pane SHALL scroll to the corresponding heading element (matched by heading text/id)
- **AND** the heading element SHALL be briefly highlighted to indicate navigation target

#### Scenario: Click heading navigates in split mode
- **WHEN** the current view mode is `split`
- **AND** user clicks a heading in the outline panel
- **THEN** the editor SHALL scroll to position that heading line at the center of the viewport
- **AND** the cursor SHALL be placed at the beginning of that heading line
- **AND** the preview pane SHALL also scroll to the corresponding heading element

#### Scenario: Active heading highlighted in outline
- **WHEN** user clicks a heading in the outline panel
- **THEN** the clicked heading item SHALL be visually highlighted with an active background color
- **AND** previously active heading SHALL lose its highlight

#### Scenario: Navigation works when editor is still initializing
- **WHEN** user clicks a heading in the outline panel very quickly after switching to a tab
- **AND** the editor view instance has not yet fully initialized
- **THEN** the navigation request SHALL be queued and executed once the editor is ready
- **OR** a retry mechanism SHALL attempt navigation after a short delay (100ms)
