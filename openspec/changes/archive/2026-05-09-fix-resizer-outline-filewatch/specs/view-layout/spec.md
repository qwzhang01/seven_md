## MODIFIED Requirements

### Requirement: View layout routes navigation events to visible panes
The system SHALL ensure that navigation events (e.g., from outline panel) are routed to the currently visible pane(s) based on the active view mode.

#### Scenario: Navigation event routing in editor-only mode
- **WHEN** a navigation event is dispatched (e.g., `editor:jump-to-line`)
- **AND** the current view mode is `editor-only`
- **THEN** the editor pane SHALL process the navigation
- **AND** no error SHALL occur due to missing preview pane

#### Scenario: Navigation event routing in preview-only mode
- **WHEN** a navigation event needs to be dispatched
- **AND** the current view mode is `preview-only`
- **THEN** the system SHALL dispatch `preview:scroll-to-heading` instead of `editor:jump-to-line`
- **AND** the preview pane SHALL scroll to the target heading

#### Scenario: Navigation event routing in split mode
- **WHEN** a navigation event is dispatched
- **AND** the current view mode is `split`
- **THEN** both `editor:jump-to-line` and `preview:scroll-to-heading` SHALL be dispatched
- **AND** both panes SHALL navigate to the target position

#### Scenario: Preview pane listens for scroll-to-heading events
- **WHEN** a `preview:scroll-to-heading` custom event is fired with a heading text as detail
- **THEN** the preview pane SHALL find the matching heading element in the rendered HTML
- **AND** SHALL scroll it into view using `scrollIntoView({ behavior: 'smooth', block: 'start' })`
