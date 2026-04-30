## MODIFIED Requirements

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
