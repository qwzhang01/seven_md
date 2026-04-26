## MODIFIED Requirements

### Requirement: View layout supports three display modes
The system SHALL support three view modes for arranging the editor and preview areas: Split (default), Editor Only, Preview Only.

#### Scenario: Default split view mode
- **WHEN** the application launches OR split view is selected
- **THEN** the editor pane and preview pane SHALL be displayed side-by-side
- **AND** a vertical gutter/divider SHALL separate them
- **AND** both panes SHALL share available width approximately 50/50

#### Scenario: Editor-only mode
- **WHEN** user selects "仅编辑器" from View menu / command palette / toolbar
- **THEN** the preview pane SHALL be hidden
- **AND** the editor pane SHALL expand to fill the full available width
- **AND** the change SHALL include a smooth transition animation (~200ms)

#### Scenario: Preview-only mode
- **WHEN** user selects "仅预览" from View menu / command palette / toolbar
- **THEN** the editor pane SHALL be hidden
- **AND** the preview pane SHALL expand to fill the full available width
- **AND** the change SHALL include a smooth transition animation (~200ms)

### Requirement: Toolbar view switcher controls view modes
The system SHALL provide view mode switcher buttons in the toolbar as a quick access method.

#### Scenario: Toolbar view buttons
- **WHEN** the toolbar is rendered
- **THEN** it SHALL display three view mode buttons: Split, Editor Only, Preview Only
- **AND** the buttons SHALL be positioned in the toolbar (before the AI button group)
- **AND** the current active view mode button SHALL show an activated visual state

#### Scenario: Switching via toolbar view buttons
- **WHEN** user clicks a view mode button in the toolbar
- **THEN** the layout SHALL switch to the corresponding view mode
- **AND** the toolbar button SHALL update to show the new active state
