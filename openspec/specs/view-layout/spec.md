## ADDED Requirements

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

### Requirement: Gutter allows resizing editor/preview ratio
The system SHALL allow users to drag the divider between editor and preview to resize their relative widths. During dragging, the window drag region SHALL be disabled to prevent accidental window movement.

#### Scenario: Drag gutter to resize
- **WHEN** user clicks and drags the vertical gutter between editor and preview
- **THEN** the gutter position SHALL follow the cursor horizontally
- **AND** the editor width and preview width SHALL adjust proportionally
- **AND** during dragging, the gutter SHALL highlight with accent color
- **AND** mouse cursor SHALL change to ↔ (east-west-resize cursor)

#### Scenario: Minimum pane sizes enforced
- **WHEN** dragging the gutter
- **THEN** neither pane SHALL shrink below 200px minimum width
- **IF** the limit is reached, further dragging in that direction SHALL be blocked

#### Scenario: Hover effect on gutter
- **WHEN** user hovers over the gutter without clicking
- **THEN** the gutter SHALL subtly highlight (2px wider, accent color tint)

#### Scenario: Window drag region disabled during gutter drag
- **WHEN** user presses mouse button down on the gutter to start resizing
- **THEN** the `data-resizing` attribute SHALL be set on `document.documentElement`
- **AND** all `data-tauri-drag-region` elements SHALL have `-webkit-app-region: no-drag` applied via CSS
- **AND** moving the mouse over the TitleBar SHALL NOT trigger window movement
- **WHEN** user releases the mouse button
- **THEN** the `data-resizing` attribute SHALL be removed from `document.documentElement`
- **AND** the TitleBar SHALL resume functioning as a window drag region

### Requirement: View mode transitions are animated
The system SHALL provide smooth animations when switching view modes.

#### Scenario: Smooth transition
- **WHEN** switching between any two view modes
- **THEN** a CSS transition of ~200ms with ease timing SHALL animate the layout change
- **AND** the transition SHALL not cause content flicker or layout shift artifacts

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
