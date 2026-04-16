## ADDED Requirements

### Requirement: Editor pane is collapsible
The system SHALL allow users to collapse and expand the editor pane.

#### Scenario: Collapse editor
- **WHEN** user clicks the "Collapse Editor" button
- **THEN** system collapses the editor pane
- **AND** the preview pane expands to fill the space

#### Scenario: Expand editor
- **WHEN** editor is collapsed
- **AND** user clicks the "Expand Editor" button
- **THEN** system expands the editor pane to its normal width
- **AND** the preview pane adjusts accordingly

#### Scenario: Remember editor state
- **WHEN** user collapses or expands the editor
- **THEN** system remembers the state for the next session

### Requirement: Preview pane is collapsible
The system SHALL allow users to collapse and expand the preview pane.

#### Scenario: Collapse preview
- **WHEN** user clicks the "Collapse Preview" button
- **THEN** system collapses the preview pane
- **AND** the editor pane expands to fill the space

#### Scenario: Expand preview
- **WHEN** preview is collapsed
- **AND** user clicks the "Expand Preview" button
- **THEN** system expands the preview pane to its normal width
- **AND** the editor pane adjusts accordingly

#### Scenario: Remember preview state
- **WHEN** user collapses or expands the preview
- **THEN** system remembers the state for the next session

### Requirement: Pane collapse behavior is logical
The system SHALL handle edge cases when collapsing panes.

#### Scenario: Both panes collapsed
- **WHEN** user tries to collapse both editor and preview
- **THEN** system prevents the action or automatically expands one pane
- **AND** at least one pane remains visible at all times

#### Scenario: Transition animation
- **WHEN** pane is collapsed or expanded
- **THEN** system animates the transition smoothly

### Requirement: Collapsed panes have toggle indicators
The system SHALL provide clear indicators for collapsed panes.

#### Scenario: Show collapsed indicator
- **WHEN** a pane is collapsed
- **THEN** system shows a small indicator or button to expand it

#### Scenario: Hover to reveal expand button
- **WHEN** a pane is collapsed
- **AND** user hovers near the collapsed edge
- **THEN** system shows an expand button

### Requirement: Pane state is independent
The system SHALL manage pane states independently.

#### Scenario: Independent pane toggles
- **WHEN** sidebar is toggled
- **THEN** editor and preview pane states are not affected

#### Scenario: All states independent
- **WHEN** any pane is toggled
- **THEN** other panes maintain their current state
